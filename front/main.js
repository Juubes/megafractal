import { HSVtoRGB } from "./hsl_to_rgb.js";

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let calculating = false;
let startX = 0;
let startY = 0;
let zoom = 1;
let endX, endY;

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  if (!calculating) {
    processClick(e.x, e.y, "right");
  }
});

canvas.addEventListener("click", (e) => {
  console.log(calculating);

  if (!calculating) {
    processClick(e.x, e.y, "left");
  }
});

const processClick = (x, y, button) => {
  calculating = true;

  // Calculate center
  // click X/Y -> absolute coordinate
  const clickX = x / zoom + startX;
  const clickY = y / zoom + startY;

  if (button === "left") {
    zoom *= 1.5;
  } else if (button === "right") {
    zoom /= 1.5;
  }

  // Set bounds
  startX = clickX - canvas.width / zoom / 2;
  startY = clickY - canvas.height / zoom / 2;
  endX = startX + canvas.width / zoom;
  endY = startY + canvas.height / zoom;

  updateCanvas(startX, startY, endX, endY, canvas.width, canvas.height);
};

canvas.onclick = (event) => {};

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
  const res = await fetch(
    `http://localhost:5000/?start_x=${startX}&start_y=${startY}&end_x=${endX}&end_y=${endY}&img_width=${imgWidth}&img_height=${imgHeight}`
  );
  const arrayBuffer = await res.arrayBuffer();
  const data = new Uint32Array(arrayBuffer);

  let imgData = ctx.createImageData(imgWidth, imgHeight);

  let max_iter = data.reduce((val, cur) => Math.max(val, cur));

  for (let i = 0; i < imgData.data.length; i += 1) {
    // Can be optimised. 2 million pixels, but only 255 inputs
    const iter = data[i];
    const [r, g, b] = HSVtoRGB(
      (iter % 256) / 256,
      1,
      iter === max_iter ? 0 : 1
    );

    imgData.data[i * 4 + 0] = r;
    imgData.data[i * 4 + 1] = g;
    imgData.data[i * 4 + 2] = b;
    imgData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  console.log("Drawn");
  calculating = false;
};

updateCanvas(0, 0, canvas.width, canvas.height, canvas.width, canvas.height);
