import { CelebrationCollage } from "./_components/celebration-collage";
import { Faq } from "./_components/faq";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { TemplateShowcase } from "./_components/template-showcase";
import { Testimonials } from "./_components/testimonials";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-[19px] pb-6">
        <SiteHeader />
        <Hero />
      </div>

      <main className="flex flex-1 flex-col">
        <TemplateShowcase />
        <CelebrationCollage />
        <HowItWorks />
        <Testimonials />
        <Faq />
      </main>

      <SiteFooter />
    </>
  );
}
