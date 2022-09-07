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

canvas.onclick = (event) => {
  // Always zooms on click

  // console.log(event.x, event.y);

  // startX = event.x - canvas.width / 2 / 2;
  // startY = event.y - canvas.height / 2 / 2;

  // endX = event.x + canvas.width / 2 / 2;
  // endY = event.y + canvas.height / 2 / 2;

  zoom = 1;

  // click X/Y -> absolute coordinate

  const clickX = event.x + startX;
  const clickY = event.y + startY;

  startX = clickX - canvas.width / 2;
  startY = clickY - canvas.height / 2;
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

  const data = new Uint8ClampedArray(arrayBuffer);

  let imgData = ctx.createImageData(imgWidth, imgHeight);

  for (let i = 0; i < imgData.data.length; i += 1) {
    imgData.data[i * 4 + 0] = 0;
    imgData.data[i * 4 + 1] = 0;
    imgData.data[i * 4 + 2] = Math.min(data[i] * 10, 255);
    imgData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  console.log("Drawn");
};

updateCanvas(0, 0, canvas.width, canvas.height, canvas.width, canvas.height);
