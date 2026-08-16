import type { PageOrientation, Sheet } from "../bingo/types";
import { BingoCard } from "./BingoCard";

type BingoSheetProps = {
  cards: Sheet;
  index: number;
  title: string;
  orientation: PageOrientation;
  showHeader: boolean;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function BingoSheet({ cards, index, title, orientation, showHeader }: BingoSheetProps) {
  const sheetClass = [
    "sheet",
    `sheet-${orientation}`,
    showHeader ? "" : "sheet-no-header",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sheetClass}>
      {showHeader ? (
        <header className="sheet-head">
          <div className="sheet-title">{title}</div>
          <div className="sheet-meta">
            <strong>Folha {pad(index + 1)}</strong>
            6 cartelas · 1 ao 90 · sem repetição
          </div>
        </header>
      ) : null}
      <div className="card-grid">
        {cards.map((card, cardIndex) => (
          <BingoCard key={cardIndex} card={card} />
        ))}
      </div>
    </section>
  );
}
