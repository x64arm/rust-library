import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Select, DatePicker, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface BorrowRecord {
  id: string;
  book_id: string;
  book_title: string;
  reader_id: string;
  reader_name: string;
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

interface Book {
  id: string;
  title: string;
  available_copies: number;
}

interface Reader {
  id: string;
  name: string;
}

const statusMap: Record<string, { color: string; text: string }> = {
  borrowed: { color: 'orange', text: '借阅中' },
  returned: { color: 'green', text: '已归还' },
  overdue: { color: 'red', text: '已逾期' },
};

const Borrows: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBorrows();
    loadBooks();
    loadReaders();
  }, []);

  const loadBorrows = () => {
    setLoading(true);
    fetch('/api/borrows')
      .then(res => res.json())
      .then(data => setBorrows(data || []))
      .catch(() => {
        setBorrows([
          { id: '1', book_id: '1', book_title: 'Rust 程序设计语言', reader_id: '1', reader_name: '张三', borrowed_at: '2026-03-01', due_date: '2026-03-15', status: 'borrowed' }
        ]);
      })
      .finally(() => setLoading(false));
  };

  const loadBooks = () => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data || []))
      .catch(() => {
        setBooks([
          { id: '1', title: 'Rust 程序设计语言', available_copies: 4 },
          { id: '2', title: 'PostgreSQL 实战', available_copies: 3 },
          { id: '3', title: 'TypeScript 高级编程', available_copies: 4 },
        ]);
      });
  };

  const loadReaders = () => {
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => setReaders(data || []))
      .catch(() => {
        setReaders([
          { id: '1', name: '张三' },
          { id: '2', name: '李四' },
          { id: '3', name: '王五' },
        ]);
      });
  };

  const handleAddBorrow = () => {
    form.validateFields().then((values) => {
      const payload = {
        book_id: values.book_id,
        reader_id: values.reader_id,
        due_date: values.due_date.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      };
      
      fetch('/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('创建失败');
      })
      .then(() => {
        message.success('借阅记录创建成功！');
        setIsModalOpen(false);
        form.resetFields();
        loadBorrows();
      })
      .catch(() => message.error('创建失败，请重试'));
    });
  };

  const handleReturn = (id: string) => {
    fetch(`/api/borrows/${id}/return`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          message.success('归还成功！');
          loadBorrows();
        } else {
          message.error('归还失败');
        }
      })
      .catch(() => message.error('归还失败，请重试'));
  };

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
      render: (date: string) => date?.split('T')[0] || date
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => date?.split('T')[0] || date
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <Space size="small">
          {record.status === 'borrowed' && (
            <Popconfirm title="确认归还？" onConfirm={() => handleReturn(record.id)}>
              <Button icon={<CheckCircleOutlined />} size="small" type="primary">
                归还
              </Button>
            </Popconfirm>
          )}
          {record.status === 'overdue' && (
            <Popconfirm title="确认归还？" onConfirm={() => handleReturn(record.id)}>
              <Button icon={<ClockCircleOutlined />} size="small" danger>
                催还
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1890ff' }}>📝 借阅管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增借阅
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={borrows} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title="📖 新增借阅"
        open={isModalOpen}
        onOk={handleAddBorrow}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="book_id" label="图书" rules={[{ required: true, message: '请选择图书' }]}>
            <Select placeholder="请选择图书" showSearch optionFilterProp="children">
              {books.map(book => (
                <Select.Option key={book.id} value={book.id} disabled={book.available_copies <= 0}>
                  {book.title} ({book.available_copies} 本可借)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reader_id" label="读者" rules={[{ required: true, message: '请选择读者' }]}>
            <Select placeholder="请选择读者" showSearch optionFilterProp="children">
              {readers.map(reader => (
                <Select.Option key={reader.id} value={reader.id}>
                  {reader.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="due_date" label="应还日期" rules={[{ required: true, message: '请选择应还日期' }]} initialValue={dayjs().add(14, 'day')}>
            <DatePicker style={{ width: '100%' }} minDate={dayjs()} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Borrows;
