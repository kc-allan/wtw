import Link from "next/link";

type WordmarkProps = {
  /** The footer renders the wordmark on the dark green surface. */
  tone?: "dark" | "light";
  className?: string;
};

export function Wordmark({ tone = "dark", className = "" }: WordmarkProps) {
  return (
    <Link
      href="/"
      className={`flex flex-col items-start ${className}`}
      aria-label="Worth the Wait Celebrations, home"
    >
      <span
        className={`text-2xl font-semibold ${
          tone === "dark" ? "text-black" : "text-chalk"
        }`}
      >
        Worth the Wait
      </span>
      <span className="text-base text-ember">Celebrations</span>
    </Link>
  );
}
