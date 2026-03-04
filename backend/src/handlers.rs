use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::*;

pub async fn health() -> &'static str {
    "OK"
}

// ============ 图书管理 ============

pub async fn list_books(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Book>>, StatusCode> {
    let books = sqlx::query_as::<_, Book>("SELECT * FROM books ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(books))
}

pub async fn get_book(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Book>, StatusCode> {
    let book = sqlx::query_as::<_, Book>("SELECT * FROM books WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    
    Ok(Json(book))
}

pub async fn create_book(
    State(pool): State<PgPool>,
    Json(req): Json<CreateBookRequest>,
) -> Result<(StatusCode, Json<Book>), StatusCode> {
    let book = sqlx::query_as::<_, Book>(
        r#"INSERT INTO books (id, title, author, isbn, publisher, publish_date, category, total_copies, available_copies, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $7, NOW(), NOW()) RETURNING *"#,
    )
    .bind(&req.title)
    .bind(&req.author)
    .bind(&req.isbn)
    .bind(&req.publisher)
    .bind(&req.publish_date)
    .bind(&req.category)
    .bind(req.total_copies)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(book)))
}

pub async fn update_book(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateBookRequest>,
) -> Result<Json<Book>, StatusCode> {
    let book = sqlx::query_as::<_, Book>(
        r#"UPDATE books SET 
               title = COALESCE($1, title),
               author = COALESCE($2, author),
               isbn = COALESCE($3, isbn),
               publisher = COALESCE($4, publisher),
               category = COALESCE($5, category),
               total_copies = COALESCE($6, total_copies),
               updated_at = NOW()
           WHERE id = $7 RETURNING *"#,
    )
    .bind(&req.title)
    .bind(&req.author)
    .bind(&req.isbn)
    .bind(&req.publisher)
    .bind(&req.category)
    .bind(&req.total_copies)
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;
    
    Ok(Json(book))
}

pub async fn delete_book(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM books WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(StatusCode::NO_CONTENT)
}

// ============ 读者管理 ============

pub async fn list_readers(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Reader>>, StatusCode> {
    let readers = sqlx::query_as::<_, Reader>("SELECT * FROM readers ORDER BY registered_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(readers))
}

pub async fn get_reader(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Reader>, StatusCode> {
    let reader = sqlx::query_as::<_, Reader>("SELECT * FROM readers WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    
    Ok(Json(reader))
}

pub async fn create_reader(
    State(pool): State<PgPool>,
    Json(req): Json<CreateReaderRequest>,
) -> Result<(StatusCode, Json<Reader>), StatusCode> {
    let reader = sqlx::query_as::<_, Reader>(
        r#"INSERT INTO readers (id, name, email, phone, id_card, registered_at, is_active)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), true) RETURNING *"#,
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(&req.phone)
    .bind(&req.id_card)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(reader)))
}

pub async fn update_reader(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    // 简化：实际项目应该有更完整的更新请求结构
) -> Result<StatusCode, StatusCode> {
    // TODO: 实现更新逻辑
    Ok(StatusCode::NOT_IMPLEMENTED)
}

pub async fn delete_reader(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM readers WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(StatusCode::NO_CONTENT)
}

// ============ 借阅管理 ============

pub async fn list_borrows(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<BorrowRecord>>, StatusCode> {
    let borrows = sqlx::query_as::<_, BorrowRecord>("SELECT * FROM borrow_records ORDER BY borrowed_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(borrows))
}

pub async fn create_borrow(
    State(pool): State<PgPool>,
    Json(req): Json<CreateBorrowRequest>,
) -> Result<(StatusCode, Json<BorrowRecord>), StatusCode> {
    // TODO: 检查图书库存和读者状态
    
    let record = sqlx::query_as::<_, BorrowRecord>(
        r#"INSERT INTO borrow_records (id, book_id, reader_id, borrowed_at, due_date, status)
           VALUES (gen_random_uuid(), $1, $2, NOW(), $3, 'borrowed') RETURNING *"#,
    )
    .bind(req.book_id)
    .bind(req.reader_id)
    .bind(req.due_date)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // 减少可用库存
    sqlx::query("UPDATE books SET available_copies = available_copies - 1 WHERE id = $1")
        .bind(req.book_id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(record)))
}

pub async fn return_book(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query(
        r#"UPDATE borrow_records SET returned_at = NOW(), status = 'returned' WHERE id = $1"#,
    )
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;
    
    // TODO: 增加可用库存
    
    Ok(StatusCode::OK)
}

// ============ 用户认证 ============

pub async fn login(
    State(pool): State<PgPool>,
    Json(_req): Json<LoginRequest>,
) -> Result<StatusCode, StatusCode> {
    // TODO: 实现登录逻辑（验证密码，生成 JWT）
    Ok(StatusCode::NOT_IMPLEMENTED)
}

pub async fn register(
    State(pool): State<PgPool>,
    Json(_req): Json<RegisterRequest>,
) -> Result<StatusCode, StatusCode> {
    // TODO: 实现注册逻辑（哈希密码，创建用户）
    Ok(StatusCode::NOT_IMPLEMENTED)
}
