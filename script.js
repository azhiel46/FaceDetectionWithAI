const miVideo = document.getElementById("video");

navigator.getMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

const loadCamera = () => {
  navigator.getMedia(
    {
      video: true,
      audio: false,
    },
    (stream) => (miVideo.srcObject = stream),
    console.error
  );
};

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(loadCamera);

miVideo.addEventListener("play", async () => {
  const canvas = faceapi.createCanvasFromMedia(miVideo);
  document.body.append(canvas);

  const displaySize = { width: miVideo.width, height: miVideo.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(miVideo)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " Anos " + detection.gender,
      }).draw(canvas);
    });
  });
});
