const API_BASE = "http://localhost:8000/api";
const WEB_BASE = "http://localhost:5173";

const textInput = document.getElementById("text-input");
const btnGetSelection = document.getElementById("btn-get-selection");
const btnAnalyze = document.getElementById("btn-analyze");
const loadingDiv = document.getElementById("loading");
const loadingMsg = document.getElementById("loading-msg");
const connError = document.getElementById("connection-error");
const resultsCard = document.getElementById("results-card");

const resRisk = document.getElementById("res-risk");
const resStatus = document.getElementById("res-status");
const flagsCount = document.getElementById("flags-count");
const flagsList = document.getElementById("flags-list");
const claimsCount = document.getElementById("claims-count");
const claimsList = document.getElementById("claims-list");
const resDisclosure = document.getElementById("res-disclosure");
const btnViewFull = document.getElementById("btn-view-full");

let currentAnalysis = null;

// 1. Get selected text from active tab
btnGetSelection.addEventListener("click", () => {
  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "GET_SELECTED_TEXT" }, (response) => {
          if (chrome.runtime.lastError || !response?.text) {
            alert("No text highlighted. Highlight financial text on any webpage first, or type directly into the box.");
          } else {
            textInput.value = response.text;
          }
        });
      }
    });
  } else {
    alert("Running outside browser extension context. Paste text in the box above.");
  }
});

// 2. Run analysis
btnAnalyze.addEventListener("click", async () => {
  const content = textInput.value.trim();
  if (!content) {
    alert("Please enter or select financial text to analyze.");
    return;
  }

  // UI state
  connError.classList.add("hidden");
  resultsCard.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
  loadingMsg.innerText = "Extracting claims & red flags...";

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    currentAnalysis = data;
    renderResults(data);
  } catch (err) {
    console.error("API error:", err);
    connError.classList.remove("hidden");
  } finally {
    loadingDiv.classList.add("hidden");
  }
});

function renderResults(data) {
  resultsCard.classList.remove("hidden");

  // Risk & status
  resRisk.innerText = data.risk_level.toUpperCase();
  resRisk.style.color = (data.risk_level === "High") ? "#ef4444" : (data.risk_level === "Medium") ? "#f59e0b" : "#10b981";

  resStatus.innerText = data.overall_status;
  resStatus.style.background = (data.overall_status === "Verified") ? "#dcfce7" : (data.overall_status === "Contradicted") ? "#fee2e2" : "#fef3c7";
  resStatus.style.color = (data.overall_status === "Verified") ? "#15803d" : (data.overall_status === "Contradicted") ? "#991b1b" : "#b45309";

  // Red Flags
  flagsCount.innerText = data.red_flags.length;
  flagsList.innerHTML = "";
  if (data.red_flags.length === 0) {
    flagsList.innerHTML = "<li style='background:#f0fdf4; border-left-color:#22c55e;'>No red flags detected.</li>";
  } else {
    data.red_flags.forEach(f => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${f.type} (${f.severity}):</strong> ${f.explanation}`;
      flagsList.appendChild(li);
    });
  }

  // Claims
  claimsCount.innerText = data.claims.length;
  claimsList.innerHTML = "";
  data.claims.forEach(c => {
    const div = document.createElement("div");
    div.className = "claim-chip";
    const statusColor = (c.status === "Verified") ? "#15803d" : (c.status === "Contradicted") ? "#991b1b" : "#b45309";
    div.innerHTML = `<span style="color:${statusColor}; font-weight:700;">[${c.status}]</span> ${c.text}`;
    claimsList.appendChild(div);
  });

  // Disclosure
  resDisclosure.innerText = data.disclosure.status;
  resDisclosure.style.color = (data.disclosure.status.includes("detected") && !data.disclosure.status.includes("No")) ? "#15803d" : (data.disclosure.status.includes("Possible")) ? "#b45309" : "#64748b";
}

// 3. View Full Analysis on Web App
btnViewFull.addEventListener("click", () => {
  const content = textInput.value.trim();
  const url = `${WEB_BASE}/analyze?text=${encodeURIComponent(content)}`;
  if (chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank");
  }
});
