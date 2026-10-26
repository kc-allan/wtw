import Image from "next/image";
import type { CSSProperties } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./invitation-landing.module.css";
import { CollectionHero } from "./collection-hero";
import { BirthdayEditionHero, hasBirthdayEdition } from "./birthday-editions";
import { BabyShowerEditionHero, hasBabyShowerEdition } from "./baby-shower-editions";
import { hasOccasionEdition, OccasionEditionHero } from "./occasion-editions";
import { BirthdayPlayfulHero, hasPlayfulBirthdayEdition } from "./birthday-playful-editions";

export function InvitationHero({ design, names, title, date, venue, accent, rsvp = true, compact = false }: {
  design: InvitationDesign; names: string[]; title: string; date: string; venue?: string;
  accent?: string; rsvp?: boolean; compact?: boolean;
}) {
  if (hasBirthdayEdition(design.kind)) {
    return <BirthdayEditionHero design={design} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  if (hasBabyShowerEdition(design.kind)) {
    return <BabyShowerEditionHero design={design} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  if (hasOccasionEdition(design.kind)) {
    return <OccasionEditionHero design={design} names={names} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  if (hasPlayfulBirthdayEdition(design.kind)) {
    return <BirthdayPlayfulHero design={design} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  if (!["coastal", "garden", "brunch"].includes(design.kind)) {
    return <CollectionHero design={design} names={names} title={title} date={date} venue={venue} accent={accent} rsvp={rsvp} compact={compact} />;
  }
  const displayNames = names.filter(Boolean);
  const Heading = compact ? "div" : "h1";
  return (
    <header id={compact ? undefined : "top"}
      className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""}`}
      style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
      {design.kind !== "brunch" ? (
        <Image src={design.image} alt="" fill sizes={compact ? "400px" : "100vw"} preload={!compact} className={styles.heroImage} />
      ) : <div className={styles.checks} aria-hidden />}
      <div className={styles.heroContent}>
        {design.kind === "coastal" ? <div className={styles.monogram} aria-hidden>{displayNames.map((name) => Array.from(name)[0]).join(" · ")}</div> : null}
        <p className={styles.eyebrow}>{design.kind === "brunch" ? "Good food. Great company." : "Together with our families"}</p>
        {design.kind === "brunch" ? (
          <>
            <Heading className={styles.title}>{title}</Heading>
          </>
        ) : (
          <>
            <Heading className={styles.title}>{displayNames.length > 1 ? <>{displayNames[0]}<span className={styles.ampersand}>&amp;</span>{displayNames.slice(1).join(" & ")}</> : displayNames[0] || title}</Heading>
            <p className={styles.script}>{design.kind === "garden" ? "A beautiful beginning" : "Our next chapter, together"}</p>
          </>
        )}
        <div className={styles.heroDate}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>
        {!compact && rsvp ? <a href="#rsvp" className={styles.reply}>Join the celebration <span aria-hidden>↗</span></a> : null}
      </div>
      {design.kind === "brunch" ? <div className={styles.tableIllustration}><Image src={design.image} alt="" fill sizes={compact ? "220px" : "460px"} className={styles.tableImage} /></div> : null}
      {!compact ? <a href="#celebration-details" className={styles.discover}>The details <span aria-hidden>↓</span></a> : null}
    </header>
  );
}

export { styles as invitationStyles };
