import { Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 * Retorna true quando a viewport está em tamanho "mobile".
 * Considera mobile abaixo do breakpoint `lg` do Antd (< 992px),
 * cobrindo celulares e tablets em modo retrato.
 *
 * @returns {boolean}
 */
function useIsMobile() {
  const screens = useBreakpoint();
  // screens.lg é true a partir de 992px. Ausência de lg = tela pequena.
  return !screens.lg;
}

export default useIsMobile;
