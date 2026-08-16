import { useEffect, useState, type CSSProperties } from "react";
import { generateSheets } from "./bingo/generator";
import { validateSheet } from "./bingo/validate";
import type { CardColors, PageOrientation, Sheet } from "./bingo/types";
import { BingoSheet } from "./components/BingoSheet";
import { Controls } from "./components/Controls";

const DEFAULT_TITLE = "Bingo do Artesanato";
const DEFAULT_COLORS: CardColors = {
  border: "#8a5a38",
  text: "#3b2416",
  stripe: "#c9a27a",
  empty: "#f3eadc",
  paper: "#fffdf8",
};

function clampSheetCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(50, Math.max(1, Math.trunc(value)));
}

export function App() {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [sheetCount, setSheetCount] = useState(4);
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [showHeader, setShowHeader] = useState(true);
  const [colors, setColors] = useState<CardColors>(DEFAULT_COLORS);
  const [paperImage, setPaperImage] = useState<string | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);

  useEffect(() => {
    const styleId = "print-page-orientation";
    const style = document.getElementById(styleId) ?? document.createElement("style");
    style.id = styleId;
    style.textContent = `@page { size: A4 ${orientation}; margin: 0; }`;
    document.head.appendChild(style);
    document.documentElement.dataset.orientation = orientation;

    return () => {
      delete document.documentElement.dataset.orientation;
    };
  }, [orientation]);

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
        orientation={orientation}
        showHeader={showHeader}
        colors={colors}
        hasSheets={sheets.length > 0}
        onTitleChange={setTitle}
        onSheetCountChange={setSheetCount}
        onOrientationChange={setOrientation}
        onShowHeaderChange={setShowHeader}
        onColorsChange={setColors}
        paperImage={paperImage}
        onPaperImageChange={setPaperImage}
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
        <main
          className={`sheets sheets-${orientation}`}
          style={
            {
              "--card-border": colors.border,
              "--card-text": colors.text,
              "--card-stripe": colors.stripe,
              "--card-empty": colors.empty,
              "--paper-bg": colors.paper,
            } as CSSProperties
          }
        >
          {sheets.map((cards, index) => (
            <BingoSheet
              key={index}
              cards={cards}
              index={index}
              title={title.trim() || DEFAULT_TITLE}
              orientation={orientation}
              showHeader={showHeader}
              paperImage={paperImage}
            />
          ))}
        </main>
      )}
    </>
  );
}
