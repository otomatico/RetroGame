export class AudioManager {
  constructor(backend) {
    this.backend = backend;
    this.enabled = true;
    this.masterVolume = 0.75;
    this.backend.setMasterVolume(this.masterVolume);
  }
  setEnabled(enabled) { this.enabled = Boolean(enabled); }
  toggle() { this.setEnabled(!this.enabled); return this.enabled; }
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.backend.setMasterVolume(this.enabled ? this.masterVolume : 0);
  }
  play(name) {
    if (!this.enabled) return;
    const sounds = {
      "jump": { waveform:"sine",frequency: 300, duration: 0.08, volume: 0.15 },
      "hit": { waveform:"sawtooth", frequency: 260, duration: 0.04, volume: 0.06 },
      "score": { frequency: 740, duration: 0.14, volume: 0.1 }
    };
    if (sounds[name]) this.backend.playTone(sounds[name]);
  }
}
