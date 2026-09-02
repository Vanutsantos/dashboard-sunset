import { useEffect, useState } from 'react';
import { Typography, Form, Input, Button, message, Spin, Select, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import useTeacherMutations from '../../hooks/useTeacherMutations';
import { CLASS_TYPE_OPTIONS } from '../../constants/classTypes';
import { PATHS } from '../../routes/paths';

const { Title } = Typography;

function TeacherForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loadingTeacher, setLoadingTeacher] = useState(isEdit);
  const { saving, getTeacher, teacherExists, saveTeacher } = useTeacherMutations();

  // Em modo edição, carrega os dados atuais do professor.
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const teacher = await getTeacher(id);
        if (!active) return;
        if (!teacher) {
          message.error('Professor não encontrado');
          navigate(PATHS.teachers, { replace: true });
          return;
        }
        form.setFieldsValue({
          id: teacher.id,
          nome: teacher.nome,
          tipoAula: teacher.tipoAula ?? undefined,
          porcentagem: teacher.porcentagem ?? undefined,
        });
      } catch (err) {
        message.error('Erro ao carregar professor: ' + (err.message || 'Erro desconhecido'));
      } finally {
        if (active) setLoadingTeacher(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit, getTeacher, form, navigate]);

  const onFinish = async (values) => {
    try {
      // Ao criar, evita sobrescrever um professor existente com o mesmo ID.
      if (!isEdit && (await teacherExists(values.id))) {
        message.error('Já existe um professor com este ID');
        return;
      }
      await saveTeacher({
        id: values.id,
        nome: values.nome,
        tipoAula: values.tipoAula,
        porcentagem: values.porcentagem,
      });
      message.success(
        isEdit ? 'Professor atualizado com sucesso!' : 'Professor cadastrado com sucesso!',
      );
      navigate(PATHS.teachers);
    } catch (err) {
      message.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    }
  };

  if (loadingTeacher) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <Title level={4}>{isEdit ? 'Editar Professor' : 'Cadastrar Professor'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="ID"
          name="id"
          rules={[{ required: true, message: 'Informe o ID do professor' }]}
        >
          <Input placeholder="Ex: 22820940" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="Nome"
          name="nome"
          rules={[{ required: true, message: 'Informe o nome do professor' }]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item
          label="Tipo de aula"
          name="tipoAula"
          rules={[{ required: true, message: 'Selecione o tipo de aula' }]}
        >
          <Select
            placeholder="Selecione o tipo de aula"
            options={CLASS_TYPE_OPTIONS}
            allowClear
          />
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
              return Math.min(100, Number(digits));
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isEdit ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(PATHS.teachers)}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TeacherForm;
