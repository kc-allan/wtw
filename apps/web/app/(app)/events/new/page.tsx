import type { Metadata } from "next";
import { WizardSteps } from "../../_components/wizard-steps";
import { NewEventForm } from "./new-event-form";

export const metadata: Metadata = { title: "New event — Worth the Wait" };

export default function NewEventPage() {
  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <WizardSteps current="type" />

      <h1 className="mt-8 font-serif text-section font-semibold text-black">
        What are we celebrating?
      </h1>
      <p className="mt-1 text-base tracking-[0.02em] text-ink/70">
        This decides which tools switch on, you can change it later.
      </p>

      <NewEventForm />
    </main>
  );
}
