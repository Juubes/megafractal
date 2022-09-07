/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let startX = 0;
let startY = 0;
let zoom = 1;
let endX, endY;

// canvas.addEventListener("keypress", (event) => {});

canvas.onclick = (event) => {
  // Calculate center
  // click X/Y -> absolute coordinate
  const clickX = event.x / zoom + startX;
  const clickY = event.y / zoom + startY;

  zoom *= 1.5;

  // Set bounds
  startX = clickX - canvas.width / zoom / 2;
  startY = clickY - canvas.height / zoom / 2;
  endX = startX + canvas.width / zoom;
  endY = startY + canvas.height / zoom;

  updateCanvas(startX, startY, endX, endY, canvas.width, canvas.height);
};

/**
 * Fetches image and updates the canvas
 * TODO: streaming one row at the time
 */
const updateCanvas = async (
  startX,
  startY,
  endX,
  endY,
  imgWidth,
  imgHeight
) => {
  console.log("Fetching image");
  const res = await fetch(
    `http://localhost:5000/?startX=${startX}&startY=${startY}&endX=${endX}&endY=${endY}&imgWidth=${imgWidth}&imgHeight=${imgHeight}`
  );
  const arrayBuffer = await res.arrayBuffer();
  console.log("Data received");

  const data = new Uint32Array(arrayBuffer);

  let imgData = ctx.createImageData(imgWidth, imgHeight);

  let max_iter = 1;
  for (let i = 0; i < imgData.data.length; i++) {
    if (data[i] > max_iter) max_iter = data[i];
  }

  for (let i = 0; i < imgData.data.length; i += 1) {
    // const [r, g, b] = hslToRgb(data[i] / 255, data[i] / 255, data[i] / 255);
    // Can be optimised. 2 million pixels, but only 255 inputs
    const iter = data[i];
    // console.log(data)
    const [r, g, b] = hslToRgb(iter / max_iter, 1, iter/max_iter);

    imgData.data[i * 4 + 0] = r;
    imgData.data[i * 4 + 1] = g;
    imgData.data[i * 4 + 2] = b;
    imgData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  console.log("Drawn");
};

updateCanvas(0, 0, canvas.width, canvas.height, canvas.width, canvas.height);
