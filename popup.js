const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');

document.addEventListener('DOMContentLoaded', () => {
  startButton.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { operation: 'START_RECORD' });
    });
  });

  stopButton.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { operation: 'STOP_RECORD' });
    });
  });
});
