import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Reader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registered_at: string;
  is_active: boolean;
}

const Readers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadReaders();
  }, []);

  const loadReaders = () => {
    setLoading(true);
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => setReaders(data || []))
      .catch(err => {
        console.error(err);
        setReaders([
          { id: '1', name: '张三', email: 'zhangsan@example.com', phone: '13800138001', registered_at: '2026-03-04', is_active: true },
          { id: '2', name: '李四', email: 'lisi@example.com', phone: '13800138002', registered_at: '2026-03-04', is_active: true },
          { id: '3', name: '王五', email: 'wangwu@example.com', phone: '13800138003', registered_at: '2026-03-04', is_active: true },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const handleAddReader = () => {
    form.validateFields().then((values) => {
      fetch('/api/readers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('添加失败');
      })
      .then(() => {
        message.success('读者添加成功！');
        setIsModalOpen(false);
        form.resetFields();
        loadReaders();
      })
      .catch(() => message.error('添加失败，请重试'));
    });
  };

  const handleDelete = (id: string) => {
    fetch(`/api/readers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          message.success('删除成功');
          loadReaders();
        } else {
          message.error('删除失败');
        }
      })
      .catch(() => message.error('删除失败，请重试'));
  };

  const columns: ColumnsType<Reader> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <span><MailOutlined style={{ marginRight: 4, color: '#1890ff' }} />{email}</span>
      )
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => phone ? (
        <span><PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />{phone}</span>
      ) : '-'
    },
    {
      title: '注册日期',
      dataIndex: 'registered_at',
      key: 'registered_at',
      render: (date: string) => date?.split('T')[0] || date
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '正常' : '停用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Reader) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1890ff' }}>👥 读者管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增读者
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={readers} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title="➕ 新增读者"
        open={isModalOpen}
        onOk={handleAddReader}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="id_card" label="身份证号">
            <Input placeholder="请输入身份证号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Readers;
