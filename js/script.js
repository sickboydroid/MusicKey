import Cursor from "./cursor.js";
import { LyricsSynchronizer, LyricsTraverser, LyricsWrapper } from "./lyrics/lyrics-utils.js";
import { TextDrawer } from "./text-drawer.js";
import { Time } from "./time.js";
import { TypingSpeedMeter } from "./typing-speed-meter.js";
import { LyricsParser } from "./lyrics/lrc-lyrics-parser.js";

// initalize elements
const canvasContainer_div = document.querySelector(".canvas-container");
const canvas = canvasContainer_div.querySelector("canvas");
const musicPlayer_audio = document.querySelector("audio");
const lyricsDelaySeconds_input = document.querySelector(".sync-lyrics #delay");
const playPauseContainer_div = document.querySelector(".play-pause");
const playPause_img = playPauseContainer_div.querySelector("img");
const wpmContainer_div = document.querySelector(".speed");
const wpmValue_span = wpmContainer_div.querySelector("span");
const reset_btn = document.querySelector("#reset");
const loadNewSong_btn = document.querySelector("#load-new-song");

let lyricsTraverser = null;
let lyricsDelaySeconds = 0;
let cursor = null;
let isMusicPlayerInitialized = false;
const correctLyricChars = new Set();
const inCorrectLyricChars = new Set();
const typingSpeedMeter = new TypingSpeedMeter(correctLyricChars);
const canvasContext = canvas.getContext("2d");
const textDrawer = new TextDrawer(canvasContext, 0, 38, 38, 7);
let isPlaybackPlaying = false;

// setup constants
const LYRIC_MONOSPACE_FONT = "UbuntuSansMono";
const LYRIC_MONOSPACE_FONT_BOLD = "UbuntuSansMonoBold";
const LYRIC_MONOSPACE_FONT_ITALIC = "UbuntuSansMonoItalic";
const LYRIC_MONOSPACE_FONT_BOLD_ITALIC = "UbuntuSansMonoBoldItalic";
const LYRIC_FONT_SIZE_PX = 23;
const CHAR_WIDTH = textDrawer.getCharacterWidth("0");
const LINE_HEIGHT = textDrawer.lineHeight;

// setup listeners
playPauseContainer_div.onclick = togglePlayback;
reset_btn.onclick = restartPlayback;
loadNewSong_btn.onclick = onLoadNewSong;
lyricsDelaySeconds_input.oninput = onLyricsDelayInput;
lyricsDelaySeconds_input.onchange = onLyricsDelayChange;
canvasContainer_div.onkeydown = onKeyDown;

setupCanvas();
setupMusicPlayer();
isMusicPlayerInitialized = false;

function setupCanvas() {
  canvasContext.font = `${LYRIC_FONT_SIZE_PX}px ${LYRIC_MONOSPACE_FONT}`;
  canvasContext.fillStyle = "black";
}

function setupMusicPlayer() {
  isMusicPlayerInitialized = true;
  const audioContext = new window.AudioContext();
  console.log(audioContext);
  audioContext.createMediaElementSource(musicPlayer_audio).connect(audioContext.destination);
}

/** Event Listeners */
function restartPlayback() {
  musicPlayer_audio.currentTime = 0;
  correctLyricChars.clear();
  inCorrectLyricChars.clear();
  textDrawer.resetPosition();
  cursor.resetPosition();

  // syncs state of music player and isPlaybackPlaying boolean
  isPlaybackPlaying = !isPlaybackPlaying;
  togglePlayback();
}

function onLoadNewSong() {
  if (isPlaybackPlaying) togglePlayback();
  const dialog_div = document.querySelector("div.dialog");
  dialog_div.classList.add("active");
}

function onLyricsDelayInput() {
  setLyricsDelay(lyricsDelaySeconds_input.value, false);
}

function onLyricsDelayChange() {
  setLyricsDelay(lyricsDelaySeconds_input.value);
}

function setLyricsDelay(delaySeconds, updateInput = true) {
  delaySeconds = Number(delaySeconds);
  if (Number.isNaN(delaySeconds)) delaySeconds = 0;
  else if (delaySeconds > 500) delaySeconds = 500;
  else if (delaySeconds < -500) delaySeconds = -500;
  lyricsDelaySeconds = delaySeconds;
  if (updateInput) lyricsDelaySeconds_input.value = delaySeconds.toFixed(1);
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
  // canvas.focus(); ? first check if user is currently interacting with some other component
  event.stopPropagation();
  if (cursor.getCharAtCursor() === event.key) correctLyricChars.add(cursor.getCurrentPosition());
  else inCorrectLyricChars.add(cursor.getCurrentPosition());
  cursor.moveToNextChar();
}

export function setupNewSong(/** @type {String} */ trackUrl, /** @type {String} */ lrcLyrics) {
  // musicPlayer_audio.pause(); ? is it necessary?
  if (!isMusicPlayerInitialized) setupMusicPlayer();
  musicPlayer_audio.src = trackUrl;
  musicPlayer_audio.oncanplay = () => {
    togglePlayback();
    setupLyrics(lrcLyrics);
    canvasContainer_div.focus();
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

function togglePlayback() {
  isPlaybackPlaying = !isPlaybackPlaying;
  if (isPlaybackPlaying) {
    playPause_img.setAttribute("src", "../images/pause.svg");
    musicPlayer_audio.play();
  } else {
    playPause_img.setAttribute("src", "../images/play.svg");
    musicPlayer_audio.pause();
  }
}

function update() {
  if (!isPlaybackPlaying) {
    requestAnimationFrame(update);
    return;
  }
  clearCanvas();
  drawLyrics();
  updateTypingSpeed();
  requestAnimationFrame(update);
}

function clearCanvas() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

function updateTypingSpeed() {
  wpmValue_span.textContent = typingSpeedMeter.getTypingSpeedWPM();
  typingSpeedMeter.isSpeedIncreasing
    ? wpmContainer_div.classList.add("typing-speed-increasing")
    : wpmContainer_div.classList.remove("typing-speed-increasing");
}

function drawLyrics() {
  textDrawer.resetPosition();
  const traverser = lyricsTraverser.getTraverser();
  const curPlaybackTime = Time.getFromMilliseconds(
    musicPlayer_audio.currentTime - lyricsDelaySeconds
  );
  cursor.scrollToCursor(traverser, canvas.height, LINE_HEIGHT);
  while (traverser.hasNext()) {
    const [idx, char] = traverser.next();
    const lyricTime = lyricsTraverser.getCharTime(idx);
    const isPlaying = curPlaybackTime.isInInterval(lyricTime.start, lyricTime.end);
    const isPlayed = lyricTime.end.isInInterval(new Time(0, 0, 0), curPlaybackTime);
    if (cursor.getCurrentPosition() === idx) cursor.draw(canvasContext, textDrawer, LINE_HEIGHT);
    drawLyricsChar(idx, char, isPlaying, isPlayed);
    if (textDrawer.y > canvas.height) break;
  }
}

function drawLyricsChar(charIdx, char, isPlaying, isPlayed) {
  if (correctLyricChars.has(charIdx)) {
    // correct char
    canvasContext.fillStyle = "green";
  } else if (inCorrectLyricChars.has(charIdx)) {
    // incorrect char
    canvasContext.fillStyle = "red";
  } else if (isPlaying) {
    // playing char
    canvasContext.fillStyle = "black";
  } else if (isPlayed) {
    // played char
  } else {
    // rest of chars
    canvasContext.font = `${LYRIC_FONT_SIZE_PX}px ${LYRIC_MONOSPACE_FONT}`;
    canvasContext.fillStyle = "grey";
  }
  textDrawer.addChar(char);
}
