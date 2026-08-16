import type { ChangeEvent, FormEvent } from "react";
import { MAX_SHEETS } from "../bingo/constants";
import { preparePaperImage } from "../bingo/preparePaperImage";
import type { CardColors, PageOrientation } from "../bingo/types";

type ControlsProps = {
  title: string;
  sheetCount: number;
  orientation: PageOrientation;
  showHeader: boolean;
  colors: CardColors;
  hasSheets: boolean;
  onTitleChange: (value: string) => void;
  onSheetCountChange: (value: number) => void;
  onOrientationChange: (value: PageOrientation) => void;
  onShowHeaderChange: (value: boolean) => void;
  onColorsChange: (colors: CardColors) => void;
  paperImage: string | null;
  onPaperImageChange: (image: string | null) => void;
  onGenerate: () => void;
  onPrint: () => void;
};

export function Controls({
  title,
  sheetCount,
  orientation,
  showHeader,
  colors,
  hasSheets,
  onTitleChange,
  onSheetCountChange,
  onOrientationChange,
  onShowHeaderChange,
  onColorsChange,
  paperImage,
  onPaperImageChange,
  onGenerate,
  onPrint,
}: ControlsProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerate();
  }

  async function handlePaperImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    try {
      onPaperImageChange(await preparePaperImage(file));
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onPaperImageChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <section className="controls">
      <div className="brand">
        <h1>Bingo</h1>
        <p>
          Cada folha A4 tem 6 cartelas e todos os números de 1 a 90, sem
          repetição. Cada geração produz uma distribuição nova, respeitando as
          regras do bingo.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Título do evento
          <input
            type="text"
            value={title}
            maxLength={48}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </label>
        <label>
          Folhas
          <input
            type="number"
            min={1}
            max={MAX_SHEETS}
            value={sheetCount}
            onChange={(event) => onSheetCountChange(Number(event.target.value))}
          />
        </label>
        <label>
          Folha A4
          <select
            value={orientation}
            onChange={(event) =>
              onOrientationChange(event.target.value as PageOrientation)
            }
          >
            <option value="portrait">Vertical</option>
            <option value="landscape">Horizontal</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(event) => onShowHeaderChange(event.target.checked)}
          />
          Cabeçalho da folha
        </label>
        <label className="color-field">
          Borda
          <input
            type="color"
            value={colors.border}
            onChange={(event) =>
              onColorsChange({ ...colors, border: event.target.value })
            }
          />
        </label>
        <label className="color-field">
          Texto
          <input
            type="color"
            value={colors.text}
            onChange={(event) =>
              onColorsChange({ ...colors, text: event.target.value })
            }
          />
        </label>
        <label className="color-field">
          Listrado
          <input
            type="color"
            value={colors.stripe}
            onChange={(event) =>
              onColorsChange({ ...colors, stripe: event.target.value })
            }
          />
        </label>
        <label className="color-field">
          Fundo vazio
          <input
            type="color"
            value={colors.empty}
            onChange={(event) =>
              onColorsChange({ ...colors, empty: event.target.value })
            }
          />
        </label>
        <label className="color-field">
          Papel
          <input
            type="color"
            value={colors.paper}
            onChange={(event) =>
              onColorsChange({ ...colors, paper: event.target.value })
            }
          />
        </label>
        <label className="file-field">
          Imagem do papel
          <span className="file-actions">
            <span className="file-button">
              {paperImage ? "Trocar imagem" : "Escolher imagem"}
              <input type="file" accept="image/*" onChange={handlePaperImage} />
            </span>
            {paperImage ? (
              <button
                className="secondary"
                type="button"
                onClick={() => onPaperImageChange(null)}
              >
                Remover
              </button>
            ) : null}
          </span>
        </label>
        <div className="actions">
          <button className="primary" type="submit">
            Gerar cartelas
          </button>
          <button
            className="secondary"
            type="button"
            disabled={!hasSheets}
            onClick={onPrint}
          >
            Imprimir A4
          </button>
        </div>
      </form>
    </section>
  );
}

