import { useState } from 'react';
import { Table, Card, Spin, Empty, Space, theme } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import useIsMobile from '../../hooks/useIsMobile';

/**
 * Tabela responsiva.
 * - Desktop (>= lg): renderiza o Table do Antd normalmente.
 * - Mobile (< lg): renderiza cada linha como um Card, exibindo os campos das
 *   colunas no formato "Título: valor". Respeita onRow (clique), loading e
 *   expandable (conteúdo expandido dentro do card).
 *
 * Recebe as mesmas props relevantes do Table: columns, dataSource, rowKey,
 * loading, onRow, expandable.
 */
function ResponsiveTable({ columns = [], dataSource = [], rowKey, loading, onRow, expandable, ...tableProps }) {
  const isMobile = useIsMobile();
  const {
    token: { colorBorderSecondary, colorTextSecondary },
  } = theme.useToken();

  if (!isMobile) {
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        onRow={onRow}
        expandable={expandable}
        {...tableProps}
      />
    );
  }

  return (
    <MobileCards
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      onRow={onRow}
      expandable={expandable}
      colorBorderSecondary={colorBorderSecondary}
      colorTextSecondary={colorTextSecondary}
    />
  );
}

function resolveRowKey(record, rowKey, index) {
  if (typeof rowKey === 'function') return rowKey(record);
  if (typeof rowKey === 'string' && record[rowKey] != null) return record[rowKey];
  return index;
}

// Colunas puramente estruturais (numeração/ações) que não viram "label: valor".
function isIndexColumn(col) {
  return col.key === 'index' || col.title === '#';
}

function renderCellValue(col, record, index) {
  const raw = col.dataIndex != null ? record[col.dataIndex] : undefined;
  if (typeof col.render === 'function') {
    return col.render(raw, record, index);
  }
  return raw ?? '-';
}

function MobileCards({
  columns,
  dataSource,
  rowKey,
  loading,
  onRow,
  expandable,
  colorBorderSecondary,
  colorTextSecondary,
}) {
  const [expandedKeys, setExpandedKeys] = useState([]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Spin />
      </div>
    );
  }

  if (!dataSource.length) {
    return (
      <div style={{ padding: 24 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />
      </div>
    );
  }

  // Colunas de conteúdo (viram linhas do card) e coluna de ações (rodapé).
  const contentColumns = columns.filter((c) => !isIndexColumn(c) && c.key !== 'acoes');
  const actionColumn = columns.find((c) => c.key === 'acoes');

  const toggle = (key) => {
    setExpandedKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  };

  return (
    <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 16 }}>
      {dataSource.map((record, index) => {
        const key = resolveRowKey(record, rowKey, index);
        const rowProps = onRow ? onRow(record, index) : {};
        const isExpanded = expandedKeys.includes(key);
        const canExpand = !!expandable?.expandedRowRender;

        return (
          <Card key={key} size="small" styles={{ body: { padding: 12 } }}>
            <div
              onClick={rowProps.onClick}
              style={{ cursor: rowProps.onClick ? 'pointer' : 'default' }}
            >
              {contentColumns.map((col) => (
                <div
                  key={col.key || col.dataIndex}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '4px 0',
                  }}
                >
                  <span style={{ color: colorTextSecondary, fontSize: 13 }}>{col.title}</span>
                  <span style={{ textAlign: 'right', wordBreak: 'break-word' }}>
                    {renderCellValue(col, record, index)}
                  </span>
                </div>
              ))}
            </div>

            {(actionColumn || canExpand) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: `1px solid ${colorBorderSecondary}`,
                }}
              >
                <span>
                  {canExpand && (
                    <a onClick={() => toggle(key)}>
                      {isExpanded ? 'Ocultar' : 'Ver detalhes'}{' '}
                      {isExpanded ? <UpOutlined /> : <DownOutlined />}
                    </a>
                  )}
                </span>
                {actionColumn && (
                  <span>{renderCellValue(actionColumn, record, index)}</span>
                )}
              </div>
            )}

            {canExpand && isExpanded && (
              <div style={{ marginTop: 12 }}>{expandable.expandedRowRender(record, index)}</div>
            )}
          </Card>
        );
      })}
    </Space>
  );
}

export default ResponsiveTable;
