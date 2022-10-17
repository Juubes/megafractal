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

  console.log("Calculating for...");
  console.log({ startX, startY, endX, endY, imgWidth, imgHeight });

  // Divide image into smaller pieces of 10000 pixels
});
