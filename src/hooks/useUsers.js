import useApi from './useApi';

/**
 * Hook para buscar usuários (professores/consultores) da API Next Fit.
 * Utiliza o endpoint GetUsuarios pois não existe endpoint específico para professores.
 * @param {object} options - Opções do useApi
 */
function useUsers(options = {}) {
  return useApi('/Pessoa/GetUsuarios', options);
}

export default useUsers;
