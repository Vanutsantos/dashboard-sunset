import { createBrowserRouter } from 'react-router-dom';
import { SyncProvider } from '../contexts/SyncContext';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import TeacherRoute from '../components/TeacherRoute';
import RouteErrorBoundary from '../components/RouteErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';
import RootLayout from './RootLayout';
import { PATHS } from './paths';

import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import ClientDetail from '../pages/ClientDetail';
import Teachers from '../pages/Teachers';
import TeacherForm from '../pages/TeacherForm';
import TeacherSales from '../pages/TeacherSales';
import TeacherSalesV2 from '../pages/TeacherSalesV2';
import Sales from '../pages/Sales';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import NotFound from '../pages/NotFound';
import TeachersV2 from '../pages/TeachersV2';
import TeacherFormV2 from '../pages/TeacherFormV2';

/**
 * Configuração central de rotas.
 *
 * Estrutura:
 *  RootLayout (AuthProvider)
 *    ├─ PublicRoute  → /login (bloqueia acesso se já autenticado)
 *    ├─ PrivateRoute → área autenticada (SyncProvider + DashboardLayout)
 *    │     ├─ /            Dashboard
 *    │     ├─ /clients     Clientes
 *    │     ├─ /teachers    Professores
 *    │     ├─ /teachers/new
 *    │     ├─ /teacher-sales/:id
 *    │     └─ /sales
 *    └─ *  → NotFound (404)
 *
 * Cada nível tem um errorElement, evitando telas em branco quando algo falha.
 */
export const routes = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: PATHS.login, element: <Login /> },
          { path: PATHS.forgotPassword, element: <ForgotPassword /> },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            element: (
              <SyncProvider>
                <DashboardLayout />
              </SyncProvider>
            ),
            children: [
              {
                // Restringe professores à própria página de vendas; admin livre.
                element: <TeacherRoute />,
                children: [
                  { index: true, element: <Dashboard /> },
                  { path: PATHS.clients, element: <Clients /> },
                  { path: PATHS.clientDetail, element: <ClientDetail /> },
                  { path: PATHS.teachers, element: <Teachers /> },
                  { path: PATHS.teachersV2, element: <TeachersV2 /> },
                  { path: PATHS.teacherNew, element: <TeacherForm /> },
                  { path: PATHS.teacherNewV2, element: <TeacherFormV2 /> },
                  { path: PATHS.teacherEdit, element: <TeacherForm /> },
                  { path: PATHS.teacherEditV2, element: <TeacherFormV2 /> },
                  { path: PATHS.teacherSales, element: <TeacherSales /> },
                  { path: PATHS.teacherSalesV2, element: <TeacherSalesV2 /> },
                  { path: PATHS.sales, element: <Sales /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
