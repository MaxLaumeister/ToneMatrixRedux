/* global Util */
// eslint-disable-next-line no-unused-vars
class SpriteSheet {
  /**
   * Manages the sprite sheet. Get the sprite sheet by calling get().
   * @param {number} canvasWidth The width of the canvas, in pixels
   * @param {number} canvasHeight The height of the canvas, in pixels
   * @param {number} gridWidth The width of the grid, in tiles
   * @param {number} gridHeight The height of the grid, in tiles
   * @param {number} currentDevicePixelRatio The device pixel ratio of the current display
   */
  constructor(canvasWidth, canvasHeight, gridWidth, gridHeight, currentDevicePixelRatio) {
    this.spriteSheet = document.createElement('canvas');
    const ssctx = this.spriteSheet.getContext('2d');
    const tileWidth = canvasWidth / gridWidth;
    const tileHeight = canvasHeight / gridHeight;
    this.spriteSheet.width = 3 * tileWidth; // 3 rectangles
    this.spriteSheet.height = tileHeight;

    // For all rectangles

    let margin;
    let x;
    let y;
    const dx = tileWidth;
    const dy = tileHeight;
    ssctx.fillStyle = '#fff';

    // Draw rectangle 1 - unarmed white rectangle

    margin = 4 * currentDevicePixelRatio;
    x = 0;
    y = 0;
    ssctx.filter = 'none';
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);

    // Draw rectangle 2 - armed white rectangle

    margin = 3 * currentDevicePixelRatio;
    x = dx;
    y = 0;
    ssctx.filter = `blur(${currentDevicePixelRatio}px)`;
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);

    // Draw rectangle 3 - activated white rectangle

    margin = 2 * currentDevicePixelRatio;
    x = 2 * dx;
    y = 0;
    ssctx.filter = `blur(${currentDevicePixelRatio * 2}px)`;
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);
  }

  /**
   * Get the app's sprite sheet.
   * @returns {Element} - The sprite sheet 'canvas' element
   */
  get() {
    return this.spriteSheet;
  }
}
