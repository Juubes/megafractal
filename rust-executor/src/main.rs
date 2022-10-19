pub mod mandelbrot;
pub mod request_processor;
pub mod zoomparams;

use request_processor::process_request;
use warp::{
    hyper::{Method, Response},
    Filter,
};
use zoomparams::ZoomParams;

async fn start_server() {
    let cors = warp::cors()
        .allow_methods([Method::GET])
        .allow_any_origin()
        .build();

    let index = warp::get()
        .and(warp::path::end()) // index
        .and(warp::query::<ZoomParams>())
        .then(process_request);

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
// http://localhost:5000/?start_x=0&start_y=0&end_x=1920&end_y=1080&img_width=1920&img_height=1080
