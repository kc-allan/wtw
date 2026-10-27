"use client";

import { useActionState } from "react";
import type { CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import type { PublicEvent, PublicGame, ThemePalette } from "@/lib/types";
import { submitGame, type GameState } from "./game-actions";
import { TurnstileWidget } from "@/app/_components/turnstile-widget";

const INITIAL: GameState = {};

export function GamesSection({
  slug,
  token,
  guest,
  games,
  palette,
  previewMode = false,
}: {
  slug: string;
  token?: string;
  guest: PublicEvent["guest"];
  games: PublicGame[];
  palette: ThemePalette;
  previewMode?: boolean;
}) {
  if (games.length === 0) return null;

  return (
    <section
      id="games"
      aria-labelledby="games-heading"
      className="scroll-mt-8 px-6 py-12"
      style={{ backgroundColor: palette.background, color: palette.ink }}
    >
      <div className="mx-auto max-w-[920px]">
        <div className="max-w-[620px]">
          <p className="text-sm uppercase tracking-[0.16em]" style={{ color: palette.muted }}>
            Shower games
          </p>
          <h2 id="games-heading" className="mt-2 font-serif text-section font-semibold">
            Play along when you have a minute
          </h2>
          <p className="mt-3 text-base" style={{ color: palette.muted }}>
            Answer one game or all of them. The hosts will see everyone&apos;s answers together.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              slug={slug}
              token={token}
              guest={guest}
              game={game}
              palette={palette}
              previewMode={previewMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GameCard({
  slug,
  token,
  guest,
  game,
  palette,
  previewMode,
}: {
  slug: string;
  token?: string;
  guest: PublicEvent["guest"];
  game: PublicGame;
  palette: ThemePalette;
  previewMode: boolean;
}) {
  const action = submitGame.bind(
    null,
    slug,
    token ?? "",
    game.id,
    game.responseKind,
  );
  const [state, formAction] = useActionState(action, INITIAL);
  const prompt = typeof game.config.prompt === "string" && game.config.prompt.trim()
    ? game.config.prompt
    : game.prompt;
  const controlStyle = {
    backgroundColor: palette.surface,
    color: palette.ink,
    borderColor: `${palette.ink}33`,
  };

  if (state.status === "sent") {
    return (
      <article className="rounded-2xl border p-5" style={{ ...controlStyle }}>
        <h3 className="font-serif text-2xl font-semibold">{game.name}</h3>
        <p role="status" className="mt-4 rounded-xl px-4 py-3 text-base" style={{ backgroundColor: palette.background }}>
          Your answer is in. Thank you for playing.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border p-5" style={{ ...controlStyle }}>
      <h3 className="font-serif text-2xl font-semibold">{game.name}</h3>
      <p className="mt-2 text-base" style={{ color: palette.muted }}>
        {prompt}
      </p>

      <form action={formAction} onSubmit={previewMode ? (event) => event.preventDefault() : undefined} className="mt-5 flex flex-col gap-4">
        {!guest ? (
          <label className="flex flex-col gap-1.5 text-base">
            Your name
            <input
              name="guestName"
              required
              maxLength={120}
              className="rounded-lg border px-4 py-3"
              style={controlStyle}
            />
          </label>
        ) : (
          <p className="text-sm" style={{ color: palette.muted }}>
            Playing as {guest.firstName}{guest.lastName ? ` ${guest.lastName}` : ""}
          </p>
        )}

        <GameFields game={game} controlStyle={controlStyle} palette={palette} />

        {!previewMode ? <TurnstileWidget action="game_submit" /> : null}

        {previewMode ? (
          <p className="text-sm" style={{ color: palette.muted }}>
            This preview does not send game answers.
          </p>
        ) : null}

        {state.message ? (
          <p role="alert" className="text-base" style={{ color: palette.accent }}>
            {state.message}
          </p>
        ) : null}

        <SubmitButton palette={palette} previewMode={previewMode} />
      </form>
    </article>
  );
}

function GameFields({
  game,
  controlStyle,
  palette,
}: {
  game: PublicGame;
  controlStyle: CSSProperties;
  palette: ThemePalette;
}) {
  if (game.responseKind === "date") {
    return (
      <label className="flex flex-col gap-1.5 text-base">
        Your guess
        <input name="guess" type="date" required className="rounded-lg border px-4 py-3" style={controlStyle} />
      </label>
    );
  }

  if (game.responseKind === "weight") {
    return (
      <label className="flex flex-col gap-1.5 text-base">
        Weight in kilograms
        <input name="kilograms" type="number" min="0.5" max="8" step="0.01" required className="rounded-lg border px-4 py-3" style={controlStyle} />
      </label>
    );
  }

  if (game.responseKind === "quiz") {
    const questions = game.config.questions ?? [];
    return (
      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="rounded-xl border p-4" style={{ borderColor: `${palette.ink}22` }}>
            <legend className="px-1 text-base font-medium">
              {index + 1}. {question.prompt}
            </legend>
            {question.options.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center gap-3 text-base">
                    <input type="radio" name={`answer:${question.id}`} value={option} required className="size-4" />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <input
                name={`answer:${question.id}`}
                required
                maxLength={500}
                className="mt-3 w-full rounded-lg border px-4 py-3"
                style={controlStyle}
              />
            )}
          </fieldset>
        ))}
      </div>
    );
  }

  if (game.responseKind === "predictions") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-base">
          Eye colour
          <input name="eyeColour" maxLength={60} className="rounded-lg border px-4 py-3" style={controlStyle} />
        </label>
        <label className="flex flex-col gap-1.5 text-base">
          Hair colour
          <input name="hairColour" maxLength={60} className="rounded-lg border px-4 py-3" style={controlStyle} />
        </label>
        <label className="flex flex-col gap-1.5 text-base">
          Looks like
          <select name="looksLike" className="rounded-lg border px-4 py-3" style={controlStyle}>
            <option value="">Pick one</option>
            <option value="mum">Mum</option>
            <option value="dad">Dad</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-base">
          Arrival
          <select name="arrivesEarlyOrLate" className="rounded-lg border px-4 py-3" style={controlStyle}>
            <option value="">Pick one</option>
            <option value="early">Early</option>
            <option value="on_time">On time</option>
            <option value="late">Late</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-base sm:col-span-2">
          Length in cm
          <input name="lengthCm" type="number" min="20" max="70" className="rounded-lg border px-4 py-3" style={controlStyle} />
        </label>
        <label className="flex flex-col gap-1.5 text-base sm:col-span-2">
          Note
          <textarea name="note" rows={3} maxLength={1000} className="rounded-lg border px-4 py-3" style={controlStyle} />
        </label>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5 text-base">
      Your answer
      <textarea name="text" rows={4} required maxLength={1000} className="rounded-lg border px-4 py-3" style={controlStyle} />
    </label>
  );
}

function SubmitButton({ palette, previewMode }: { palette: ThemePalette; previewMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || previewMode}
      className="rounded-full px-6 py-3.5 text-base font-medium disabled:opacity-60"
      style={{ backgroundColor: palette.accent, color: palette.background }}
    >
      {previewMode ? "Preview only" : pending ? "Saving" : "Send answer"}
    </button>
  );
}
