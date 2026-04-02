const scanBtn = document.getElementById("scan-btn");
const statusEl = document.getElementById("status");
const answersList = document.getElementById("answers-list");

function logStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#dc3545" : "";
}

async function handleScan() {
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner"></span> Scanning...';
  logStatus("Scanning page for forms...");

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) throw new Error("No active tab found");

    // Ensure content script is loaded
    try {
      await chrome.tabs.sendMessage(tabs[0].id, { action: "ping" });
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      });
      await new Promise((r) => setTimeout(r, 100));
    }

    const scanResponse = await chrome.tabs.sendMessage(tabs[0].id, {
      action: "scan",
    });

    if (!scanResponse?.fields?.length) {
      logStatus("No forms found on page");
      return;
    }

    logStatus(`Found ${scanResponse.fields.length} fields. Analyzing...`);

    const analyzeResponse = await chrome.runtime.sendMessage({
      action: "analyze",
      fields: scanResponse.fields,
    });

    if (analyzeResponse.error) {
      logStatus(`Error: ${analyzeResponse.error}`, true);
      return;
    }

    if (analyzeResponse.answers) {
      displayAnswers(analyzeResponse.answers);
      logStatus("Analysis complete! Auto-filling fields...");

      await chrome.tabs.sendMessage(tabs[0].id, {
        action: "fill",
        answers: analyzeResponse.answers,
      });

      logStatus("Fields auto-filled! Review before submitting.");
    }
  } catch (error) {
    logStatus(`Error: ${error.message}`, true);
    console.error("[Form Autofill] Error:", error);
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = "Scan Page Forms";
  }
}

scanBtn.onclick = handleScan;

function displayAnswers(answers) {
  answersList.innerHTML = "";
  answers.forEach((answer) => {
    const div = document.createElement("div");
    div.className = "answer-item";
    div.innerHTML = `
      <strong>${answer.label}</strong><br>
      <textarea readonly rows="2">${answer.suggested_answer}</textarea>
      <small>Confidence: ${(answer.confidence * 100).toFixed(0)}%</small>
    `;
    answersList.appendChild(div);
  });
}
