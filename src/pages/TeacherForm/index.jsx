import { useState } from 'react';
import { Typography, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { Title } = Typography;

function TeacherForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'teachers', values.id), {
        id: values.id,
        nome: values.nome,
      });
      message.success('Professor cadastrado com sucesso!');
      form.resetFields();
      navigate('/teachers');
    } catch (err) {
      message.error('Erro ao cadastrar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <Title level={4}>Cadastrar Professor</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="ID"
          name="id"
          rules={[{ required: true, message: 'Informe o ID do professor' }]}
        >
          <Input placeholder="Ex: 22820940" />
        </Form.Item>

        <Form.Item
          label="Nome"
          name="nome"
          rules={[{ required: true, message: 'Informe o nome do professor' }]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cadastrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TeacherForm;
