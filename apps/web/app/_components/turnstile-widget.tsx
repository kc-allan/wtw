"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        action: string;
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": () => void;
      }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ action }: { action: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!container || !sitekey) return;

    let widgetId: string | undefined;
    let hasIssuedToken = false;
    const name = `wtw_turnstile_${action}`;
    const writeToken = (token: string) => {
      hasIssuedToken = true;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${name}=${encodeURIComponent(token)}; Path=/; Max-Age=300; SameSite=Strict${secure}`;
    };
    const clearToken = () => {
      hasIssuedToken = false;
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
    };
    const render = () => {
      if (widgetId || !window.turnstile) return;
      widgetId = window.turnstile.render(container, {
        sitekey,
        action,
        callback: writeToken,
        "expired-callback": clearToken,
        "error-callback": clearToken,
      });
    };

    render();
    window.addEventListener("turnstile-ready", render);
    const tokenCookiePresent = () => document.cookie.split("; ").some((entry) => entry.startsWith(`${name}=`));
    const refreshTimer = window.setInterval(() => {
      if (hasIssuedToken && !tokenCookiePresent() && widgetId && window.turnstile) {
        hasIssuedToken = false;
        window.turnstile.reset(widgetId);
      }
    }, 1000);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("turnstile-ready", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action]);

  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-0" aria-label="Security check" />;
}
