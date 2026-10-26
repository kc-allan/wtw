import Image from "next/image";
import type { CSSProperties } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./baby-shower-editions.module.css";

export function hasBabyShowerEdition(kind?: InvitationDesign["kind"]) {
  return kind !== undefined && [
    "pink-gold", "butterfly", "ballerina-baby", "boho-rainbow", "blush-bloom", "little-prince", "sailor-baby", "little-lion", "woodland-baby", "blue-teddy", "airplanes", "neutral-beige", "sage-baby", "scandinavian", "earth-baby", "modern-boho-baby",
  ].includes(kind);
}

export function BabyShowerEditionHero({ design, title, date, venue, accent, rsvp = true, compact = false }: {
  design: InvitationDesign;
  title: string;
  date: string;
  venue?: string;
  accent?: string;
  rsvp?: boolean;
  compact?: boolean;
}) {
  const Heading = compact ? "div" : "h1";
  const displayTitle = <Heading className={styles.title}>{title}</Heading>;
  const reply = !compact && rsvp ? <a className={styles.reply} href="#rsvp">{design.replyHeading ?? "Join the celebration"}<span aria-hidden="true">↗</span></a> : null;
  const facts = <div className={styles.facts}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>;
  const illustratedMotif = ["butterfly", "sailor-baby", "little-lion", "blue-teddy", "airplanes"].includes(design.kind);

  return <header id={compact ? undefined : "top"} className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""} ${title.length > 38 ? styles.longTitle : ""}`} style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
    <div className={styles.masthead}><span>{design.eyebrow ?? "A little love is on the way"}</span><span>{compact ? design.name : "A gathering for baby"}</span></div>
    <div className={styles.opening}>
      <div className={styles.copy}>
        <p className={styles.kicker}>{design.name}</p>
        {displayTitle}
        <p className={styles.subtitle}>{design.subtitle}</p>
        {reply}
      </div>
      <div className={`${styles.art} ${illustratedMotif ? styles.illustratedArt : ""}`} aria-hidden="true">
        {illustratedMotif ? <BabyMotif kind={design.kind} /> : <Image src={design.image} alt="" fill sizes={compact ? "280px" : "(max-width: 700px) 90vw, 520px"} preload={!compact} />}
      </div>
    </div>
    <div className={styles.details}>{facts}</div>
    {!compact ? <a className={styles.discover} href="#celebration-details">The details <span aria-hidden="true">↓</span></a> : null}
  </header>;
}

function BabyMotif({ kind }: { kind: InvitationDesign["kind"] }) {
  if (kind === "butterfly") return <svg viewBox="0 0 360 260" focusable="false"><path d="M180 130C115 20 30 38 58 113c12 33 62 39 122 17-60 22-91 52-64 83 31 35 72-9 64-83 8 74 33 118 64 83 27-31-4-61-64-83 60 22 110 16 122-17 28-75-57-93-122 17Z" fill="#d5e3df" stroke="#718f8b" strokeWidth="4"/><path d="M180 74v130m-2-108-27-27m29 27 27-27" fill="none" stroke="#718f8b" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (kind === "sailor-baby") return <svg viewBox="0 0 360 260" focusable="false"><path d="M65 168h230l-36 48H103z" fill="#d8e5ee" stroke="#315b83" strokeWidth="5"/><path d="M179 43v122m0-113-73 91h73zm12 18 64 73h-64z" fill="#fff" stroke="#315b83" strokeWidth="5" strokeLinejoin="round"/><path d="M58 232c25-12 49-12 74 0s49 12 74 0 49-12 74 0" fill="none" stroke="#6d9ab5" strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === "little-lion") return <svg viewBox="0 0 360 260" focusable="false"><path d="M180 29c22 0 35 16 48 22 19 8 41 2 54 22 9 14 4 32 11 48 8 18 27 31 23 52-3 17-20 28-27 44-8 18-6 42-22 53-15 10-34 1-53 5-19 4-34 20-53 15-17-4-25-24-40-36-15-11-39-15-46-33-6-17 6-34 5-53-1-20-14-40-5-56 8-15 30-18 44-31 15-12 24-36 43-41 6-2 12-3 18-3Z" fill="#e4c183" stroke="#a77b3c" strokeWidth="5"/><path d="M132 113h10m76 0h10M155 155q25 22 50 0" fill="none" stroke="#5c4934" strokeWidth="7" strokeLinecap="round"/><path d="m168 139 12 9 12-9" fill="#a77b3c"/></svg>;
  if (kind === "blue-teddy") return <svg viewBox="0 0 360 260" focusable="false"><circle cx="105" cy="81" r="42" fill="#c9dce7" stroke="#7898aa" strokeWidth="5"/><circle cx="255" cy="81" r="42" fill="#c9dce7" stroke="#7898aa" strokeWidth="5"/><circle cx="180" cy="139" r="100" fill="#dce9ef" stroke="#7898aa" strokeWidth="5"/><circle cx="145" cy="126" r="7" fill="#405765"/><circle cx="215" cy="126" r="7" fill="#405765"/><ellipse cx="180" cy="158" rx="28" ry="19" fill="#fff" stroke="#7898aa" strokeWidth="4"/><path d="m174 151 6-5 6 5-6 7zM162 177q18 16 36 0" fill="none" stroke="#405765" strokeWidth="4" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 360 260" focusable="false"><path d="m50 146 119-20 53-70 20 4-28 61 82-12 17 16-101 29 29 35-14 6-47-30-64 18-20-8 42-27-83 7z" fill="#d5e6ee" stroke="#4e7f99" strokeWidth="5" strokeLinejoin="round"/><path d="M87 191h182" stroke="#9cb7c5" strokeWidth="4" strokeDasharray="8 11"/></svg>;
}
