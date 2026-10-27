"use client";

import Script from "next/script";

export function TurnstileLoader() {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null;
  return (
    <Script
      id="turnstile-api"
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive"
      onReady={() => {
        window.dispatchEvent(new Event("turnstile-ready"));
      }}
    />
  );
}
