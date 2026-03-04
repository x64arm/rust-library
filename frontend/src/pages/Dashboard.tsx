import { Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>控制台</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="图书总数"
              value={14}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="读者总数"
              value={3}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="借阅中"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已归还"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="系统公告" style={{ marginTop: 24 }}>
        <p>🎉 欢迎使用图书管理系统！</p>
        <p>系统已就绪，可以开始管理图书、读者和借阅记录了。</p>
      </Card>
    </div>
  );
};

export default Dashboard;
