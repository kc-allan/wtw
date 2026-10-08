import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./birthday-worlds.module.css";

export function BirthdayWorldHero({ design, title, date, venue, accent, rsvp, compact, details }: {
  design: InvitationDesign; title: string; date: string; venue?: string;
  accent?: string; rsvp: boolean; compact: boolean;
  details?: ReactNode;
}) {
  const gaming = design.kind === "gaming";
  const Heading = compact ? "div" : "h1";
  return (
    <header id={compact ? undefined : "top"}
      className={`${styles.hero} ${gaming ? styles.gaming : styles.sporty} ${compact ? styles.compact : ""} ${title.length > 38 ? styles.longTitle : ""}`}
      style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
      {gaming ? <>
        <div className={styles.masthead}><span>Birthday / Multiplayer</span><span>You're invited</span></div>
        <div className={styles.lobby}>
          {!compact ? <nav className={styles.lobbyNav} aria-label="Birthday invitation">
            <a href="#celebration-details"><span>01</span> The session</a>
            {rsvp ? <a href="#rsvp"><span>02</span> Join the party</a> : null}
          </nav> : null}
          <div className={styles.headline}>
            <p className={styles.kicker}>Gather your favourite people</p>
            <Heading className={styles.title}>{title}</Heading>
            <p className={styles.subtitle}>Better together.<br />Even better with cake.</p>
            {!compact && rsvp ? <a className={styles.action} href="#rsvp">Join the party <span aria-hidden="true">↗</span></a> : null}
          </div>
          <div className={styles.art}><Image src={design.image} alt="" fill sizes={compact ? "200px" : "(max-width: 700px) 240px, 440px"} preload={!compact} /></div>
        </div>
        {details ?? <dl className={styles.session}><div><dt>Session date</dt><dd>{date}</dd></div>{venue ? <div><dt>Meet-up point</dt><dd>{venue}</dd></div> : null}</dl>}
      </> : <>
        <div className={styles.masthead}><span>The birthday club</span><span>Match-day edition</span></div>
        <div className={styles.fixture}>
          <p className={styles.kicker}>Good friends. Great form.</p>
          <Heading className={styles.title}>{title}</Heading>
          <div className={styles.fixtureBottom}>
            <p className={styles.subtitle}>The best team?<br />Everyone we love.</p>
            <div className={styles.art}><Image src={design.image} alt="" fill sizes={compact ? "130px" : "(max-width: 700px) 150px, 240px"} preload={!compact} /></div>
          </div>
        </div>
        <div className={styles.ticket}>
          <span className={styles.ticketLabel}>Your invitation</span>
          {details ?? <dl><div><dt>Match day</dt><dd>{date}</dd></div>{venue ? <div><dt>Home ground</dt><dd>{venue}</dd></div> : null}</dl>}
          {!compact && rsvp ? <a className={styles.action} href="#rsvp">Count me in <span aria-hidden="true">↗</span></a> : null}
        </div>
      </>}
    </header>
  );
}

export { styles as birthdayWorldStyles };
