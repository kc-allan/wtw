import { EventTypeKey } from './event-types';

/** Palette tokens a template renders from; extended per template family. */
export interface ThemePalette {
  background: string;
  surface: string;
  ink: string;
  accent: string;
  muted: string;
}

export interface ThemeSummary {
  key: string;
  name: string;
  /** Grouping shown as a heading in the picker, e.g. "Kenyan inspired". */
  group: string;
  eventTypeKey: EventTypeKey;
  palette: ThemePalette;
  previewImageUrl: string | null;
  isPremium: boolean;
}
