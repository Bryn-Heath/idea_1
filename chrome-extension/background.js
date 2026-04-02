const BACKEND_URL = "http://localhost:5000";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Form Autofill] Extension installed");
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "analyze") {
    fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ answers: data.answers }))
      .catch((err) => {
        console.error("[Form Autofill] Backend error:", err);
        sendResponse({ error: err.message });
      });
    return true;
  }
});
