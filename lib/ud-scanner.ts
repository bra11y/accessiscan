// ─── Universal Design Scanner Engine ─────────────────────────────────────────
// Drop into: lib/ud-scanner.ts
// Runs automated UD checks against a URL.
// Called from: app/api/ud-scan/route.ts
//
// Dependencies (already in accessiscan package.json):
//   - puppeteer / puppeteer-core
//   - axe-core
//   - @axe-core/puppeteer

import type {
  UDReport,
  UDPrincipleResult,
  UDCheckResult,
  CheckStatus,
  UDCheck,
} from "@/types/ud";
import { UD_PRINCIPLES } from "@/lib/ud-principles";

// ─── Individual check runners ─────────────────────────────────────────────────
// Each function receives the Puppeteer page and returns a partial UDCheckResult.

type CheckRunner = (
  page: any, // Puppeteer Page
  checkId: string
) => Promise<{ status: CheckStatus; evidence?: string; count?: number; element?: string }>;

const CHECK_RUNNERS: Record<string, CheckRunner> = {

  // ── Principle 1 — Equitable Use ──────────────────────────────────────────
  "eu-1": async (page) => {
    const found = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const keywords = ["accessible version", "text only", "text-only", "screen reader version", "accessibility mode"];
      const match = links.find((l) =>
        keywords.some((k) => (l.textContent || "").toLowerCase().includes(k) || (l.href || "").toLowerCase().includes(k.replace(/ /g, "-")))
      );
      return match ? match.outerHTML.slice(0, 200) : null;
    });
    return found
      ? { status: "fail", evidence: found, count: 1 }
      : { status: "pass" };
  },

  "eu-2": async (page) => {
    const result = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, select, textarea"));
      const unlabelled = inputs.filter((el: any) => {
        const id = el.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = el.getAttribute("aria-label");
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        return !label && !ariaLabel && !ariaLabelledBy;
      });
      return { count: unlabelled.length, sample: unlabelled[0]?.outerHTML?.slice(0, 150) };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.sample }
      : { status: "pass" };
  },

  "eu-3": async (page) => {
    const hasCaptcha = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const iframes = Array.from(document.querySelectorAll("iframe"));
      const captchaIframe = iframes.find((f) => (f.src || "").includes("captcha") || (f.src || "").includes("recaptcha"));
      return text.includes("captcha") || !!captchaIframe;
    });
    if (!hasCaptcha) return { status: "na" };
    const hasAudio = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes("audio captcha") || text.includes("audio challenge") || document.querySelector('[aria-label*="audio"]') !== null;
    });
    return hasAudio
      ? { status: "pass", evidence: "CAPTCHA detected with audio alternative" }
      : { status: "fail", evidence: "CAPTCHA detected but no audio alternative found" };
  },

  "eu-4": async (page) => {
    const issues = await page.evaluate(() => {
      const interactives = Array.from(document.querySelectorAll("a, button, [role='button'], [role='link'], [onclick]"));
      const nonFocusable = interactives.filter((el: any) => {
        const tag = el.tagName.toLowerCase();
        const tabindex = el.getAttribute("tabindex");
        if (tag === "a" && !el.href) return true;
        if (tag === "div" || tag === "span") return tabindex === null;
        return false;
      });
      return { count: nonFocusable.length, sample: nonFocusable[0]?.outerHTML?.slice(0, 150) };
    });
    return issues.count > 0
      ? { status: "fail", count: issues.count, evidence: issues.sample }
      : { status: "pass" };
  },

  "eu-5": async (page) => {
    const result = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const animated = elements.filter((el: any) => {
        const styles = window.getComputedStyle(el);
        const hasAnimation = styles.animationName && styles.animationName !== "none";
        const hasTransition = styles.transition && styles.transition !== "none" && styles.transition !== "all 0s ease 0s";
        return hasAnimation || hasTransition;
      });
      // Check if any have prefers-reduced-motion override — simplified check
      const noReducedMotion = animated.filter((el: any) => {
        const sheet = Array.from(document.styleSheets).find((s) => {
          try { return Array.from(s.cssRules).some((r: any) => r.conditionText?.includes("prefers-reduced-motion")); } catch { return false; }
        });
        return !sheet;
      });
      return { animated: animated.length, noReducedMotion: noReducedMotion.length };
    });
    if (result.animated === 0) return { status: "pass" };
    return result.noReducedMotion > 0
      ? { status: "fail", count: result.noReducedMotion, evidence: `${result.animated} animated elements found, ${result.noReducedMotion} without prefers-reduced-motion override` }
      : { status: "pass", evidence: `${result.animated} animated elements found, all with prefers-reduced-motion support` };
  },

  "eu-6": async (page) => {
    const lang = await page.evaluate(() => document.documentElement.getAttribute("lang"));
    return lang && lang.trim().length > 0
      ? { status: "pass", evidence: `lang="${lang}"` }
      : { status: "fail", evidence: "Missing or empty lang attribute on <html>" };
  },

  // ── Principle 2 — Flexibility ─────────────────────────────────────────────
  "fl-1": async (page) => {
    // Inject a keyboard trap detector
    const result = await page.evaluate(() => {
      const interactives = Array.from(document.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      ));
      return { count: interactives.length };
    });
    // If no interactives at all, flag it
    return result.count > 0
      ? { status: "pass", evidence: `${result.count} keyboard-focusable elements found` }
      : { status: "fail", evidence: "No keyboard-focusable elements detected on page" };
  },

  "fl-2": async (page) => {
    const small = await page.evaluate(() => {
      const targets = Array.from(document.querySelectorAll("a, button, [role='button'], input[type='checkbox'], input[type='radio']"));
      const tooSmall = targets.filter((el: any) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      });
      return {
        count: tooSmall.length,
        total: targets.length,
        sample: tooSmall.slice(0, 3).map((el: any) => {
          const rect = el.getBoundingClientRect();
          return `${el.tagName} ${el.textContent?.slice(0, 30)} (${Math.round(rect.width)}×${Math.round(rect.height)}px)`;
        }),
      };
    });
    return small.count > 0
      ? { status: "fail", count: small.count, evidence: small.sample.join(" | ") }
      : { status: "pass", evidence: `All ${small.total} targets meet 44×44px minimum` };
  },

  "fl-3": async (page) => {
    // Check for session timeout warning — manual check since it requires interaction
    return { status: "manual", evidence: "Session timeout behaviour requires manual testing. Log in and wait for timeout, or inspect session management code." };
  },

  "fl-4": async (page) => {
    const result = await page.evaluate(() => {
      const animated = Array.from(document.querySelectorAll("[style*='animation'], [style*='transition']"));
      return animated.length;
    });
    return { status: "manual", evidence: `${result} inline-animated elements found. Enable 'prefers-reduced-motion: reduce' in OS settings and reload to verify they stop.` };
  },

  "fl-5": async (page) => {
    const result = await page.evaluate(() => {
      return {
        hasViewport: !!document.querySelector("meta[name='viewport']"),
        viewportContent: document.querySelector("meta[name='viewport']")?.getAttribute("content") || "",
      };
    });
    if (result.viewportContent.includes("user-scalable=no") || result.viewportContent.match(/maximum-scale=[01](\.[0-9])?[^0-9]/)) {
      return { status: "fail", evidence: `Viewport blocks zoom: ${result.viewportContent}` };
    }
    return { status: "pass", evidence: result.viewportContent };
  },

  "fl-6": async (page) => {
    const result = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll("p, li, td, th, dd, dt, label, span, div"))
        .filter((el: any) => el.children.length === 0 && el.textContent?.trim().length > 0);
      const fixedSize = textElements.filter((el: any) => {
        const fs = window.getComputedStyle(el).fontSize;
        return fs.endsWith("px");
      });
      return { fixed: fixedSize.length, total: textElements.length };
    });
    return result.fixed > result.total * 0.5
      ? { status: "fail", count: result.fixed, evidence: `${result.fixed} of ${result.total} text elements use fixed px font sizes — will not scale with browser settings` }
      : { status: "pass" };
  },

  // ── Principle 3 — Simple & Intuitive ────────────────────────────────────
  "si-1": async (page) => {
    const title = await page.title();
    if (!title || title.trim().length < 5) return { status: "fail", evidence: `Page title is empty or too short: "${title}"` };
    const generic = ["home", "index", "page", "untitled", "new tab", "welcome"];
    if (generic.some((g) => title.toLowerCase().trim() === g)) return { status: "fail", evidence: `Generic page title: "${title}"` };
    return { status: "pass", evidence: `"${title}"` };
  },

  "si-2": async (page) => {
    const result = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      const h1Count = headings.filter((h) => h.tagName === "H1").length;
      const issues: string[] = [];
      if (h1Count === 0) issues.push("No H1 found");
      if (h1Count > 1) issues.push(`${h1Count} H1 elements found — should be exactly 1`);
      let prevLevel = 0;
      headings.forEach((h) => {
        const level = parseInt(h.tagName[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          issues.push(`Heading skip: H${prevLevel} → H${level} ("${h.textContent?.slice(0, 40)}")`);
        }
        prevLevel = level;
      });
      return { issues, count: issues.length };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.issues.join(" | ") }
      : { status: "pass" };
  },

  "si-3": async (page) => {
    return { status: "manual", evidence: "Submit forms with invalid data and verify error messages name the field and explain how to fix it." };
  },

  "si-4": async (page) => {
    const result = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), select, textarea"));
      const issues = inputs.filter((el: any) => {
        const id = el.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = el.getAttribute("aria-label");
        const hasAriaLabelledBy = el.getAttribute("aria-labelledby");
        const hasTitle = el.getAttribute("title");
        const placeholderOnly = el.getAttribute("placeholder") && !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle;
        return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle;
      });
      return { count: issues.length, sample: issues[0]?.outerHTML?.slice(0, 150) };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.sample }
      : { status: "pass" };
  },

  "si-5": async (page) => {
    return { status: "manual", evidence: "Compare navigation order and position across at least 3 different pages of the site." };
  },

  "si-6": async (page) => {
    const result = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll("p, li")).map((el) => el.textContent || "");
      const bodyText = paragraphs.join(" ").replace(/\s+/g, " ").trim().slice(0, 3000);
      if (bodyText.length < 100) return { score: null, text: "" };
      // Simplified Flesch-Kincaid grade calculation
      const sentences = bodyText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const words = bodyText.split(/\s+/).filter((w) => w.length > 0);
      const syllables = words.reduce((acc, word) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, "");
        if (!clean) return acc;
        let count = clean.replace(/[^aeiouy]/g, "").length || 1;
        if (clean.endsWith("e") && count > 1) count--;
        return acc + Math.max(1, count);
      }, 0);
      if (sentences.length === 0 || words.length === 0) return { score: null, text: "" };
      const grade = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
      return { score: Math.round(grade * 10) / 10, wordCount: words.length };
    });
    if (!result.score) return { status: "manual", evidence: "Insufficient text to calculate reading level." };
    return result.score <= 9
      ? { status: "pass", evidence: `Flesch-Kincaid Grade ${result.score} (target ≤ 9) — ${result.wordCount} words analysed` }
      : { status: "fail", evidence: `Flesch-Kincaid Grade ${result.score} (target ≤ 9) — content may be too complex for some users` };
  },

  // ── Principle 4 — Perceptible Information ───────────────────────────────
  "pi-1": async (page) => {
    const result = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      const missing = imgs.filter((img: any) => img.getAttribute("alt") === null);
      const badAlt = imgs.filter((img: any) => {
        const alt = img.getAttribute("alt") || "";
        const src = (img.getAttribute("src") || "").split("/").pop() || "";
        return alt === src || ["image", "photo", "picture", "img", "icon"].includes(alt.toLowerCase());
      });
      return { missing: missing.length, badAlt: badAlt.length, total: imgs.length, sample: missing[0]?.outerHTML?.slice(0, 150) };
    });
    if (result.missing > 0 || result.badAlt > 0) {
      return {
        status: "fail",
        count: result.missing + result.badAlt,
        evidence: `${result.missing} images missing alt, ${result.badAlt} with meaningless alt text (of ${result.total} total images). Sample: ${result.sample}`,
      };
    }
    return { status: "pass", evidence: `All ${result.total} images have alt text` };
  },

  "pi-2": async (page) => {
    const result = await page.evaluate(() => {
      // Look for common color-only status patterns
      const colorOnlyPatterns = [
        { selector: "[style*='color: red']:not([aria-label]):not([role])", label: "red-only error" },
        { selector: "[style*='color: green']:not([aria-label]):not([role])", label: "green-only success" },
        { selector: ".error:not([aria-label]):not([aria-describedby])", label: ".error class without ARIA" },
        { selector: ".success:not([aria-label])", label: ".success class without ARIA" },
      ];
      const found: string[] = [];
      colorOnlyPatterns.forEach((p) => {
        const count = document.querySelectorAll(p.selector).length;
        if (count > 0) found.push(`${count} ${p.label}`);
      });
      return found;
    });
    return result.length > 0
      ? { status: "fail", count: result.length, evidence: result.join(" | ") }
      : { status: "manual", evidence: "Automated color-only detection is limited. Use the Vision Simulator with colour blindness filters to manually verify status indicators." };
  },

  "pi-3": async (page) => {
    const result = await page.evaluate(() => {
      function getLuminance(r: number, g: number, b: number) {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function contrastRatio(l1: number, l2: number) {
        const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (lighter + 0.05) / (darker + 0.05);
      }
      function parseColor(color: string): [number, number, number] | null {
        const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (m) return [+m[1], +m[2], +m[3]];
        return null;
      }

      const textEls = Array.from(document.querySelectorAll("p, a, button, label, h1, h2, h3, h4, h5, h6, span, li, td, th"))
        .filter((el: any) => el.children.length === 0 && el.textContent?.trim().length > 0)
        .slice(0, 50); // sample first 50

      const failures: string[] = [];
      textEls.forEach((el: any) => {
        const styles = window.getComputedStyle(el);
        const fg = parseColor(styles.color);
        const bg = parseColor(styles.backgroundColor);
        if (!fg || !bg) return;
        // Skip transparent (rgba) backgrounds — parseColor only handles rgb()
        if (styles.backgroundColor === "transparent" || styles.backgroundColor === "rgba(0, 0, 0, 0)") return;
        const ratio = contrastRatio(getLuminance(...fg), getLuminance(...bg));
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        const isLarge = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
        const required = isLarge ? 3 : 4.5;
        if (ratio < required) {
          failures.push(`"${el.textContent?.slice(0, 30)}" ratio ${ratio.toFixed(2)}:1 (need ${required}:1)`);
        }
      });
      return { failures: failures.slice(0, 5), count: failures.length };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.failures.join(" | ") }
      : { status: "pass" };
  },

  "pi-4": async (page) => {
    const result = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll("video"));
      const missing = videos.filter((v) => !v.querySelector("track[kind='captions'], track[kind='subtitles']"));
      return { missing: missing.length, total: videos.length };
    });
    if (result.total === 0) return { status: "na", evidence: "No video elements found" };
    return result.missing > 0
      ? { status: "fail", count: result.missing, evidence: `${result.missing} of ${result.total} videos missing captions track` }
      : { status: "pass", evidence: `All ${result.total} videos have captions` };
  },

  "pi-5": async (page) => {
    const result = await page.evaluate(() => {
      const iconButtons = Array.from(document.querySelectorAll("button, a, [role='button']")).filter((el: any) => {
        const hasText = el.textContent?.trim().length > 0;
        const hasSvg = el.querySelector("svg");
        const hasImg = el.querySelector("img");
        const ariaLabel = el.getAttribute("aria-label");
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        const title = el.getAttribute("title");
        // Icon-only = has SVG/img but no visible text, and no accessible name
        return (hasSvg || hasImg) && !hasText && !ariaLabel && !ariaLabelledBy && !title;
      });
      return { count: iconButtons.length, sample: iconButtons[0]?.outerHTML?.slice(0, 150) };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.sample }
      : { status: "pass" };
  },

  "pi-6": async (page) => {
    const result = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let outlineNoneCount = 0;
      styleSheets.forEach((sheet) => {
        try {
          Array.from(sheet.cssRules).forEach((rule: any) => {
            if (rule.selectorText?.includes(":focus") || rule.selectorText?.includes(":focus-visible")) {
              const text = rule.cssText || "";
              if (text.includes("outline: none") || text.includes("outline: 0") || text.includes("outline:none") || text.includes("outline:0")) {
                outlineNoneCount++;
              }
            }
          });
        } catch (_) {}
      });
      return { count: outlineNoneCount };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: `${result.count} CSS rule(s) remove focus outline without replacement — keyboard users cannot see focus` }
      : { status: "pass" };
  },

  // ── Principle 5 — Tolerance for Error ───────────────────────────────────
  "te-1": async (page) => {
    return { status: "manual", evidence: "Fill in a form field with invalid data and tab away. Check if an error appears before you submit the form." };
  },

  "te-2": async (page) => {
    const result = await page.evaluate(() => {
      const deleteBtns = Array.from(document.querySelectorAll("button, a")).filter((el: any) => {
        const text = (el.textContent || "").toLowerCase();
        return text.includes("delete") || text.includes("remove") || text.includes("cancel subscription");
      });
      return { count: deleteBtns.length };
    });
    if (result.count === 0) return { status: "na", evidence: "No obvious destructive action buttons found on this page" };
    return { status: "manual", evidence: `${result.count} potentially destructive action(s) found. Click each to verify a confirmation dialog appears before the action executes.` };
  },

  "te-3": async (page) => {
    return { status: "manual", evidence: "Complete a multi-step form or checkout flow. Verify a review/confirmation step appears before final submission." };
  },

  "te-4": async (page) => {
    const result = await page.evaluate(() => {
      const emailInputs = document.querySelectorAll("input[type='email']");
      return { count: emailInputs.length };
    });
    if (result.count === 0) return { status: "na" };
    return { status: "manual", evidence: `${result.count} email input(s) found. Enter an invalid email and check if the error message suggests a correction.` };
  },

  "te-5": async (page) => {
    const result = await page.evaluate(() => {
      const personalFields: Record<string, string> = {
        "input[name*='name']": "name",
        "input[name*='email']": "email",
        "input[type='email']": "email",
        "input[name*='phone']": "tel",
        "input[name*='address']": "street-address",
        "input[name*='postcode'], input[name*='zipcode'], input[name*='zip']": "postal-code",
      };
      const missing: string[] = [];
      Object.entries(personalFields).forEach(([sel, expected]) => {
        document.querySelectorAll(sel).forEach((el: any) => {
          const ac = el.getAttribute("autocomplete");
          if (!ac || ac === "off") {
            missing.push(`${el.name || sel} missing autocomplete="${expected}"`);
          }
        });
      });
      return { missing: missing.slice(0, 5), count: missing.length };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.missing.join(" | ") }
      : { status: "pass" };
  },

  // ── Principle 6 — Low Physical Effort ───────────────────────────────────
  "le-1": async (page) => {
    const result = await page.evaluate(() => {
      const firstFocusable = document.querySelector("a, button, input");
      const skipLinks = Array.from(document.querySelectorAll("a")).filter((a: any) => {
        const href = a.getAttribute("href") || "";
        const text = (a.textContent || "").toLowerCase();
        return href.startsWith("#") && (text.includes("skip") || text.includes("main") || text.includes("content"));
      });
      return { count: skipLinks.length, sample: skipLinks[0]?.outerHTML?.slice(0, 150) };
    });
    return result.count > 0
      ? { status: "pass", evidence: result.sample }
      : { status: "fail", evidence: "No skip navigation link found. Add <a href='#main-content'>Skip to main content</a> as the first element in the body." };
  },

  "le-2": async (page) => {
    return { status: "manual", evidence: "Open a modal with the keyboard. Verify focus moves into it. Press Escape. Verify focus returns to the button that opened it." };
  },

  "le-3": async (page) => {
    return { status: "manual", evidence: "Tab through all interactive components. Verify Tab or Esc can always move focus away without reloading the page." };
  },

  "le-4": async (page) => {
    const result = await page.evaluate(() => {
      const landmarks = {
        main: document.querySelectorAll("main, [role='main']").length,
        nav: document.querySelectorAll("nav, [role='navigation']").length,
        aside: document.querySelectorAll("aside, [role='complementary']").length,
      };
      const pageHeight = document.body.scrollHeight;
      const hasBackToTop = Array.from(document.querySelectorAll("a, button")).some((el: any) =>
        (el.textContent || "").toLowerCase().includes("top") || (el.getAttribute("href") || "") === "#top"
      );
      return { landmarks, pageHeight, hasBackToTop };
    });
    const issues: string[] = [];
    if (result.landmarks.main === 0) issues.push("No <main> landmark");
    if (result.landmarks.nav === 0) issues.push("No <nav> landmark");
    if (result.pageHeight > 3000 && !result.hasBackToTop) issues.push("Long page without back-to-top link");
    return issues.length > 0
      ? { status: "fail", count: issues.length, evidence: issues.join(" | ") }
      : { status: "pass", evidence: `Landmarks: main(${result.landmarks.main}), nav(${result.landmarks.nav}), aside(${result.landmarks.aside})` };
  },

  "le-5": async (page) => {
    const result = await page.evaluate(() => {
      // Look for tooltip/hover-only patterns
      const hoverMenus = document.querySelectorAll("[onmouseover], [onmouseenter]");
      return { count: hoverMenus.length };
    });
    if (result.count === 0) return { status: "pass" };
    return { status: "manual", count: result.count, evidence: `${result.count} hover event handler(s) found. Verify each has a keyboard/click equivalent.` };
  },

  // ── Principle 7 — Size & Space ────────────────────────────────────────────
  "ss-1": async (page) => {
    const result = await page.evaluate(() => {
      const interactives = Array.from(document.querySelectorAll("a, button, input, select, [role='button']"))
        .filter((el: any) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      const tooClose: string[] = [];
      for (let i = 0; i < interactives.length - 1; i++) {
        const r1 = (interactives[i] as any).getBoundingClientRect();
        const r2 = (interactives[i + 1] as any).getBoundingClientRect();
        if (Math.abs(r1.right - r2.left) < 8 && Math.abs(r1.top - r2.top) < 44) {
          tooClose.push(`${(interactives[i] as any).tagName} and ${(interactives[i + 1] as any).tagName} too close`);
        }
      }
      return { count: tooClose.length, sample: tooClose.slice(0, 3) };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: result.sample.join(" | ") }
      : { status: "pass" };
  },

  "ss-2": async (page) => {
    const result = await page.evaluate(() => {
      const targets = Array.from(document.querySelectorAll("a, button, [role='button'], input[type='checkbox'], input[type='radio']"));
      const tooSmall = targets.filter((el: any) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
      });
      return { count: tooSmall.length, total: targets.length, sample: tooSmall[0]?.outerHTML?.slice(0, 100) };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: `${result.count}/${result.total} targets below 24×24px minimum. Sample: ${result.sample}` }
      : { status: "pass" };
  },

  "ss-3": async (page) => {
    const result = await page.evaluate(() => {
      const viewport = document.querySelector("meta[name='viewport']");
      const content = viewport?.getAttribute("content") || "";
      return { content };
    });
    if (result.content.includes("user-scalable=no") || /maximum-scale=[01](\.[0-9])?($|[^0-9])/.test(result.content)) {
      return { status: "fail", evidence: `Viewport disables zoom: ${result.content}` };
    }
    return { status: "pass", evidence: result.content || "No viewport meta (defaults allow zoom)" };
  },

  "ss-4": async (page) => {
    return { status: "manual", evidence: "Test at 320px viewport width using browser dev tools. Check for horizontal overflow and hidden/broken content." };
  },

  "ss-5": async (page) => {
    const result = await page.evaluate(() => {
      const scrollable = Array.from(document.querySelectorAll("*")).filter((el: any) => {
        const style = window.getComputedStyle(el);
        return (style.overflow === "auto" || style.overflow === "scroll" || style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight;
      });
      const withoutTabindex = scrollable.filter((el: any) => {
        const tag = el.tagName.toLowerCase();
        return !["main", "body", "html", "article", "section"].includes(tag) && el.getAttribute("tabindex") === null;
      });
      return { count: withoutTabindex.length, total: scrollable.length };
    });
    return result.count > 0
      ? { status: "fail", count: result.count, evidence: `${result.count} scrollable container(s) missing tabindex='0' — keyboard users cannot scroll them` }
      : { status: "pass" };
  },
};

// ─── Main scanner function ────────────────────────────────────────────────────

export async function runUDScan(url: string): Promise<UDReport> {
  // Dynamic import to avoid breaking builds where Puppeteer isn't installed
  const puppeteer = await import("puppeteer").catch(() => null);
  if (!puppeteer) throw new Error("Puppeteer not available. Run: npm install puppeteer");

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (err) {
    await browser.close();
    throw new Error(`Could not load URL: ${url}`);
  }

  const principleResults: UDPrincipleResult[] = [];
  let totalCritical = 0, totalSerious = 0, totalModerate = 0, totalMinor = 0;

  for (const principle of UD_PRINCIPLES) {
    const results: UDCheckResult[] = [];

    for (const check of principle.checks) {
      const runner = CHECK_RUNNERS[check.id];
      let checkResult: UDCheckResult;

      if (runner) {
        try {
          const raw = await runner(page, check.id);
          checkResult = { check, ...raw };
        } catch (err) {
          checkResult = { check, status: "manual", evidence: "Check failed to run — inspect manually." };
        }
      } else {
        checkResult = { check, status: "manual" };
      }

      results.push(checkResult);

      if (checkResult.status === "fail") {
        if (check.severity === "critical") totalCritical++;
        else if (check.severity === "serious") totalSerious++;
        else if (check.severity === "moderate") totalModerate++;
        else totalMinor++;
      }
    }

    const passed = results.filter((r) => r.status === "pass").length;
    const failed = results.filter((r) => r.status === "fail").length;
    const manual = results.filter((r) => r.status === "manual").length;
    const applicable = results.filter((r) => r.status !== "na").length;
    const score = applicable > 0 ? Math.round((passed / applicable) * 100) : 100;

    principleResults.push({ principle, results, score, passed, failed, manual });
  }

  await browser.close();

  const allScores = principleResults.map((p) => p.score);
  const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  return {
    url,
    scannedAt: new Date().toISOString(),
    overallScore,
    principleResults,
    summary: {
      critical: totalCritical,
      serious: totalSerious,
      moderate: totalModerate,
      minor: totalMinor,
      totalIssues: totalCritical + totalSerious + totalModerate + totalMinor,
    },
  };
}
