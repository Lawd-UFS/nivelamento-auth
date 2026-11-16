/**
 * Políticas de acesso aos eventos da SEMAC.
 *
 * Concentrar as regras em um único arquivo facilita explicar e testar
 * a autorização separadamente das rotas.
 */

/**
 * Palestrantes e monitores (membros da LAWD) podem ver todos os dados
 * de um evento. Participantes só podem ver título e horário.
 */
export function podeVerEventoCompleto(usuario) {
  return usuario.papel === "palestrante" || usuario.papel === "monitor";
}

/**
 * Somente palestrante com MAIS de 3 anos de LAWD pode cadastrar ou editar.
 * Repare que a regra combina papel (RBAC) e atributo do usuário (ABAC).
 */
export function podeGerenciarEventos(usuario) {
  return usuario.papel === "palestrante" && usuario.anosNaLawd >= 3;
}

/**
 * Devolve o evento com todos os campos ou apenas com os campos públicos,
 * de acordo com o perfil de quem está pedindo.
 */
export function filtrarEventoParaUsuario(evento, usuario) {
  if (podeVerEventoCompleto(usuario)) {
    return evento;
  }

  return {
    id: evento.id,
    titulo: evento.titulo,
    horario: evento.horario,
  };
}

/** Mensagem exibida na tela de acesso negado. */
export const MENSAGEM_ACESSO_NEGADO = "Usuário não possui acesso ao recurso.";
