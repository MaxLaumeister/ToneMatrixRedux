/* global Tone */
// eslint-disable-next-line no-unused-vars
class NotePlayer {
  constructor(gridWidth, gridHeight) {
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
    this.noteDuration = (Tone.Time('1m') / gridWidth) * 6; // Total note duration, including release

    this.players = [];

    this.currentPlayer = 0;

    const self = this;
    Tone.Offline(() => {
      const lowPass = new Tone.Filter({
        frequency: 1100,
        rolloff: -12,
      }).toMaster();

      const synth = new Tone.PolySynth(Tone.Synth, {
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
        synth.triggerAttackRelease(el, Tone.Time('1m') / gridWidth, idx * self.noteDuration);
      });
    }, this.noteDuration * scale.length).then((buffer) => {
      for (let i = 0; i < scale.length * self.numVoices; i += 1) {
        this.players.push(new Tone.Player(buffer).toMaster());
      }
    });
  }

  play(index, time, volume) {
    // Cycle through the voices
    try {
      this.players[this.currentPlayer].volume.value = volume;
      this.players[this.currentPlayer].start(time, index * this.noteDuration, this.noteDuration);
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    } catch (e) {
      // Player not yet ready
    }
  }
}
