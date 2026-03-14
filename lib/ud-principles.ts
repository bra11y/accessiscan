// ─── Universal Design Principles — Full Knowledge Base ───────────────────────
// Drop into: lib/ud-principles.ts
// Based on the 7 Principles of Universal Design, NC State University (1997)
// Extended with digital/web-specific checks for each principle

import type { UDPrinciple } from "@/types/ud";

export const UD_PRINCIPLES: UDPrinciple[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "equitable-use",
    number: 1,
    title: "Equitable Use",
    tagline: "Useful to people with diverse abilities. No segregation.",
    description:
      "The design is useful and marketable to people with diverse abilities. It provides the same means of use for all users — identical whenever possible, equivalent when not. It avoids segregating or stigmatising any users.",
    color: "#378ADD",
    checks: [
      {
        id: "eu-1",
        title: "No separate accessible version",
        description:
          "The site must not redirect users to a separate 'accessible version'. Separate versions go stale, signal stigma, and fail WCAG 1.3.1.",
        wcagRef: "WCAG 1.3.1",
        severity: "critical",
        howToFix:
          "Remove the separate accessible version. Fix the main site to be accessible. Redirect any /accessible paths to the main URL.",
        howToTest:
          "Search the DOM for links containing 'accessible version', 'text only', or 'screen reader version'. Check for meta redirects.",
      },
      {
        id: "eu-2",
        title: "Login wall does not block assistive technology users",
        description:
          "Core functionality must be reachable without authentication. AT users should not hit barriers before they can even log in.",
        wcagRef: "WCAG 2.1.1",
        severity: "critical",
        howToFix:
          "Audit your login and signup flows with a keyboard only and screen reader. Every field, button, and error must be reachable and announced.",
        howToTest:
          "Use keyboard-only navigation on /login and /signup. Check all form fields have associated labels. Check error messages are announced via aria-live.",
      },
      {
        id: "eu-3",
        title: "Privacy is equally maintained for all users",
        description:
          "AT users should not be forced to expose personal information in a way that sighted/mouse users are not.",
        severity: "serious",
        howToFix:
          "Ensure CAPTCHA alternatives exist (audio CAPTCHA, logic challenge). Never require a phone number where an email suffices.",
        howToTest:
          "Check if CAPTCHA is present. If so, verify an audio or alternative exists. Check if visual-only verification is required anywhere.",
      },
      {
        id: "eu-4",
        title: "Identical feature set for all input methods",
        description:
          "Every feature available to mouse users must be available to keyboard users, touch users, and voice control users.",
        wcagRef: "WCAG 2.1.1",
        severity: "critical",
        howToFix:
          "Audit every interactive element for keyboard operability. Custom widgets (dropdowns, sliders, modals) must implement ARIA patterns.",
        howToTest:
          "Tab through the entire page. Verify every clickable element is focusable and operable with Enter/Space. Check for keyboard traps.",
      },
      {
        id: "eu-5",
        title: "No content flashes or auto-plays that exclude seizure users",
        description:
          "Flashing content, auto-playing media with sound, and rapid animations can exclude users with photosensitive epilepsy or vestibular disorders.",
        wcagRef: "WCAG 2.3.1",
        severity: "critical",
        howToFix:
          "Remove content that flashes more than 3 times per second. Add prefers-reduced-motion media query to all animations. Add controls to any auto-playing media.",
        howToTest:
          "Check for elements with CSS animation or transition without a prefers-reduced-motion override. Check for video elements with autoplay attribute.",
      },
      {
        id: "eu-6",
        title: "Language attribute is set on the html element",
        description:
          "The lang attribute on <html> enables screen readers to use the correct pronunciation and text-to-speech engine for the content language.",
        wcagRef: "WCAG 3.1.1",
        severity: "serious",
        howToFix: "Add lang='en' (or appropriate BCP 47 code) to the <html> element.",
        howToTest: "Check document.documentElement.getAttribute('lang'). Must not be empty or absent.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "flexibility",
    number: 2,
    title: "Flexibility in Use",
    tagline: "Accommodates a wide range of preferences and abilities.",
    description:
      "The design accommodates a wide range of individual preferences and abilities — left-hand or right-hand access, adaptability to user pace, and choice in methods of use.",
    color: "#1D9E75",
    checks: [
      {
        id: "fl-1",
        title: "Keyboard navigation — full page operability",
        description:
          "Every interactive element must be operable via keyboard alone, with a logical tab order that follows visual flow.",
        wcagRef: "WCAG 2.1.1",
        severity: "critical",
        howToFix:
          "Ensure all interactive elements are in the natural DOM order. Use tabindex='0' only for custom widgets. Never use tabindex > 0.",
        howToTest:
          "Press Tab from the browser address bar and verify focus moves through every interactive element in logical order without getting trapped.",
      },
      {
        id: "fl-2",
        title: "Pointer target size minimum 44×44px",
        description:
          "Touch targets smaller than 44×44 CSS pixels are difficult for users with motor impairments, older users, and anyone on a touchscreen.",
        wcagRef: "WCAG 2.5.5",
        severity: "serious",
        howToFix:
          "Use min-width: 44px; min-height: 44px on all interactive elements. Use padding rather than icon-only buttons. Increase spacing between adjacent targets.",
        howToTest:
          "Query all a, button, input, select elements. Check computed width and height. Flag anything below 44px in either dimension.",
      },
      {
        id: "fl-3",
        title: "Session timeouts have user warning and extension",
        description:
          "Users who work slowly — due to disability, cognitive load, or interruption — must be warned before session expiry and given a way to extend.",
        wcagRef: "WCAG 2.2.1",
        severity: "serious",
        howToFix:
          "Show a warning dialog at least 20 seconds before timeout. Provide a button to extend the session by at least 10x the original limit.",
        howToTest:
          "Check for any session timeout logic. If present, verify a timeout warning component exists with an extend option.",
      },
      {
        id: "fl-4",
        title: "Motion/animation respects prefers-reduced-motion",
        description:
          "Users with vestibular disorders, epilepsy, or motion sensitivity must be able to disable non-essential animation.",
        wcagRef: "WCAG 2.3.3",
        severity: "serious",
        howToFix:
          "Wrap all CSS animations and transitions in @media (prefers-reduced-motion: no-preference). Provide a pause button for any essential animation.",
        howToTest:
          "Enable prefers-reduced-motion in OS settings. Reload the page. All animations should stop or be significantly reduced.",
      },
      {
        id: "fl-5",
        title: "Content reflows at 320px without horizontal scroll",
        description:
          "Users who zoom to 400% (equivalent to 320px viewport width) must be able to read all content without horizontal scrolling.",
        wcagRef: "WCAG 1.4.10",
        severity: "serious",
        howToFix:
          "Use responsive layouts with CSS flexbox or grid. Replace fixed pixel widths with max-width and percentage widths. Test at 400% zoom.",
        howToTest:
          "Set viewport to 320px wide. Verify no horizontal scrollbar appears and all content is readable without scrolling sideways.",
      },
      {
        id: "fl-6",
        title: "Text can be resized to 200% without loss of content",
        description:
          "Users must be able to resize text up to 200% without content or functionality being lost.",
        wcagRef: "WCAG 1.4.4",
        severity: "serious",
        howToFix:
          "Use relative units (rem, em, %) for font sizes and container heights. Avoid overflow: hidden on text containers.",
        howToTest:
          "Use browser zoom to 200%. Check that all text is still readable and no content is cut off or overlapping.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "simple-intuitive",
    number: 3,
    title: "Simple & Intuitive Use",
    tagline: "Easy to understand, regardless of experience or language.",
    description:
      "Use of the design is easy to understand, regardless of the user's experience, knowledge, language skills, or current concentration level.",
    color: "#EF9F27",
    checks: [
      {
        id: "si-1",
        title: "Page titles are descriptive and unique",
        description:
          "Each page must have a <title> that describes its content. Generic titles like 'Home' or 'Page' fail this check.",
        wcagRef: "WCAG 2.4.2",
        severity: "serious",
        howToFix:
          "Format titles as: 'Page Name — Site Name'. Ensure every page has a unique, descriptive title that names the current content.",
        howToTest:
          "Check document.title on every scanned page. Flag duplicates and titles shorter than 10 characters.",
      },
      {
        id: "si-2",
        title: "Heading hierarchy is logical (H1 → H2 → H3)",
        description:
          "Headings create a document outline. Skipping levels (H1 → H3) breaks the logical structure and confuses screen reader users.",
        wcagRef: "WCAG 1.3.1",
        severity: "serious",
        howToFix:
          "Ensure one H1 per page. Heading levels must not skip — an H3 must be preceded by an H2. Use CSS for visual size, not heading level.",
        howToTest:
          "Extract all heading elements in DOM order. Check that levels never jump by more than 1. Verify exactly one H1 exists.",
      },
      {
        id: "si-3",
        title: "Error messages identify the field and explain how to fix",
        description:
          "Form errors must identify which field has the error and describe how to correct it — not just say 'Invalid input'.",
        wcagRef: "WCAG 3.3.1",
        severity: "serious",
        howToFix:
          "Write error messages in plain language. Name the field. Explain what is wrong and what is expected. E.g. 'Email must include an @ symbol.'",
        howToTest:
          "Submit forms with invalid data. Check that error messages name the field and give actionable guidance.",
      },
      {
        id: "si-4",
        title: "Form fields have visible labels (not placeholder-only)",
        description:
          "Placeholders disappear when typing. Users with cognitive disabilities or who zoom in lose context. Every input must have a persistent visible label.",
        wcagRef: "WCAG 3.3.2",
        severity: "critical",
        howToFix:
          "Add a <label> element for every input. Pair it with the input via htmlFor/id. Never rely on placeholder as the only label.",
        howToTest:
          "Query all input, select, textarea elements. Check each has an associated <label> via for/id or aria-label. Flag placeholder-only fields.",
      },
      {
        id: "si-5",
        title: "Navigation is consistent across pages",
        description:
          "Navigation components that appear on multiple pages must appear in the same location and same order.",
        wcagRef: "WCAG 3.2.3",
        severity: "moderate",
        howToFix:
          "Use a shared layout component for navigation. Do not reorder nav items between pages. Highlight current page in nav.",
        howToTest:
          "Compare the nav structure across at least 3 different pages. Check order and placement are identical.",
      },
      {
        id: "si-6",
        title: "Reading level is appropriate (Flesch-Kincaid ≤ Grade 9)",
        description:
          "Body copy should be readable by someone with a middle-school reading level. Complex jargon excludes users with cognitive disabilities, non-native speakers, and low-literacy users.",
        severity: "moderate",
        howToFix:
          "Use short sentences (under 20 words). Prefer common words over technical jargon. Use the active voice. Define acronyms on first use.",
        howToTest:
          "Run body text through Flesch-Kincaid readability formula. Flag content scoring above Grade 9.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "perceptible-info",
    number: 4,
    title: "Perceptible Information",
    tagline: "Communicates information effectively, for all senses.",
    description:
      "The design communicates necessary information effectively to the user, regardless of ambient conditions or the user's sensory abilities. Uses different modes — pictorial, verbal, tactile.",
    color: "#7F77DD",
    checks: [
      {
        id: "pi-1",
        title: "All images have meaningful alt text",
        description:
          "Informative images must have descriptive alt text. Decorative images must have alt='' so screen readers skip them.",
        wcagRef: "WCAG 1.1.1",
        severity: "critical",
        howToFix:
          "Add alt text to every <img>. Describe what the image shows and why it is there. Use alt='' for purely decorative images. Never use the filename as alt text.",
        howToTest:
          "Query all img elements. Flag those missing alt attribute entirely. Flag those where alt equals the src filename. Flag those with alt='image' or alt='photo'.",
      },
      {
        id: "pi-2",
        title: "Color is not the only means of conveying information",
        description:
          "Information conveyed only through color is invisible to users who are color blind or using high-contrast mode.",
        wcagRef: "WCAG 1.4.1",
        severity: "critical",
        howToFix:
          "Always pair color with a text label, icon, or pattern. Status indicators must say 'Error', not just be red. Chart legends must include text.",
        howToTest:
          "Enable a color blindness simulation. Check if all status indicators, charts, and form validation states are still understandable.",
      },
      {
        id: "pi-3",
        title: "Text contrast ratio meets WCAG AA (4.5:1 normal, 3:1 large)",
        description:
          "Low contrast text is unreadable for users with low vision, in bright light, or on low-quality screens.",
        wcagRef: "WCAG 1.4.3",
        severity: "critical",
        howToFix:
          "Use a contrast checker on all text/background combinations. Minimum 4.5:1 for text under 18pt. Minimum 3:1 for text 18pt+ or bold 14pt+.",
        howToTest:
          "Extract all text elements and their computed foreground/background colors. Calculate contrast ratios using the WCAG algorithm. Flag failures.",
      },
      {
        id: "pi-4",
        title: "Videos have captions",
        description:
          "All videos with spoken content must have accurate captions for deaf and hard-of-hearing users.",
        wcagRef: "WCAG 1.2.2",
        severity: "critical",
        howToFix:
          "Add a <track kind='captions'> element to every <video>. Use WebVTT format. Auto-generated captions alone do not satisfy this — they must be reviewed for accuracy.",
        howToTest:
          "Query all <video> elements. Check for a <track kind='captions'> or <track kind='subtitles'> child. Flag those without.",
      },
      {
        id: "pi-5",
        title: "Icons have accessible names",
        description:
          "Icon-only buttons are invisible to screen reader users unless they have an accessible name via aria-label or visually hidden text.",
        wcagRef: "WCAG 4.1.2",
        severity: "serious",
        howToFix:
          "Add aria-label='Close menu' to icon buttons. Or add <span class='sr-only'>Close menu</span> inside the button. Never use an empty button.",
        howToTest:
          "Query all buttons that contain only an SVG or img with no visible text. Check for aria-label or aria-labelledby. Flag empty accessible names.",
      },
      {
        id: "pi-6",
        title: "Focus indicator is visible on all interactive elements",
        description:
          "Keyboard users must be able to see which element has focus. outline: none without a replacement fails this check.",
        wcagRef: "WCAG 2.4.7",
        severity: "critical",
        howToFix:
          "Never suppress the focus ring without a custom replacement. Use :focus-visible { outline: 2px solid; outline-offset: 3px; } — no color needed, the browser provides system colour.",
        howToTest:
          "Tab through the page. A visible focus indicator must be present on every interactive element at all times.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "tolerance-error",
    number: 5,
    title: "Tolerance for Error",
    tagline: "Minimises hazards from accidental or unintended actions.",
    description:
      "The design minimises hazards and the adverse consequences of accidental or unintended actions. Elements are arranged to minimise hazards and errors. Warnings are provided. Fail-safe features are included.",
    color: "#D85A30",
    checks: [
      {
        id: "te-1",
        title: "Inline validation on forms — errors shown before submission",
        description:
          "Users with cognitive or motor disabilities benefit from knowing about errors as they fill the form, not only after submission.",
        wcagRef: "WCAG 3.3.1",
        severity: "serious",
        howToFix:
          "Add real-time or on-blur validation to form fields. Show the error adjacent to the field, not only in a banner at the top.",
        howToTest:
          "Enter invalid data in a form field and move focus away. An error message should appear before form submission.",
      },
      {
        id: "te-2",
        title: "Destructive actions require confirmation",
        description:
          "Actions that cannot be undone — deleting data, cancelling a subscription, submitting a payment — must ask for confirmation first.",
        wcagRef: "WCAG 3.3.4",
        severity: "serious",
        howToFix:
          "Add a confirmation dialog before any irreversible action. The dialog must describe what will happen and offer Cancel.",
        howToTest:
          "Find all delete, submit, and cancel actions on the page. Check whether they show a confirmation step before executing.",
      },
      {
        id: "te-3",
        title: "Users can review before final submission",
        description:
          "Forms that collect sensitive or financial data must let users review and correct their input before final submission.",
        wcagRef: "WCAG 3.3.4",
        severity: "moderate",
        howToFix:
          "Add a review step before payment or account creation. Display all entered data for confirmation. Allow going back to edit.",
        howToTest:
          "Complete a multi-step form or checkout flow. Check whether a review screen appears before the final irreversible submit.",
      },
      {
        id: "te-4",
        title: "Error suggestions are provided (not just error messages)",
        description:
          "When the system knows what the correct input should be, it must suggest it.",
        wcagRef: "WCAG 3.3.3",
        severity: "moderate",
        howToFix:
          "For known formats (email, phone, date, postcode), provide an example or suggest a correction. E.g. 'Did you mean user@example.com?'",
        howToTest:
          "Submit a form with a slightly wrong email (missing TLD). Check if the error message suggests a correction.",
      },
      {
        id: "te-5",
        title: "Autocomplete is enabled on personal data fields",
        description:
          "Autocomplete reduces typing effort and errors, especially for users with motor disabilities or memory difficulties.",
        wcagRef: "WCAG 1.3.5",
        severity: "moderate",
        howToFix:
          "Add autocomplete attributes to personal data fields: name, email, tel, street-address, postal-code, cc-number, etc.",
        howToTest:
          "Query all input elements in forms. Check for the autocomplete attribute on fields that collect personal information.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "low-effort",
    number: 6,
    title: "Low Physical Effort",
    tagline: "Efficient and comfortable with minimum fatigue.",
    description:
      "The design can be used efficiently and comfortably and with a minimum of fatigue. Allows the user to maintain a neutral body position. Uses reasonable operating forces. Minimises repetitive actions.",
    color: "#639922",
    checks: [
      {
        id: "le-1",
        title: "Skip navigation link present",
        description:
          "Keyboard users must be able to skip past repeated navigation to reach the main content without pressing Tab dozens of times.",
        wcagRef: "WCAG 2.4.1",
        severity: "serious",
        howToFix:
          "Add <a href='#main-content' class='skip-link'>Skip to main content</a> as the very first element in the body. Make it visible on focus.",
        howToTest:
          "Press Tab once from the browser address bar. The first focused element should be a skip link. Pressing Enter should move focus to the main content area.",
      },
      {
        id: "le-2",
        title: "Focus is managed correctly in modals and dynamic content",
        description:
          "When a modal opens, focus must move into it. When it closes, focus must return to the trigger. Without this, keyboard users must tab through the entire page again.",
        wcagRef: "WCAG 2.4.3",
        severity: "critical",
        howToFix:
          "On modal open: move focus to the first focusable element inside. Trap Tab within the modal. On close: return focus to the element that opened it.",
        howToTest:
          "Open a modal with keyboard. Verify focus moves into it. Press Escape or click close. Verify focus returns to the trigger button.",
      },
      {
        id: "le-3",
        title: "No keyboard trap",
        description:
          "Users must always be able to move focus away from any component using only the keyboard. Being trapped forces a page reload.",
        wcagRef: "WCAG 2.1.2",
        severity: "critical",
        howToFix:
          "Audit all interactive components with a keyboard. If Tab cannot exit a component, add a documented keyboard shortcut (Esc) to leave it.",
        howToTest:
          "Tab into every interactive widget. Verify Tab or Esc can always move focus away without reloading the page.",
      },
      {
        id: "le-4",
        title: "Repetitive content has a 'skip' or 'back to top' mechanism",
        description:
          "Long pages, repeated carousels, and data tables need mechanisms to jump to relevant sections, reducing scrolling and tabbing fatigue.",
        wcagRef: "WCAG 2.4.1",
        severity: "moderate",
        howToFix:
          "Add anchor links, a table of contents, or section landmarks for long pages. Add a 'Back to top' button on pages taller than 3 viewports.",
        howToTest:
          "Check if long pages have internal navigation anchors or a back-to-top mechanism. Check if landmark regions (main, nav, aside) are present.",
      },
      {
        id: "le-5",
        title: "No content requires pointer precision (drag-only, hover-only)",
        description:
          "Interactions that require holding a mouse button and dragging, or hovering to reveal content, exclude keyboard users and users with motor impairments.",
        wcagRef: "WCAG 2.5.1",
        severity: "serious",
        howToFix:
          "Replace drag-only interactions with click-based alternatives. Replace hover-only menus with click-toggle menus. Provide keyboard alternatives for all pointer gestures.",
        howToTest:
          "Identify all drag interactions and hover-only menus. Verify each has a keyboard equivalent.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "size-space",
    number: 7,
    title: "Size & Space for Use",
    tagline: "Appropriate size regardless of body, posture, or mobility.",
    description:
      "Appropriate size and space is provided for approach, reach, manipulation, and use regardless of user's body size, posture, or mobility.",
    color: "#D4537E",
    checks: [
      {
        id: "ss-1",
        title: "Touch targets are adequately spaced (8px minimum gap)",
        description:
          "Adjacent touch targets that are too close together cause accidental activation for users with tremors or large fingers.",
        wcagRef: "WCAG 2.5.8",
        severity: "serious",
        howToFix:
          "Ensure at least 8px of space between the edges of adjacent interactive elements. Increase padding rather than shrinking targets.",
        howToTest:
          "Query adjacent interactive elements. Calculate the gap between their bounding boxes. Flag pairs with less than 8px gap.",
      },
      {
        id: "ss-2",
        title: "Minimum interactive element size 24×24px (AAA: 44×44px)",
        description:
          "Elements smaller than 24×24px are nearly impossible to tap accurately on touchscreens, especially for users with motor impairments.",
        wcagRef: "WCAG 2.5.8",
        severity: "serious",
        howToFix:
          "Set min-width: 44px; min-height: 44px on all buttons and links. Use padding to increase clickable area without changing visual size.",
        howToTest:
          "Measure the computed dimensions of all interactive elements. Flag anything below 24px in width or height.",
      },
      {
        id: "ss-3",
        title: "Viewport meta tag does not disable user scaling",
        description:
          "user-scalable=no or maximum-scale=1 in the viewport meta tag prevents users from zooming in — a critical accessibility failure for low-vision users.",
        wcagRef: "WCAG 1.4.4",
        severity: "critical",
        howToFix:
          "Remove user-scalable=no and maximum-scale=1 from your viewport meta tag. The correct meta tag is: <meta name='viewport' content='width=device-width, initial-scale=1'>",
        howToTest:
          "Check the content attribute of <meta name='viewport'>. Flag if it contains user-scalable=no or maximum-scale less than 2.",
      },
      {
        id: "ss-4",
        title: "Layout is fully responsive and usable on mobile",
        description:
          "Users with physical disabilities often use mobile devices mounted to wheelchairs or held in non-standard positions. The site must be fully operable at all viewport sizes.",
        severity: "serious",
        howToFix:
          "Test the site at 320px, 375px, 768px, and 1024px viewport widths. Ensure all content is accessible and no features are hidden on mobile without an equivalent.",
        howToTest:
          "Use device emulation to test at 320px viewport width. Check for horizontal overflow, overlapping elements, and hidden functionality.",
      },
      {
        id: "ss-5",
        title: "Scrollable regions are keyboard accessible",
        description:
          "Custom scrollable containers (overflow: scroll divs) are not keyboard accessible by default. Users cannot scroll them without a mouse.",
        wcagRef: "WCAG 2.1.1",
        severity: "serious",
        howToFix:
          "Add tabindex='0' to scrollable containers that are not otherwise focusable. Ensure arrow keys scroll the container when it has focus.",
        howToTest:
          "Find all elements with overflow: auto or overflow: scroll. Verify they can receive keyboard focus and be scrolled with arrow keys.",
      },
    ],
  },
];

// Helper — get a principle by id
export function getPrinciple(id: string): UDPrinciple | undefined {
  return UD_PRINCIPLES.find((p) => p.id === id);
}

// Helper — get all check IDs across all principles
export function getAllCheckIds(): string[] {
  return UD_PRINCIPLES.flatMap((p) => p.checks.map((c) => c.id));
}
