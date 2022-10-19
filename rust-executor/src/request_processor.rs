use std::time::Instant;

use crate::{zoomparams::ZoomParams, mandelbrot};

pub async fn process_request(params: ZoomParams) -> Vec<u8> {
    let ZoomParams {
        start_x,
        start_y,
        end_x,
        end_y,
        img_width,
        img_height,
    } = params;

    let img_width = img_width as f64;
    let img_height = img_height as f64;

    if end_y <= start_y || end_x <= start_x || img_width * img_height < 1.0 {
        // TODO: handle properly with code 400
        panic!("Invalid input")
    }

    // let max_iter_count = ((100.0 + (img_width / (end_x - start_x)).powf(0.5)).floor()) as u32;
    let scale = (end_x - start_x) / img_width;
    let max_iter_count = (100.0 + f64::log10(4.0 / f64::abs(scale)).powf(4.5)) as u32;

    println!("Max iterations: {}", max_iter_count);

    println!("Calculating area for...");
    println!(
        "{{ startX: {}, startY: {}, endX: {}, endY: {}, imgWidth: {}: imgHeight: {}}}",
        start_x, start_y, end_x, end_y, img_width, img_height
    );

    let mut iterations = vec![255; (img_width as usize) * (img_height as usize)];

    let time_start = Instant::now();
    let range_x = (end_x - start_x).abs();
    let range_y = (end_y - start_y).abs();

    println!("range_x: {}", range_x);

    for pixel_x in 0..img_width as u16 {
        for pixel_y in 0..img_height as u16 {
            let x = (start_x + (pixel_x as f64) / img_width * range_x) / img_width;
            let y = (start_y + (pixel_y as f64) / img_height * range_y) / img_height;

            iterations[((pixel_y as f64) * img_width) as usize + (pixel_x as usize)] =
                mandelbrot::get_iterations(x, y, max_iter_count);
        }
    }

    let time_end = time_start.elapsed();
    println!("Calculated frame in {}ms", time_end.as_millis());

    let vec: Vec<u8> = iterations.iter().flat_map(|e| e.to_le_bytes()).collect();

    return vec;
}
