import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./birthday-editions.module.css";

export function hasBirthdayEdition(kind?: InvitationDesign["kind"]) {
  return kind !== undefined && ["dinosaur", "trucks", "rainbow", "mermaid", "space", "neon", "brunch", "cocktail", "forty", "golden-hour", "birthday-floral", "rooftop", "sweet-sixteen", "minimal-black", "birthday-champagne", "birthday-tropical", "all-white", "birthday-nocturne", "masquerade", "denim", "gatsby", "casino", "roaring-twenties", "twenty-one", "dirty-thirty", "fifty", "diamond"].includes(kind);
}

export function BirthdayEditionHero({ design, title, date, venue, accent, rsvp = true, compact = false, details }: {
  design: InvitationDesign; title: string; date: string; venue?: string; accent?: string;
  rsvp?: boolean; compact?: boolean; details?: ReactNode;
}) {
  const Heading = compact ? "div" : "h1";
  const headline = <Heading className={styles.title}>{title}</Heading>;
  const art = <div className={styles.art}><Image src={design.image} alt="" fill sizes={compact ? "320px" : "(max-width: 700px) 100vw, 680px"} preload={!compact} /></div>;
  const facts = details ?? <div className={styles.previewDate}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>;
  const reply = (label: string) => !compact && rsvp ? <a className={styles.action} href="#rsvp">{label}<span aria-hidden="true">↗</span></a> : null;
  let content: ReactNode;
  switch (design.kind) {
    case "dinosaur":
      content = <>
        <div className={styles.masthead}><span>The birthday expedition</span><span>Field journal</span></div>
        <div className={styles.expedition}>
          <div className={styles.journalTitle}><p className={styles.kicker}>A discovery worth celebrating</p>{headline}{reply("Join the expedition")}</div>
          <figure className={styles.specimen}>{art}<figcaption>A little older. A lot more adventure.</figcaption></figure>
        </div>
        <div className={styles.fieldNotes}>{facts}</div>
      </>;
      break;
    case "trucks":
      content = <>
        <div className={styles.workOrder}><span>Birthday works department</span><strong>You're on the crew</strong></div>
        <div className={styles.siteTitle}><p className={styles.kicker}>Today's big project</p>{headline}</div>
        <div className={styles.siteFloor}>{art}<div className={styles.siteSign}><p>Small builders.<br />Big celebration.</p>{reply("Report for birthday duty")}</div></div>
        <div className={styles.jobSheet}>{facts}</div>
      </>;
      break;
    case "rainbow":
      content = <>
        <div className={styles.colourBanner}><span>A little more colour</span><span>A lot more happy</span></div>
        <div className={styles.mural}>
          <div className={styles.muralTitle}>{headline}{reply("Be part of the happy")}</div>
          <div className={styles.muralArt}>{art}<p>Life is brighter<br />with you in it.</p></div>
        </div>
        <div className={styles.colourDate}>{facts}</div>
      </>;
      break;
    case "mermaid":
      content = <>
        <div className={styles.masthead}><span>A tale from beneath the waves</span><span>You're invited</span></div>
        <div className={styles.storySpread}>
          <div className={styles.storyTitle}><p className={styles.kicker}>Once upon a birthday</p>{headline}<p className={styles.aside}>A little sea magic,<br />a whole ocean of friends.</p>{reply("Join our underwater story")}</div>
          <figure className={styles.storyArt}>{art}<figcaption>And so the birthday adventure begins...</figcaption></figure>
        </div>
        <div className={styles.tideLine}>{facts}</div>
      </>;
      break;
    case "space":
      content = <>
        <div className={styles.missionTop}><span>Birthday flight crew</span><span>Destination: celebration</span></div>
        <div className={styles.missionBrief}><div><p className={styles.kicker}>Your next great mission</p>{headline}{reply("Join the crew")}</div><figure className={styles.missionScene}>{art}<figcaption>One more trip around the sun.</figcaption></figure></div>
        <div className={styles.flightManifest}>{facts}</div>
      </>;
      break;
    case "neon":
      content = <>
        <div className={styles.gigStrip}><span>Birthday night</span><span>Good people / Loud music</span></div>
        <div className={styles.gigPoster}><div className={styles.gigTitle}>{headline}{reply("Put me on the list")}</div>{art}</div>
        <div className={styles.admission}>{facts}<p>Come for the birthday.<br />Stay for the memories.</p></div>
      </>;
      break;
    case "brunch":
      content = <>
        <div className={styles.bistroMasthead}><span>Good morning, birthday</span><span>Take your time</span></div>
        <div className={styles.menuOpening}><p className={styles.kicker}>A table full of favourite people</p>{headline}</div>
        <div className={styles.tableSetting}>{art}<div className={styles.tableNote}><p>Coffee.<br />Catch-ups.<br /><em>One more slice.</em></p>{reply("Save me a seat")}</div></div>
        <div className={styles.reservation}>{facts}</div>
      </>;
      break;
    case "cocktail":
      content = <>
        <div className={styles.barSign}><span>The birthday social</span><span>Good company, always</span></div>
        <div className={styles.aperitivo}><div className={styles.barTitle}><p className={styles.kicker}>A birthday with a twist</p>{headline}{reply("Meet us for a toast")}</div><div className={styles.barIllustration}>{art}<p>Here's to<br /><em>being together.</em></p></div></div>
        <div className={styles.barReceipt}>{facts}</div>
      </>;
      break;
    case "golden-hour":
      content = <>
        <div className={styles.toastMasthead}><span>An evening to remember</span><span>Birthday soirée</span></div>
        <div className={styles.toastOpening}><p className={styles.kicker}>A golden kind of gathering</p>{headline}<p className={styles.toastNote}>Good things are even better<br />when we share them.</p>{reply("Save me a place")}</div>
        <figure className={styles.toastArt}>{art}<figcaption>A toast to another wonderful year.</figcaption></figure>
        <div className={styles.toastDetails}>{facts}</div>
      </>;
      break;
    case "birthday-floral":
      content = <>
        <div className={styles.flowerMasthead}><span>Gathered with love</span><span>A birthday garden party</span></div>
        <div className={styles.flowerOpening}><div><p className={styles.kicker}>A day in full bloom</p>{headline}<p className={styles.flowerNote}>For all the little moments<br />that make a life lovely.</p>{reply("Join us in the garden")}</div>{art}</div>
        <div className={styles.flowerDetails}>{facts}</div>
      </>;
      break;
    case "rooftop":
      content = <>
        <div className={styles.rooftopMasthead}><span>City lights / good company</span><span>Birthday after dark</span></div>
        <div className={styles.rooftopOpening}><p className={styles.kicker}>Above the ordinary</p>{headline}<p className={styles.rooftopNote}>The skyline is better<br />with you in it.</p>{reply("Meet us up top")}</div>
        <div className={styles.rooftopArt}>{art}</div>
        <div className={styles.rooftopDetails}>{facts}</div>
      </>;
      break;
    case "sweet-sixteen":
      content = <>
        <div className={styles.sweetMasthead}><span>One for the memory book</span><span>June / celebration</span></div>
        <div className={styles.sweetOpening}><span className={styles.sweetNumber} aria-hidden="true">16</span><div><p className={styles.kicker}>A milestone made brighter</p>{headline}<p className={styles.sweetNote}>Sixteen years of becoming<br />wonderfully, unmistakably you.</p>{reply("Be there for the big night")}</div></div>
        <div className={styles.sweetArt}>{art}</div>
        <div className={styles.sweetDetails}>{facts}</div>
      </>;
      break;
    case "minimal-black":
    case "birthday-champagne":
    case "birthday-tropical":
    case "all-white":
    case "birthday-nocturne":
    case "masquerade":
    case "denim":
    case "gatsby":
    case "casino":
    case "roaring-twenties":
    case "twenty-one":
    case "dirty-thirty":
    case "fifty":
    case "diamond": {
      const milestone = ["twenty-one", "dirty-thirty", "fifty", "diamond"].includes(design.kind);
      const dark = ["birthday-nocturne", "masquerade", "gatsby", "casino", "roaring-twenties", "dirty-thirty", "fifty"].includes(design.kind);
      const number = design.kind === "twenty-one" ? "21" : design.kind === "dirty-thirty" ? "30" : design.kind === "fifty" ? "50" : "60+";
      content = <>
        <div className={styles.editorialMasthead}><span>{design.eyebrow ?? design.name}</span><span>{dark ? "An evening invitation" : "A birthday gathering"}</span></div>
        <div className={styles.editorialOpening}>
          {milestone ? <span className={styles.editorialNumber} aria-hidden="true">{number}</span> : null}
          <div className={styles.editorialCopy}>
            <p className={styles.kicker}>{design.eyebrow ?? "A day worth celebrating"}</p>
            {headline}
            <p className={styles.editorialSubtitle}>{design.subtitle}</p>
            {reply(design.replyHeading ?? "Join the celebration")}
          </div>
          <figure className={styles.editorialArt}>{art}<figcaption>{design.name} · A day to remember</figcaption></figure>
        </div>
        <div className={styles.editorialDetails}>{facts}</div>
      </>;
      break;
    }
    default:
      content = <>
        <div className={styles.newspaperName}>The Good Years</div>
        <div className={styles.editionLine}><span>A birthday edition</span><span>Stories worth celebrating</span></div>
        <div className={styles.frontPage}><div><p className={styles.kicker}>The next chapter makes the headlines</p>{headline}{reply("Be part of the next chapter")}</div><figure>{art}<figcaption>To the years behind us.<br />And everything still ahead.</figcaption></figure></div>
        <div className={styles.dateline}>{facts}</div>
      </>;
  }
  return <header id={compact ? undefined : "top"} className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""} ${title.length > 38 ? styles.longTitle : ""}`}
    style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>{content}</header>;
}

export { styles as birthdayEditionStyles };
