/* global Tone */
/* global Util */
// eslint-disable-next-line no-unused-vars
class NotePlayer {
  constructor(gridWidth, gridHeight) {
    Util.assert(arguments.length === 2);

    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // Construct scale array
    const pentatonic = ['B#', 'D', 'F', 'G', 'A'];
    const octave = 3; // base octave
    const octaveoffset = 4;
    let scale = Array(gridHeight);
    for (let i = 0; i < gridHeight; i += 1) {
      scale[i] = pentatonic[i % pentatonic.length]
        + (octave + Math.floor((i + octaveoffset) / pentatonic.length));
    }
    scale = scale.reverse(); // higher notes at lower y values, near the top

    // Pre-render synth

    this.numVoices = 3; // Number of voices (players) *per note*
    this.noteOffset = (Tone.Time('1m') / gridWidth) * 6; // Total note duration, including release. Used to offset the sound sprites

    this.players = [];

    this.currentPlayer = 0;

    const self = this;
    Tone.Offline(() => {
      const lowPass = new Tone.Filter({
        frequency: 1100,
        rolloff: -12,
      }).toMaster();

      const synth = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      }).connect(lowPass);

      scale.forEach((el, idx) => {
        synth.triggerAttackRelease(el, Tone.Time('1m') / gridWidth, idx * self.noteOffset);
      });
    }, this.noteOffset * scale.length).then((buffer) => {
      for (let i = 0; i < scale.length * self.numVoices; i += 1) {
        this.players.push(new Tone.Player(buffer).toMaster());
      }
    });
  }

  getPlayheadX() {
    const adjustedSeconds = Tone.Transport.seconds
      % (Tone.Transport.loopEnd - Tone.Transport.loopStart);
    const adjustedProgress = adjustedSeconds / (Tone.Transport.loopEnd - Tone.Transport.loopStart);
    return Math.floor(adjustedProgress * this.gridWidth);
  }

  scheduleNote(gridX, gridY, volume) {
    Util.assert(arguments.length === 3);
    // Cycle through the voices
    try {
      const noteDuration = Tone.Time('1m') / this.gridWidth;
      const playEvent = Tone.Transport.schedule((time) => {
        this.players[this.currentPlayer].volume.value = volume;
        this.players[this.currentPlayer].start(
          time, gridY * this.noteOffset, this.noteOffset,
        );
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
      }, gridX * noteDuration);
      return playEvent;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Note play failure:', e);
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  unscheduleNote(id) {
    Util.assert(arguments.length === 1);
    Tone.Transport.clear(id);
  }
}
