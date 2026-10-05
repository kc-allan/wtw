import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventModuleKey, EventTypeKey } from "@wtw/shared";
import { BackToEvent } from "../_hub/back-to-event";
import { Button, Field, Input, Select, Textarea } from "@/app/_components/ui";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { toDateTimeLocalInput } from "@/lib/zoned-datetime";
import type { EventDetail, EventModuleView } from "@/lib/types";
import {
  addRegistryItem,
  deleteGalleryImage,
  deleteRegistryItem,
  savePracticalInfo,
  saveRegistrySettings,
  saveRsvpSettings,
  saveStory,
  saveTimeline,
  uploadGalleryImage,
} from "./content-actions";

export const metadata: Metadata = { title: "Content | Worth the Wait" };

type Search = { saved?: string };

type RegistryItemRow = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  quantity: number;
  quantityClaimed: number;
  externalUrl: string | null;
  status: string;
};

type MediaAsset = {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

function moduleFor(event: EventDetail, key: EventModuleKey): EventModuleView | undefined {
  return event.modules.find((module) => module.key === key);
}

function arrayConfig<T>(module: EventModuleView | undefined, key: string): T[] {
  const value = module?.config[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

function textConfig(module: EventModuleView | undefined, key: string): string {
  const value = module?.config[key];
  return typeof value === "string" ? value : "";
}

function boolConfig(module: EventModuleView | undefined, key: string, fallback: boolean): boolean {
  const value = module?.config[key];
  return typeof value === "boolean" ? value : fallback;
}

function numberConfig(module: EventModuleView | undefined, key: string, fallback: number): number {
  const value = module?.config[key];
  return typeof value === "number" ? value : fallback;
}

function withBlank<T>(items: T[], blank: T): T[] {
  return [...items, blank];
}

export default async function ContentPage({
  params,
  searchParams,
}: PageProps<"/events/[id]/content">) {
  const { id } = await params;
  const { saved } = (await searchParams) as Search;

  const event = await api<EventDetail>(`/events/${id}`).catch(() => null);
  if (!event) notFound();

  const registryModule = moduleFor(event, EventModuleKey.REGISTRY);
  const galleryModule = moduleFor(event, EventModuleKey.GALLERY);
  const [registryItems, media] = await Promise.all([
    registryModule?.enabled
      ? api<RegistryItemRow[]>(`/events/${id}/registry`).catch(() => [] as RegistryItemRow[])
      : Promise.resolve([] as RegistryItemRow[]),
    galleryModule
      ? api<MediaAsset[]>(`/events/${id}/media`).catch(() => [] as MediaAsset[])
      : Promise.resolve([] as MediaAsset[]),
  ]);

  return (
    <main className="w-full px-6 py-8 lg:px-10">
      <BackToEvent eventId={id} />

      <header className="mt-8 max-w-[760px]">
        <p className="text-sm tracking-[0.12em] text-muted uppercase">Event content</p>
        <h1 className="mt-2 font-serif text-section font-semibold text-black">
          Finish what guests will read
        </h1>
        <p className="mt-3 text-base text-ink/70">
          Add the sections that matter, save each one, then preview the invitation or website.
        </p>
        {saved ? (
          <p role="status" className="mt-4 rounded-xl bg-mint px-4 py-3 text-base text-success">
            Changes saved.
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <StorySection event={event} />
          <ScheduleSection event={event} />
          <PracticalSection event={event} />
          <RsvpSection event={event} />
          {registryModule ? (
            <RegistrySection event={event} items={registryItems} />
          ) : null}
          {galleryModule ? <GallerySection event={event} media={media} /> : null}
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6">
          <h2 className="font-serif text-xl text-black">Preview checklist</h2>
          <ul className="mt-4 flex flex-col gap-3 text-base text-ink/70">
            <li>Story, FAQ and schedule links appear only after content is saved.</li>
            <li>Registry links and gift claims use the live guest access rules.</li>
            <li>Gallery photos publish only when the gallery section is enabled.</li>
          </ul>
          <a
            href={`/events/${event.id}/preview`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-base font-medium text-bright"
          >
            Preview saved page
          </a>
        </aside>
      </div>
    </main>
  );
}

function Panel({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl bg-white p-6">
      <h2 className="font-serif text-2xl text-black">{title}</h2>
      <p className="mt-2 max-w-[720px] text-base text-ink/70">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StorySection({ event }: { event: EventDetail }) {
  const module = moduleFor(event, EventModuleKey.OUR_STORY);
  if (!module) return null;
  const rows = withBlank(
    arrayConfig<{ title: string; body: string; date?: string }>(module, "sections"),
    { title: "", body: "", date: "" },
  );

  return (
    <Panel
      id="story"
      title="Our Story"
      lead="Add the story entries guests should see on the wedding website. Leave every row blank to hide the section."
    >
      <form action={saveStory.bind(null, event.id)} className="flex flex-col gap-5">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-4 rounded-xl bg-ivory p-4 md:grid-cols-[1fr_180px]">
            <Field label="Entry title" htmlFor={`story-title-${index}`}>
              <Input id={`story-title-${index}`} name="storyTitle" defaultValue={row.title} />
            </Field>
            <Field label="Date" htmlFor={`story-date-${index}`}>
              <Input id={`story-date-${index}`} name="storyDate" type="date" defaultValue={row.date?.slice(0, 10) ?? ""} />
            </Field>
            <Field label="Story" htmlFor={`story-body-${index}`} className="md:col-span-2">
              <Textarea id={`story-body-${index}`} name="storyBody" rows={4} defaultValue={row.body} />
            </Field>
          </div>
        ))}
        <Button type="submit" className="self-start">Save story</Button>
      </form>
    </Panel>
  );
}

function ScheduleSection({ event }: { event: EventDetail }) {
  const module = moduleFor(event, EventModuleKey.TIMELINE);
  if (!module) return null;
  const rows = withBlank(
    arrayConfig<{ startsAt: string; title: string; description?: string; location?: string }>(module, "entries"),
    { startsAt: "", title: "", description: "", location: "" },
  );

  return (
    <Panel id="schedule" title="Schedule" lead="Build the shared programme guests can read before they RSVP.">
      <form action={saveTimeline.bind(null, event.id)} className="flex flex-col gap-5">
        <input type="hidden" name="timezone" value={event.timezone} />
        {rows.map((row, index) => (
          <div key={index} className="grid gap-4 rounded-xl bg-ivory p-4 md:grid-cols-[220px_1fr]">
            <Field label="Starts at" htmlFor={`timeline-start-${index}`}>
              <Input id={`timeline-start-${index}`} name="timelineStartsAt" type="datetime-local" defaultValue={toDateTimeLocalInput(row.startsAt, event.timezone)} />
            </Field>
            <Field label="Title" htmlFor={`timeline-title-${index}`}>
              <Input id={`timeline-title-${index}`} name="timelineTitle" defaultValue={row.title} />
            </Field>
            <Field label="Location" htmlFor={`timeline-location-${index}`}>
              <Input id={`timeline-location-${index}`} name="timelineLocation" defaultValue={row.location ?? ""} />
            </Field>
            <Field label="Description" htmlFor={`timeline-description-${index}`}>
              <Input id={`timeline-description-${index}`} name="timelineDescription" defaultValue={row.description ?? ""} />
            </Field>
          </div>
        ))}
        <Button type="submit" className="self-start">Save schedule</Button>
      </form>
    </Panel>
  );
}

function PracticalSection({ event }: { event: EventDetail }) {
  const faq = moduleFor(event, EventModuleKey.FAQ);
  const dress = moduleFor(event, EventModuleKey.DRESS_CODE);
  const accommodation = moduleFor(event, EventModuleKey.ACCOMMODATION);
  const faqRows = withBlank(arrayConfig<{ question: string; answer: string }>(faq, "items"), { question: "", answer: "" });
  const stays = withBlank(
    arrayConfig<{ name: string; address?: string; bookingUrl?: string; note?: string }>(accommodation, "options"),
    { name: "", address: "", bookingUrl: "", note: "" },
  );

  if (!faq && !dress && !accommodation) return null;

  return (
    <Panel id="practical" title="Practical information" lead="Answer guest questions, explain the dress code and add stay options when they help.">
      <div className="grid gap-6">
        {faq ? (
          <form action={savePracticalInfo.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
            <input type="hidden" name="section" value="faq" />
            <h3 className="text-lg font-semibold text-black">FAQ</h3>
            <div className="mt-4 flex flex-col gap-4">
              {faqRows.map((row, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-2">
                  <Field label="Question" htmlFor={`faq-question-${index}`}>
                    <Input id={`faq-question-${index}`} name="faqQuestion" defaultValue={row.question} />
                  </Field>
                  <Field label="Answer" htmlFor={`faq-answer-${index}`}>
                    <Input id={`faq-answer-${index}`} name="faqAnswer" defaultValue={row.answer} />
                  </Field>
                </div>
              ))}
            </div>
            <Button type="submit" className="mt-5">Save FAQ</Button>
          </form>
        ) : null}

        {dress ? (
          <form action={savePracticalInfo.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
            <input type="hidden" name="section" value="dress" />
            <h3 className="text-lg font-semibold text-black">Dress code</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Dress code title" htmlFor="dressTitle">
                <Input id="dressTitle" name="dressTitle" defaultValue={textConfig(dress, "title")} placeholder="Garden formal" />
              </Field>
              <Field label="Named colors" htmlFor="dressPalette" hint="Use hex colors, separated by commas.">
                <Input id="dressPalette" name="dressPalette" defaultValue={arrayConfig<string>(dress, "palette").join(", ")} placeholder="#2f5233, #f2d2bd" />
              </Field>
              <Field label="Description" htmlFor="dressDescription" className="md:col-span-2">
                <Textarea id="dressDescription" name="dressDescription" rows={3} defaultValue={textConfig(dress, "description")} />
              </Field>
            </div>
            <Button type="submit" className="mt-5">Save dress code</Button>
          </form>
        ) : null}

        {accommodation ? (
          <form action={savePracticalInfo.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
            <input type="hidden" name="section" value="accommodation" />
            <h3 className="text-lg font-semibold text-black">Accommodation</h3>
            <div className="mt-4 flex flex-col gap-4">
              {stays.map((row, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-2">
                  <Field label="Place" htmlFor={`stay-name-${index}`}>
                    <Input id={`stay-name-${index}`} name="stayName" defaultValue={row.name} />
                  </Field>
                  <Field label="Booking link" htmlFor={`stay-url-${index}`}>
                    <Input id={`stay-url-${index}`} name="stayUrl" type="url" defaultValue={row.bookingUrl ?? ""} />
                  </Field>
                  <Field label="Address" htmlFor={`stay-address-${index}`}>
                    <Input id={`stay-address-${index}`} name="stayAddress" defaultValue={row.address ?? ""} />
                  </Field>
                  <Field label="Note" htmlFor={`stay-note-${index}`}>
                    <Input id={`stay-note-${index}`} name="stayNote" defaultValue={row.note ?? ""} />
                  </Field>
                </div>
              ))}
            </div>
            <Button type="submit" className="mt-5">Save accommodation</Button>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}

function RsvpSection({ event }: { event: EventDetail }) {
  const module = moduleFor(event, EventModuleKey.RSVP);
  if (!module) return null;

  return (
    <Panel id="rsvp-settings" title="RSVP settings" lead="Choose what guests can answer and which extra details are relevant.">
      <form action={saveRsvpSettings.bind(null, event.id)} className="grid gap-4 rounded-xl bg-ivory p-4 md:grid-cols-2">
        <input type="hidden" name="timezone" value={event.timezone} />
        <Field label="Deadline" htmlFor="deadline">
          <Input id="deadline" name="deadline" type="datetime-local" defaultValue={toDateTimeLocalInput(textConfig(module, "deadline"), event.timezone)} />
        </Field>
        <Field label="Largest party size" htmlFor="maxPartySize">
          <Input id="maxPartySize" name="maxPartySize" type="number" min={1} max={20} defaultValue={numberConfig(module, "maxPartySize", 1)} />
        </Field>
        <Field label="Meal options" htmlFor="mealOptions" hint="One option per line." className="md:col-span-2">
          <Textarea id="mealOptions" name="mealOptions" rows={4} defaultValue={arrayConfig<string>(module, "mealOptions").join("\n")} />
        </Field>
        <Checklist
          items={[
            ["allowPlusOnes", "Allow plus-ones", boolConfig(module, "allowPlusOnes", false)],
            ["allowMaybe", "Allow Maybe replies", boolConfig(module, "allowMaybe", true)],
            ["collectDietary", "Ask about dietary notes", boolConfig(module, "collectDietary", false)],
            ["collectMessage", "Allow a note to hosts", boolConfig(module, "collectMessage", true)],
            ["collectHeadcountBreakdown", "Ask adults and children", boolConfig(module, "collectHeadcountBreakdown", false)],
          ]}
        />
        <div className="md:col-span-2">
          <Button type="submit">Save RSVP settings</Button>
        </div>
      </form>
    </Panel>
  );
}

function Checklist({ items }: { items: [string, string, boolean][] }) {
  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      {items.map(([name, label, checked]) => (
        <label key={name} className="flex items-center gap-3 text-base text-ink">
          <input type="checkbox" name={name} defaultChecked={checked} className="size-4 accent-forest" />
          {label}
        </label>
      ))}
    </div>
  );
}

function RegistrySection({ event, items }: { event: EventDetail; items: RegistryItemRow[] }) {
  const module = moduleFor(event, EventModuleKey.REGISTRY);
  if (!module) return null;
  const cashMethods = withBlank(
    arrayConfig<{ kind: string; label: string; detail?: string }>(module, "cashGiftMethods"),
    { kind: "mobile_money", label: "", detail: "" },
  );
  const externalRegistries = withBlank(
    arrayConfig<{ label: string; url: string }>(module, "externalRegistries"),
    { label: "", url: "" },
  );

  return (
    <Panel id="registry" title="Registry" lead="Add gift items, external registries or cash instructions. Guests claim gifts from the public page.">
      <div className="grid gap-6">
        <form action={saveRegistrySettings.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
          <h3 className="text-lg font-semibold text-black">Gift instructions</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Currency" htmlFor="currency">
              <Input id="currency" name="currency" maxLength={3} defaultValue={textConfig(module, "currency") || event.currency} />
            </Field>
            <label className="mt-8 flex items-center gap-3 text-base text-ink">
              <input type="checkbox" name="allowCashGifts" defaultChecked={boolConfig(module, "allowCashGifts", true)} className="size-4 accent-forest" />
              Show cash gift details
            </label>
            <Field label="Cash gift note" htmlFor="cashGiftNote" className="md:col-span-2">
              <Textarea id="cashGiftNote" name="cashGiftNote" rows={3} defaultValue={textConfig(module, "cashGiftNote")} />
            </Field>
          </div>

          <h4 className="mt-6 text-base font-semibold text-black">Cash gift methods</h4>
          <div className="mt-3 flex flex-col gap-3">
            {cashMethods.map((method, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[160px_1fr_1fr]">
                <Select name="cashKind" aria-label="Cash gift method" defaultValue={method.kind}>
                  <option value="mobile_money">Mobile money</option>
                  <option value="bank">Bank</option>
                  <option value="international">International</option>
                </Select>
                <Input name="cashLabel" aria-label="Cash label" placeholder="M-Pesa Paybill" defaultValue={method.label} />
                <Input name="cashDetail" aria-label="Cash detail" placeholder="123456, Account WTW" defaultValue={method.detail ?? ""} />
              </div>
            ))}
          </div>

          <h4 className="mt-6 text-base font-semibold text-black">External registries</h4>
          <div className="mt-3 flex flex-col gap-3">
            {externalRegistries.map((entry, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-2">
                <Input name="externalLabel" aria-label="Registry label" placeholder="Amazon wishlist" defaultValue={entry.label} />
                <Input name="externalUrl" aria-label="Registry URL" type="url" placeholder="https://" defaultValue={entry.url} />
              </div>
            ))}
          </div>

          <label className="mt-5 flex items-center gap-3 text-base text-ink">
            <input type="checkbox" name="hideClaimedItems" defaultChecked={boolConfig(module, "hideClaimedItems", false)} className="size-4 accent-forest" />
            Hide fully claimed gifts
          </label>
          <Button type="submit" className="mt-5">Save registry settings</Button>
        </form>

        <form action={addRegistryItem.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
          <h3 className="text-lg font-semibold text-black">Add a gift</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Gift name" htmlFor="giftName">
              <Input id="giftName" name="name" />
            </Field>
            <Field label="Quantity" htmlFor="giftQuantity">
              <Input id="giftQuantity" name="quantity" type="number" min={1} max={99} defaultValue={1} />
            </Field>
            <Field label="Price" htmlFor="giftPrice" hint="Optional, in the event currency.">
              <Input id="giftPrice" name="price" type="number" min={0} step="0.01" />
            </Field>
            <Field label="Purchase link" htmlFor="giftExternalUrl">
              <Input id="giftExternalUrl" name="externalUrl" type="url" placeholder="https://" />
            </Field>
            <Field label="Image URL" htmlFor="giftImageUrl">
              <Input id="giftImageUrl" name="imageUrl" type="url" placeholder="https://" />
            </Field>
            <Field label="Description" htmlFor="giftDescription">
              <Input id="giftDescription" name="description" />
            </Field>
          </div>
          <Button type="submit" className="mt-5">Add gift</Button>
        </form>

        {items.length > 0 ? (
          <ul className="divide-y divide-rule/50 rounded-xl bg-ivory">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <span>
                  <span className="block text-base font-medium text-black">{item.name}</span>
                  <span className="block text-sm text-ink/60">
                    {item.price !== null ? `${formatMoney(item.price, event.currency)} · ` : ""}
                    {item.quantityClaimed} of {item.quantity} claimed
                  </span>
                </span>
                <form action={deleteRegistryItem.bind(null, event.id, item.id)}>
                  <Button type="submit" variant="quiet">Remove</Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Panel>
  );
}

function GallerySection({ event, media }: { event: EventDetail; media: MediaAsset[] }) {
  return (
    <Panel id="gallery" title="Gallery" lead="Upload the photos that should appear publicly when the gallery section is on.">
      <form action={uploadGalleryImage.bind(null, event.id)} className="rounded-xl bg-ivory p-4">
        <Field label="Photo" htmlFor="galleryFile" hint="JPEG, PNG, WebP, AVIF or GIF.">
          <Input id="galleryFile" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
        </Field>
        <Button type="submit" className="mt-5">Upload photo</Button>
      </form>

      {media.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((asset) => (
            <li key={asset.id} className="overflow-hidden rounded-xl bg-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <form action={deleteGalleryImage.bind(null, event.id, asset.id)} className="p-3">
                <Button type="submit" variant="quiet" className="w-full">Remove photo</Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-base text-ink/70">No photos uploaded yet.</p>
      )}
    </Panel>
  );
}
