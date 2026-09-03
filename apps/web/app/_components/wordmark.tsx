import Link from "next/link";

type WordmarkProps = {
  /** The footer renders the wordmark on the dark green surface. */
  tone?: "dark" | "light";
  /** Where it links to, or `null` when a parent already provides the link. */
  href?: string | null;
  className?: string;
};

export function Wordmark({ tone = "dark", href = "/", className = "" }: WordmarkProps) {
  const content = (
    <>
      <span
        className={`text-xl font-semibold whitespace-nowrap sm:text-2xl ${
          tone === "dark" ? "text-black" : "text-chalk"
        }`}
      >
        Worth the Wait
      </span>
      <span className="text-base text-ember">Celebrations</span>
    </>
  );

  // Nesting this inside another link would be invalid HTML, and the browser's
  // repair of it shows up as a hydration mismatch — so callers that provide
  // their own link pass `href={null}` and get a plain element instead.
  if (href === null) {
    return <span className={`flex flex-col items-start ${className}`}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={`flex flex-col items-start ${className}`}
      aria-label="Worth the Wait Celebrations, home"
    >
      {content}
    </Link>
  );
}
