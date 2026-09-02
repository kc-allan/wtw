import Image from "next/image";
import Link from "next/link";
import { celebrations, type Celebration } from "@/app/_data/landing";

const SIZES = "(max-width: 767px) 100vw, 60vw";

export function CelebrationCollage() {
  return (
    <section
      aria-labelledby="celebrations-heading"
      className="w-full bg-sand px-2.5 py-2.5"
    >
      <div className="mx-auto flex w-full max-w-[1419px] flex-col items-center gap-[25px] p-4 sm:p-10">
        <header className="flex w-full flex-col items-center gap-2.5 px-2 py-6 text-center sm:p-10">
          <p className="w-full text-base font-semibold tracking-[0.02em] text-ember">
            Every kind of party
          </p>
          <h2
            id="celebrations-heading"
            className="w-full text-section font-semibold text-black"
          >
            One platform. Every celebration
          </h2>
        </header>

        {/* Overlapping collage on the 1440 canvas; a simple stack below md. */}
        <div className="grid w-full grid-cols-1 gap-6 md:relative md:block md:aspect-[1339/1441] md:gap-0">
          <Figure
            image={celebrations.wedding}
            className="md:absolute md:top-0 md:left-[1.37%] md:h-[50.8%] md:w-[59.67%]"
            priority
          />
          <Figure
            image={celebrations.babyShower}
            className="md:absolute md:top-[7.77%] md:left-[64.77%] md:h-[29.98%] md:w-[33.94%]"
          />
          <Figure
            image={celebrations.graduation}
            className="md:absolute md:top-[55.1%] md:left-0 md:h-[29.63%] md:w-[43.42%]"
            objectPosition="object-bottom"
          />
          <Figure
            image={celebrations.birthday}
            className="md:absolute md:top-[55.1%] md:left-[49.1%] md:h-[44.9%] md:w-[50.9%]"
          />
        </div>
      </div>
    </section>
  );
}

type FigureProps = {
  image: Celebration;
  className?: string;
  objectPosition?: string;
  priority?: boolean;
};

function Figure({
  image,
  className = "",
  objectPosition = "object-center",
  priority = false,
}: FigureProps) {
  const { detail } = image;

  return (
    <div className={`group relative md:overflow-hidden rounded-2xl ${className}`}>
      <div className="relative aspect-4/3 md:absolute md:inset-0 md:aspect-auto">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={SIZES}
          priority={priority}
          className={`object-cover ${objectPosition}`}
        />
      </div>

      {/* From md up this rides over the foot of the photo and rises in on hover
          or keyboard focus. Below md it sits in flow under the photo instead:
          `group-hover` is gated behind `@media (hover: hover)`, so on touch the
          copy would otherwise be unreachable, and a tall panel would be clipped
          against a short photo. */}
      <div className="bg-white/65 p-4 transition duration-600 md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:translate-y-2 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:bg-white md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 motion-reduce:transition-none">
        <h3 className="text-base font-semibold tracking-normal text-black">
          {detail.title}
        </h3>
        <p className="mt-1 text-base text-black">{detail.summary}</p>
        <ul className="mt-5 flex flex-col gap-0.5 ps-1.5">
          {detail.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-base text-black">
              <span aria-hidden>&middot;</span>
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href="/create"
          className="mt-4 inline-flex rounded-full border border-pine px-4 py-2.5 text-base font-medium text-pine outline-offset-2"
        >
          Create event
          <span className="sr-only">: {detail.title}</span>
        </Link>
      </div>
    </div>
  );
}
