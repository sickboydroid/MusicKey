export class Time {
  constructor(minute, second, centisecond) {
    this.minute = minute;
    this.second = second;
    this.centisecond = centisecond;
  }

  subtract(otherTime) {
    const thisCentisecond = this.minute * 60 * 100 + this.second * 100 + this.centisecond;
    const otherCentisecond =
      otherTime.minute * 60 * 100 + otherTime.second * 100 + otherTime.centisecond;
    let resCentisecond = thisCentisecond - otherCentisecond;
    const resMinute = Math.trunc(resCentisecond / 6_000); // 1 min = 6000 cs
    resCentisecond -= resMinute * 6000;
    const resSecond = Math.trunc(resCentisecond / 100);
    resCentisecond -= resSecond * 100;
    return new Time(resMinute, resSecond, resCentisecond);
  }

  toMinutes() {
    return this.minute + this.second / 60 + this.centisecond / (60 * 100);
  }
  toSeconds() {
    return this.minute * 60 + this.second + this.centisecond / 100;
  }

  toCentiseconds() {
    return this.minute * 60 * 100 + this.second * 100 + this.centisecond;
  }
  // TODO: actually convert 6(s).xxx(ms) into time
  static getFromMilliseconds(milliseconds) {
    const minute = Math.trunc(milliseconds / 60);
    const second = Math.trunc(milliseconds - minute * 60);
    milliseconds = (milliseconds - Math.floor(milliseconds)) * 1000;
    const centisecond = Math.round(milliseconds / 10);
    return new Time(minute, second, centisecond);
  }

  isInInterval(intervalStart, intervalEnd) {
    const parsedEnd = intervalEnd.subtract(intervalStart);
    const parsedTime = this.subtract(intervalStart);
    const centisecondEnd =
      parsedEnd.minute * 60 * 100 + parsedEnd.second * 100 + parsedEnd.centisecond;
    const centisecondTime =
      parsedTime.minute * 60 * 100 + parsedTime.second * 100 + parsedTime.centisecond;
    return 0 <= centisecondTime && centisecondTime <= centisecondEnd;
  }

  toString() {
    return `${this.minute}:${this.second}:${this.centisecond}`;
  }
}
