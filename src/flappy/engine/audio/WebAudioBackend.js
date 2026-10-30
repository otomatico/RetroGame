export class WebAudioBackend {
  constructor() {
    this.context = null;
    this.masterGain = null;
  }
  ensureContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }
  setMasterVolume(value) {
    const context = this.ensureContext();
    if (context && this.masterGain) this.masterGain.gain.value = value;
  }
  playTone({ frequency = 440, duration = 0.07, waveform = "square", volume = 0.12 } = {}) {
    const context = this.ensureContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}
