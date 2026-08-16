import { useState } from "react";
import { generateSheets } from "./bingo/generator";
import { validateSheet } from "./bingo/validate";
import type { Sheet } from "./bingo/types";
import { BingoSheet } from "./components/BingoSheet";
import { Controls } from "./components/Controls";

const DEFAULT_TITLE = "Bingo do Artesanato";

function clampSheetCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(50, Math.max(1, Math.trunc(value)));
}

export function App() {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [sheetCount, setSheetCount] = useState(4);
  const [sheets, setSheets] = useState<Sheet[]>([]);

  function handleGenerate() {
    const count = clampSheetCount(sheetCount);
    setSheetCount(count);
    const nextSheets = generateSheets(count);
    nextSheets.forEach(validateSheet);
    setSheets(nextSheets);
  }

  return (
    <>
      <Controls
        title={title}
        sheetCount={sheetCount}
        hasSheets={sheets.length > 0}
        onTitleChange={setTitle}
        onSheetCountChange={setSheetCount}
        onGenerate={handleGenerate}
        onPrint={() => window.print()}
      />

      {sheets.length === 0 ? (
        <div className="empty-state">
          <h2>Pronto para sortear as folhas</h2>
          <p>
            Clique em <strong>Gerar cartelas</strong> para criar folhas com 6 cartelas de
            3×9. Cada linha terá 5 números, e a mesma folha nunca repete um número.
          </p>
        </div>
      ) : (
        <main className="sheets">
          {sheets.map((cards, index) => (
            <BingoSheet
              key={index}
              cards={cards}
              index={index}
              title={title.trim() || DEFAULT_TITLE}
            />
          ))}
        </main>
      )}
    </>
  );
}
