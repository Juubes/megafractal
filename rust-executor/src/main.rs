pub mod mandelbrot;

use serde::{Deserialize, Serialize};
use std::fmt::{format, Debug};
use std::path::Display;
use std::time::Instant;
use warp::hyper::Response;
use warp::test::request;
use warp::{Filter, Future};

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
    let cors = warp::cors()
        .allow_origin("http://localhost:3000")
        .allow_method("GET")
        .build();

    let options_route = warp::options()
        .map(|| {
            return warp::reply();
        })
        .with(cors.clone());

    let default_route = warp::get()
        .and(warp::query::<ZoomParams>())
        .map(|params: ZoomParams| {
            println!("Sending data!");
            return Response::builder().body(format!("{}", params));
        })
        .with(cors.clone());

    let catch_all = warp::any().map(|| "hello world");

    warp::serve(default_route.or(options_route).or(catch_all))
        .run(([127, 0, 0, 1], 5000))
        .await
}

fn index(
    start_x: f64,
    start_y: f64,
    end_x: f64,
    end_y: f64,
    img_width: u16,
    img_height: u16,
) -> String {
    if end_y <= start_y || end_x <= start_x || f64::from(img_width * img_height) < 1f64 {
        // TODO: handle properly with code 400
        panic!("Invalid input")
    }

    let max_iter_count = (100f64 + (f64::from(img_width) / (end_x - start_x)).powf(0.4f64)).floor();

    println!("Calculating area for...");
    println!(
        "{{ startX: {}, startY: {}, endX: {}, endY: {}, imgWidth: {}: imgHeight: {}}}",
        start_x, start_y, end_x, end_y, img_width, img_height
    );

    let mut iterations: Box<[[u16; 1080]; 1920]> = Box::from([[0u16; 1080]; 1920]);

    let incr_x = (end_x - start_x) / f64::from(img_width);
    let incr_y = (end_y - start_y) / f64::from(img_height);

    let time_start = Instant::now();
    for pixel_x in 0..img_width {
        for pixel_y in 0..img_height {
            let x = f64::from(pixel_x) * (end_x - start_x) / f64::from(img_width);
            let y = pixel_y as f64 * (end_y - start_y) / f64::from(img_height);

            iterations[pixel_x as usize][pixel_y as usize] =
                mandelbrot::get_iterations(x, y, (max_iter_count) as u16);
        }
    }

    let time_end = time_start.elapsed();

    println!("Calculated frame in {}ms", time_end.as_millis());

    let mut data = Vec::new();
    data.resize(img_width as usize * img_height as usize, 0u16);

    let mut count = 0;
    for x in 0..(img_height as usize) {
        for y in 0..(img_width as usize) {
            data[x * (img_width as usize) + y] = iterations[y][x];
            count += 1;
        }
    }

    println!("Width: {}, Height: {}", img_width, img_height);

    return format!("{:?}", data);

    // http://localhost:5000/?start_x=0&start_y=0&end_x=1920&end_y=1080&img_width=1920&img_height=1080
}
