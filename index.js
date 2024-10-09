// whisper server url
const WHISPER_URL =
  "http://ec2-18-116-81-253.us-east-2.compute.amazonaws.com:8000/whisperaudio";

let mediaRecorder;
let audioChunks = [];
let audioContext;
let audioInputSelect = document.getElementById("audioInputSelect");
let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");

let deviceCounter = 0;

let tabStream;

// Use the standard Web Audio API to enumerate devices
navigator.mediaDevices
  .enumerateDevices()
  .then((devices) => {
    devices.forEach((device) => {
      let option = document.createElement("option");
      if (device.deviceId && device.deviceId !== "") {
        option.value = device.deviceId;
      } else {
        // Generate a unique ID if deviceId is empty
        option.value = `${device.kind}_${deviceCounter++}`;
      }

      if (device.label) {
        option.text = device.label;
      } else {
        // If label is not available, use the kind and generated ID
        option.text = `${device.kind} (${option.value})`;
      }

      if (device.kind === "audioinput") {
        audioInputSelect.appendChild(option);
      }
    });
  })
  .catch((err) => {
    console.error("Error enumerating devices:", err);
  });

recordButton.addEventListener("click", () => {
  let constraints = { audio: true };

  audioChunks = [];

  // If the selected value starts with "audioinput_", it's our generated ID
  if (!audioInputSelect.value.startsWith("audioinput_")) {
    constraints.audio = { deviceId: { exact: audioInputSelect.value } };
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((micStream) => {
      chrome.tabCapture.capture(
        { audio: true, video: false },
        (capturedTabStream) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }

          tabStream = capturedTabStream;

          const audioContext = new AudioContext();
          const micSource = audioContext.createMediaStreamSource(micStream);
          const tabSource = audioContext.createMediaStreamSource(tabStream);
          const destination = audioContext.createMediaStreamDestination();

          // Create a gain node for the tab audio (for volume control if needed)
          const tabGain = audioContext.createGain();
          tabGain.gain.value = 1; // Set to 1 for passthrough, or adjust as needed

          // Connect the tab audio to both the destination and the audio context destination (speakers)
          tabSource.connect(tabGain);
          tabGain.connect(destination);
          tabGain.connect(audioContext.destination);

          micSource.connect(destination);

          const combinedStream = destination.stream;

          mediaRecorder = new MediaRecorder(combinedStream);
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          mediaRecorder.onstop = () => {
            let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            let audioUrl = URL.createObjectURL(audioBlob);
            let audio = new Audio(audioUrl);

            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
            };

            audio.play();

            // send audio to whisper server
            sendAudioToServer(audioBlob).then((result) => {
              updateGUI(result.text);
            });
          };
          mediaRecorder.start();
          recordButton.disabled = true;
          stopButton.disabled = false;
          // Disable select elements
          audioInputSelect.disabled = true;
        }
      );
    })
    .catch((err) => {
      console.error("Error accessing the microphone or tab audio:", err);
    });
});

stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
  if (tabStream) {
    tabStream.getTracks().forEach((track) => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  recordButton.disabled = false;
  stopButton.disabled = true;
  // Re-enable select elements
  audioInputSelect.disabled = false;
});

async function sendAudioToServer(audioBlob) {
  console.log("Sending audio to server");
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");

  const headers = {
    // "X-API-Key": editable_settings["Whisper Server API Key"],
  };

  try {
    const response = await fetch(WHISPER_URL, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error sending audio to server:", error);
    throw error;
  }
}

function updateGUI(text) {
  // Update your GUI with the transcribed text
  // This might involve updating a DOM element
  const userInput = document.getElementById("userInput");
  userInput.value += text + "\n";
  userInput.scrollTop = userInput.scrollHeight;
}
