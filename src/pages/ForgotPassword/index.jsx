import { useState } from 'react';
import { Form, Input, Button, Card, Tooltip, Typography, Result, message, theme } from 'antd';
import { MailOutlined, BulbOutlined, BulbFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import '../../services/firebase';
import { PATHS } from '../../routes/paths';
import logo from '../../assets/logo.jpg';

const { Title, Text } = Typography;
const auth = getAuth();

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setSent(true);
    } catch (err) {
      const messages = {
        'auth/invalid-email': 'E-mail inválido',
        'auth/user-not-found': 'Não encontramos uma conta com este e-mail',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      };
      message.error(messages[err.code] || 'Erro ao enviar o e-mail de recuperação');
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

        {sent ? (
          <Result
            status="success"
            title="E-mail enviado"
            subTitle="Se existir uma conta com este e-mail, você receberá um link para redefinir a senha. Verifique também a caixa de spam."
            extra={
              <Button type="primary" block size="large" onClick={() => navigate(PATHS.login)}>
                Voltar para o login
              </Button>
            }
          />
        ) : (
          <>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 4 }}>
              Recuperar senha
            </Title>
            <Text
              type="secondary"
              style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
            >
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </Text>
            <Form form={form} name="forgot-password" layout="vertical" onFinish={onFinish}>
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

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Enviar link de recuperação
                </Button>
              </Form.Item>

              <Button
                type="link"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(PATHS.login)}
              >
                Voltar para o login
              </Button>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}

export default ForgotPassword;
