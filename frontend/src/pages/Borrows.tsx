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
      .then(data => {
        console.log('加载借阅数据:', data);
        setBorrows(data || []);
      })
      .catch(err => {
        console.error('加载失败:', err);
        message.error('加载借阅记录失败');
        setBorrows([
          { id: '1', book_id: '1', book_title: 'Rust 程序设计语言', reader_id: '1', reader_name: '张三', borrowed_at: '2026-03-01T00:00:00Z', due_date: '2026-03-15T00:00:00Z', status: 'borrowed' }
        ]);
      })
      .finally(() => setLoading(false));
  };

  const loadBooks = () => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        console.log('加载图书数据:', data);
        setBooks(data || []);
      })
      .catch(err => {
        console.error('加载图书失败:', err);
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
      .then(data => {
        console.log('加载读者数据:', data);
        setReaders(data || []);
      })
      .catch(err => {
        console.error('加载读者失败:', err);
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
      
      console.log('创建借阅:', payload);
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
      .catch(err => {
        console.error('创建失败:', err);
        message.error('创建失败，请重试');
      });
    });
  };

  const handleReturn = (id: string) => {
    console.log('归还图书:', id);
    fetch(`/api/borrows/${id}/return`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          message.success('归还成功！');
          loadBorrows();
        } else {
          message.error('归还失败');
        }
      })
      .catch(err => {
        console.error('归还失败:', err);
        message.error('归还失败，请重试');
      });
  };

  const columns: ColumnsType<BorrowRecord> = [
    {
      title: '图书',
      dataIndex: 'book_title',
      key: 'book_title',
      width: 200,
    },
    {
      title: '读者',
      dataIndex: 'reader_name',
      key: 'reader_name',
      width: 100,
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowed_at',
      key: 'borrowed_at',
      width: 120,
      render: (date: string) => date?.split('T')[0] || date?.substring(0, 10) || '-'
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date: string) => date?.split('T')[0] || date?.substring(0, 10) || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>📝 借阅管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增借阅
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={borrows} 
        rowKey="id" 
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`
        }}
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
        width={500}
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
