import { Time } from "../time.js";

export class LyricsTraverser {
  constructor(lyrics) {
    /** wrapped lyrics */
    this.times = new Map();
    let charPos = 0;
    let flatMappedLyrics = [];
    // todo: add explaination for +1 in inner for loop and charPos
    // exp: you joining lyrics later => adding new line
    for (let i = 0; i < lyrics.length; i++) {
      const startTime = lyrics[i][0];
      const lyric = lyrics[i][1].join("\n");
      let endTime = new Time(Infinity, Infinity, Infinity);
      if (i < lyrics.length - 1) endTime = lyrics[i + 1][0];
      for (let j = 0; j < lyric.length + 1; j++) this.times.set(charPos + j, [startTime, endTime]);
      charPos += lyric.length + 1;
      flatMappedLyrics.push(lyric);
    }
    this.lyrics = flatMappedLyrics.join("\n");
  }

  getTraverser() {
    const self = this;
    return {
      curCharPos: 0,

      next() {
        if (!this.hasNext()) return null;
        return [this.curCharPos, self.lyrics[this.curCharPos++]];
      },

      previous() {
        if (!this.hasPrevious()) return null;
        return [this.curCharPos, self.lyrics[this.curCharPos--]];
      },

      hasNext() {
        return this.curCharPos < self.lyrics.length;
      },

      hasPrevious() {
        return this.curCharPos >= 0;
      },
    };
  }

  getCharAt(pos, mapper = e => e) {
    return mapper(this.lyrics[pos]);
  }

  getCharTime(pos) {
    return { start: this.times.get(pos)[0], end: this.times.get(pos)[1] };
  }

  getCharCount() {
    return this.lyrics.length;
  }
}

// todo: Use advance methods like checking (when vocal is spoken) to sync
export class LyricsSynchronizer {
  static getLyricsDelaySeconds(
    /** @type {Lyrics} */ lyrics,
    /** @type {HTMLAudioElement} */ audio
  ) {
    if (!lyrics.length) return;
    const lyricsDuration = lyrics.length.toSeconds();
    const audioDuration = audio.duration;
    return audioDuration - lyricsDuration;
  }
}

export class LyricsWrapper {
  constructor(lyricsLines) {
    this.lyrics = lyricsLines;
  }

  static wrapLyrics(rawLyrics /**@type {Lyrics} */, containerWidth, charWidth) {
    const maxChars = Math.round(containerWidth / charWidth);
    const parsedLyrics = [];
    for (const lyric of rawLyrics.lyrics) {
      const wrappedLyric = LyricsWrapper.wrapLine(lyric.lyric, maxChars);
      parsedLyrics.push([lyric.time, wrappedLyric]);
    }
    return parsedLyrics;
  }

  static wrapLine(line, maxChars) {
    const res = [];
    let curLine = "";
    const words = line
      .split(" ")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (let word of words) {
      const remChars = maxChars - curLine.length;
      if (remChars >= word.length) {
        const whitespace = curLine.length > 0 ? " " : "";
        curLine += whitespace + word;
      } else {
        if (curLine) res.push(curLine);
        while (word.length > maxChars) {
          res.push(word.substring(0, maxChars));
          word = word.substring(maxChars, word.length);
        }
        curLine = word;
      }
    }
    if (curLine) res.push(curLine);
    return res;
  }
}
