import { useState, useEffect, useCallback, useRef } from "react";

// ─── Generic Fetch Hook ───

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

function useFetch<T>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

// ─── Scan Hooks ───

export function useScans() {
  return useFetch<{ scans: any[] }>("/api/scan");
}

export function useScanDetail(scanId: string | null) {
  return useFetch<{ scan: any }>(
    scanId ? `/api/scan?scanId=${scanId}` : null
  );
}

// ─── Scan Progress Polling ───

export function useScanProgress(scanId: string | null) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");
  const [result, setResult] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!scanId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan?scanId=${scanId}`);
        const data = await res.json();
        const scan = data.scan;

        if (scan.status === "COMPLETED") {
          setProgress(100);
          setStatus("COMPLETED");
          setResult(scan);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (scan.status === "FAILED") {
          setStatus("FAILED");
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          // Estimate progress based on pages scanned
          const estimated = Math.min(
            90,
            (scan.pagesCount / 10) * 100
          );
          setProgress(estimated);
          setStatus("RUNNING");
        }
      } catch (e) {
        console.error("Poll error:", e);
      }
    };

    intervalRef.current = setInterval(poll, 2000); // Poll every 2s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scanId]);

  return { progress, status, result };
}

// ─── Issues Hook ───

interface IssueFilters {
  scanId?: string;
  severity?: string;
  status?: string;
  needsHuman?: boolean;
  page?: number;
}

export function useIssues(filters: IssueFilters = {}) {
  const params = new URLSearchParams();
  if (filters.scanId) params.set("scanId", filters.scanId);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.status) params.set("status", filters.status);
  if (filters.needsHuman) params.set("needsHuman", "true");
  if (filters.page) params.set("page", String(filters.page));

  return useFetch<{ issues: any[]; pagination: any }>(
    `/api/issues?${params.toString()}`
  );
}

// ─── Review Queue Hook ───

export function useReviewQueue(status: string = "PENDING") {
  return useFetch<{ issues: any[] }>(
    `/api/reviews?status=${status}`
  );
}

// ─── Submit Review Hook ───

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (data: {
    issueId: string;
    feedback: string;
    severity?: string;
    fixCode?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }

      return await res.json();
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submitReview, loading, error };
}

// ─── Start Scan Hook ───

export function useStartScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  const startScan = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start scan");
      }

      const data = await res.json();
      setScanId(data.scanId);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { startScan, loading, error, scanId };
}

export { useFetch };
