// 简单的 HTTP 截图服务 - 使用 node 内置功能
const http = require('http');
const fs = require('fs');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>图书管理系统 - 预览</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; }
    .layout { display: flex; min-height: 100vh; }
    .sider { width: 200px; background: #001529; color: white; }
    .logo { height: 64px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; background: rgba(255,255,255,0.1); margin: 0; }
    .menu { list-style: none; padding: 0; }
    .menu-item { padding: 16px 24px; cursor: pointer; transition: background 0.3s; }
    .menu-item:hover { background: #1890ff; }
    .menu-item.active { background: #1890ff; }
    .menu-icon { margin-right: 10px; }
    .main { flex: 1; }
    .header { height: 64px; background: white; padding: 0 24px; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .content { margin: 24px; padding: 24px; background: white; border-radius: 8px; min-height: calc(100vh - 140px); }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
    .stat-label { color: #666; font-size: 14px; }
    .stat-icon { font-size: 48px; margin-bottom: 16px; }
    .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .book-card { border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; }
    .book-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #1890ff; }
    .book-author { color: #666; font-size: 14px; }
    h1 { margin-bottom: 24px; color: #333; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sider">
      <div class="logo">📚 图书管理系统</div>
      <ul class="menu">
        <li class="menu-item active"><span class="menu-icon">📊</span>控制台</li>
        <li class="menu-item"><span class="menu-icon">📖</span>图书管理</li>
        <li class="menu-item"><span class="menu-icon">👥</span>读者管理</li>
        <li class="menu-item"><span class="menu-icon">📝</span>借阅管理</li>
      </ul>
    </div>
    <div class="main">
      <div class="header">
        <span style="font-size: 18px; font-weight: 500;">📚 图书管理系统</span>
      </div>
      <div class="content">
        <h1>控制台</h1>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon">📖</div>
            <div class="stat-value" style="color: #1890ff;">14</div>
            <div class="stat-label">图书总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value" style="color: #52c41a;">3</div>
            <div class="stat-label">读者总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value" style="color: #faad14;">0</div>
            <div class="stat-label">借阅中</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value" style="color: #722ed1;">0</div>
            <div class="stat-label">已归还</div>
          </div>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-bottom: 16px; color: #333;">系统公告</h2>
          <p style="color: #666; line-height: 1.8;">🎉 欢迎使用图书管理系统！</p>
          <p style="color: #666; line-height: 1.8;">系统已就绪，可以开始管理图书、读者和借阅记录了。</p>
        </div>
        <div style="margin-top: 24px;">
          <h2 style="margin-bottom: 16px; color: #333;">推荐图书</h2>
          <div class="books-grid">
            <div class="book-card">
              <div class="book-title">Rust 程序设计语言</div>
              <div class="book-author">Steve Klabnik</div>
              <div style="margin-top: 8px; color: #999; font-size: 12px;">机械工业出版社 · 编程语言</div>
            </div>
            <div class="book-card">
              <div class="book-title">PostgreSQL 实战</div>
              <div class="book-author">Bruce Momjian</div>
              <div style="margin-top: 8px; color: #999; font-size: 12px;">人民邮电出版社 · 数据库</div>
            </div>
            <div class="book-card">
              <div class="book-title">TypeScript 高级编程</div>
              <div class="book-author">Alex Banks</div>
              <div style="margin-top: 8px; color: #999; font-size: 12px;">清华大学出版社 · 编程语言</div>
            </div>
            <div class="book-card">
              <div class="book-title">Vue.js 设计与实现</div>
              <div class="book-author">尤雨溪</div>
              <div style="margin-top: 8px; color: #999; font-size: 12px;">电子工业出版社 · 前端框架</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlContent);
});

server.listen(8080, () => {
  console.log('预览服务器运行在 http://localhost:8080');
});
