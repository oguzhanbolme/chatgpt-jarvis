const input = document.querySelector('textarea');
const button = document.querySelector('button.absolute');
const mic = new webkitSpeechRecognition();
const speaker = new SpeechSynthesisUtterance();
mic.continuous = true;
speaker.rate = 0.8;
let results;
let interval;
let prevWords = '';
let answerIndex = 0;
let answer = [];

// Popup actions
chrome.runtime.onMessage.addListener((request) => {
  switch (request.operation) {
    case 'START_RECORD':
      mic.start();
      break;
    case 'STOP_RECORD':
      mic.stop();
      break;
    default:
      break;
  }
});

// Mic start event as a cleanup
mic.onstart = () => {
  prevWords = '';
  answerIndex = 0;
  answer = [];
};

// Mic results and send to ChatGPT
mic.onresult = (e) => {
  mic.stop();
  const question = e.results[e.results.length - 1][0].transcript;
  input.innerText = question;
  button.click();
  input.innerText = '';
};

// ChatGPT answer catcher
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation, i) => {
    if (mutation.type === 'characterData' && results) {
      const text = mutation.target.data.replace(prevWords, '');
      const index = text.indexOf(text.match(/[?.,!;:]/));

      if (index !== -1) {
        answer.push(text.trim());
        prevWords = mutation.target.data;
        if (answer.length === 1) {
          speak(answer[0]);
        }
      }
    }
  });
});

// Function for synchronous reading (recursively)
function speak(text) {
  if (text) {
    speaker.text = text;
    speaker.onend = () => {
      answerIndex++;
      if (!answer[answerIndex]) {
        results = null;
        scanResults();
        mic.start();
      } else {
        speak(answer[answerIndex]);
      }
    };
    window.speechSynthesis.speak(speaker);
  }
}

// Is ChatGPT start to work?
function scanResults() {
  interval = setInterval(() => {
    if (results) {
      observer.observe(results, { characterData: true, childList: true, subtree: true });
      clearInterval(interval);
    } else {
      results = document.querySelector('div.result-streaming');
    }
  }, 500);
}

// Let's play!
scanResults();
