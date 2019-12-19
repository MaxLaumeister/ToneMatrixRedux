// eslint-disable-next-line no-unused-vars
class ParticleSystem {
  /**
   * Represents a particle system.
   * @constructor
   * @param {number} width - Height of the particle system, in pixels
   * @param {number} height - Width of the particle system, in pixels
   */
  constructor(width, height) {
    this.PARTICLE_POOL_SIZE = 200;
    this.PARTICLE_LIFETIME = 40;

    this.WIDTH = width;
    this.HEIGHT = height;

    this.oldestParticle = 0;
    this.lastTick = 0;

    this.particles = new Array(this.PARTICLE_POOL_SIZE);
    for (let i = 0; i < this.PARTICLE_POOL_SIZE; i += 1) {
      this.particles[i] = {};
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
   * Updates all particle positions based on their current position,
   * velocity, and the amount of time that's passed.
   */
  tickParticles() {
    if (this.lastTick !== 0) {
      const now = Date.now();
      const deltaTime = (now - this.lastTick) / 16.67; // 60fps is a time factor of 1
      for (let i = 0; i < this.PARTICLE_POOL_SIZE; i += 1) {
        const p = this.particles[i];
        if (p.life > 0) {
          const pvx = p.vx * deltaTime;
          const pvy = p.vy * deltaTime;
          p.x += pvx;
          if (p.x > this.WIDTH || p.x < 0) {
            // x overflow/underflow
            p.vx = -p.vx;
            p.x += pvx;
          }
          p.y += pvy;
          if (p.y > this.HEIGHT || p.y < 0) {
            // y overflow/underflow
            p.vy = -p.vy;
            p.y += pvy;
          }
          p.life -= 1;
        }
      }
      this.lastTick = now;
    } else {
      this.lastTick = Date.now();
    }
  }
}
