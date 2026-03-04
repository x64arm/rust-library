use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// 图书
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Book {
    pub id: Uuid,
    pub title: String,
    pub author: String,
    pub isbn: Option<String>,
    pub publisher: Option<String>,
    pub publish_date: Option<DateTime<Utc>>,
    pub category: Option<String>,
    pub total_copies: i32,
    pub available_copies: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// 创建图书请求
#[derive(Debug, Deserialize)]
pub struct CreateBookRequest {
    pub title: String,
    pub author: String,
    pub isbn: Option<String>,
    pub publisher: Option<String>,
    pub publish_date: Option<DateTime<Utc>>,
    pub category: Option<String>,
    pub total_copies: i32,
}

/// 更新图书请求
#[derive(Debug, Deserialize)]
pub struct UpdateBookRequest {
    pub title: Option<String>,
    pub author: Option<String>,
    pub isbn: Option<String>,
    pub publisher: Option<String>,
    pub category: Option<String>,
    pub total_copies: Option<i32>,
}

/// 读者
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Reader {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub id_card: Option<String>,
    pub registered_at: DateTime<Utc>,
    pub is_active: bool,
}

/// 创建读者请求
#[derive(Debug, Deserialize)]
pub struct CreateReaderRequest {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub id_card: Option<String>,
}

/// 借阅记录
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BorrowRecord {
    pub id: Uuid,
    pub book_id: Uuid,
    pub reader_id: Uuid,
    pub borrowed_at: DateTime<Utc>,
    pub due_date: DateTime<Utc>,
    pub returned_at: Option<DateTime<Utc>>,
    pub status: String, // borrowed, returned, overdue
}

/// 创建借阅记录请求
#[derive(Debug, Deserialize)]
pub struct CreateBorrowRequest {
    pub book_id: Uuid,
    pub reader_id: Uuid,
    pub due_date: DateTime<Utc>,
}

/// 用户（用于登录）
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub role: String, // admin, librarian, reader
    pub created_at: DateTime<Utc>,
}

/// 登录请求
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

/// 注册请求
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub password: String,
    pub role: Option<String>,
}
