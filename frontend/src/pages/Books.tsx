import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  category?: string;
  total_copies: number;
  available_copies: number;
}

const Books: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    setLoading(true);
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        console.log('加载图书数据:', data);
        setBooks(data || []);
      })
      .catch(err => {
        console.error('加载失败:', err);
        message.error('加载图书列表失败');
        // 使用示例数据
        setBooks([
          { id: '1', title: 'Rust 程序设计语言', author: 'Steve Klabnik', isbn: '978-7-111-12345-6', publisher: '机械工业出版社', category: '编程语言', total_copies: 5, available_copies: 5 },
          { id: '2', title: 'PostgreSQL 实战', author: 'Bruce Momjian', isbn: '978-7-111-23456-7', publisher: '人民邮电出版社', category: '数据库', total_copies: 3, available_copies: 3 },
          { id: '3', title: 'TypeScript 高级编程', author: 'Alex Banks', isbn: '978-7-111-34567-8', publisher: '清华大学出版社', category: '编程语言', total_copies: 4, available_copies: 4 },
          { id: '4', title: 'Vue.js 设计与实现', author: '尤雨溪', isbn: '978-7-111-45678-9', publisher: '电子工业出版社', category: '前端框架', total_copies: 2, available_copies: 2 },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const handleAddBook = () => {
    form.validateFields().then((values) => {
      console.log('新增图书:', values);
      fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          publish_date: values.publish_date ? new Date(values.publish_date).toISOString() : null
        })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('添加失败');
      })
      .then(() => {
        message.success('图书添加成功！');
        setIsModalOpen(false);
        form.resetFields();
        loadBooks();
      })
      .catch(err => {
        console.error('添加失败:', err);
        message.error('添加失败，请重试');
      });
    });
  };

  const handleEdit = (record: Book) => {
    console.log('编辑图书:', record);
    setEditingBook(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateBook = () => {
    editForm.validateFields().then((values) => {
      if (!editingBook) return;
      
      console.log('更新图书:', values);
      fetch(`/api/books/${editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('更新失败');
      })
      .then(() => {
        message.success('图书更新成功！');
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingBook(null);
        loadBooks();
      })
      .catch(err => {
        console.error('更新失败:', err);
        message.error('更新失败，请重试');
      });
    });
  };

  const handleDelete = (id: string) => {
    console.log('删除图书:', id);
    fetch(`/api/books/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          message.success('删除成功');
          loadBooks();
        } else {
          message.error('删除失败');
        }
      })
      .catch(err => {
        console.error('删除失败:', err);
        message.error('删除失败，请重试');
      });
  };

  const columns: ColumnsType<Book> = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 150,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 150,
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat?: string) => cat ? <Tag color="blue">{cat}</Tag> : '-'
    },
    {
      title: '总数量',
      dataIndex: 'total_copies',
      key: 'total_copies',
      width: 80,
    },
    {
      title: '可借数量',
      dataIndex: 'available_copies',
      key: 'available_copies',
      width: 80,
      render: (copies: number, record: Book) => (
        <span style={{ color: copies > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {copies}/{record.total_copies}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Book) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm 
            title="确定删除这本书吗？" 
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>📚 图书管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增图书
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={books} 
        rowKey="id" 
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`
        }}
      />

      {/* 新增图书弹窗 */}
      <Modal
        title="➕ 新增图书"
        open={isModalOpen}
        onOk={handleAddBook}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input placeholder="请输入 ISBN" />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input placeholder="请输入出版社" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item name="total_copies" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} defaultValue={1} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑图书弹窗 */}
      <Modal
        title="✏️ 编辑图书"
        open={isEditModalOpen}
        onOk={handleUpdateBook}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setEditingBook(null);
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input placeholder="请输入 ISBN" />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input placeholder="请输入出版社" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" />
          </Form.Item>
          <Form.Item name="total_copies" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
