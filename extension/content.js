// TrustLens AI content script: captures selected text on the active webpage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SELECTED_TEXT") {
    const selected = window.getSelection().toString().trim();
    sendResponse({ text: selected });
  }
  return true;
});
