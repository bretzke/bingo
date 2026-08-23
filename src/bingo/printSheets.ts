function copyPrintStyles(target: Document): void {
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]')) {
    target.head.appendChild(node.cloneNode(true));
  }
}

function waitForImages(root: ParentNode): Promise<void[]> {
  return Promise.all(
    Array.from(root.querySelectorAll("img")).map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

export async function printSheets(sheets: HTMLElement): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Print");
  iframe.style.position = "fixed";
  iframe.style.inset = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument;
  if (!frameWindow || !frameDocument) {
    iframe.remove();
    window.print();
    return;
  }

  frameDocument.open();
  frameDocument.write("<!DOCTYPE html><html><head><title>Bingo</title></head><body></body></html>");
  frameDocument.close();

  copyPrintStyles(frameDocument);
  frameDocument.body.style.margin = "0";
  frameDocument.body.appendChild(sheets.cloneNode(true));

  await waitForImages(frameDocument);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.remove();
    }
  };
  frameWindow.addEventListener("afterprint", cleanup, { once: true });
  frameWindow.focus();
  frameWindow.print();
  window.setTimeout(cleanup, 60_000);
}
