import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Reader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  id_card?: string;
  registered_at: string;
  is_active: boolean;
}

const Readers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadReaders();
  }, []);

  const loadReaders = () => {
    setLoading(true);
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => {
        console.log('加载读者数据:', data);
        setReaders(data || []);
      })
      .catch(err => {
        console.error('加载失败:', err);
        message.error('加载读者列表失败');
        setReaders([
          { id: '1', name: '张三', email: 'zhangsan@example.com', phone: '13800138001', id_card: '110101199001011234', registered_at: '2026-03-04T00:00:00Z', is_active: true },
          { id: '2', name: '李四', email: 'lisi@example.com', phone: '13800138002', id_card: '110101199002022345', registered_at: '2026-03-04T00:00:00Z', is_active: true },
          { id: '3', name: '王五', email: 'wangwu@example.com', phone: '13800138003', id_card: '110101199003033456', registered_at: '2026-03-04T00:00:00Z', is_active: true },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const handleAddReader = () => {
    form.validateFields().then((values) => {
      console.log('新增读者:', values);
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
      .catch(err => {
        console.error('添加失败:', err);
        message.error('添加失败，请重试');
      });
    });
  };

  const handleEdit = (record: Reader) => {
    console.log('编辑读者:', record);
    setEditingReader(record);
    editForm.setFieldsValue({
      ...record,
      registered_at: record.registered_at?.split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateReader = () => {
    editForm.validateFields().then((values) => {
      if (!editingReader) return;
      
      console.log('更新读者:', values);
      fetch(`/api/readers/${editingReader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('更新失败');
      })
      .then(() => {
        message.success('读者信息更新成功！');
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingReader(null);
        loadReaders();
      })
      .catch(err => {
        console.error('更新失败:', err);
        message.error('更新失败，请重试');
      });
    });
  };

  const handleDelete = (id: string) => {
    console.log('删除读者:', id);
    fetch(`/api/readers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          message.success('删除成功');
          loadReaders();
        } else {
          message.error('删除失败');
        }
      })
      .catch(err => {
        console.error('删除失败:', err);
        message.error('删除失败，请重试');
      });
  };

  const columns: ColumnsType<Reader> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => <strong style={{ color: '#1890ff' }}>{name}</strong>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <span><MailOutlined style={{ marginRight: 4, color: '#1890ff' }} />{email}</span>
      )
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone?: string) => phone ? (
        <span><PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />{phone}</span>
      ) : '-'
    },
    {
      title: '身份证号',
      dataIndex: 'id_card',
      key: 'id_card',
      width: 160,
      render: (idCard?: string) => idCard || '-'
    },
    {
      title: '注册日期',
      dataIndex: 'registered_at',
      key: 'registered_at',
      width: 120,
      render: (date: string) => date?.split('T')[0] || date?.substring(0, 10) || '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '正常' : '停用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Reader) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm 
            title="确定删除该读者吗？" 
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
        <h1 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>👥 读者管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增读者
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={readers} 
        rowKey="id" 
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`
        }}
      />

      {/* 新增读者弹窗 */}
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
        width={600}
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

      {/* 编辑读者弹窗 */}
      <Modal
        title="✏️ 编辑读者"
        open={isEditModalOpen}
        onOk={handleUpdateReader}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setEditingReader(null);
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
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
          <Form.Item name="is_active" label="状态" valuePropName="checked">
            <input type="checkbox" /> 正常
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Readers;
