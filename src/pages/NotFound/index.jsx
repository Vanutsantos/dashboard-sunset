import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="A página que você procura não existe ou foi movida."
        extra={
          <Button type="primary" onClick={() => navigate('/', { replace: true })}>
            Voltar para o início
          </Button>
        }
      />
    </div>
  );
}

export default NotFound;
