/**
 * Tipos de aula disponíveis para um professor.
 * Usados no cadastro/edição de professores.
 */
export const CLASS_TYPES = ['Beach Tennis', 'Vôlei', 'Futevôlei'];

/** Opções no formato esperado pelo Select do Antd. */
export const CLASS_TYPE_OPTIONS = CLASS_TYPES.map((type) => ({
  label: type,
  value: type,
}));
