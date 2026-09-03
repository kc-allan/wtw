/**
 * The setup flow stands on its own: no site navigation and no app chrome, so
 * the only things on screen are the question being asked and the way back.
 */
export default function CreateLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas">
      <Backdrop />
      <div className="relative mx-auto w-full max-w-[1392px] px-6 py-10 sm:px-12 sm:py-14">
        {children}
      </div>
    </div>
  );
}

/** The soft warm shapes the flow sits on, kept well behind the content. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute -top-32 left-1/3 h-[560px] w-[620px] rounded-full bg-sand/45 blur-3xl" />
      <span className="absolute top-1/4 -right-40 h-[520px] w-[520px] rounded-full bg-blush/50 blur-3xl" />
      <span className="absolute -bottom-40 left-0 h-[480px] w-[680px] rounded-full bg-sand/35 blur-3xl" />
    </div>
  );
}
