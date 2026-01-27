chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token }, () => {
      console.log("JWT saved to extension storage");
    });
  }
});
