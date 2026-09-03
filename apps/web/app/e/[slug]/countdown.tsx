"use client";

import { useEffect, useState } from "react";

function remaining(target: string) {
  const milliseconds = Math.max(0, new Date(target).getTime() - Date.now());
  const totalSeconds = Math.floor(milliseconds / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Starts from the server-rendered date and only begins ticking after mount:
 * rendering "now" during SSR would guarantee a hydration mismatch.
 */
export function Countdown({ target }: { target: string }) {
  const [parts, setParts] = useState(() => remaining(target));
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(true);
    setParts(remaining(target));
    const timer = window.setInterval(() => setParts(remaining(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const units = [
    { label: "days", value: parts.days },
    { label: "hours", value: parts.hours },
    { label: "minutes", value: parts.minutes },
    { label: "seconds", value: parts.seconds },
  ];

  return (
    <ul className="flex flex-wrap gap-6" suppressHydrationWarning>
      {units.map((unit) => (
        <li key={unit.label}>
          <span className="block text-3xl tabular-nums">
            {live ? String(unit.value).padStart(2, "0") : "--"}
          </span>
          <span className="block text-sm opacity-70">{unit.label}</span>
        </li>
      ))}
    </ul>
  );
}
