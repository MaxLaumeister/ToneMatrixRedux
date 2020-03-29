import Util from './Util';
/** Manages the sprite sheet. To draw a sprite, use drawSprite(). */
export default class SpriteSheet { // eslint-disable-line no-unused-vars
  /**
   * @param {number} gridWidth The width of the grid, in tiles
   * @param {number} gridHeight The height of the grid, in tiles
   * @param {number} canvasWidth The width of the canvas, in pixels
   * @param {number} canvasHeight The height of the canvas, in pixels
   */
  constructor(gridWidth, gridHeight, canvasWidth, canvasHeight) {
    Util.assert(arguments.length === 4);
    this.spriteSheet = document.createElement('canvas');
    const ssctx = this.spriteSheet.getContext('2d');
    this.tileWidth = canvasWidth / gridWidth;
    this.tileHeight = canvasHeight / gridHeight;
    this.spriteSheet.width = 3 * this.tileWidth; // 3 sprites. very magical
    this.spriteSheet.height = this.tileHeight;

    const currentDevicePixelRatio = Util.getDevicePixelRatio();

    // For all rectangles

    let margin;
    let x;
    let y;
    const dx = this.tileWidth;
    const dy = this.tileHeight;
    ssctx.fillStyle = '#fff';

    // Rectangle id 0 - unarmed white rectangle

    margin = 4 * currentDevicePixelRatio;
    x = 0;
    y = 0;
    ssctx.filter = 'none';
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);

    // Rectangle id 1 - armed white rectangle

    margin = 3 * currentDevicePixelRatio;
    x = dx;
    y = 0;
    ssctx.filter = `blur(${currentDevicePixelRatio}px)`;
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);

    // Rectangle id 2 - activated white rectangle

    margin = 2 * currentDevicePixelRatio;
    x = 2 * dx;
    y = 0;
    ssctx.filter = `blur(${currentDevicePixelRatio * 2}px)`;
    Util.drawRoundedRectangle(ssctx, x + margin, y + margin,
      dx - 2 * margin, dy - 2 * margin, 2, true, false);
  }

  /**
   * Draw a sprite to a canvas
   * @param {number} spriteId - The id of the sprite to draw
   * @param {CanvasRenderingContext2D} context - The canvas context to draw to
   * @param {number} x - The x position on the canvas to draw the sprite to
   * @param {number} y - The y position on the canvas to draw the sprite to
   */
  drawSprite(spriteId, context, x, y) {
    Util.assert(arguments.length === 4);
    context.drawImage(this.spriteSheet, spriteId * this.tileWidth, 0,
      this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight);
  }
}
