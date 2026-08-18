import { Typography, Form, Input, Button, Card } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Login() {
  const onFinish = (values) => {
    console.log('Login:', values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Login
        </Title>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { required: true, message: 'Informe seu e-mail' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="seu@email.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Senha"
            name="password"
            rules={[{ required: true, message: 'Informe sua senha' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Sua senha" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
