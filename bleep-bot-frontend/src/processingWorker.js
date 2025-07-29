// File: bleep-bot-frontend/src/processingWorker.js

self.onmessage = async (event) => {
  console.log("WORKER: Message received from main app.");
  const { file, filterSettings } = event.data;

  self.postMessage({ type: 'progress', status: 'Uploading video...', progress: 10 });

  const formData = new FormData();
  formData.append('video', file);

  try {
    // Step 1: Upload the video
    console.log("WORKER: Step 1 - Starting video upload...");
    const uploadResponse = await fetch('http://localhost:8080/api/video/upload', {
      method: 'POST',
      body: formData,
    });
    console.log("WORKER: Upload fetch completed. Status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload request failed: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log("WORKER: Upload result parsed as JSON:", uploadResult);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Server reported upload failure.');
    }

    // Step 2: Start the processing
    self.postMessage({ type: 'progress', status: 'Analyzing audio...', progress: 30 });
    console.log("WORKER: Step 2 - Starting video processing request...");
    const processResponse = await fetch('http://localhost:8080/api/video/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_id: uploadResult.file_id,
        filter_settings: filterSettings
      }),
    });
    console.log("WORKER: Process fetch completed. Status:", processResponse.status);

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`Processing request failed: ${errorText}`);
    }
    const processResult = await processResponse.json();
    console.log("WORKER: Process result parsed as JSON:", processResult);

    if (!processResult.success) {
      throw new Error(processResult.error || 'Server reported processing failure.');
    }

    // Step 3: Send the final result back
    console.log("WORKER: Step 3 - Sending 'complete' message to main app.");
    self.postMessage({
      type: 'complete',
      status: processResult.message || 'Processing complete!',
      segments: processResult.segments || [],
      downloadUrl: `http://localhost:8080/api/video/download/${processResult.clean_file_id}`
    });

  } catch (err) {
    console.error("WORKER: CRITICAL ERROR caught in worker:", err);
    self.postMessage({ type: 'error', status: 'An error occurred in the worker.', error: err.message });
  }
};