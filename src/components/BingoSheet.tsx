import type { Sheet } from "../bingo/types";
import { BingoCard } from "./BingoCard";

type BingoSheetProps = {
  cards: Sheet;
  index: number;
  title: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function BingoSheet({ cards, index, title }: BingoSheetProps) {
  return (
    <section className="sheet">
      <header className="sheet-head">
        <div className="sheet-title">{title}</div>
        <div className="sheet-meta">
          <strong>Folha {pad(index + 1)}</strong>
          6 cartelas · 1 ao 90 · sem repetição
        </div>
      </header>
      <div className="card-grid">
        {cards.map((card, cardIndex) => (
          <BingoCard key={cardIndex} card={card} index={cardIndex} />
        ))}
      </div>
    </section>
  );
}
