import compression, { CompressionFilter } from "compression";
import cors from "cors";
import express from "express";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cors({}));

const filter: CompressionFilter = (req, res) => {
  if (req.path === "/") return true;
  return false;
};
app.use(compression({ filter }));

app.get("/", (req, res) => {
  let startX: number,
    startY: number,
    endX: number,
    endY: number,
    imgWidth: number,
    imgHeight: number;
  try {
    // @ts-ignore
    startX = parseFloat(req.query.startX);
    // @ts-ignore
    startY = parseFloat(req.query.startY);
    // @ts-ignore
    endX = parseFloat(req.query.endX);
    // @ts-ignore
    endY = parseFloat(req.query.endY);
    // @ts-ignore
    imgWidth = parseInt(req.query.imgWidth);
    // @ts-ignore
    imgHeight = parseInt(req.query.imgHeight);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(400);
    return;
  }

  if (endY <= startY || endX <= startX || imgWidth * imgHeight < 1) {
    return res.end(400);
  }
  const maxIterCount = 100 + Math.sqrt(imgWidth / (endX - startX));

  console.log("Calculating for...");
  console.log({ startX, startY, endX, endY, imgWidth, imgHeight });

  // Get pixels in rectangle
  const iterations = new Array<Array<number>>(imgHeight);

  const incrX = (endX - startX) / imgWidth;
  const incrY = (endY - startY) / imgHeight;

  let indexX = 0;

  const timeStart = Date.now();
  for (let x = startX; x < endX; x += incrX) {
    let indexY = 0;

    iterations[indexX] = new Array(imgWidth);
    for (let y = startY; y < endY; y += incrY) {
      let normalizedX = (x / imgWidth) * 4;
      let normalizedY = (y / imgHeight) * 3;

      // console.log("Calculate pixel " + indexX + ":" + indexY);

      iterations[indexX][indexY] = Math.min(
        getIterations(normalizedX, normalizedY, maxIterCount),
        255
      );
      indexY++;
    }
    indexX++;
  }
  const timeEnd = Date.now();

  console.log(timeEnd - timeStart + "ms for fractal calculation");

  let MAX_ITER_COUNT_IN_DATA = 255;
  const data: number[] = [];
  for (let i = 0; i < imgHeight; i++) {
    for (let j = 0; j < imgWidth; j++) {
      data.push(iterations[j][i]);

      if (iterations[j][i] > MAX_ITER_COUNT_IN_DATA)
        MAX_ITER_COUNT_IN_DATA = iterations[j][i];
    }
  }

  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    data[i] = (255 * element) / MAX_ITER_COUNT_IN_DATA;
  }

  console.log("Iterations per pixel: " + maxIterCount);
  // const clamped = Uint8ClampedArray.from(data);

  const clamped = Uint8ClampedArray.from(data);

  res.send(Buffer.from(clamped.buffer));
});

// TODO: colors
const getIterations = (
  argX: number,
  argY: number,
  maxIterCount: number
): number => {
  // Offsets so the image shows up at the center
  const offsetX = -3;
  const offsetY = -1.5;

  // The pixel to be calculated
  const pixel = { x: argX + offsetX, y: argY + offsetY };

  let result = { x: 0, y: 0 };
  let iter_num = 0;
  let p, distance;
  do {
    p = {
      x: result.x * result.x - result.y * result.y,
      y: 2 * result.x * result.y,
    };
    result = {
      x: p.x + pixel.x,
      y: p.y + pixel.y,
    };
    distance = Math.sqrt(result.x * result.x + result.y * result.y);
    iter_num++;
  } while (distance <= 2 && iter_num < maxIterCount);

  return iter_num;
};

app.listen(5000, "localhost", () => {
  console.log("Server started on port 5000");
});
