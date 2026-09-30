/**
 * Helpers puros (sem estado/React) da tela de vendas do professor.
 */

/**
 * Calcula o valor de repasse a partir de um total e uma porcentagem.
 * Retorna null quando a porcentagem não está definida.
 */
export function calcRepasse(total, percent) {
  if (percent == null || total == null) return null;
  return (total * percent) / 100;
}

/**
 * Soma os valores em centavos para evitar erro de ponto flutuante.
 */
export function somarValorTotal(items) {
  const centavos = (items || []).reduce(
    (acc, item) => acc + Math.round((item.valorTotal || 0) * 100),
    0,
  );
  return centavos / 100;
}

/**
 * Normaliza texto para busca/comparação: sem acentos e em minúsculas.
 */
export function normalizarTexto(valor) {
  return (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Indica se o nome é o grupo de vendas avulsas (ignora acentos/caixa).
 */
function isVendasAvulsas(nome) {
  return normalizarTexto(nome).trim() === 'vendas avulsas';
}

/**
 * Grupo com uma única venda de GYMPASS/TOTALPASS: não é exibido na listagem.
 */
function isSinglePassSale(group) {
  if (group.vendas.length !== 1) return false;
  const descricao = group.vendas[0]?.descricao || '';
  return descricao.includes('GYMPASS') || descricao.includes('TOTALPASS');
}

/**
 * Agrupa as vendas por cliente. "VENDAS AVULSAS" sempre na primeira posição;
 * os demais alunos seguem em ordem alfabética.
 */
export function agruparVendasPorCliente(vendas) {
  const map = new Map();

  (vendas || []).forEach((venda) => {
    const group = map.get(venda.codigoCliente) ?? {
      clientId: venda.codigoCliente,
      key: venda.codigoCliente,
      nome: venda.nomeCliente,
      vendas: [],
    };
    group.vendas.push(venda);
    map.set(venda.codigoCliente, group);
  });

  return [...map.values()]
    .map((group) => ({
      ...group,
      totalValor: somarValorTotal(group.vendas),
      totalVendas: group.vendas.length,
    }))
    .filter((group) => !isSinglePassSale(group))
    .sort((a, b) => {
      const aAvulsas = isVendasAvulsas(a.nome);
      const bAvulsas = isVendasAvulsas(b.nome);
      if (aAvulsas !== bAvulsas) return aAvulsas ? -1 : 1;
      return (a.nome || '').localeCompare(b.nome || '');
    });
}

/**
 * Gera um id curto a partir de um texto (SHA-256 convertido em base62).
 */
export async function gerarIdCurto(input, tamanho = 10) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer);
  const alfabeto = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let resultado = '';
  for (let i = 0; i < bytes.length && resultado.length < tamanho; i += 1) {
    resultado += alfabeto[bytes[i] % alfabeto.length];
  }
  return resultado.slice(0, tamanho);
}

/**
 * Formata um valor numérico como moeda simples (ex.: "R$ 12.34").
 */
export function formatarMoeda(valor) {
  return valor != null ? `R$ ${valor.toFixed(2)}` : '-';
}
