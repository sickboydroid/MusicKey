export class TypingSpeedMeter {
  constructor(/** @type {Set} */ correctLyricChars) {
    this.lastMeasurementTimeMillis = Date.now();
    this.lastMeasurementValue = 0;
    this.lastCorrectCharsCount = correctLyricChars.size;
    this.AVG_WORD_LENGTH = 5;
    this.isSpeedIncreasing = false;
    this.correctLyricChars = correctLyricChars;
  }

  getTypingSpeedWPM() {
    const curTimeMillis = Date.now();
    if (curTimeMillis - this.lastMeasurementTimeMillis <= 3000) return this.lastMeasurementValue;
    const timeTakenMinutes = (curTimeMillis - this.lastMeasurementTimeMillis) / 60_000;
    const wordsTyped =
      (this.correctLyricChars.size - this.lastCorrectCharsCount) / this.AVG_WORD_LENGTH;
    let newMeasurementValue = wordsTyped / timeTakenMinutes;
    newMeasurementValue = newMeasurementValue > 0 ? newMeasurementValue : 0;
    this.lastMeasurementTimeMillis = curTimeMillis;
    this.lastCorrectCharsCount = this.correctLyricChars.size;
    this.isSpeedIncreasing = newMeasurementValue > this.lastMeasurementValue;
    this.lastMeasurementValue = Math.round((newMeasurementValue + this.lastMeasurementValue) / 2);
    return this.lastMeasurementValue;
  }
}
