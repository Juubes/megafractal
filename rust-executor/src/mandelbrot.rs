struct Imaginary {
    x: f64,
    y: f64,
}

pub fn get_iterations(coordinate_x: f64, coordinate_y: f64, max_iter_count: u32) -> u32 {
    // The pixel to be calculated
    let pixel = Imaginary {
        x: coordinate_x * 8.0 - 6.0,
        y: coordinate_y * 4.0 - 2.0,
    };

    let mut result = Imaginary { x: 0.0, y: 0.0 };
    let mut iter_num = 0;
    let mut p: Imaginary;
    let mut distance: f64;
    loop {
        p = Imaginary {
            x: result.x * result.x - result.y * result.y,
            y: 2.0 * result.x * result.y,
        };
        result = Imaginary {
            x: p.x + pixel.x,
            y: p.y + pixel.y,
        };
        distance = (result.x * result.x + result.y * result.y).sqrt();
        iter_num += 1;

        if distance > 2.0 || iter_num >= max_iter_count {
            break;
        }
    }

    return iter_num;
}
