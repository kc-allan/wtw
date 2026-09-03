import Image from "next/image";
import { HOST_ROLES, HOST_ROLE_ORDER, HostRole } from "@wtw/shared";
import { saveHostRole } from "@/lib/create-actions";

/**
 * The artwork on each card. It is decorative — the role is already named in
 * words above it — so it carries no alternative text of its own.
 */
const ILLUSTRATIONS: Record<HostRole, { src: string; width: number; height: number }> = {
  [HostRole.BRIDE]: { src: "/roles/bride.png", width: 311, height: 382 },
  [HostRole.GROOM]: { src: "/roles/groom.png", width: 311, height: 383 },
  [HostRole.PLANNER]: { src: "/roles/planner.png", width: 324, height: 382 },
  [HostRole.OTHER]: { src: "/roles/other.png", width: 171, height: 390 },
};

/**
 * Four cards, each its own submit: there is nothing else to answer here, so
 * choosing is the same gesture as continuing.
 */
export function HostRoleForm({ selected }: { selected?: HostRole }) {
  return (
    <form action={saveHostRole} className="mt-8">
      <fieldset>
        <legend className="sr-only">Who are you?</legend>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {HOST_ROLE_ORDER.map((role) => {
            const illustration = ILLUSTRATIONS[role];

            return (
              <button
                key={role}
                type="submit"
                name="hostRole"
                value={role}
                aria-pressed={selected === role}
                className={`flex min-h-[380px] cursor-pointer flex-col items-center gap-6 rounded-2xl bg-shell px-6 py-8 text-center transition-colors lg:min-h-[500px] ${
                  selected === role
                    ? "ring-2 ring-forest"
                    : "ring-1 ring-transparent hover:ring-rule"
                }`}
              >
                <span className="text-xl font-semibold text-black">
                  {HOST_ROLES[role].name}
                </span>

                <Image
                  src={illustration.src}
                  alt=""
                  width={illustration.width}
                  height={illustration.height}
                  // All four are the whole screen; none of them is below the fold.
                  priority
                  className="min-h-0 w-auto flex-1 object-contain"
                />
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
