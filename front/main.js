/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

console.log({ canvas });
const ctx = canvas.getContext("2d");

canvas.onclick = () => {
  updateCanvas();
};

const updateCanvas = () => {
  console.log("Fetching image");
  const res = fetch(
    "http://localhost:5000/?startX=0&startY=0&endX=1920&endY=1080&imgWidth=1920&imgHeight=1080"
  )
    .then((res) => res.arrayBuffer())
    .then((/**@type {ArrayBuffer}*/ ab) => {
      console.log("Data received");

      const data = new Uint8ClampedArray(ab);

      let imgData = ctx.createImageData(1920, 1080);

      let nums = new Set();

      for (let i = 0; i < imgData.data.length; i += 1) {
        imgData.data[i * 4 + 0] = 0;
        imgData.data[i * 4 + 1] = 0;
        imgData.data[i * 4 + 2] = data[i];
        imgData.data[i * 4 + 3] = 255;

        nums.add(ab[i]);
      }
      ctx.putImageData(imgData, 0, 0);
      console.log("Drawn");

      console.log(nums);
    });
};

updateCanvas();
