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
    imgWidth = parseFloat(req.query.imgWidth);
    // @ts-ignore
    imgHeight = parseFloat(req.query.imgHeight);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(400);
    return;
  }

  // Get pixels in rectangle
  const iterations = new Array<Array<number>>(imgHeight);

  const incrX = (endX - startX) / imgWidth;
  const incrY = (endY - startY) / imgHeight;

  const timeStart = Date.now();
  for (let x = startX; x < endX; x += incrX) {
    iterations[x] = new Array(imgHeight);
    for (let y = startY; y < endY; y += incrY) {
      let normalizedX = (x / imgWidth) * 4;
      let normalizedY = (y / imgHeight) * 3;

      iterations[x][y] = Math.min(getIterations(normalizedX, normalizedY), 255);
    }
  }
  const timeEnd = Date.now();

  console.log(timeEnd - timeStart + "ms calculated");

  const data: number[] = [];

  for (let i = 0; i < imgHeight; i++) {
    for (let j = 0; j < imgWidth; j++) {
      data.push(iterations[j][i]);
    }
  }
  // const clamped = Uint8ClampedArray.from(data);

  const clamped = Uint8ClampedArray.from(data);

  // const blob = Buffer.from(clamped, { type: "arraybuffer" });

  // savePixels([data], "png", {});

  res.send(Buffer.from(clamped.buffer));
});

const MAX_ITERATIONS = 500;
// TODO: colors
const getIterations = (argX: number, argY: number): number => {
  const offsetX = -3;
  const offsetY = -1.5;
  const c = { x: argX + offsetX, y: argY + offsetY };

  let z = { x: 0, y: 0 },
    n = 0,
    p,
    d;
  do {
    p = {
      x: z.x * z.x - Math.pow(z.y, 2),
      y: 2 * z.x * z.y,
    };
    z = {
      x: p.x + c.x,
      y: p.y + c.y,
    };
    d = Math.sqrt(z.x * z.x + Math.pow(z.y, 2));
    n += 1;
  } while (d <= 2 && n < MAX_ITERATIONS);

  return n;
};

app.listen(5000, "localhost", () => {
  console.log("Server started on port 5000");
});
