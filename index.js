let mediaRecorder;
let audioChunks = [];
let audioContext;
let audioInputSelect = document.getElementById("audioInputSelect");
let audioOutputSelect = document.getElementById("audioOutputSelect");
let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");

let deviceCounter = 0;

// Use the standard Web Audio API to enumerate devices
navigator.mediaDevices
  .enumerateDevices()
  .then((devices) => {
    console.log(devices);
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
      } else if (device.kind === "audiooutput") {
        audioOutputSelect.appendChild(option);
      }
    });
  })
  .catch((err) => {
    console.error("Error enumerating devices:", err);
  });

recordButton.addEventListener("click", () => {
  let constraints = { audio: true };

  // If the selected value starts with "audioinput_", it's our generated ID
  if (!audioInputSelect.value.startsWith("audioinput_")) {
    constraints.audio = { deviceId: { exact: audioInputSelect.value } };
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        let audioUrl = URL.createObjectURL(audioBlob);
        let audio = new Audio(audioUrl);

        if (audio.setSinkId) {
          // Check if the selected value is a generated ID
          if (audioOutputSelect.value.startsWith("audiooutput_")) {
            console.warn("Using default audio output due to generated ID.");
            audio.play();
          } else {
            audio
              .setSinkId(audioOutputSelect.value)
              .then(() => {
                audio.play();
              })
              .catch((error) => {
                console.warn(
                  "Failed to set audio output device. Falling back to default output.",
                  error
                );
                audio.play();
              });
          }
        } else {
          console.warn(
            "setSinkId is not supported in this browser. Using default audio output."
          );
          audio.play();
        }
      };
      mediaRecorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;
    })
    .catch((err) => {
      console.error("Error accessing the microphone:", err);
    });
});

stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
  recordButton.disabled = false;
  stopButton.disabled = true;
});
