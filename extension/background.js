chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token });
    console.log("Extension received token");
  }
  
  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove("token");
    console.log("token removed");
  }
});
