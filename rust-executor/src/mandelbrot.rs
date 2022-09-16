struct Imaginary {
    x: f64,
    y: f64,
}

pub fn get_iterations(coordinate_x: f64, coordinate_y: f64, max_iter_count: u16) -> u16 {
    // Offsets so the image shows up at the center
    let offset_x = -3f64;
    let offset_y = -1.5f64;

    // The pixel to be calculated
    let pixel = Imaginary {
        x: coordinate_x + offset_x,
        y: coordinate_y + offset_y,
    };

    let mut result = Imaginary { x: 0f64, y: 0f64 };
    let mut iter_num = 0;
    let mut p: Imaginary;
    let mut distance: f64;
    loop {
        p = Imaginary {
            x: result.x * result.x - result.y * result.y,
            y: 2f64 * result.x * result.y,
        };
        result = Imaginary {
            x: p.x + pixel.x,
            y: p.y + pixel.y,
        };
        distance = (result.x * result.x + result.y * result.y).sqrt();
        iter_num += 1;

        if distance > 2f64 || iter_num >= max_iter_count {
            break;
        }
    }

    return iter_num;
}
