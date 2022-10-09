pub mod mandelbrot;

use serde::{Deserialize, Serialize};
use std::time::Instant;
use warp::{
    hyper::{Method, Response},
    Filter,
};

#[derive(Deserialize, Serialize, Debug)]
struct ZoomParams {
    start_x: f64,
    start_y: f64,
    end_x: f64,
    end_y: f64,
    img_width: u16,
    img_height: u16,
}
impl core::fmt::Display for ZoomParams {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(
            format!(
                "{}, {}, {}, {}, {}, {}",
                self.start_x, self.start_y, self.end_x, self.end_y, self.img_width, self.img_height
            )
            .as_str(),
        )
    }
}

#[tokio::main]
async fn main() {
    start_server().await
}

async fn start_server() {
    let cors = warp::cors()
        .allow_origin("http://localhost:3000")
        .allow_methods([Method::GET])
        .build();

    let index = warp::get()
        .and(warp::path::end()) // index
        .and(warp::query::<ZoomParams>())
        .map(process_request)
        .with(cors)
        .with(warp::filters::compression::gzip());

    let catch_all = warp::any().map(|| Response::builder().status(404).body("404"));

    let routes = index.or(catch_all);

    warp::serve(routes).run(([127, 0, 0, 1], 5000)).await;
}

fn process_request(params: ZoomParams) -> Vec<u8> {
    let ZoomParams {
        start_x,
        start_y,
        end_x,
        end_y,
        img_width,
        img_height,
    } = params;

    if end_y <= start_y || end_x <= start_x || ((img_width as f64) * (img_height as f64)) < 1f64 {
        // TODO: handle properly with code 400
        panic!("Invalid input")
    }

    let max_iter_count =
        (100f64 + ((img_width as f64) / (end_x - start_x)).powf(0.4 as f64)).floor();

    println!("Calculating area for...");
    println!(
        "{{ startX: {}, startY: {}, endX: {}, endY: {}, imgWidth: {}: imgHeight: {}}}",
        start_x, start_y, end_x, end_y, img_width, img_height
    );

    let mut iterations = vec![255; (img_width as usize) * (img_height as usize)];

    let time_start = Instant::now();
    let range_x = (end_x - start_x).abs();
    let range_y = (end_y - start_y).abs();

    print!("Diffx: {}", range_x);

    for pixel_x in 0..img_width {
        for pixel_y in 0..img_height {
            let x = start_x + (pixel_x as f64) / (img_width as f64) * range_x;
            let y = start_y + (pixel_y as f64) / (img_height as f64) * range_y;

            // let x: f64 = pixel_x as f64;
            // let y: f64 = pixel_y as f64;

            iterations[((pixel_y as f64) * (img_width as f64)) as usize + (pixel_x as usize)] =


                // Scales improperly
                // mandelbrot::get_iterations(x, y, (max_iter_count) as u8);
                mandelbrot::get_iterations(x , y, 255);
        }
    }

    let time_end = time_start.elapsed();
    println!("Calculated frame in {}ms", time_end.as_millis());

    let vec: Vec<u8> = iterations.iter().map(|e| *e as u8).collect();

    return vec;
}

// http://localhost:5000/?start_x=0&start_y=0&end_x=1920&end_y=1080&img_width=1920&img_height=1080
