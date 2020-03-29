export default class Tile { // eslint-disable-line no-unused-vars
  constructor() {
    /**
     * A sparse array containing Tone.js scheduled event IDs, indexed by instrument id
     */
    this.notes = [];
    this.numberOfNotes = 0;
  }

  isEmpty() {
    return this.numberOfNotes === 0;
  }

  getNote(i) {
    return this.notes[i];
  }

  hasNote(i) {
    return typeof this.notes[i] !== 'undefined';
  }

  addNote(i, noteId) {
    this.notes[i] = noteId;
    this.numberOfNotes += 1;
  }

  removeNote(i) {
    delete this.notes[i];
    this.numberOfNotes -= 1;
  }

  removeAllNotes() {
    this.notes = [];
    this.numberOfNotes = 0;
  }
}
