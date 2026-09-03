import { redirect } from "next/navigation";

/**
 * The marketing pages have always pointed at /create. The builder lives under
 * /events/new, so this keeps those links working — and carries a chosen
 * template through, since that is why someone clicks from a template card.
 */
export default async function CreateRedirect({ searchParams }: PageProps<"/create">) {
  const { template } = await searchParams;
  const query = typeof template === "string" ? `?template=${encodeURIComponent(template)}` : "";
  redirect(`/events/new${query}`);
}
