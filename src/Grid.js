/* global GridRenderer */
/* global SynthInstrument */
/* global Util */
/* global Tile */
/* global Tone */
/** A 2-D matrix that keeps track of notes and can enable, disable, and play them */
class Grid { // eslint-disable-line no-unused-vars
  /**
   * Creates a new Grid
   * @param {number} width - The width of the grid in tiles
   * @param {number} height  - The height of the grid in tiles
   * @param {Canvas} canvas - The canvas DOM element that the grid should draw to
   */
  constructor(width, height, canvas) {
    Util.assert(arguments.length === 3);
    this.data = Array(width * height).fill().map(() => (new Tile()));
    this.width = width;
    this.height = height;
    this.renderer = new GridRenderer(width, height, canvas);
    this.currentInstrument = 0;
    this.instruments = [];
    this.instruments.push(new SynthInstrument(width, height, {
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    },
    {
      frequency: 1100,
      rolloff: -12,
    }));
    this.instruments.push(new SynthInstrument(width, height, {
      oscillator: {
        type: 'sawtooth',
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 2,
      },
    },
    {
      frequency: 1100,
      rolloff: -12,
    }));
  }

  /**
   * Updates and draws the grid to the canvas
   * @param {number} mouseX - The current x position of the mouse on the canvas element
   * @param {number} mouseY - The current y position of the mouse on the canvas element
   */
  update(mouseX, mouseY) {
    Util.assert(arguments.length === 2);
    this.renderer.update(this, mouseX, mouseY);
  }

  /**
   * Gets whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   * @returns {bool} - Whether the tile is lit up
   */
  getTileValue(x, y) {
    Util.assert(arguments.length === 2);
    return this.data[Util.coordToIndex(x, y, this.height)].hasNote(this.currentInstrument);
  }

  /**
   * Sets whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   * @param {bool} - Whether the tile should be turned on (true) or off (false)
   */
  setTileValue(x, y, bool) {
    Util.assert(arguments.length === 3);
    if (bool) {
      if (this.getTileValue(x, y)) return;
      // Turning on, schedule note

      this.data[Util.coordToIndex(x, y, this.height)].addNote(this.currentInstrument,
        this.instruments[this.currentInstrument]
          .scheduleNote(x, y));
    } else {
      if (!this.getTileValue(x, y)) return;
      // Turning off, unschedule note
      this.instruments[this.currentInstrument]
        .unscheduleNote(this.data[Util.coordToIndex(x, y, this.height)]
          .getNote(this.currentInstrument));
      this.data[Util.coordToIndex(x, y, this.height)].removeNote(this.currentInstrument);
    }
  }

  /**
   * Toggles whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   */
  toggleTileValue(x, y) {
    Util.assert(arguments.length === 2);
    this.setTileValue(x, y, !this.getTileValue(x, y));
  }

  /**
   * Turns off all tiles and removes all notes
   */
  clearAllTiles() {
    Util.assert(arguments.length === 0);
    this.data.forEach((e) => e.removeAllNotes());
    Tone.Transport.cancel();
  }

  setCurrentInstrument(instrumentId) {
    if (instrumentId >= this.instruments.length) {
      // eslint-disable-next-line no-console
      console.warn('tried to switch to nonexistent instrument');
    } else {
      this.currentInstrument = instrumentId;
    }
  }

  /**
   * Sets whether the ToneMatrix grid is muted.
   * @param {boolean} muted - True for muted, false for unmuted
   */
  // eslint-disable-next-line class-methods-use-this
  setMuted(muted) {
    Util.assert(arguments.length === 1);
    Tone.Destination.mute = muted;
  }

  /**
   * Saves the grid's current state into a savestate string
   * @returns {string} savestate - The base64-encoded URL-encoded savestate string,
   *   ready for saving or outputting in a URL
   */
  toBase64() {
    Util.assert(arguments.length === 0);
    let dataflag = false;
    const bytes = new Uint8Array(this.data.length / 8);
    for (let i = 0; i < this.data.length / 8; i += 1) {
      let str = '';
      for (let j = 0; j < 8; j += 1) {
        const tile = !this.data[Util.coordToIndex(i, j, 8)].isEmpty();
        if (tile) {
          str += '1';
          dataflag = true;
        } else {
          str += '0';
        }
      }
      bytes[i] = parseInt(str, 2);
    }
    if (!dataflag) return '';

    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const base64enc = encodeURIComponent(base64);
    return base64enc;
  }

  /**
   * Loads a savestate from a string into the grid
   * @param {string} savestate - The base64-encoded URL-encoded savestate string
   */
  fromBase64(base64enc) {
    Util.assert(arguments.length === 1);
    try {
      const base64 = decodeURIComponent(base64enc);
      const binary = atob(base64);

      const bytes = new Uint8Array(this.data.length / 8);
      let str = '';
      for (let i = 0; i < this.data.length / 8; i += 1) {
        const byte = binary.charCodeAt(i);
        bytes[i] = byte;
        let bits = byte.toString(2);
        bits = bits.padStart(8, '0');
        str += bits;
      }

      for (let i = 0; i < str.length; i += 1) {
        const bool = str[i] === '1';
        this.setTileValue(Math.floor(i / this.width), i % this.width, bool);
      }
    } catch (e) {
      // Invalid hash
    }
  }
}
