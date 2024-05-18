// import { Cursor, LyricsTraverser, TextDrawer, TypingSpeedMeter } from "./drawer.js";
// import { LyricsParser } from "./lyrics/lrc-lyrics-parser.js";
// import { LyricsSynchronizer, LyricsWrapper, Time } from "./utils.js";

import Cursor from "./cursor.js";
import { LyricsSynchronizer, LyricsTraverser, LyricsWrapper } from "./lyrics/lyrics-utils.js";
import { TextDrawer } from "./text-drawer.js";
import { Time } from "./time.js";
import { TypingSpeedMeter } from "./typing-speed-meter.js";
import { LyricsParser } from "./lyrics/lrc-lyrics-parser.js";

let lyricsTraverser = null;
/** @type {Cursor} */
let cursor = null;
let lyricsDelaySeconds = 0;
const correctLyricChars = new Set();
const inCorrectLyricChars = new Set();
const typingSpeedMeter = new TypingSpeedMeter(correctLyricChars);

const LYRIC_MONOSPACE_FONT = "UbuntuSansMono";
const LYRIC_MONOSPACE_FONT_BOLD = "UbuntuSansMonoBold";
const LYRIC_MONOSPACE_FONT_ITALIC = "UbuntuSansMonoItalic";
const LYRIC_MONOSPACE_FONT_BOLD_ITALIC = "UbuntuSansMonoBoldItalic";
const LYRIC_FONT_SIZE_PX = 23;

// initalize elements
const canvasContainer_div = document.querySelector(".canvas-container");
const canvas = canvasContainer_div.querySelector("canvas");
const musicPlayer_audio = document.querySelector("audio");
const lyricsDelaySeconds_input = document.querySelector(".sync-lyrics #delay");
const playPause_img = document.querySelector(".play-pause > img");
const wpmContainer_div = document.querySelector(".speed");
const wpmValue_span = wpmContainer_div.querySelector("span");
const reset_btn = document.querySelector("#reset");
const loadNewSong_btn = document.querySelector("#load-new-song");

const canvasContext = canvas.getContext("2d");
const textDrawer = new TextDrawer(canvasContext, 0, 38, 38, 7);
const CHAR_WIDTH = textDrawer.getCharacterWidth("0");
let lineHeight = textDrawer.lineHeight;
let isPlaybackPlaying = false;

// setup listeners
playPause_img.onclick = tooglePlayback;
reset_btn.onclick = restartPlayback;
loadNewSong_btn.onclick = onLoadNewSong;
lyricsDelaySeconds_input.oninput = onLyricsDelayInput;
lyricsDelaySeconds_input.onchange = onLyricsDelayChange;
canvasContainer_div.onkeydown = onKeyDown;

setupCanvas();
setupMusicPlayer();

function setupCanvas() {
  canvasContext.font = `${LYRIC_FONT_SIZE_PX}px ${LYRIC_MONOSPACE_FONT}`;
  canvasContext.fillStyle = "black";
}

function setupMusicPlayer() {
  const audioContext = new window.AudioContext();
  audioContext.createMediaElementSource(musicPlayer_audio).connect(audioContext.destination);
}

function onKeyDown(/** @type {KeyboardEvent} */ event) {
  if (!isPlaybackPlaying) return;
  if (event.key.length !== 1) {
    switch (event.key) {
      case "Enter":
      case "Space":
        break;
      default:
        return;
    }
  }
  // canvas.focus();
  event.stopPropagation();
  if (cursor.getCharAtCursor() === event.key) {
    correctLyricChars.add(cursor.getCurrentPosition());
  } else {
    inCorrectLyricChars.add(cursor.getCurrentPosition());
  }
  cursor.moveToNextChar();
}

export function setupNewSong(/** @type {String} */ trackUrl, /** @type {String} */ lrcLyrics) {
  // musicPlayer_audio.pause();
  musicPlayer_audio.src = trackUrl;
  musicPlayer_audio.oncanplay = () => {
    tooglePlayback();
    setupLyrics(lrcLyrics);
    update();
  };
}

function setupLyrics(lrcLyrics) {
  const lyrics = LyricsParser.parse(lrcLyrics);
  const wrappedLyrics = LyricsWrapper.wrapLyrics(lyrics, canvas.width, CHAR_WIDTH);
  lyricsTraverser = new LyricsTraverser(wrappedLyrics);
  cursor = new Cursor(lyricsTraverser);
  setLyricsDelay(LyricsSynchronizer.getLyricsDelaySeconds(lyrics, musicPlayer_audio));
}

function update() {
  if (!isPlaybackPlaying) {
    requestAnimationFrame(update);
    return;
  }
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  textDrawer.resetPosition();
  const traverser = lyricsTraverser.getTraverser();
  const curPlaybackTime = Time.getFromMilliseconds(
    musicPlayer_audio.currentTime - lyricsDelaySeconds
  );
  cursor.scrollToCursor(traverser, canvas.height, lineHeight);
  while (traverser.hasNext()) {
    const [idx, char] = traverser.next();
    const lyricTime = lyricsTraverser.getCharTime(idx);
    if (cursor.getCurrentPosition() === idx)
      cursor.draw(
        canvasContext,
        textDrawer.x,
        textDrawer.y - textDrawer.lineHeight + 5,
        textDrawer.lineHeight
      );
    if (correctLyricChars.has(idx)) {
      canvasContext.fillStyle = "green";
    } else if (inCorrectLyricChars.has(idx)) {
      canvasContext.fillStyle = "red";
    } else if (curPlaybackTime.isInInterval(lyricTime.start, lyricTime.end)) {
      canvasContext.fillStyle = "black";
    }
    // else if (lyricTime.end.isInInterval(new Time(0, 0, 0), curPlaybackTime)) //played
    //   ctx.fillStyle = "black";
    else {
      canvasContext.font = `${LYRIC_FONT_SIZE_PX}px ${LYRIC_MONOSPACE_FONT}`;
      canvasContext.fillStyle = "grey";
    }
    textDrawer.addChar(char);
    if (textDrawer.y > canvas.height) break;
  }
  wpmValue_span.textContent = typingSpeedMeter.getTypingSpeedWPM();
  typingSpeedMeter.isSpeedIncreasing
    ? wpmContainer_div.classList.add("typing-speed-increasing")
    : wpmContainer_div.classList.remove("typing-speed-increasing");
  requestAnimationFrame(update);
}

function tooglePlayback() {
  isPlaybackPlaying = !isPlaybackPlaying;
  if (isPlaybackPlaying) {
    playPause_img.setAttribute("src", "../images/pause.svg");
    musicPlayer_audio.play();
  } else {
    playPause_img.setAttribute("src", "../images/play.svg");
    musicPlayer_audio.pause();
  }
}

function restartPlayback() {
  musicPlayer_audio.currentTime = 0;
  correctLyricChars.clear();
  inCorrectLyricChars.clear();
  textDrawer.resetPosition();
  cursor.resetPosition();
}

function onLoadNewSong() {
  if (isPlaybackPlaying) tooglePlayback();
  const dialog_div = document.querySelector("div.dialog");
  dialog_div.classList.add("active");
}

function onLyricsDelayInput(event) {
  setLyricsDelay(lyricsDelaySeconds_input.value, false);
}

function onLyricsDelayChange(event) {
  setLyricsDelay(lyricsDelaySeconds_input.value);
}

function setLyricsDelay(delaySeconds, updateInput = true) {
  delaySeconds = Number(delaySeconds) ?? 0;
  if (delaySeconds > 500) delaySeconds = 500;
  if (delaySeconds < -500) delaySeconds = -500;
  lyricsDelaySeconds = delaySeconds;
  if (updateInput) lyricsDelaySeconds_input.value = delaySeconds.toFixed(1);
}
