/**
 * Cliente HTTP simples.
 *
 * Além de centralizar o endereço da API e o envio do token, anexa a resposta
 * de erro ao objeto `Error` (`erro.dados`). Assim o modo didático consegue
 * ler os `passos` devolvidos pelo servidor mesmo em respostas 401/403/404.
 */
const BASE_API = '/api';

export async function requisitar(caminho, { metodo = 'GET', corpo, token } = {}) {
  const resposta = await fetch(`${BASE_API}${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(dados.erro ?? 'Não foi possível concluir a requisição.');
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }

  return dados;
}
