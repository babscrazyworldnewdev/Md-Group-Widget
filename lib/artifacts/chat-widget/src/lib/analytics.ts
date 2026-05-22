function getBrowserInfo(): { browser: string; browserVersion: string } {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let browserVersion = "";

  if (/Edg\//.test(ua)) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
  } else if (/OPR\/|Opera/.test(ua)) {
    browser = "Opera";
    browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] ?? "";
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
  } else if (/MSIE|Trident/.test(ua)) {
    browser = "Internet Explorer";
    browserVersion = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] ?? "";
  }

  return { browser, browserVersion };
}

function getOSInfo(): { os: string; osVersion: string } {
  const ua = navigator.userAgent;
  let os = "Unknown";
  let osVersion = "";

  if (/Windows NT/.test(ua)) {
    os = "Windows";
    const v = ua.match(/Windows NT ([\d.]+)/)?.[1];
    const map: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.1": "XP" };
    osVersion = map[v ?? ""] ?? v ?? "";
  } else if (/Mac OS X/.test(ua)) {
    os = "macOS";
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "";
  } else if (/Android/.test(ua)) {
    os = "Android";
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] ?? "";
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = "iOS";
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "";
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  } else if (/CrOS/.test(ua)) {
    os = "Chrome OS";
  }

  return { os, osVersion };
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function getSessionId(): string {
  const key = "mdlaw_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export async function trackVisit(): Promise<void> {
  const { browser, browserVersion } = getBrowserInfo();
  const { os, osVersion } = getOSInfo();

  const payload = {
    sessionId: getSessionId(),
    browser,
    browserVersion,
    os,
    osVersion,
    device: getDeviceType(),
    screenWidth: String(screen.width),
    screenHeight: String(screen.height),
    language: navigator.language,
    referrer: document.referrer || "",
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    extra: {
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
    },
  };

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // silently fail — never block user experience
  }
}
