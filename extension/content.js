console.log("PassOP content script loaded");

// Listen for messages from website
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "PASSOP_JWT") {
    chrome.runtime.sendMessage({
      type: "SAVE_TOKEN",
      token: event.data.token
    });
  }

  if (event.data?.type === "PASSOP_LOGOUT") {
    chrome.runtime.sendMessage({
      type: "CLEAR_TOKEN"
    });
  }
});

