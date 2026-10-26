import Image from "next/image";
import type { CSSProperties } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./occasion-editions.module.css";

const OCCASION_KINDS: InvitationDesign["kind"][] = [
  "university", "graduation-nocturne", "future-chapter", "anniversary-gold", "silver-anniversary", "anniversary-dinner",
  "bride-to-be", "floral-brunch", "boho-bride", "modern-corporate", "awards-gala", "product-launch", "networking", "year-end",
];

export function hasOccasionEdition(kind?: InvitationDesign["kind"]) {
  return kind !== undefined && OCCASION_KINDS.includes(kind);
}

export function OccasionEditionHero({ design, names, title, date, venue, accent, rsvp = true, compact = false }: {
  design: InvitationDesign;
  names: string[];
  title: string;
  date: string;
  venue?: string;
  accent?: string;
  rsvp?: boolean;
  compact?: boolean;
}) {
  const Heading = compact ? "div" : "h1";
  const corporate = design.category === "corporate";
  const coupleNames = names.filter(Boolean).join(" & ");
  const reply = !compact && rsvp ? <a className={styles.reply} href="#rsvp">{design.replyHeading ?? "Join us"}<span aria-hidden="true">↗</span></a> : null;
  return <header id={compact ? undefined : "top"} className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""} ${title.length > 38 ? styles.longTitle : ""}`} style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
    <div className={styles.masthead}><span>{design.eyebrow ?? design.name}</span><span>{compact ? design.name : corporate ? "Event invitation" : "A day to remember"}</span></div>
    <div className={styles.layout}>
      <div className={styles.copy}>
        <p className={styles.kicker}>{design.name}</p>
        {design.category === "anniversary" && coupleNames ? <p className={styles.couple}>{coupleNames}</p> : null}
        <Heading className={styles.title}>{title}</Heading>
        <p className={styles.subtitle}>{design.subtitle}</p>
        {reply}
      </div>
      <div className={styles.art} aria-hidden="true"><Image src={design.image} alt="" fill sizes={compact ? "280px" : "(max-width: 700px) 90vw, 560px"} preload={!compact} /></div>
    </div>
    <div className={styles.details}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>
    {!compact ? <a className={styles.discover} href="#celebration-details">{corporate ? "Arrival information" : "The details"}<span aria-hidden="true">↓</span></a> : null}
  </header>;
}
