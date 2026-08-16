import type { Card } from "../bingo/types";

type BingoCardProps = {
  card: Card;
  index: number;
};

export function BingoCard({ card, index }: BingoCardProps) {
  return (
    <article className="card">
      <div className="card-head">
        <strong>Cartela {index + 1}</strong>
        <span>5 números por linha</span>
      </div>
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
