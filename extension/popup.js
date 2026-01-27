const loggedOutDiv = document.getElementById("loggedOut");
const loggedInDiv = document.getElementById("loggedIn");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Check auth state on popup open
chrome.storage.local.get(["token"], (result) => {
  if (result.token) {
    loggedOutDiv.style.display = "none";
    loggedInDiv.style.display = "block";
  } else {
    loggedOutDiv.style.display = "block";
    loggedInDiv.style.display = "none";
  }
});

// Login → open web app
loginBtn.addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://pass-op-password-manager-aagam.vercel.app/login"
  });
});

// Logout → clear token
logoutBtn.addEventListener("click", () => {
  chrome.storage.local.remove("token", () => {
    loggedOutDiv.style.display = "block";
    loggedInDiv.style.display = "none";
  });
});
