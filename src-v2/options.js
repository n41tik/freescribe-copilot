import { loadConfig, saveConfig } from "../src/config.js";
import { isValidUrl, generateBaseUrl } from "../src/helpers.js";

let config;

function showConfig() {
  // Transcription settings
  document.getElementById("transcriptionLocal").checked =
    config.TRANSCRIPTION_LOCAL;
  toggleTranscriptionSettings();

  const transcriptionLocalModelSelect = document.getElementById(
    "transcriptionLocalModel"
  );
  transcriptionLocalModelSelect.innerHTML =
    config.TRANSCRIPTION_LOCAL_MODELS.map(
      (model) => `<option value="${model}">${model}</option>`
    ).join("");
  transcriptionLocalModelSelect.value = config.TRANSCRIPTION_LOCAL_MODEL;

  document.getElementById("transcriptionHost").value =
    config.TRANSCRIPTION_HOST;
  document.getElementById("transcriptionPort").value =
    config.TRANSCRIPTION_PORT;
  document.getElementById("transcriptionSecure").value =
    config.TRANSCRIPTION_SECURE;
  document.getElementById("transcriptionApiKey").value =
    config.TRANSCRIPTION_API_KEY;

  // LLM settings
  document.getElementById("llmLocal").checked = config.LLM_LOCAL;
  toggleLLMSettings();

  const llmLocalModelSelect = document.getElementById("llmLocalModel");
  llmLocalModelSelect.innerHTML = config.LLM_LOCAL_MODELS.map(
    (model) => `<option value="${model}">${model}</option>`
  ).join("");
  llmLocalModelSelect.value = config.LLM_LOCAL_MODEL;

  document.getElementById("llmHost").value = config.LLM_HOST;
  document.getElementById("llmPort").value = config.LLM_PORT;
  document.getElementById("llmSecure").value = config.LLM_SECURE;
  document.getElementById("llmApiKey").value = config.LLM_API_KEY;
  document.getElementById("llmModel").value = config.LLM_MODEL;

  document.getElementById("llmContextBefore").value = config.LLM_CONTEXT_BEFORE;
  document.getElementById("llmContextAfter").value = config.LLM_CONTEXT_AFTER;
  document.getElementById("realtimeToggle").checked = config.REALTIME;
  document.getElementById("realtimeRecordingLength").value =
    config.REALTIME_RECODING_LENGTH;
  document.getElementById("silenceThreshold").value = config.SILENCE_THRESHOLD;
  document.getElementById("sliderOutput").textContent =
    config.SILENCE_THRESHOLD;
  document.getElementById("minSilenceDuration").value =
    config.MIN_SILENCE_DURATION;
  document.getElementById("debugMode").checked = config.DEBUG_MODE;

  // Pre-processing settings
  document.getElementById("preProcessing").checked = config.PRE_PROCESSING;
  document.getElementById("preProcessingPrompt").value =
    config.PRE_PROCESSING_PROMPT;
  togglePreProcessingSettings();

  // Post-processing settings
  document.getElementById("postProcessing").checked = config.POST_PROCESSING;
  document.getElementById("postProcessingPrompt").value =
    config.POST_PROCESSING_PROMPT;
  togglePostProcessingSettings();
}

function showHideSettings(selector, add_class, remove_class) {
  document.querySelectorAll(selector).forEach((e) => {
    e.classList.remove(remove_class);
    e.classList.add(add_class);
  });
}

function formValidations(selector, value) {
  document.querySelectorAll(selector).forEach((e) => {
    e.required = value;
  });
}

function toggleTranscriptionSettings() {
  if (document.getElementById("transcriptionLocal").checked) {
    showHideSettings(".transcriptionLocalSettings", "visible", "hidden");
    showHideSettings(".transcriptionServerSettings", "hidden", "visible");
  } else {
    showHideSettings(".transcriptionLocalSettings", "hidden", "visible");
    showHideSettings(".transcriptionServerSettings", "visible", "hidden");
  }
}

function toggleLLMSettings() {
  if (document.getElementById("llmLocal").checked) {
    showHideSettings(".llmLocalSettings", "visible", "hidden");
    showHideSettings(".llmServerSettings", "hidden", "visible");
  } else {
    showHideSettings(".llmLocalSettings", "hidden", "visible");
    showHideSettings(".llmServerSettings", "visible", "hidden");
  }
}

function togglePreProcessingSettings() {
  if (document.getElementById("preProcessing").checked) {
    showHideSettings(".pre-processing-settings", "visible", "hidden");
    formValidations(".pre-processing-form", true);
  } else {
    showHideSettings(".pre-processing-settings", "hidden", "visible");
    formValidations(".pre-processing-form", false);
  }
}

function togglePostProcessingSettings() {
  if (document.getElementById("postProcessing").checked) {
    showHideSettings(".post-processing-settings", "visible", "hidden");
    formValidations(".post-processing-form", true);
  } else {
    showHideSettings(".post-processing-settings", "hidden", "visible");
    formValidations(".post-processing-form", false);
  }
}

function updateConfig() {
  // Transcription settings
  config.TRANSCRIPTION_LOCAL =
    document.getElementById("transcriptionLocal").checked;
  config.TRANSCRIPTION_LOCAL_MODEL = document.getElementById(
    "transcriptionLocalModel"
  ).value;
  config.TRANSCRIPTION_HOST =
    document.getElementById("transcriptionHost").value;
  config.TRANSCRIPTION_PORT = parseInt(
    document.getElementById("transcriptionPort").value
  );
  config.TRANSCRIPTION_SECURE = parseInt(
    document.getElementById("transcriptionSecure").value
  );
  config.TRANSCRIPTION_API_KEY = document.getElementById(
    "transcriptionApiKey"
  ).value;

  config.TRANSCRIPTION_URL =
    generateBaseUrl(
      config.TRANSCRIPTION_SECURE,
      config.TRANSCRIPTION_HOST,
      config.TRANSCRIPTION_PORT
    ) + "/whisperaudio";

  // LLM settings
  config.LLM_LOCAL = document.getElementById("llmLocal").checked;
  config.LLM_LOCAL_MODEL = document.getElementById("llmLocalModel").value;
  config.LLM_HOST = document.getElementById("llmHost").value;
  config.LLM_PORT = parseInt(document.getElementById("llmPort").value);
  config.LLM_SECURE = parseInt(document.getElementById("llmSecure").value);
  config.LLM_API_KEY = document.getElementById("llmApiKey").value;
  config.LLM_URL =
    generateBaseUrl(config.LLM_SECURE, config.LLM_HOST, config.LLM_PORT) +
    "/v1/chat/completions";

  config.LLM_MODEL = document.getElementById("llmModel").value;
  config.LLM_CONTEXT_BEFORE = document.getElementById("llmContextBefore").value;
  config.LLM_CONTEXT_AFTER = document.getElementById("llmContextAfter").value;
  config.REALTIME = document.getElementById("realtimeToggle").checked;
  config.REALTIME_RECODING_LENGTH = parseInt(
    document.getElementById("realtimeRecordingLength").value
  );
  config.SILENCE_THRESHOLD = parseFloat(
    document.getElementById("silenceThreshold").value
  );
  config.MIN_SILENCE_DURATION = parseInt(
    document.getElementById("minSilenceDuration").value
  );
  config.DEBUG_MODE = document.getElementById("debugMode").checked;

  // Pre-processing settings
  config.PRE_PROCESSING = document.getElementById("preProcessing").checked;
  config.PRE_PROCESSING_PROMPT = document.getElementById(
    "preProcessingPrompt"
  ).value;

  // Post-processing settings
  config.POST_PROCESSING = document.getElementById("postProcessing").checked;
  config.POST_PROCESSING_PROMPT = document.getElementById(
    "postProcessingPrompt"
  ).value;

  // Save configuration
  saveConfig(config).then(function () {
    alert(
      "Configuration saved! Please restart the extension for the settings to take effect."
    );
    closeTab(); // Close the tab after saving
  });
}

function closeTab() {
  chrome.tabs.getCurrent(function (tab) {
    chrome.tabs.remove(tab.id, function () {});
  });
}

document.addEventListener("DOMContentLoaded", async function (event) {
  $('[data-toggle="tooltip"]').tooltip(); // Initialize tooltips

  config = await loadConfig();
  showConfig();

  // Custom URL validation method
  $.validator.addMethod(
    "customUrl",
    function (value, element) {
      return this.optional(element) || isValidUrl(value);
    },
    "Please enter a valid URL."
  );

  document
    .getElementById("silenceThreshold")
    .addEventListener("change", function () {
      document.getElementById("sliderOutput").textContent = this.value;
    });

  $("#configForm").validate({
    errorClass: "text-danger small",
    rules: {
      transcriptionHost: {
        required: true,
      },
      transcriptionApiKey: {
        required: false,
      },
      llmHost: {
        required: true,
      },
      llmModel: {
        required: true,
      },
      llmContextBefore: {
        required: true,
      },
      llmContextAfter: {
        required: true,
      },
      realtimeRecordingLength: {
        required: true,
        min: 5,
        max: 30,
      },
      silenceThreshold: {
        required: true,
        min: 0.01,
        max: 0.1,
      },
      minSilenceDuration: {
        required: true,
        min: 500,
        max: 2000,
      },
    },
    messages: {
      transcriptionHost: {
        required: "Please enter the Transcription Server URL.",
        customUrl:
          "Please enter a valid URL format for the Transcription Server.",
      },
      transcriptionApiKey: {
        required: "Please enter the Transcription Server API Key.",
      },
      llmHost: {
        required: "Please enter the LLM URL.",
        customUrl: "Please enter a valid URL format for the LLM.",
      },
      llmModel: {
        required: "Please enter the LLM Model.",
      },
      llmContextBefore: {
        required: "Please enter the LLM Context used before the prompt.",
      },
      llmContextAfter: {
        required: "Please enter the LLM Context used after the prompt.",
      },
      realtimeRecordingLength: {
        required: "Please enter the Realtime Recording Length.",
        min: "The Realtime Recording Length must be at least 5 seconds.",
        max: "The Realtime Recording Length cannot exceed 10 seconds.",
      },
      silenceThreshold: {
        required: "Please enter the Silence Threshold.",
        min: "The Silence Threshold must be at least 0.",
      },
      minSilenceDuration: {
        required: "Please enter the Minimum Silence Duration.",
        min: "The Minimum Silence Duration must be at least 500 milliseconds.",
      },
    },
    submitHandler: function (form) {
      updateConfig();
    },
  });

  // Event listeners for the checkboxes
  document
    .getElementById("transcriptionLocal")
    .addEventListener("change", toggleTranscriptionSettings);
  document
    .getElementById("llmLocal")
    .addEventListener("change", toggleLLMSettings);

  document
    .getElementById("preProcessing")
    .addEventListener("change", togglePreProcessingSettings);

  document
    .getElementById("postProcessing")
    .addEventListener("change", togglePostProcessingSettings);
});

// Close without saving
document.getElementById("closeButton").addEventListener("click", closeTab);
