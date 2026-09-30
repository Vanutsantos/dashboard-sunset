import { Button, Card, Col, InputNumber, Row, Space, Statistic, Typography } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

/** Rótulo padrão dos campos do card de ajustes. */
function FieldLabel({ children }) {
  return (
    <Text type="secondary" style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
      {children}
    </Text>
  );
}

/** Campo de repasse (%): somente leitura até entrar em edição. */
function PorcentagemField({ isEditing, value, onChange, onToggle }) {
  return (
    <div>
      <FieldLabel>Repasse (%)</FieldLabel>
      <InputNumber
        value={value || 0}
        disabled={!isEditing}
        controls={false}
        suffix="%"
        placeholder="—"
        min={0}
        max={100}
        style={{ width: 90, marginRight: 4 }}
        parser={(texto) => {
          const apenasNumeros = texto?.replace(/\D/g, '') ?? '';
          if (apenasNumeros === '') return '';
          return String(Math.min(Number(apenasNumeros), 100));
        }}
        formatter={(valor) => (valor ? `${valor}` : '')}
        onChange={onChange}
      />
      <Button
        type={isEditing ? 'primary' : 'default'}
        icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
        onClick={onToggle}
      />
    </div>
  );
}

/** Campo de desconto (R$) aplicado ao repasse. Apenas local, não é salvo. */
function DescontoField({ value, onChange, disabled }) {
  return (
    <div>
      <FieldLabel>Desconto</FieldLabel>
      <InputNumber
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={0}
        precision={2}
        decimalSeparator=","
        prefix="R$"
        placeholder="0,00"
        controls={false}
        style={{ width: 120 }}
      />
    </div>
  );
}

/**
 * Cartões de resumo do mês: alunos, total em vendas, repasse e ajustes.
 */
function ResumoCards({
  totalAlunos,
  totalVendas,
  totalRepasseLiquido,
  desconto,
  onDescontoChange,
  loading,
  porcentagem,
  onPorcentagemChange,
  onPorcentagemToggle,
}) {
  return (
    <Row gutter={[16, 16]} align="stretch" style={{ marginTop: 16 }}>
      <Col xs={8} lg={4}>
        <Card size="small" style={{ height: '100%' }}>
          <Statistic title="Alunos" value={totalAlunos} />
        </Card>
      </Col>
      <Col xs={16} sm={10} lg={6}>
        <Card size="small" style={{ height: '100%' }}>
          <Statistic title="Total em vendas" value={totalVendas} precision={2} prefix="R$" />
        </Card>
      </Col>
      <Col xs={24} sm={10} lg={6}>
        <Card size="small" style={{ height: '100%' }}>
          <Statistic
            title={desconto ? 'Repasse (c/ desconto)' : 'Repasse'}
            value={totalRepasseLiquido}
            precision={2}
            prefix="R$"
          />
        </Card>
      </Col>
      <Col xs={24} sm={24} lg={8}>
        <Card size="small" style={{ height: '100%' }}>
          <Space size="large" align="start" wrap>
            <PorcentagemField
              isEditing={porcentagem.isEditing}
              value={porcentagem.value}
              onChange={onPorcentagemChange}
              onToggle={onPorcentagemToggle}
            />
            <DescontoField
              value={desconto}
              onChange={onDescontoChange}
              disabled={loading}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
}

export default ResumoCards;
