import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message } from 'antd';
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
  const [form] = Form.useForm();

  const columns: ColumnsType<Book> = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '总数量',
      dataIndex: 'total_copies',
      key: 'total_copies',
    },
    {
      title: '可借数量',
      dataIndex: 'available_copies',
      key: 'available_copies',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const data: Book[] = [
    {
      id: '1',
      title: 'Rust 程序设计语言',
      author: 'Steve Klabnik',
      isbn: '978-7-111-12345-6',
      publisher: '机械工业出版社',
      category: '编程语言',
      total_copies: 5,
      available_copies: 5,
    },
    {
      id: '2',
      title: 'PostgreSQL 实战',
      author: 'Bruce Momjian',
      isbn: '978-7-111-23456-7',
      publisher: '人民邮电出版社',
      category: '数据库',
      total_copies: 3,
      available_copies: 3,
    },
    {
      id: '3',
      title: 'TypeScript 高级编程',
      author: 'Alex Banks',
      isbn: '978-7-111-34567-8',
      publisher: '清华大学出版社',
      category: '编程语言',
      total_copies: 4,
      available_copies: 4,
    },
    {
      id: '4',
      title: 'Vue.js 设计与实现',
      author: '尤雨溪',
      isbn: '978-7-111-45678-9',
      publisher: '电子工业出版社',
      category: '前端框架',
      total_copies: 2,
      available_copies: 2,
    },
  ];

  const handleAddBook = () => {
    form.validateFields().then((values) => {
      console.log('新增图书:', values);
      message.success('图书添加成功！');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>图书管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增图书
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />

      <Modal
        title="新增图书"
        open={isModalOpen}
        onOk={handleAddBook}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
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
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
