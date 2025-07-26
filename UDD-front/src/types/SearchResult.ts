import type { Index } from "./Index";

export type SearchResultDTO = {
  index: Index;
  highlights: Record<string, string[]>;
};
