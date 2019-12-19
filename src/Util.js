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
}
