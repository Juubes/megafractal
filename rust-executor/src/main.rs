pub mod mandelbrot;
pub mod process_request;
pub mod zoom_params;

use zoom_params::ZoomParams;

use warp::{
    hyper::{Method, Response},
    Filter,
};

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

async fn start_server() {
    let cors = warp::cors()
        .allow_methods([Method::GET])
        .allow_any_origin()
        .build();

    let index = warp::get()
        .and(warp::path::end()) // index
        .and(warp::query::<ZoomParams>())
        .map(process_request::process_request);

    let catch_all = warp::any().map(|| Response::builder().status(404).body("404"));

    let routes = index
        .or(catch_all)
        .with(cors)
        .with(warp::filters::compression::gzip());

    warp::serve(routes).run(([127, 0, 0, 1], 5000)).await;
}

#[tokio::main]
async fn main() {
    start_server().await
}
