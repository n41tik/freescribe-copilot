export class SilenceDetector {
  constructor(config) {
    this.config = config;
    this.silenceStart = null;
  }

  detect(inputData, currentTime) {
    const average = this.calculateAverage(inputData);
    if (average < this.config.SILENCE_THRESHOLD) {
      return this.handleSilence(currentTime);
    }
    this.silenceStart = null;
    return false;
  }

  calculateAverage(inputData) {
    const total = inputData.reduce((sum, value) => sum + Math.abs(value), 0);
    return total / inputData.length;
  }

  handleSilence(currentTime) {
    if (this.silenceStart === null) {
      this.silenceStart = currentTime;
      return false;
    }
    const silenceDuration = currentTime - this.silenceStart;
    return silenceDuration > this.config.MIN_SILENCE_DURATION;
  }
}
