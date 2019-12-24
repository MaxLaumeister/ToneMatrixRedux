/**
 * Utility functions for ToneMatrix
 */
// eslint-disable-next-line no-unused-vars
class Util {
  /**
  * Draws a rounded rectangle
  * Adapted from https://stackoverflow.com/a/3368118/2234742
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

  static coordToIndex(x, y, gridWidth) {
    Util.assert(arguments.length === 3);
    return x * gridWidth + y;
  }

  static assert(bool) {
    // Util.assert(arguments.length === 1); // do not uncomment this line or you will be sorry
    // eslint-disable-next-line no-console
    if (!bool) console.error('assertion failed');
  }
}
