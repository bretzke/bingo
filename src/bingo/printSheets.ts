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
  await waitForImages(sheets);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  document.body.classList.add("is-printing");
  const cleanup = () => document.body.classList.remove("is-printing");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 60_000);
}
