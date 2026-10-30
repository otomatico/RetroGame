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
      "paddle-hit": { frequency: 520, duration: 0.045, volume: 0.08 },
      "wall-hit": { frequency: 260, duration: 0.04, volume: 0.06 },
      "score": { frequency: 740, duration: 0.14, volume: 0.1 },
      "start": { frequency: 420, duration: 0.1, volume: 0.08 },
      "game-over": { frequency: 180, duration: 0.3, volume: 0.1 }
    };
    if (sounds[name]) this.backend.playTone(sounds[name]);
  }
}
