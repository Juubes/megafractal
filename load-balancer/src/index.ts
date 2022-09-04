import express from "express";
import cors from "cors";
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cors({}));

interface QueryParams {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

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
    imgWidth = parseFloat(req.query.imgWidth);
    // @ts-ignore
    imgHeight = parseFloat(req.query.imgHeight);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(400);
    return;
  }

  // Get pixels in rectangle
  const iterations = new Array<Array<number>>(imgWidth);

  const incrX = (endX - startX) / imgWidth;
  const incrY = (endY - startY) / imgHeight;

  let pixelIndexX = 0;
  let pixelIndexY = 0;
  for (let x = startX; x < endX; x += incrX) {
    iterations[x] = new Array(imgHeight);
    for (let y = startY; y < endY; y += incrY) {
      let normalizedX = x / imgWidth;
      let normalizedY = y / imgHeight;

      iterations[x][y] = Math.min(getIterations(normalizedX, normalizedY), 255);
      pixelIndexY++;
    }
    pixelIndexX++;
  }
  console.log({ length: iterations.length });

  // pixels.forEach((pixel) => {
  //   pixel.x = Math.round(imgWidth * pixel.x);
  //   pixel.y = Math.round(imgHeight * pixel.y);
  // });

  console.log({ iterations });

  res.json(iterations);
});

const MAX_ITERATIONS = 500;
// TODO: colors
const getIterations = (argX: number, argY: number): number => {
  const offsetX = -2;
  const offsetY = -0.5;
  const c = { x: argX + offsetX, y: argY + offsetY };

  let z = { x: 0, y: 0 },
    n = 0,
    p,
    d;
  do {
    p = {
      x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
      y: 2 * z.x * z.y,
    };
    z = {
      x: p.x + c.x,
      y: p.y + c.y,
    };
    d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
    n += 1;
  } while (d <= 2 && n < MAX_ITERATIONS);

  return n;
};

app.listen(5000, "localhost", () => {
  console.log("Server started on port 5000");
});
