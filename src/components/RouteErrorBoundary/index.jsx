import { Button, Result, Typography } from 'antd';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

const { Paragraph, Text } = Typography;

/**
 * Elemento de erro para as rotas (errorElement).
 * Captura erros de renderização, de loaders e respostas de erro do router,
 * exibindo uma tela amigável em vez de uma página em branco.
 */
function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Algo deu errado';
  let subTitle = 'Ocorreu um erro inesperado ao carregar esta página.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status}`;
    subTitle = error.statusText || subTitle;
  }

  const detail = isRouteErrorResponse(error)
    ? error.data
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <Result
        status="error"
        title={title}
        subTitle={subTitle}
        extra={[
          <Button key="home" type="primary" onClick={() => navigate('/', { replace: true })}>
            Ir para o início
          </Button>,
          <Button key="reload" onClick={() => window.location.reload()}>
            Recarregar
          </Button>,
        ]}
      >
        {detail ? (
          <Paragraph>
            <Text type="secondary">{detail}</Text>
          </Paragraph>
        ) : null}
      </Result>
    </div>
  );
}

export default RouteErrorBoundary;
