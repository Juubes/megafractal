/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

console.log({ canvas });
const ctx = canvas.getContext("2d");

//   "/?startX=0&startY=0&endX=1920&endY=1080&imgWidth=1920&imgHeight=1080"

console.log("Fetching image");
const res = fetch(
  "http://localhost:5000/?startX=0&startY=0&endX=1920&endY=1080&imgWidth=1920&imgHeight=1080"
)
  .then((res) => res.json())
  .then((data) => {
    console.log("Data received");

    console.log({ data });

    for (let x = 0; x < data.length; x++) {
      for (let y = 0; y < data[x].length; y++) {
        const blue = data[x][y];
        ctx.fillStyle = `rgb(${blue}, ${blue}, ${blue})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    console.log("Drawn");
  });
