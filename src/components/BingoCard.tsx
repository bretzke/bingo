import type { Card } from "../bingo/types";

type BingoCardProps = {
  card: Card;
};

export function BingoCard({ card }: BingoCardProps) {
  return (
    <article className="card">
      <div className="grid">
        {card.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={value === null ? "cell empty" : "cell"}
            >
              {value ?? ""}
            </div>
          )),
        )}
      </div>
    </article>
  );
}
