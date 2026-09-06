import { useState } from 'react';
import { Form, Input, Button, Card, Tooltip, message, theme } from 'antd';
import { LockOutlined, MailOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import '../../services/firebase';
import { recordLogin } from '../../services/loginLog';
import logo from '../../assets/logo.jpg';

const auth = getAuth();

function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      // Registra o login (data, IP e metadados) no Firestore. Best-effort.
      await recordLogin(credential.user);
      // Após login, vai sempre para a página inicial (dashboard).
      navigate('/', { replace: true });
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'E-mail ou senha incorretos',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      };
      message.error(messages[err.code] || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 16,
        background: colorBgLayout,
      }}
    >
      <Tooltip title={isDark ? 'Tema claro' : 'Tema escuro'}>
        <Button
          type="text"
          icon={isDark ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          style={{ position: 'absolute', top: 16, right: 16, fontSize: 18 }}
        />
      </Tooltip>
      <Card style={{ width: 400, maxWidth: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: 100, aspectRatio: 1, objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
        <Form form={form} name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { required: true, message: 'Informe seu e-mail' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="seu@email.com"
              size="large"
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item
            label="Senha"
            name="password"
            rules={[{ required: true, message: 'Informe sua senha' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Sua senha"
              size="large"
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
