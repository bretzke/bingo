const TILE_SIZE = 8;

export function createStripePattern(stripe: string, empty: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  context.fillStyle = empty;
  context.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  context.strokeStyle = stripe;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, TILE_SIZE);
  context.lineTo(TILE_SIZE, 0);
  context.stroke();
  context.beginPath();
  context.moveTo(-TILE_SIZE / 2, TILE_SIZE / 2);
  context.lineTo(TILE_SIZE / 2, -TILE_SIZE / 2);
  context.stroke();
  context.beginPath();
  context.moveTo(TILE_SIZE / 2, TILE_SIZE + TILE_SIZE / 2);
  context.lineTo(TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2);
  context.stroke();

  return canvas.toDataURL("image/png");
}
