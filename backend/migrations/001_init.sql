-- 图书表
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200) NOT NULL,
    isbn VARCHAR(50),
    publisher VARCHAR(200),
    publish_date TIMESTAMPTZ,
    category VARCHAR(100),
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 读者表
CREATE TABLE IF NOT EXISTS readers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    id_card VARCHAR(50),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 借阅记录表
CREATE TABLE IF NOT EXISTS borrow_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed'
);

-- 用户表（用于系统登录）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'reader',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_reader_id ON borrow_records(reader_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_status ON borrow_records(status);

-- 插入示例数据
INSERT INTO books (title, author, isbn, publisher, category, total_copies, available_copies) VALUES
('Rust 程序设计语言', 'Steve Klabnik', '978-7-111-12345-6', '机械工业出版社', '编程语言', 5, 5),
('PostgreSQL 实战', 'Bruce Momjian', '978-7-111-23456-7', '人民邮电出版社', '数据库', 3, 3),
('TypeScript 高级编程', 'Alex Banks', '978-7-111-34567-8', '清华大学出版社', '编程语言', 4, 4),
('Vue.js 设计与实现', '尤雨溪', '978-7-111-45678-9', '电子工业出版社', '前端框架', 2, 2);

INSERT INTO readers (name, email, phone) VALUES
('张三', 'zhangsan@example.com', '13800138001'),
('李四', 'lisi@example.com', '13800138002'),
('王五', 'wangwu@example.com', '13800138003');

INSERT INTO users (username, password_hash, role) VALUES
('admin', '$argon2id$v=19$m=19456,t=2,p=1$YWJjZGVmZ2hpams$abcdefghijklmnopqrstuvwxyz', 'admin');
