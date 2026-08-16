export type Cell = number | null;
export type Card = Cell[][];
export type Sheet = Card[];
export type PageOrientation = "portrait" | "landscape";

export type CardColors = {
  border: string;
  text: string;
  stripe: string;
  empty: string;
  paper: string;
};
