import { Time } from "../time.js";

export class LyricsParser {
  static parse(lrcLyrics) {
    const LRC_TIME = /\[(?<mm>\d\d?):(?<ss>\d\d?).(?<xx>\d\d?)\](?<lyric>.*)/; // minute:second.one-hundreth-of-second
    const LRC_TITLE = /\[ti:(?<title>.*)\]/;
    const LRC_ARTIST = /\[ar:(?<artist>.*)\]/;
    const LRC_ALBUM = /\[al:(?<album>.*)\]/;
    const LRC_SONG_AUTHOR = /\[au:(?<song_author>.*)\]/;
    const LRC_LENGTH = /\[length:(?<mm>\d\d):(?<ss>\d\d).(?<xx>\d\d)\]/;
    const LRC_LYRICS_AUTHOR = /\[by:(?<lyrics_author>.*)\]/;
    const LRC_OFFSET = /\[offset:(?<offset>)\]/;
    const LRC_TOOL = /\[(re|tool):(?<tool>.*)\]/;
    const LRC_VERSION = /\[ve:(?<version>.*)\]/;
    const LRC_COMMENT = /\[#\]/;
    const lyrics = new Lyrics();
    for (let line of lrcLyrics.split("\n")) {
      let match = null;
      if ((match = line.match(LRC_TIME))) {
        const time = new Time(
          Number(match.groups.mm),
          Number(match.groups.ss),
          Number(match.groups.xx)
        );
        lyrics.add(time, match.groups.lyric);
      } else if ((match = line.match(LRC_TITLE))) {
        lyrics.songTitle = match.groups.title;
      } else if ((match = line.match(LRC_ARTIST))) {
        lyrics.artist = match.groups.artist;
      } else if ((match = line.match(LRC_ALBUM))) {
        lyrics.album = match.groups.album;
      } else if ((match = line.match(LRC_SONG_AUTHOR))) {
        lyrics.songAuthor = match.groups.song_author;
      } else if ((match = line.match(LRC_LENGTH))) {
        lyrics.length = new Time(
          Number(match.groups.mm),
          Number(match.groups.ss),
          Number(match.groups.xx)
        );
      } else if ((match = line.match(LRC_LYRICS_AUTHOR))) {
        lyrics.lyricsAuthor = match.groups.lrc_author;
      } else if ((match = line.match(LRC_OFFSET))) {
        lyrics.offset = match.groups.offset;
      } else if ((match = line.match(LRC_TOOL))) {
        lyrics.tool = match.groups.tool;
      } else if ((match = line.match(LRC_VERSION))) {
        lyrics.version = match.groups.version;
      } else if ((match = line.match(LRC_COMMENT))) {
        // ignore comments
      }
    }
    return lyrics;
  }
}

export class Lyrics {
  constructor() {
    this.lyrics = [];
  }

  add(time, lyric) {
    this.lyrics.push({ time, lyric });
  }

  toString() {
    return this.lyrics.map(e => e.lyric).join("\n");
  }

  getLyrics() {
    return this.lyrics;
  }

  // TODO: implement
  toJSON() {}

  getLyricAt(time) {
    for (let i = 0; i < this.lyrics.length - 1; i++) {
      if (isTimeInInvertal(lyrics[i], lyrics[i + 1], time)) return this.lyrics[i];
    }
    if (this.length && this.isTimeInInterval(this.lyrics[i + 1], length)) return this.lyrics.at(-1);
    return null;
  }
}
