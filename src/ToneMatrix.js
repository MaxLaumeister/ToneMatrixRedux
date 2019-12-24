/* global ClipboardJS */
/* global Tone */
/* global Grid */
/* global Util */
/** Main class of ToneMatrix Redux, a pentatonic step sequencer */
class ToneMatrix { // eslint-disable-line no-unused-vars
  /**
   * Creates a new ToneMatrix Redux instance, and attach it to existing DOM elements
   * @param {Element} canvasWrapperEl - The wrapper element that ToneMatrix should inject its
   *    canvas into
   * @param {Element} clearNotesButtonEl - A DOM element that should clear all notes when clicked
   * @param {Element} clipboardInputEl - An HTML 'input' element for displaying level codes
   * @param {Element} clipboardButtonEl - A DOM element that should copy the level code to the
   *    clipboard when clicked
   */
  constructor(canvasWrapperEl, clearNotesButtonEl, clipboardInputEl, clipboardButtonEl) {
    Util.assert(arguments.length === 4);
    this.DEBUG = false;

    /**
     * The main canvas element that ToneMatrix draws to
     * @type {Element}
     */
    this.c = document.createElement('canvas');
    canvasWrapperEl.appendChild(this.c);
    const rect = this.c.getBoundingClientRect();

    // Get the size of the canvas in CSS pixels.
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    const dpr = devicePixelRatio || 1;
    this.c.width = rect.width * dpr;
    this.c.height = rect.height * dpr;
    /**
     * The main canvas element's 2d drawing context
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.c.getContext('2d');
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

    this.grid = new Grid(this.WIDTH, this.HEIGHT, this.c);

    this.mouseX = -1;
    this.mouseY = -1;

    // Clipboard input element

    this.clipboardInputEl = clipboardInputEl || null;
    this.originalURL = [window.location.protocol, '//', window.location.host, window.location.pathname].join(''); // Initial page URL without query string

    clearNotesButtonEl.addEventListener('click', () => {
      this.clear();
    });

    // Integrate the clipboard button with the ClipboardJS library

    // eslint-disable-next-line no-new
    new ClipboardJS(clipboardButtonEl);

    // Listen for clicks on the canvas

    let arming = null; // Whether our cursor is currently turning on or turning off tiles

    function canvasClick(x, y) {
      Util.assert(arguments.length === 2);
      const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
        this.c.width, this.c.height);
      if (arming === null) arming = !this.grid.getTileValue(tile.x, tile.y);
      this.grid.setTileValue(tile.x, tile.y, arming);
      // Update URL fragment
      const base64 = this.grid.toBase64();
      if (base64) this.setSharingURL(base64);
      else this.resetSharingURL();
      // Make sure audio context is running
      Tone.context.resume();
    }
    this.c.addEventListener('mousemove', (e) => {
      this.updateCanvasMousePosition(e);
      if (e.buttons !== 1) return; // Only if left button is held
      canvasClick.bind(this)(this.mouseX, this.mouseY);
    });
    this.c.addEventListener('mouseleave', () => {
      this.resetCanvasMousePosition();
    });
    this.c.addEventListener('mousedown', (e) => {
      this.updateCanvasMousePosition(e);
      arming = null;
      canvasClick.bind(this)(this.mouseX, this.mouseY);
    });
    this.c.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent emulated click
      if (e.touches.length === 1) {
        arming = null;
      }
      Array.from(e.touches).forEach(
        (touch) => {
          this.updateCanvasMousePosition(touch);
          canvasClick.bind(this)(this.mouseX, this.mouseY);
        },
      );
    });
    this.c.addEventListener('touchend', (e) => {
      e.preventDefault(); // Prevent emulated click
      this.resetCanvasMousePosition();
    });
    this.c.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent emulated click
      Array.from(e.touches).forEach(
        (touch) => {
          this.updateCanvasMousePosition(touch);
          canvasClick.bind(this)(this.mouseX, this.mouseY);
        },
      );
    });

    this.SYNTHLATENCY = 0.25; // Queue events ahead of time
    Tone.context.latencyHint = this.SYNTHLATENCY;
    Tone.Transport.loopEnd = '1m'; // loop at one measure
    Tone.Transport.loop = true;
    Tone.Transport.toggle(); // start

    // If Chrome Autoplay Policy is blocking audio,
    // add a play button that encourages user interaction

    window.addEventListener('DOMContentLoaded', () => {
      // eslint-disable-next-line no-param-reassign
      canvasWrapperEl.style.visibility = 'visible';
    });

    if ('ontouchstart' in window || window.location.toString().indexOf('?') >= 0) {
      canvasWrapperEl.addEventListener('click', () => {
        Tone.context.resume().then(() => {
          document.body.classList.add('playing');
        });
      });
      Tone.context.resume().then(() => {
        document.body.classList.add('playing');
      });
    } else {
      document.body.classList.add('playing');
    }

    // Load tune from search string, then remove search string

    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('d');
    if (data) {
      this.grid.fromBase64(data);
      this.setSharingURL(data);
      window.history.replaceState('', document.title, window.location.pathname);
    } else {
      this.resetSharingURL();
    }

    // Kick off game loop

    function updateContinuous() {
      this.update();
      requestAnimationFrame(updateContinuous.bind(this));
    }
    requestAnimationFrame(updateContinuous.bind(this));
  }

  /**
   * Updates the state of the app, and draws it to the canvas.
   * Called in requestAnimationFrame.
   */
  update() {
    Util.assert(arguments.length === 0);
    this.grid.update(this.mouseX, this.mouseY);
  }

  /**
   * Updates the this.mouseX and this.mouseY variables based on where the mouse is on the canvas
   * @param {PointerEvent} e - The touch or click event that contains the new "mouse" position
   */
  updateCanvasMousePosition(e) {
    Util.assert(arguments.length === 1);
    const currentRect = this.c.getBoundingClientRect(); // abs. size of element
    const scaleX = this.c.width / currentRect.width; // relationship bitmap vs. element for X
    const scaleY = this.c.height / currentRect.height; // relationship bitmap vs. element for Y

    const x = (e.clientX - currentRect.left) * scaleX;
    const y = (e.clientY - currentRect.top) * scaleY;

    // Update internal position
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Resets the this.mouseX and this.mouseY variables.
   * Call this when the mouse leaves the canvas or the screen is not being touched.
   */
  resetCanvasMousePosition() {
    Util.assert(arguments.length === 0);
    // Update internal position
    this.mouseX = -1;
    this.mouseY = -1;
  }

  /**
   * Clears all notes from the grid and resets the sharing URL.
   */
  clear() {
    Util.assert(arguments.length === 0);
    this.grid.clearAllTiles();
    Tone.Transport.cancel();
    this.resetSharingURL(); // get rid of hash
  }

  /**
   * Writes encoded data to the "Share URL" input element on the screen.
   * @param {string} base64URLEncodedData - Base64, URL-encoded level savestate
   */
  setSharingURL(base64URLEncodedData) {
    Util.assert(arguments.length === 1);
    Util.assert(base64URLEncodedData);
    const params = new URLSearchParams({ v: '1', d: base64URLEncodedData });
    this.clipboardInputEl.value = `${this.originalURL}?${params}`;
  }

  /**
   * Resets the "Share URL" input element to the page's canonical URL.
   */
  resetSharingURL() {
    this.clipboardInputEl.value = this.originalURL;
  }
}
