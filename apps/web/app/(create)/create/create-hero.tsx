import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";

/**
 * The photograph beside the first question. It is artwork rather than data, so
 * the file is dropped into `public` and picked up here; until it is, the column
 * holds its shape with a warm panel rather than collapsing or showing a gap.
 */
const HERO_PATH = "/create/celebration.png";

const heroExists = existsSync(join(process.cwd(), "public", HERO_PATH));

export function CreateHero() {
  if (!heroExists) {
    return (
      <div
        aria-hidden
        className="min-h-[420px] rounded-2xl bg-gradient-to-br from-sand via-blush to-ember/40 lg:min-h-[640px] xl:min-h-[780px]"
      />
    );
  }

  return (
    <Image
      src={HERO_PATH}
      alt=""
      width={658}
      height={897}
      priority
      className="h-full max-h-[780px] w-full rounded-2xl object-cover"
    />
  );
}
