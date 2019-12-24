/* global Util */
/** A particle system which contains particles that update themselves */
class ParticleSystem { // eslint-disable-line no-unused-vars
  /**
   * @param {number} width - Height of the particle system, typically in pixels
   * @param {number} height - Width of the particle system, typically in pixels
   */
  constructor(width, height) {
    Util.assert(arguments.length === 2);
    this.PARTICLE_POOL_SIZE = 2000;
    this.PARTICLE_LIFETIME = 40;

    this.width = width;
    this.height = height;

    this.oldestParticle = 0;
    this.lastUpdate = 0;

    this.particles = new Array(this.PARTICLE_POOL_SIZE);
    for (let i = 0; i < this.PARTICLE_POOL_SIZE; i += 1) {
      this.particles[i] = {};
    }
  }

  /**
   * Updates all particle positions based on their current position,
   * velocity, and the amount of time that's passed.
   */
  update() {
    Util.assert(arguments.length === 0);
    if (this.lastUpdate !== 0) {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 16.67; // 60fps is a time factor of 1
      for (let i = 0; i < this.PARTICLE_POOL_SIZE; i += 1) {
        const p = this.particles[i];
        if (p.life > 0) {
          const pvx = p.vx * deltaTime;
          const pvy = p.vy * deltaTime;
          p.x += pvx;
          if (p.x > this.width || p.x < 0) {
            // x overflow/underflow
            p.vx = -p.vx;
            p.x += pvx;
          }
          p.y += pvy;
          if (p.y > this.height || p.y < 0) {
            // y overflow/underflow
            p.vy = -p.vy;
            p.y += pvy;
          }
          p.life -= deltaTime;
        }
      }
      this.lastUpdate = now;
    } else {
      this.lastUpdate = Date.now();
    }
  }

  /**
   * Creates a new particle
   * @param {number} x - Particle's x position, in pixels
   * @param {number} y - Particle's y position, in pixels
   * @param {number} vx - Particle's x velocity, in pixels per 1/60th of a second
   * @param {number} vy - Particle's y velocity, in pixels per 1/60th of a second
   */
  createParticle(x, y, vx, vy) {
    Util.assert(arguments.length === 4);
    const p = this.particles[this.oldestParticle];
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = this.PARTICLE_LIFETIME;
    this.oldestParticle += 1;
    if (this.oldestParticle >= this.PARTICLE_POOL_SIZE) this.oldestParticle = 0;
  }

  /**
   * Creates a burst of particles exploding out in a circle from a single point
   * @param {number} x - The x coordinate of the emanation point
   * @param {number} y - The y coordinate of the emanation point
   * @param {number} v - The velocity of the particles, in pixels per 1/60th of a second
   * @param {number} n - The number of particles to create
   */
  createParticleBurst(x, y, v, n) {
    const randomOffset = Math.random() * 2 * Math.PI;
    for (let j = 0; j < 2 * Math.PI; j += (2 * Math.PI) / n) {
      const pvx = Math.cos(j + randomOffset) * v;
      const pvy = Math.sin(j + randomOffset) * v;
      this.createParticle(x, y, pvx, pvy);
    }
  }
}
