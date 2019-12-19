(function() {
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
			for (let i = 0; i < this.PARTICLE_POOL_SIZE; i++) {
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
			let p = this.particles[this.oldestParticle];
			p.x = x;
			p.y = y;
			p.vx = vx;
			p.vy = vy;
			p.life = this.PARTICLE_LIFETIME;
			this.oldestParticle++;
			if (this.oldestParticle >= this.PARTICLE_POOL_SIZE) this.oldestParticle = 0;
		}
		
		/**
		 * Updates all particle positions based on their current position, velocity, and the amount of time that's passed.
		 */
		tickParticles() {
			if (this.lastTick !== 0) {
				let now = Date.now();
				let deltaTime = (now - this.lastTick) / 16.67; // 60fps is a time factor of 1
				for (let i = 0; i < this.PARTICLE_POOL_SIZE; i++) {
					let p = this.particles[i];
					if (p.life <= 0) continue;
					let pvx = p.vx * deltaTime;
					let pvy = p.vy * deltaTime;
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
					p.life--;
				}
				this.lastTick = now;
			} else {
				this.lastTick = Date.now();
			}
		}
	}
	
	class ToneMatrix {
		/**
		 * The entry point for ToneMatrix
		 * @constructor
		 * @param {Element} canvasWrapperEl - The wrapper element that ToneMatrix should inject its canvas into
		 * @param {Element} clearNotesButtonEl - A DOM element that should clear all notes when clicked
		 * @param {Element} clipboardInputEl - An HTML 'input' element for displaying level codes
		 * @param {Element} clipboardButtonEl - A DOM element that should copy the level code to the clipboard when clicked
		 */
		constructor(canvasWrapperEl, clearNotesButtonEl, clipboardInputEl, clipboardButtonEl) {
			this.DEBUG = false;
			
			/**
			 * The main canvas element that ToneMatrix draws to
			 * @type {Element}
			 */
			this.c = document.createElement("canvas");
			this.c.width = this.c.height = 500;
			canvasWrapperEl.appendChild(this.c);
			/**
			 * The main canvas element's 2d drawing context
			 * @type {CanvasRenderingContext2D}
			 */
			this.ctx = this.c.getContext("2d");
			/**
			 * The width of the grid, measured in grid tiles
			 * @const {number}
			 */
			this.WIDTH = 16;
			/**
			 * The height of the grid, measured in grid tiles
			 * @const {number}
			 */
			this.HEIGHT = 16;
			this.data = Array(this.WIDTH * this.HEIGHT).fill(false);
			
			// Resize canvas for hidpi display, if needed
			
			// Get the device pixel ratio, falling back to 1.
			
			/**
			 * The device pixel ratio of the current display
			 * @const {number}
			 */
			this.DPR = window.devicePixelRatio || 1;

			// Get the size of the canvas in CSS pixels.
			var rect = this.c.getBoundingClientRect();
			// Give the canvas pixel dimensions of their CSS
			// size * the device pixel ratio.
			this.c.width = rect.width * this.DPR;
			this.c.height = rect.height * this.DPR;
			
			// Clipboard input element
			
			this.clipboardInputEl = clipboardInputEl || null;
			this.originalURL = [location.protocol, '//', location.host, location.pathname].join(''); // Initial page URL without query string

			clearNotesButtonEl.addEventListener("click", (function() {
				this.clearAllTiles();
			}).bind(this));

			// Clipboard button

			new ClipboardJS(clipboardButtonEl);
			
			// Load tune from search string, then remove it
			
			const urlParams = new URLSearchParams(window.location.search);
			const data = urlParams.get('d');
			if(data) {
				this.base64ToGrid(data);
				this.setCopyURL(data);
				history.replaceState("", document.title, window.location.pathname);
			} else {
				this.setCopyURL("");
			}

			// Listen for clicks on the canvas
			
			let arming = null;
			
			function canvasClick(e) {
				
				let rect = this.c.getBoundingClientRect(), // abs. size of element
				  scaleX = this.c.width / rect.width,    // relationship bitmap vs. element for X
				  scaleY = this.c.height / rect.height;  // relationship bitmap vs. element for Y
			  
				let x = (e.clientX - rect.left) * scaleX;
				let y = (e.clientY - rect.top) * scaleY
				
				let tile = this.getTileCollision(x, y);
				if (arming === null) arming = !this.getTileValue(tile.x, tile.y);
				this.setTileValue(tile.x, tile.y, arming);
				// Update URL fragment
				let base64 = this.gridToBase64();
				this.setCopyURL(base64);
			}
			this.c.addEventListener('mousemove', (function(e) {
				if (e.buttons !== 1) return; // Only if left button is held
				canvasClick.bind(this)(e);
			}).bind(this));
			this.c.addEventListener('mousedown', (function(e) {
				arming = null;
				canvasClick.bind(this)(e);
			}).bind(this));
			this.c.addEventListener('touchstart', (function(e) {
				e.preventDefault(); // Prevent emulated click
				if (e.touches.length === 1) {
					arming = null;
				}
				for (let touch of e.touches) {
					canvasClick.bind(this)(touch);
				}
			}).bind(this));
			this.c.addEventListener('touchmove', (function(e) {
				e.preventDefault(); // Prevent emulated click
				for (let touch of e.touches) {
					canvasClick.bind(this)(touch);
				}
			}).bind(this));
			
			// Construct scale array
			
			let pentatonic = ["B#", "D", "F", "G", "A"];
			let octave = 3; // base octave
			let octaveoffset = 4;
			this.scale = Array(this.HEIGHT);
			for (let i = 0; i < this.HEIGHT; i++) {
				this.scale[i] = pentatonic[i % pentatonic.length] + (octave + Math.floor((i + octaveoffset) / pentatonic.length));
			}
			this.scale = this.scale.reverse(); // higher notes at lower y values, near the top
			
			// Init synth
			
			const lowPass = new Tone.Filter({
				frequency: 1100,
				rolloff: -12
			}).toMaster();
			
			this.synth = new Tone.PolySynth(16, Tone.Synth, {
				oscillator : {
					type : "sine"
				},
				envelope : {
					attack : 0.005 ,
					decay : 0.1 ,
					sustain : 0.3 ,
					release : 1
				}
			}).connect(lowPass);
			
			this.synth.volume.value = -10;
			
			Tone.context.latencyHint = 'balanced'; // Queue events ahead of time
			Tone.Transport.loopEnd = '1m'; // loop at one measure
			Tone.Transport.loop = true;
			Tone.Transport.toggle(); // start
			
			// Init particle system
			
			this.particleSystem = new ParticleSystem(this.c.width, this.c.height);
			
			// If Chrome Autoplay Policy is blocking audio, add a play button that encourages user interaction
			
			window.addEventListener('DOMContentLoaded', (event) => {
				canvasWrapperEl.style.visibility = "visible";
			});

			if ('ontouchstart' in window || location.toString().indexOf('?') >= 0) {
				canvasWrapperEl.addEventListener('click', (event) => {
					Tone.context.resume().then(function() {
						document.body.classList.add("playing");
					});
				});
				Tone.context.resume().then(function() {
					document.body.classList.add("playing");
				});
			} else {
				document.body.classList.add("playing");
			}
			
			// Kick off drawing loop
			
			let drawContinuous = (function() {
				this.particleSystem.tickParticles();
				this.draw();
				window.requestAnimationFrame(drawContinuous);
			}).bind(this);
			
			drawContinuous();
		}

		/**
		 * Singleton - draws and returns a sprite sheet the first time it's called.
		 * For subsequent calls, returns the cached sprite sheet.
		 * @returns {Element} - The sprite sheet 'canvas' element
		 */
		getSpriteSheet() {
			// 
			
			if (this.spriteSheet) return this.spriteSheet;
			
			let ss = document.createElement('canvas');
			let ssctx = ss.getContext("2d");
			let tileWidth = this.c.width / this.WIDTH;
			let tileHeight = this.c.height / this.HEIGHT;
			ss.width = 3 * tileWidth; // 3 rectangles
			ss.height = tileHeight;
			
			// For all rectangles
			
			let margin;
			let x;
			let y;
			const dx = this.c.width / this.WIDTH;
			const dy = this.c.height / this.HEIGHT;
			ssctx.fillStyle = '#fff';
			
			// Draw rectangle 1 - unarmed white rectangle
			
			margin = 4*this.DPR;
			x = 0;
			y = 0;
			ssctx.filter = 'none';
			roundRect(ssctx, x+margin, y+margin, dx-2*margin, dy-2*margin, 2, true, false);
			
			// Draw rectangle 2 - armed white rectangle
			
			margin = 3*this.DPR;
			x = dx;
			y = 0;
			ssctx.filter = 'blur('+ this.DPR +'px)';
			roundRect(ssctx, x+margin, y+margin, dx-2*margin, dy-2*margin, 2, true, false);
			
			// Draw rectangle 3 - activated white rectangle
			
			margin = 2*this.DPR;
			x = 2*dx;
			y = 0;
			ssctx.filter = 'blur(' + (this.DPR * 2) + 'px)';
			roundRect(ssctx, x+margin, y+margin, dx-2*margin, dy-2*margin, 2, true, false);

			this.spriteSheet = ss;
			return ss;
		}
		
		clearAllTiles() {
			this.data = Array(this.WIDTH * this.HEIGHT).fill(false);
			Tone.Transport.cancel();
			this.setCopyURL(""); // get rid of hash
		}
		
		setCopyURL(data) {
			if (data) {
				let params = new URLSearchParams({v: "1", d: data});
				this.clipboardInputEl.value = this.originalURL + "?" + params;
			} else {
				this.clipboardInputEl.value = this.originalURL;
			}
		}

		getTileValue(x, y) {
			return this.data[x * this.WIDTH + y] !== false;
		}

		setTileValue(x, y, bool) {
			if (bool) {
				if (this.getTileValue(x, y)) return;
				// Make sure AudioContext has started
				Tone.context.resume();
				// Turning on, schedule note
				this.data[x * this.WIDTH + y] = Tone.Transport.schedule((function(time) {
					this.synth.triggerAttackRelease(this.scale[y], Tone.Time('1m') / this.WIDTH, time);
					let px = this.c.width / this.WIDTH * (x + 0.5);
					let py = this.c.height / this.HEIGHT * (y + 0.5);
					let velocityscalar = 10 * this.DPR;
					let numparticles = 20;
					for (let i = 0; i < 2 * Math.PI; i += 2 * Math.PI / 20) {
						let pvx = Math.cos(i) * velocityscalar;
						let pvy = Math.sin(i) * velocityscalar;
						this.particleSystem.createParticle(px, py, pvx, pvy);
					}
					
				}).bind(this), Tone.Time('1m') / this.WIDTH * x);
			} else {
				if (!this.getTileValue(x, y)) return;
				// Turning off, unschedule note
				Tone.Transport.clear(this.data[x * this.WIDTH + y]);
				this.data[x * this.WIDTH + y] = false;
			}
		}

		toggleTileValue(x, y) {
			this.setTileValue(x, y, !this.getTileValue(x, y));
		}
	  
		draw() {
			// Defaults
			this.ctx.globalAlpha = 1;
			this.ctx.filter = 'none';
			
			this.ctx.beginPath();
			this.ctx.rect(0, 0, this.c.width, this.c.height);
			this.ctx.fillStyle = "black";
			this.ctx.fill();
			
			// Get particle heatmap
			
			let heatmap = this.getParticleHeatMap();
			
			// Draw each tile
			for (let i = 0; i < this.data.length; i++) {
				let dx, dy;
				dx = dy = this.c.width / this.WIDTH;
				let gridx = i % this.WIDTH;
				let gridy = Math.floor(i / this.WIDTH);
				let x = dx * gridx;
				let y = dy * gridy;
				
				let on = this.getTileValue(gridx, gridy);
				
				let playheadx = Math.floor(Tone.Transport.progress * this.WIDTH);
				
				let margin;
				if (on) {
					if (gridx === playheadx) {
						this.ctx.globalAlpha = 1;
						this.ctx.drawImage(this.spriteSheet, dx*2, 0, dx, dy, x, y, dx, dy);
					} else {
						this.ctx.globalAlpha = 0.85;
						this.ctx.drawImage(this.spriteSheet, dx, 0, dx, dy, x, y, dx, dy);
					}
				} else {
					const BRIGHTNESS = 0.05; // max particle brightness between 0 and 1
					this.ctx.globalAlpha = (heatmap[i] / this.particleSystem.PARTICLE_LIFETIME * BRIGHTNESS * 204/255) + 51/255;
					this.ctx.drawImage(this.getSpriteSheet(), 0, 0, dx, dy, x, y, dx, dy);
				}
			}
			
			// Draw particles
			
			if (this.DEBUG) {
				let ps = this.particleSystem;
				for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i++) {
					let p = ps.particles[i];
					this.ctx.globalAlpha = 1;
					this.ctx.fillStyle = "white";
					this.ctx.fillRect( p.x, p.y, 2, 2 );
				}
			}
		}
		
		getTileCollision(x, y) {
			let dx, dy;
			dx = dy = this.c.width / this.WIDTH;
			let xCoord = Math.floor(x / dx);
			let yCoord = Math.floor(y / dy);
			if (
				xCoord >= this.WIDTH ||
				yCoord >= this.WIDTH ||
				xCoord < 0 ||
				yCoord < 0
			) {
				return false;
			}
			return {x: xCoord, y: yCoord};
		}
		
		getParticleHeatMap() {
			let heatmap = Array(this.WIDTH * this.HEIGHT).fill(0);
			let ps = this.particleSystem;
			for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i++) {
				let p = ps.particles[i];
				let tile = this.getTileCollision(p.x, p.y);
				if (tile) heatmap[this.WIDTH * tile.y + tile.x] = p.life;
			}
			return heatmap;
		}
		
		gridToBase64() {
			let dataflag = false;
			let bytes = new Uint8Array(this.data.length / 8);
			for (let i = 0; i < this.data.length / 8; i++) {
				let str = "";
				for (let j = 0; j < 8; j++) {
					let tile = this.data[i*8+j] !== false;
					if (tile) {
						str += "1";
						dataflag = true;
					} else {
						str += "0";
					}
				}
				bytes[i] = parseInt(str, 2);
			}
			if (!dataflag) return "";
			
			var binary = '';
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode( bytes[ i ] );
			}
			let base64 = btoa(binary);
			let base64enc = encodeURIComponent(base64);
			return base64enc;
		}
		
		base64ToGrid(base64enc) {
			try {
				let base64 = decodeURIComponent(base64enc);
				let binary = atob(base64);
				
				let bytes = new Uint8Array(this.data.length / 8);
				let str = "";
				for (let i = 0; i < this.data.length / 8; i++) {
					let byte = binary.charCodeAt(i);
					bytes[i] = byte;
					let bits = byte.toString(2);
					bits = bits.padStart(8, "0");
					str += bits;
				}
				
				for (let i = 0; i < str.length; i++) {
					let bool = str[i] === "1";
					this.setTileValue(Math.floor(i / this.WIDTH), i % this.WIDTH, bool);
				}
			} catch (e) {
				// Invalid hash
			}
		}
	}
	window.ToneMatrix = ToneMatrix;
})();
