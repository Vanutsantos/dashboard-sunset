import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import App from './App.jsx';
import './styles/tableLoading.css';

dayjs.locale('pt-br');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
