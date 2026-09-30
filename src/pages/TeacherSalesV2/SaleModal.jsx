import { DatePicker, Form, Input, InputNumber, Modal } from 'antd';

/**
 * Modal de cadastro de venda avulsa.
 */
function SaleModal({ open, form, onCancel, onOk }) {
    return (
        <Modal
            title="Nova venda"
            open={open}
            onCancel={onCancel}
            okText="Salvar"
            cancelText="Cancelar"
            onOk={onOk}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Nome do aluno"
                    name="nomeAluno"
                    rules={[{ required: true, message: 'Informe o nome do aluno' }]}
                >
                    <Input placeholder="Nome do aluno" />
                </Form.Item>
                <Form.Item
                    label="Descrição da venda"
                    name="descricao"
                    rules={[{ required: true, message: 'Informe a descrição da venda' }]}
                >
                    <Input placeholder="Descrição da venda" />
                </Form.Item>
                <Form.Item
                    label="Data"
                    name="data"
                    rules={[{ required: true, message: 'Informe a data' }]}
                >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Valor"
                    name="valor"
                    rules={[{ required: true, message: 'Informe o valor' }]}
                >
                    <InputNumber
                        min={0}
                        precision={2}
                        decimalSeparator=","
                        prefix="R$"
                        placeholder="0,00"
                        controls={false}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default SaleModal;
