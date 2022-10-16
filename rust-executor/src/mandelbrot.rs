pub fn get_iterations(coordinate_x: f64, coordinate_y: f64, max_iter_count: u32) -> u32 {
    // The pixel to be calculated
    let pixel_x = coordinate_x * 8.0 - 5.0;
    let pixel_y = coordinate_y * 4.0 - 2.0;

    let mut x = 0.0;
    let mut y = 0.0;

    let mut x2 = 0.0;
    let mut y2 = 0.0;

    let mut iter_num = 1;

    loop {
        y = (x + x) * y + pixel_y;
        x = x2 - y2 + pixel_x;

        x2 = x * x;
        y2 = y * y;

        if x2 + y2 >= 4.0 || iter_num >= max_iter_count {
            break;
        }

        iter_num += 1;
    }

    return iter_num;
}
