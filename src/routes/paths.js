/**
 * Definição centralizada dos caminhos de rota da aplicação.
 * Usar estas constantes evita strings mágicas espalhadas pelo código e
 * facilita mudanças futuras nos caminhos.
 */
export const PATHS = {
  login: '/login',
  home: '/',
  clients: '/clients',
  teachers: '/teachers',
  teacherNew: '/teachers/new',
  teacherEdit: '/teachers/:id/edit',
  teacherSales: '/teacher-sales/:id',
  sales: '/sales',
  clientDetail: '/clients/:id',
};

/** Gera o caminho de vendas de um professor específico. */
export const teacherSalesPath = (id) => `/teacher-sales/${id}`;

/** Gera o caminho de edição de um professor específico. */
export const teacherEditPath = (id) => `/teachers/${id}/edit`;

/** Gera o caminho de detalhe de um cliente específico. */
export const clientDetailPath = (id) => `/clients/${id}`;
