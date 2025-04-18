use sentry::ClientInitGuard;
use tracing::info;

pub fn init() -> Option<ClientInitGuard> {
    let dsn = std::env::var("SENTRY_DSN").ok();
    
    if let Some(dsn) = dsn {
        info!("Initializing Sentry");
        Some(sentry::init((
            dsn,
            sentry::ClientOptions {
                release: sentry::release_name!(),
                traces_sample_rate: 1.0,
                // Remove unsupported options
                ..Default::default()
            },
        )))
    } else {
        info!("No Sentry DSN found, skipping Sentry initialization");
        None
    }
}

pub fn create_sentry_layer() -> sentry_tower::NewSentryLayer<http::Request<axum::body::Body>> {
    sentry_tower::NewSentryLayer::new_from_top()
}