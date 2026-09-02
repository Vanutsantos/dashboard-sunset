import { Typography } from 'antd';

const { Title } = Typography;

function Home() {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Title>Olá Mundo</Title>
    </div>
  );
}

export default Home;
