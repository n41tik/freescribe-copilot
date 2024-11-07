import { pipeline, WhisperTextStreamer } from "./transformers.min.js";

// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
  static task = "automatic-speech-recognition";
  static model = "onnx-community/whisper-base";
  static instance = null;

  constructor(tokenizer, model) {
    this.tokenizer = tokenizer;
    this.model = model;
  }

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        dtype: {
          encoder_model:
            this.model === "onnx-community/whisper-large-v3-turbo"
              ? "fp16"
              : "fp32",
          decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
        },
        device: "webgpu",
        progress_callback,
      });
    }

    return this.instance;
  }
}

async function load(model) {
  self.postMessage({
    type: "s2t",
    status: "loading",
    message: "Loading model...",
  });

  const p = PipelineFactory;
  if (p.model !== model) {
    // Invalidate model if different
    p.model = model;

    if (p.instance !== null) {
      (await p.getInstance()).dispose();
      p.instance = null;
    }
  }

  await p.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    x.type = "s2t";
    self.postMessage(x);
  });

  self.postMessage({ type: "s2t", status: "ready" });
}
let isRecording = false;
async function transcribe(audio) {
  if (isRecording) {
    return;
  }
  isRecording = true;

  self.postMessage({
    type: "s2t",
    status: "start",
  });

  // Load transcriber model
  const transcriber = await PipelineFactory.getInstance((data) => {
    data.type = "s2t";
    self.postMessage(data);
  });

  const chunk_length_s = 30;
  const stride_length_s = 5;

  const time_precision =
    transcriber.processor.feature_extractor.config.chunk_length /
    transcriber.model.config.max_source_positions;

  // Storage for chunks to be processed. Initialise with an empty chunk.
  /** @type {{ text: string; offset: number, timestamp: [number, number | null] }[]} */
  const chunks = [];

  // TODO: Storage for fully-processed and merged chunks
  // let decoded_chunks = [];

  let chunk_count = 0;
  let start_time;
  let num_tokens = 0;
  let tps;
  const streamer = new WhisperTextStreamer(transcriber.tokenizer, {
    time_precision,
    on_chunk_start: (x) => {
      const offset = (chunk_length_s - stride_length_s) * chunk_count;
      chunks.push({
        text: "",
        timestamp: [offset + x, null],
        finalised: false,
        offset,
      });
    },
    token_callback_function: (x) => {
      start_time ??= performance.now();
      if (num_tokens++ > 0) {
        tps = (num_tokens / (performance.now() - start_time)) * 1000;
      }
    },
    callback_function: (x) => {
      if (chunks.length === 0) return;
      // Append text to the last chunk
      chunks.at(-1).text += x;

      self.postMessage({
        type: "s2t",
        status: "update",
        data: {
          text: "", // No need to send full text yet
          chunks,
          tps,
        },
      });
    },
    on_chunk_end: (x) => {
      const current = chunks.at(-1);
      current.timestamp[1] = x + current.offset;
      current.finalised = true;
    },
    on_finalize: () => {
      start_time = null;
      num_tokens = 0;
      ++chunk_count;
    },
  });

  // Actually run transcription
  const output = await transcriber(audio, {
    // Greedy
    top_k: 0,
    do_sample: false,

    // Sliding window
    chunk_length_s,
    stride_length_s,

    // Language and task

    // Return timestamps
    return_timestamps: true,
    force_full_sequences: false,

    // Callback functions
    streamer, // after each generation step
  }).catch((error) => {
    console.error(error);
    self.postMessage({
      type: "s2t",
      status: "error",
      data: error,
    });
    return null;
  });

  self.postMessage({
    status: "complete",
    data: {
      type: "s2t",
      text: output.text, // No need to send full text yet
      chunks,
      tps,
    },
  });
  isRecording = false;
}

self.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "load_s2t":
      load(data);
      break;
    case "transcribe":
      transcribe(data);
      break;
  }
});
