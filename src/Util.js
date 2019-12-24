/** A static class that provides pure functions */
class Util { // eslint-disable-line no-unused-vars
  /**
   * Converts coordinates in "pixel space" to coordinates in "tile space".
   * In essence, if you pass in an (x, y) position on the canvas,
   * this returns the corresponding (x, y) position on the grid.
   * @param {number} x - The x position, in pixels, to get the corresponding grid position for
   * @param {number} y - The y position, in pixels, to get the corresponding grid position for
   * @param {number} gridWidth - The width of the grid, in grid tiles
   * @param {number} gridHeight - The height of the grid, in grid tiles
   * @param {number} canvasWidth - The width of the pixel space,
   *  typically the width of the canvas
   * @param {number} canvasHeight - The height of the pixel space,
   *  typically the height of the canvas
   */
  static pixelCoordsToTileCoords(x, y, gridWidth, gridHeight, canvasWidth, canvasHeight) {
    Util.assert(arguments.length === 6);
    const dx = canvasHeight / gridHeight;
    const dy = canvasWidth / gridWidth;
    const xCoord = Math.floor(x / dx);
    const yCoord = Math.floor(y / dy);
    if (
      xCoord >= gridWidth
            || yCoord >= gridWidth
            || xCoord < 0
            || yCoord < 0
    ) {
      return false;
    }
    return { x: xCoord, y: yCoord };
  }

  /**
   * Converts 2-D coordinates to their corresponding index in a 1-D array representation
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} gridWidth - The width of the 2-D representation (the grid width)
   */
  static coordToIndex(x, y, gridWidth) {
    Util.assert(arguments.length === 3);
    return x * gridWidth + y;
  }

  /**
   * Draws a rounded rectangle
   * Adapted from https://stackoverflow.com/a/3368118/2234742
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
   * @param {number} x - The x coordinate at which to draw the rounded rectangle
   * @param {number} y - The y coordinate at which to draw the rounded rectangle
   * @param {number} width - The width of the rounded rectangle to draw
   * @param {number} height  - The height of the rounded rectangle to draw
   * @param {number} radius - The border radius of the rounded rectangle
   * @param {boolean} fill - Whether the rectangle should be filled
   * @param {boolean} stroke - Whether the rectangle should be stroked
   */
  static drawRoundedRectangle(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    Util.assert(arguments.length >= 5 && arguments.length <= 8);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  /**
   * Gets the current devicePixelRatio in a performant way
   * @returns {number} - The device pixel ratio
   */
  static getDevicePixelRatio() {
    return Util.devicePixelRatio;
  }

  /**
   * Logs an error to the console if an assertion is false
   * @param {boolean} bool - The assertion to check
   */
  static assert(bool) {
    // Util.assert(arguments.length === 1); // do not uncomment this line or you will be sorry
    // eslint-disable-next-line no-console
    if (!bool) console.error('assertion failed');
  }
}

Util.devicePixelRatio = 1;

(function initPixelRatio() {
  const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
  const updatePixelRatio = () => {
    Util.devicePixelRatio = window.devicePixelRatio || 1;
  };
  updatePixelRatio();
  matchMedia(mqString).addEventListener('change', updatePixelRatio);
}());
