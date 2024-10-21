import { loadConfig, saveConfig } from "./config.js";
import { isValidUrl } from "./helpers.js";
import { Logger } from "./logger.js";

let config;

function showConfig() {
  document.getElementById("transcriptionUrl").value = config.TRANSCRIPTION_URL;
  document.getElementById("transcriptionApiKey").value =
    config.TRANSCRIPTION_API_KEY;
  document.getElementById("llmUrl").value = config.LLM_URL;
  document.getElementById("llmModel").value = config.LLM_MODEL;
  document.getElementById("llmContextBefore").value = config.LLM_CONTEXT_BEFORE;
  document.getElementById("llmContextAfter").value = config.LLM_CONTEXT_AFTER;
  document.getElementById("realtimeToggle").checked = config.REALTIME;
  document.getElementById("realtimeRecordingLength").value =
    config.REALTIME_RECODING_LENGTH;
  document.getElementById("silenceThreshold").value = config.SILENCE_THRESHOLD;
  document.getElementById("minSilenceDuration").value =
    config.MIN_SILENCE_DURATION;
  document.getElementById("debugMode").checked = config.DEBUG_MODE;
}

function updateConfig() {
  let transcriptionUrl = document.getElementById("transcriptionUrl").value;
  let transcriptionApiKey = document.getElementById(
    "transcriptionApiKey"
  ).value;
  let llmUrl = document.getElementById("llmUrl").value;
  let llmModel = document.getElementById("llmModel").value;
  let llmContextBefore = document.getElementById("llmContextBefore").value;
  let llmContextAfter = document.getElementById("llmContextAfter").value;
  let realtime = document.getElementById("realtimeToggle").checked;
  let realtimeRecordingLength = parseInt(
    document.getElementById("realtimeRecordingLength").value
  );
  let silenceThreshold = parseFloat(
    document.getElementById("silenceThreshold").value
  );
  let minSilenceDuration = parseInt(
    document.getElementById("minSilenceDuration").value
  );
  let debugMode = document.getElementById("debugMode").checked;

  if (!isValidUrl(transcriptionUrl)) {
    alert("Invalid Transcription URL");
    return;
  }

  if (!isValidUrl(llmUrl)) {
    alert("Invalid LLM URL");
    return;
  }

  config.TRANSCRIPTION_URL = transcriptionUrl;
  config.TRANSCRIPTION_API_KEY = transcriptionApiKey;
  config.LLM_URL = llmUrl;
  config.LLM_MODEL = llmModel;
  config.LLM_CONTEXT_BEFORE = llmContextBefore;
  config.LLM_CONTEXT_AFTER = llmContextAfter;
  config.REALTIME = realtime;
  config.REALTIME_RECODING_LENGTH = realtimeRecordingLength;
  config.SILENCE_THRESHOLD = silenceThreshold;
  config.MIN_SILENCE_DURATION = minSilenceDuration;
  config.DEBUG_MODE = debugMode;

  saveConfig(config).then(function () {
    Logger.info("Configuration saved!");
    alert("Configuration saved!");
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.remove(tab.id, function () {});
    });
  });
}

function closeTab() {
  chrome.tabs.getCurrent(function (tab) {
    chrome.tabs.remove(tab.id, function () {});
  });
}

document.addEventListener("DOMContentLoaded", async function (event) {
  config = await loadConfig();
  showConfig();
});

// Save configuration
document.getElementById("saveConfig").addEventListener("click", updateConfig);

// Close without saving
document.getElementById("closeButton").addEventListener("click", closeTab);
