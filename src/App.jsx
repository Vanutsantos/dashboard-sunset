import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Teachers from './pages/Teachers';
import Sales from './pages/Sales';
import Login from './pages/Login';
import TeacherSales from './pages/TeacherSales';
import TeacherForm from './pages/TeacherForm';

function App() {
  return (
    <ConfigProvider locale={ptBR}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SyncProvider>
                    <DashboardLayout />
                  </SyncProvider>
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teachers/new" element={<TeacherForm />} />
              <Route path="teacher-sales/:id" element={<TeacherSales />} />
              <Route path="sales" element={<Sales />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
