/* global GridRenderer */
/* global NotePlayer */
/* global Util */
// eslint-disable-next-line no-unused-vars
class Grid {
  constructor(width, height, canvas) {
    Util.assert(arguments.length === 3);
    this.data = Array(width * height).fill(false);
    this.width = width;
    this.height = height;
    this.renderer = new GridRenderer(width, height, canvas);
    this.player = new NotePlayer(width, height);
  }

  clearAllTiles() {
    Util.assert(arguments.length === 0);
    this.data = Array(this.width * this.height).fill(false);
  }

  update(mouseX, mouseY) {
    Util.assert(arguments.length === 2);
    this.renderer.update(this.data, mouseX, mouseY);
  }

  /**
   * Get whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   * @returns {bool} - Whether the tile is lit up
   */
  getTileValue(x, y) {
    Util.assert(arguments.length === 2);
    return this.data[Util.coordToIndex(x, y, this.width)] !== false;
  }

  /**
   * Set whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   * @param {bool} - Whether the tile should be turned on (true) or off (false)
   */
  setTileValue(x, y, bool) {
    Util.assert(arguments.length === 3);
    if (bool) {
      if (this.getTileValue(x, y)) return;
      // Turning on, schedule note

      const highVolume = -10; // When one note is playing
      const lowVolume = -35; // When all notes are playing (lower volume to prevent peaking)

      const volume = ((this.height - this.countNotesInColumn(x)) / this.height)
        * (highVolume - lowVolume) + lowVolume;

      this.data[Util.coordToIndex(x, y, this.width)] = this.player.scheduleNote(x, y, volume);
    } else {
      if (!this.getTileValue(x, y)) return;
      // Turning off, unschedule note
      this.player.unscheduleNote(this.data[Util.coordToIndex(x, y, this.width)]);
      this.data[Util.coordToIndex(x, y, this.width)] = false;
    }
  }

  countNotesInColumn(x) {
    Util.assert(arguments.length === 1);
    let count = 0;
    for (let i = 0; i < this.height; i += 1) {
      if (this.getTileValue(x, i)) count += 1;
    }
    return count;
  }

  /**
   * Toggle whether a grid tile is currently lit up (armed)
   * @param {number} x - The x position, measured in grid tiles
   * @param {number} y - The y position, measured in grid tiles
   */
  toggleTileValue(x, y) {
    Util.assert(arguments.length === 2);
    this.setTileValue(x, y, !this.getTileValue(x, y));
  }

  /**
   * Save the grid's current state into a savestate string
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
        const tile = this.data[Util.coordToIndex(i, j, 8)] !== false;
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
   * Load a savestate from a string into the grid
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
