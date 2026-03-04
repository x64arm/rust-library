use axum::{
    routing::{get, post, put, delete},
    Router,
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod handlers;
mod models;
mod db;

#[tokio::main]
async fn main() {
    // 初始化日志
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "library_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // 加载环境变量
    dotenvy::dotenv().ok();

    // 初始化数据库连接池
    let pool = db::create_pool().await.expect("Failed to create database pool");

    // 运行数据库迁移
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // 配置 CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 构建路由
    let app = Router::new()
        // 健康检查
        .route("/health", get(handlers::health))
        // 图书管理
        .route("/api/books", get(handlers::list_books).post(handlers::create_book))
        .route("/api/books/{id}", get(handlers::get_book).put(handlers::update_book).delete(handlers::delete_book))
        // 读者管理
        .route("/api/readers", get(handlers::list_readers).post(handlers::create_reader))
        .route("/api/readers/{id}", get(handlers::get_reader).put(handlers::update_reader).delete(handlers::delete_reader))
        // 借阅记录
        .route("/api/borrows", get(handlers::list_borrows).post(handlers::create_borrow))
        .route("/api/borrows/{id}/return", post(handlers::return_book))
        // 用户认证
        .route("/api/auth/login", post(handlers::login))
        .route("/api/auth/register", post(handlers::register))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(pool);

    // 启动服务器
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("📚 Library Backend running on http://{}", listener.local_addr().unwrap());
    
    axum::serve(listener, app).await.unwrap();
}
