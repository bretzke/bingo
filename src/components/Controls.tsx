import type { FormEvent } from "react";

type ControlsProps = {
  title: string;
  sheetCount: number;
  hasSheets: boolean;
  onTitleChange: (value: string) => void;
  onSheetCountChange: (value: number) => void;
  onGenerate: () => void;
  onPrint: () => void;
};

export function Controls({
  title,
  sheetCount,
  hasSheets,
  onTitleChange,
  onSheetCountChange,
  onGenerate,
  onPrint,
}: ControlsProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerate();
  }

  return (
    <section className="controls">
      <div className="brand">
        <h1>Bingo do Artesanato</h1>
        <p>
          Cada folha A4 tem 6 cartelas e todos os números de 1 a 90, sem repetição.
          A distribuição entre as cartelas é mais aleatória a cada geração.
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
            max={50}
            value={sheetCount}
            onChange={(event) => onSheetCountChange(Number(event.target.value))}
          />
        </label>
        <div className="actions">
          <button className="primary" type="submit">
            Gerar cartelas
          </button>
          <button className="secondary" type="button" disabled={!hasSheets} onClick={onPrint}>
            Imprimir A4
          </button>
        </div>
      </form>
    </section>
  );
}
