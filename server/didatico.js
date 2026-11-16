/**
 * Passos didáticos devolvidos pela API.
 *
 * Cada rota relevante inclui um array `passos` na resposta. O frontend
 * transforma esse array em uma linha do tempo animada, mostrando o que o
 * servidor fez de verdade por trás da requisição.
 *
 * Cuidados:
 * - nunca incluir `senhaHash`, o segredo do JWT ou dados sensíveis;
 * - no login com falha, não revelar se o e-mail existe.
 */

/** Login realizado com sucesso. */
export function passosLoginSucesso(usuario) {
  return [
    {
      titulo: "Requisição recebida",
      detalhe: "POST /api/autenticacao/entrar",
      estado: "ok",
    },
    {
      titulo: "Usuário localizado",
      detalhe: `email = ${usuario.email}`,
      estado: "ok",
    },
    {
      titulo: "Senha conferida",
      detalhe: "bcrypt.compare(senha, senhaHash) → true",
      estado: "ok",
    },
    {
      titulo: "Token assinado",
      detalhe: "jwt.sign({ sub, papel, afiliacao }) · validade de 1 hora",
      estado: "ok",
    },
    {
      titulo: "Resposta enviada",
      detalhe: "200 OK · token + dados públicos do usuário",
      estado: "ok",
    },
    {
      titulo: "Próximo passo: navegador",
      detalhe: "o cliente grava o token em localStorage['semac.token']",
      estado: "info",
    },
  ];
}

/** Login recusado (mensagem propositalmente genérica). */
export function passosLoginFalha() {
  return [
    {
      titulo: "Requisição recebida",
      detalhe: "POST /api/autenticacao/entrar",
      estado: "ok",
    },
    {
      titulo: "Credenciais verificadas",
      detalhe: "busca por e-mail + bcrypt.compare(...)",
      estado: "ok",
    },
    {
      titulo: "Acesso negado",
      detalhe: "401 · mensagem genérica para não revelar o e-mail",
      estado: "falha",
    },
  ];
}

/** Passos comuns a qualquer rota de evento já autenticada. */
export function passosBaseEvento(req, usuario) {
  return [
    {
      titulo: "Requisição recebida",
      detalhe: `${req.method} ${req.originalUrl}`,
      estado: "ok",
    },
    {
      titulo: "Token validado",
      detalhe: "jwt.verify(token, SEGREDO) → assinatura e validade ok",
      estado: "ok",
    },
    {
      titulo: "Usuário identificado",
      detalhe: `sub = ${usuario.id} → ${usuario.nome}`,
      estado: "ok",
    },
    {
      titulo: "Atributos lidos",
      detalhe: `papel = ${usuario.papel} · anosNaLawd = ${usuario.anosNaLawd}`,
      estado: "ok",
    },
  ];
}

/** Verificação de acesso a um evento (visualização). */
export function passosVisualizacao(req, usuario, acessoCompleto) {
  return [
    ...passosBaseEvento(req, usuario),
    {
      titulo: "Regra de visualização aplicada",
      detalhe: acessoCompleto
        ? "palestrante ou monitor → true · todos os campos"
        : "palestrante ou monitor → false · apenas id, titulo e horario",
      estado: "info",
    },
    {
      titulo: "Resposta enviada",
      detalhe: `200 OK · ${acessoCompleto ? "acesso completo" : "acesso limitado"}`,
      estado: "ok",
    },
  ];
}

/** Verificação de cadastro/edição de evento. */
export function passosGestao(req, usuario, autorizado, acao) {
  return [
    ...passosBaseEvento(req, usuario),
    {
      titulo: "Regra de gestão aplicada",
      detalhe: `palestrante && anosNaLawd >= 3 → ${autorizado}`,
      estado: autorizado ? "ok" : "falha",
    },
    {
      titulo: "Resposta enviada",
      detalhe: autorizado
        ? `200 OK · usuário pode ${acao}`
        : "403 Forbidden · acesso negado",
      estado: autorizado ? "ok" : "falha",
    },
  ];
}

/** Evento inexistente. */
export function passosEventoNaoEncontrado(req, usuario, id) {
  return [
    ...passosBaseEvento(req, usuario),
    {
      titulo: "Evento localizado",
      detalhe: `id = ${id} → não encontrado`,
      estado: "falha",
    },
    {
      titulo: "Resposta enviada",
      detalhe: "404 Not Found · evento não encontrado",
      estado: "falha",
    },
  ];
}

/** Falha na validação do token (middleware de autenticação). */
export function passosTokenInvalido(req, motivo) {
  return [
    {
      titulo: "Requisição recebida",
      detalhe: `${req.method} ${req.originalUrl}`,
      estado: "ok",
    },
    {
      titulo: "Validação do token",
      detalhe: motivo,
      estado: "falha",
    },
    {
      titulo: "Resposta enviada",
      detalhe: "401 Unauthorized · usuário não autenticado",
      estado: "falha",
    },
  ];
}
