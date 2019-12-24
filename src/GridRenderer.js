/* global SpriteSheet */
/* global ParticleSystem */
/* global Util */
// eslint-disable-next-line no-unused-vars
class GridRenderer {
  constructor(gridWidth, gridHeight, canvas) {
    Util.assert(arguments.length === 3);
    this.spriteSheet = new SpriteSheet(gridWidth, gridHeight, canvas.width, canvas.height);
    this.particleSystem = new ParticleSystem(canvas.width, canvas.height);
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
  * Gets the "heat" of every tile by calculating how many particles are on top of the tile
  * @returns {array} An array of numbers from 0 to 1, representing the "heat" of each tile
  */
  getParticleHeatMap() {
    Util.assert(arguments.length === 0);
    const heatmap = Array(this.gridWidth * this.gridHeight).fill(0);
    const ps = this.particleSystem;
    for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i += 1) {
      const p = ps.particles[i];
      const tile = Util.pixelCoordsToTileCoords(p.x, p.y, this.gridWidth, this.gridHeight,
        this.canvas.width, this.canvas.height);
      if (tile) heatmap[this.gridWidth * tile.y + tile.x] = p.life;
    }
    return heatmap;
  }

  update(gridData, playheadX, mouseX, mouseY) {
    Util.assert(arguments.length === 4);
    this.particleSystem.update();
    this.draw(gridData, playheadX, mouseX, mouseY);
  }

  /**
   * Draw the current state of the app to the canvas element.
   * This is looped asynchronously via requestAnimationFrame.
   */
  draw(gridData, playheadX, mouseX, mouseY) {
    Util.assert(arguments.length === 4);
    // Defaults
    this.ctx.globalAlpha = 1;
    this.ctx.filter = 'none';

    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();

    // Get particle heatmap

    const heatmap = this.getParticleHeatMap();

    const mousedOverTile = Util.pixelCoordsToTileCoords(mouseX, mouseY,
      this.gridWidth, this.gridHeight, this.canvas.width, this.canvas.height);

    // Draw each tile
    for (let i = 0; i < gridData.length; i += 1) {
      const dx = this.canvas.height / this.gridHeight;
      const dy = this.canvas.width / this.gridWidth;
      const gridx = i % this.gridWidth;
      const gridy = Math.floor(i / this.gridWidth);
      const x = dx * gridx;
      const y = dy * gridy;

      const on = gridData[Util.coordToIndex(gridx, gridy, this.gridWidth)] !== false;

      if (on) {
        if (gridx === playheadX) {
          this.ctx.globalAlpha = 1;
          this.spriteSheet.drawSprite(2, this.ctx, x, y);
          // Create particles
          const px = dx * (gridx + 0.5);
          const py = dy * (gridy + 0.5);
          const velocityscalar = 10 * this.DPR;
          const numparticles = 20;
          for (let j = 0; j < 2 * Math.PI; j += (2 * Math.PI) / numparticles) {
            const pvx = Math.cos(j) * velocityscalar;
            const pvy = Math.sin(j) * velocityscalar;
            this.particleSystem.createParticle(px, py, pvx, pvy);
          }
        } else {
          this.ctx.globalAlpha = 0.85;
          this.spriteSheet.drawSprite(1, this.ctx, x, y);
        }
      } else {
        if (gridx === mousedOverTile.x && gridy === mousedOverTile.y) {
          // Highlight moused over tile
          this.ctx.globalAlpha = 0.3;
        } else {
          const BRIGHTNESS = 0.05; // max particle brightness between 0 and 1
          this.ctx.globalAlpha = ((heatmap[i] * BRIGHTNESS * (204 / 255))
              / this.particleSystem.PARTICLE_LIFETIME) + 51 / 255;
        }
        this.spriteSheet.drawSprite(0, this.ctx, x, y);
      }
    }

    // Draw particles

    if (this.DEBUG) {
      const ps = this.particleSystem;
      for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i += 1) {
        const p = ps.particles[i];
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(p.x, p.y, 2, 2);
      }
    }
  }
}
