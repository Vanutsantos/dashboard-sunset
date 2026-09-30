/**
 * Definição centralizada dos caminhos de rota da aplicação.
 * Usar estas constantes evita strings mágicas espalhadas pelo código e
 * facilita mudanças futuras nos caminhos.
 */
export const PATHS = {
  login: '/login',
  forgotPassword: '/forgot-password',
  home: '/',
  clients: '/clients',
  teachers: '/teachers',
  teachersV2: '/teachers-v2',
  teacherNew: '/teachers/new',
  teacherNewV2: '/teachers-v2/new',
  teacherEdit: '/teachers/:id/edit',
  teacherEditV2: '/teachers-v2/:id/edit',
  teacherSales: '/teacher-sales/:id',
  teacherSalesV2: '/teacher-sales-v2/:id',
  sales: '/sales',
  clientDetail: '/clients/:id',
};

/** Gera o caminho de vendas de um professor específico. */
export const teacherSalesPath = (id) => `/teacher-sales/${id}`;

/** Gera o caminho da v2 de vendas de um professor específico. */
export const teacherSalesV2Path = (id) => `/teacher-sales-v2/${id}`;

/** Gera o caminho de edição de um professor específico. */
export const teacherEditPath = (id) => `/teachers/${id}/edit`;
export const teacherEditV2Path = (id) => `/teachers-v2/${id}/edit`;

/** Gera o caminho de detalhe de um cliente específico. */
export const clientDetailPath = (id) => `/clients/${id}`;
