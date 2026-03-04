import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Select, DatePicker, Tag, message } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface BorrowRecord {
  id: string;
  book_title: string;
  reader_name: string;
  borrowed_at: string;
  due_date: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

const statusMap = {
  borrowed: { color: 'orange', text: '借阅中' },
  returned: { color: 'green', text: '已归还' },
  overdue: { color: 'red', text: '已逾期' },
};

const Borrows: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<BorrowRecord> = [
    {
      title: '图书',
      dataIndex: 'book_title',
      key: 'book_title',
    },
    {
      title: '读者',
      dataIndex: 'reader_name',
      key: 'reader_name',
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowed_at',
      key: 'borrowed_at',
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'borrowed' && (
            <Button icon={<CheckCircleOutlined />} size="small" type="primary">
              归还
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const data: BorrowRecord[] = [
    {
      id: '1',
      book_title: 'Rust 程序设计语言',
      reader_name: '张三',
      borrowed_at: '2026-03-01',
      due_date: '2026-03-15',
      status: 'borrowed',
    },
  ];

  const handleAddBorrow = () => {
    form.validateFields().then((values) => {
      console.log('新增借阅:', values);
      message.success('借阅记录创建成功！');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>借阅管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增借阅
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />

      <Modal
        title="新增借阅"
        open={isModalOpen}
        onOk={handleAddBorrow}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="book_id" label="图书" rules={[{ required: true, message: '请选择图书' }]}>
            <Select placeholder="请选择图书">
              <Select.Option value="1">Rust 程序设计语言</Select.Option>
              <Select.Option value="2">PostgreSQL 实战</Select.Option>
              <Select.Option value="3">TypeScript 高级编程</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reader_id" label="读者" rules={[{ required: true, message: '请选择读者' }]}>
            <Select placeholder="请选择读者">
              <Select.Option value="1">张三</Select.Option>
              <Select.Option value="2">李四</Select.Option>
              <Select.Option value="3">王五</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="due_date" label="应还日期" rules={[{ required: true, message: '请选择应还日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Borrows;
