import type { CSSProperties, ReactNode } from "react";
import type { InvitationDesign } from "@/lib/invitation-designs";
import styles from "./birthday-playful-editions.module.css";

const PLAYFUL_KINDS: InvitationDesign["kind"][] = [
  "safari-animals", "pirate-adventure", "unicorn-dream", "fairy-garden", "birthday-pastel", "ballerina", "jungle-adventure", "under-the-sea", "circus-day", "candyland", "carnival", "outer-space", "pyjama-party", "glow-party", "graffiti", "pop-culture", "k-pop",
];

export function hasPlayfulBirthdayEdition(kind?: InvitationDesign["kind"]) {
  return kind !== undefined && PLAYFUL_KINDS.includes(kind);
}

export function BirthdayPlayfulHero({ design, title, date, venue, accent, rsvp = true, compact = false }: {
  design: InvitationDesign;
  title: string;
  date: string;
  venue?: string;
  accent?: string;
  rsvp?: boolean;
  compact?: boolean;
}) {
  const Heading = compact ? "div" : "h1";
  const reply = !compact && rsvp ? <a href="#rsvp" className={styles.reply}>{design.replyHeading}<span aria-hidden="true">↗</span></a> : null;
  const facts: ReactNode = <div className={styles.facts}><span>{date}</span>{venue ? <span>{venue}</span> : null}</div>;
  return <header id={compact ? undefined : "top"} className={`${styles.hero} ${styles[design.kind]} ${compact ? styles.compact : ""} ${title.length > 38 ? styles.longTitle : ""}`} style={{ "--invite-accent": accent ?? design.palette.accent } as CSSProperties}>
    <div className={styles.masthead}><span>{design.eyebrow}</span><span>{compact ? design.name : "Birthday edition"}</span></div>
    <div className={styles.body}>
      <div className={styles.copy}><p className={styles.kicker}>{design.name}</p><Heading className={styles.title}>{title}</Heading><p className={styles.subtitle}>{design.subtitle}</p>{reply}</div>
      <div className={styles.art} aria-hidden="true"><PlayfulMotif kind={design.kind} /></div>
    </div>
    <div className={styles.details}>{facts}</div>
    {!compact ? <a className={styles.discover} href="#celebration-details">The details <span aria-hidden="true">↓</span></a> : null}
  </header>;
}

function PlayfulMotif({ kind }: { kind: InvitationDesign["kind"] }) {
  let art: ReactNode;
  switch (kind) {
    case "safari-animals": art = <><circle cx="180" cy="130" r="96"/><path d="M115 135q65-80 130 0v52q-65 48-130 0z"/><circle className={styles.detail} cx="148" cy="151" r="8"/><circle className={styles.detail} cx="212" cy="151" r="8"/><path className={styles.line} d="M155 179q25 20 50 0M180 34v37m-95 28 34 17m157-17-34 17"/></> ; break;
    case "pirate-adventure": art = <><path d="M52 159h256l-43 57H100z"/><path className={styles.paper} d="M179 33v123l-82-15zm14 20v102l74-15z"/><path className={styles.line} d="M60 231q35-16 70 0t70 0 70 0"/><path className={styles.detail} d="m177 77 10 11-10 11-10-11z"/></>; break;
    case "unicorn-dream": art = <><path d="M74 172q22-90 97-77l47-63 15 77q65 37 48 104-18 66-100 49-74-15-107-90z"/><path className={styles.paper} d="m177 97 13-66 28 58z"/><path className={styles.line} d="M151 155h2m58 0h2m-49 27q20 14 40 0"/><path className={styles.detail} d="m84 49 6 16 16 6-16 6-6 16-6-16-16-6 16-6zm190 27 5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/></>; break;
    case "fairy-garden": art = <><path d="M180 42c37 31 50 61 0 89-50-28-37-58 0-89zm-4 91c-54-34-85-8-58 39 18 29 39 23 58-39zm8 0c54-34 85-8 58 39-18 29-39 23-58-39z"/><path className={styles.line} d="M180 131v85m0-35q-37 2-55 31m55-31q37 2 55 31"/><circle className={styles.detail} cx="180" cy="135" r="9"/></>; break;
    case "birthday-pastel": art = <><circle cx="117" cy="124" r="68"/><circle className={styles.paper} cx="221" cy="105" r="53"/><path d="M111 207q64-52 131 0"/><path className={styles.detail} d="m70 52 6 16 16 6-16 6-6 16-6-16-16-6 16-6zm204 142 5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/></>; break;
    case "ballerina": art = <><path d="M181 59c27 0 40 24 26 42-8 10-20 12-30 5-12-8-15-27-4-40 2-3 5-5 8-7zm-7 54h18l21 44-40 24-38-24 21-44zm-39 63h96q-11 46-48 46t-48-46z"/><path className={styles.line} d="M155 220h-37m94 0h37m-71-102-38-16m78 16 38-16"/><path className={styles.detail} d="m180 45 6 11 12 2-9 9 2 12-11-6-11 6 2-12-9-9 12-2z"/></>; break;
    case "jungle-adventure": art = <><path d="M58 198q8-102 76-150 22 64 5 111 34-85 99-116 18 83-27 141 34-48 91-55-11 82-97 119H97z"/><path className={styles.line} d="M180 246q-12-79-67-133m65 131q26-81 93-126"/><circle className={styles.detail} cx="88" cy="77" r="8"/><circle className={styles.detail} cx="276" cy="67" r="7"/></>; break;
    case "under-the-sea": art = <><path d="M40 142q47-58 94 0-47 58-94 0zm93 29q49-58 98 0-49 58-98 0zm99-51q44-51 88 0-44 51-88 0z"/><path className={styles.line} d="m104 142 25-18v36zm125 29 27-18v36zm75-51 24-17v34zM68 203q35-24 68 0m22-32q35-24 68 0m29-51q34-23 67 0"/><circle className={styles.detail} cx="91" cy="139" r="4"/><circle className={styles.detail} cx="190" cy="166" r="4"/></>; break;
    case "circus-day": art = <><path d="M45 201 180 49l135 152z"/><path className={styles.paper} d="m180 49 48 54-50 98h-44z"/><path className={styles.line} d="M45 201h270m-194 0 5-56h99l5 56m-80 0v-38h48v38"/><circle className={styles.detail} cx="180" cy="37" r="13"/></>; break;
    case "candyland": art = <><path d="M180 51c36 0 64 28 64 64s-28 64-64 64-64-28-64-64 28-64 64-64z"/><path className={styles.line} d="M138 89q42 26 84 0m-84 51q42-26 84 0m-45 39 11 51"/><path className={styles.paper} d="M250 63q41 16 41 53t-41 53l-14-22q23-11 23-31t-23-31z"/><path className={styles.detail} d="m84 54 6 16 16 6-16 6-6 16-6-16-16-6 16-6z"/></>; break;
    case "carnival": art = <><circle cx="180" cy="120" r="89"/><circle className={styles.paper} cx="180" cy="120" r="19"/><path className={styles.line} d="M180 31v178m-89-89h178m-152-63 126 126m0-126L117 183m63 26-17 28h34l-17-28"/><circle className={styles.detail} cx="180" cy="31" r="8"/><circle className={styles.detail} cx="269" cy="120" r="8"/><circle className={styles.detail} cx="180" cy="209" r="8"/><circle className={styles.detail} cx="91" cy="120" r="8"/></>; break;
    case "outer-space": art = <><path d="M180 30q53 59 48 135l-48 50-48-50q-5-76 48-135z"/><path className={styles.paper} d="m146 139 34-66 34 66z"/><path className={styles.line} d="M132 155 91 195l43-9m94-31 41 40-43-9m-46 29v36"/><circle className={styles.detail} cx="73" cy="75" r="7"/><circle className={styles.detail} cx="286" cy="73" r="9"/></>; break;
    case "pyjama-party": art = <><path d="M247 57q-29 7-36 37-9 39 28 58-45 22-82-6-49-37-21-91 37-72 111 2z"/><path className={styles.line} d="M76 194q18-30 36 0 18-30 36 0m34 7q18-30 36 0 18-30 36 0"/><path className={styles.detail} d="m280 168 5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/></>; break;
    case "glow-party": art = <><circle cx="180" cy="128" r="77"/><circle className={styles.paper} cx="180" cy="128" r="47"/><path className={styles.line} d="M180 22v38m0 136v38M74 128h38m136 0h38M105 53l27 27m96 96 27 27m0-150-27 27m-96 96-27 27"/><circle className={styles.detail} cx="180" cy="128" r="15"/></>; break;
    case "graffiti": art = <><path d="m47 182 61-105 52 47-59 96zm112 20 55-123 44 16-57 123zm88-8 43-89 25 12-43 89z"/><path className={styles.line} d="M49 224q82-30 164 0m-49-148 23-25m51 34 26-35"/><circle className={styles.detail} cx="279" cy="66" r="7"/></>; break;
    case "k-pop": art = <><path d="M105 82h150v18l-18 28v87q0 28-28 28h-58q-28 0-28-28v-87l-18-28z"/><path className={styles.paper} d="M141 141h78v63q0 18-18 18h-42q-18 0-18-18z"/><path className={styles.line} d="M145 82V52m70 30V52"/><path className={styles.detail} d="m71 57 7 19 19 7-19 7-7 19-7-19-19-7 19-7zm220 69 6 16 16 6-16 6-6 16-6-16-16-6 16-6z"/><circle cx="112" cy="216" r="8"/><circle cx="252" cy="211" r="6"/></>; break;
    default: art = <><path d="M52 75h256v145H52z"/><path className={styles.paper} d="M52 75h256v28H52zm0 117h256v28H52z"/><path className={styles.line} d="M78 155h204m-174-27h144m-123 54h102"/><circle className={styles.detail} cx="91" cy="89" r="4"/><circle className={styles.detail} cx="112" cy="89" r="4"/><circle className={styles.detail} cx="133" cy="89" r="4"/><circle className={styles.detail} cx="154" cy="89" r="4"/></>;
  }
  return <svg viewBox="0 0 360 260" focusable="false">{art}</svg>;
}
