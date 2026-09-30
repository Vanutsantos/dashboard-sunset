import { useEffect } from 'react';
import { Typography, Form, Input, Button, message, Spin, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import useTeacherForm from './useTeacherForm';

const { Title } = Typography;

function TeacherFormV2() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { teacher, loading, createTeacher, updateTeacher } = useTeacherForm(id);

  useEffect(() => {
    if (!isEdit || !teacher) return;
    form.setFieldsValue({
      id: teacher.idNextFit,
      idUsuario: teacher.idUsuario ?? undefined,
      nome: teacher.nome,
      email: teacher.email ?? undefined,
      porcentagem: teacher.porcentagem ?? undefined,
    });
  }, [id, isEdit, teacher, form]);

  const onFinish = async (values) => {
    const { id, idUsuario, nome, email, porcentagem } = values;

    try {
      const action = isEdit ? updateTeacher : createTeacher;
      const payload = isEdit
        ? { idUsuario, nome, email, porcentagem }
        : { idNextFit: id, idUsuario, nome, email, porcentagem };

      await action(payload);
      message.success(`Professor ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
      navigate(PATHS.teachersV2);
    } catch (err) {
      message.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    }
  };

  if ((isEdit && loading) || (!isEdit && loading)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <Title level={4}>{isEdit ? 'Editar Professorqweqweqweq' : 'Cadastrar Professorqweqw'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="ID"
          name="id"
          rules={[{ required: true, message: 'Informe o ID do professor' }]}
        >
          <Input placeholder="Ex: 22820940" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="ID de usuário"
          name="idUsuario"
          rules={[{ required: true, message: 'Informe o ID de usuário' }]}
        >
          <Input placeholder="Ex: 22344097" />
        </Form.Item>

        <Form.Item
          label="Nome"
          name="nome"
          rules={[{ required: true, message: 'Informe o nome do professor' }]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            { required: true, message: 'Informe o e-mail do professor' },
            { type: 'email', message: 'E-mail inválido' },
          ]}
        >
          <Input placeholder="professor@email.com" />
        </Form.Item>

        <Form.Item
          label="Porcentagem"
          name="porcentagem"
          rules={[{ required: true, message: 'Informe a porcentagem' }]}
        >
          <InputNumber
            placeholder="Ex: 50"
            min={0}
            max={100}
            precision={0}
            suffix="%"
            style={{ width: '100%' }}
            parser={(value) => {
              // Mantém apenas dígitos e limita o valor entre 0 e 100.
              const digits = (value || '').replace(/\D/g, '');
              if (digits === '') return '';
              return String(Math.min(100, Number(digits)));
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(PATHS.teachersV2)}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TeacherFormV2;
