import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [form] = Form.useForm();

  const columns: ColumnsType<Reader> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '注册日期',
      dataIndex: 'registered_at',
      key: 'registered_at',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => active ? '正常' : '停用',
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

  const data: Reader[] = [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      registered_at: '2026-03-04',
      is_active: true,
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      registered_at: '2026-03-04',
      is_active: true,
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138003',
      registered_at: '2026-03-04',
      is_active: true,
    },
  ];

  const handleAddReader = () => {
    form.validateFields().then((values) => {
      console.log('新增读者:', values);
      message.success('读者添加成功！');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>读者管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增读者
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" />

      <Modal
        title="新增读者"
        open={isModalOpen}
        onOk={handleAddReader}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
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
        </Form>
      </Modal>
    </div>
  );
};

export default Readers;
