import { CelebrationCollage } from "@/app/_components/celebration-collage";
import { ClosingCta } from "@/app/_components/closing-cta";
import { Faq } from "@/app/_components/faq";
import { FindEvent } from "@/app/_components/find-event";
import { Hero } from "@/app/_components/hero";
import { HowItWorks } from "@/app/_components/how-it-works";
import { TemplateShowcase } from "@/app/_components/template-showcase";
import { Testimonials } from "@/app/_components/testimonials";

export default function Home() {
  return (
    <>
      {/* The designed gap between the nav and the hero, which the shared
          marketing layout leaves to each page to set. */}
      <div className="pt-5 pb-6">
        <Hero />
      </div>

      <FindEvent />
      <TemplateShowcase />
      <CelebrationCollage />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </>
  );
}
