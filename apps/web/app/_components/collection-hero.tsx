import Image from "next/image";
import { EventTypeKey } from "@wtw/shared";
import type { CSSProperties } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./invitation-collection.module.css";
import { BirthdayWorldHero } from "./birthday-worlds";

export function CollectionHero({ design, names, title, date, venue, accent, rsvp, compact }: {
  design: InvitationDesign; names: string[]; title: string; date: string;
  venue?: string; accent?: string; rsvp: boolean; compact: boolean;
}) {
  if (design.kind === "gaming" || design.kind === "sporty") {
    return <BirthdayWorldHero design={design} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  const Heading = compact ? "div" : "h1";
  const wedding = design.category === EventTypeKey.WEDDING;
  const displayNames = names.filter(Boolean);
  const headline = wedding && displayNames.length ? displayNames.join(" & ") : title;
  const mirroredArt = ["blacktie", "heirloom", "gilded", "bloom", "emerald", "kitenge"].includes(design.kind);
  const imageSizes = compact ? "400px" : mirroredArt ? "25vw"
    : ["dinosaur", "trucks", "rainbow", "mermaid", "gaming", "sporty"].includes(design.kind) ? "(max-width: 700px) 92vw, 680px"
    : design.kind === "forty" ? "200px"
    : design.kind === "honey" ? "(max-width: 700px) 92vw, 680px"
    : design.kind === "cocktail" ? "(max-width: 700px) 86vw, 440px"
    : design.kind === "woven" ? "(max-width: 700px) 100vw, 28vw"
    : design.kind === "nocturne" ? "200px"
    : ["porcelain", "pampas"].includes(design.kind) ? "(max-width: 700px) 160px, 30vw" : "100vw";
  return (
    <header id={compact ? undefined : "top"}
      className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""} ${headline.length > 42 ? styles.longTitle : ""}`}
      style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
      <div className={styles.art} aria-hidden="true">
        <Image src={design.image} alt="" fill sizes={imageSizes} preload={!compact} />
      </div>
      {mirroredArt ? <div className={styles.artEcho} aria-hidden="true"><Image src={design.image} alt="" fill sizes={imageSizes} loading={compact ? "lazy" : "eager"} /></div> : null}
      <div className={styles.content}>
        {design.kind === "gilded" && displayNames.length > 0 ? <div className={styles.initials} aria-hidden="true">{displayNames.map((name) => Array.from(name)[0]).join(" / ")}</div> : null}
        <p className={styles.eyebrow}>{design.eyebrow}</p>
        <Heading className={styles.title}>
          {wedding && displayNames.length > 1 ? <>{displayNames[0]}<span className={styles.join}>&amp;</span>{displayNames.slice(1).join(" & ")}</> : headline}
        </Heading>
        <p className={styles.subtitle}>{design.subtitle}</p>
        <div className={styles.facts}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>
        {!compact && rsvp ? <a href="#rsvp" className={styles.reply}>{design.category === EventTypeKey.CORPORATE ? "Confirm attendance" : "Join the celebration"}<span aria-hidden="true">↗</span></a> : null}
      </div>
      {!compact ? <a href="#celebration-details" className={styles.discover}>The details <span aria-hidden="true">↓</span></a> : null}
    </header>
  );
}
