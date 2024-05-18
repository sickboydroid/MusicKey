import { setupNewSong } from "./script.js";

const dialogContainer_div = document.querySelector(".dialog");
const cancel_btn = dialogContainer_div.querySelector("#cancel");
const ok_btn = dialogContainer_div.querySelector("#ok");
const musicFile_input = dialogContainer_div.querySelector("input#music-file");
const lyricsFile_input = dialogContainer_div.querySelector("input#lyrics-file");
const filePicker_inputs = [...document.querySelectorAll('input[type="file"]')];
const errorMessage_span = dialogContainer_div.querySelector(".error .message");
filePicker_inputs.forEach(input => input.addEventListener("change", changeListenerFilePicker));

function changeListenerFilePicker() {
  const filePicker_div = this.parentElement.nextElementSibling;
  const pickedFilePath = this.files[0];
  if (!pickedFilePath) {
    filePicker_div.textContent = "(No file selected)";
    return;
  }
  filePicker_div.textContent = pickedFilePath.name;
}

ok_btn.addEventListener("click", async () => {
  if (musicFile_input.files.length === 0) {
    showError("Please select a song");
    return;
  } else if (lyricsFile_input.files.length === 0) {
    showError("Please select lyrics (lrc format)");
    return;
  }
  const trackUrl = URL.createObjectURL(musicFile_input.files[0]);
  const lyrics = await lyricsFile_input.files[0].text();
  setupNewSong(trackUrl, lyrics);
  dialogContainer_div.classList.remove("active");
});

function showError(errorMessage) {
  errorMessage_span.textContent = errorMessage;
}
