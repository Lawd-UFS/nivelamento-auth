/**
 * Rotas de eventos da SEMAC.
 *
 * Nesta etapa não há cadastro/edição de verdade: as rotas apenas
 * RESPONDEM se o usuário autenticado tem ou não permissão para a ação.
 * A decisão é sempre tomada no servidor — esconder um botão no frontend
 * não é autorização.
 *
 * Cada resposta inclui `passos`, usados pelo frontend para explicar o
 * fluxo de verificação de forma animada (modo didático).
 */
import { Router } from "express";
import { autenticar } from "../middleware/autenticar.js";
import { buscarEventoPorId, listarEventos } from "../store.js";
import {
  passosEventoNaoEncontrado,
  passosGestao,
  passosVisualizacao,
} from "../didatico.js";
import {
  MENSAGEM_ACESSO_NEGADO,
  filtrarEventoParaUsuario,
  podeGerenciarEventos,
  podeVerEventoCompleto,
} from "../politicas/eventos.js";

export const rotasEventos = Router();

// Todas as rotas de eventos exigem um usuário autenticado.
// O método `.use()` aplica o middleware a todas as rotas definidas depois dele.
rotasEventos.use(autenticar);

/** GET /api/eventos — lista os eventos conforme o perfil do usuário. */
rotasEventos.get("/", (req, res) => {
  const acessoCompleto = podeVerEventoCompleto(req.usuario);

  return res.json({
    acessoCompleto,
    mensagem: acessoCompleto
      ? "Acesso completo aos dados dos eventos."
      : "Acesso limitado: você só pode ver o título e o horário dos eventos.",
    eventos: listarEventos().map((evento) =>
      filtrarEventoParaUsuario(evento, req.usuario),
    ),
  });
});

/**
 * GET /api/eventos/novo
 *
 * Verifica se o usuário pode cadastrar um novo evento.
 * Precisa vir antes de `/:id` para "novo" não ser interpretado como um id.
 */
rotasEventos.get("/novo", (req, res) => {
  const autorizado = podeGerenciarEventos(req.usuario);
  const passos = passosGestao(
    req,
    req.usuario,
    autorizado,
    "cadastrar eventos",
  );

  if (!autorizado) {
    return res.status(403).json({
      autorizado: false,
      erro: MENSAGEM_ACESSO_NEGADO,
      mensagem: MENSAGEM_ACESSO_NEGADO,
      passos,
    });
  }

  return res.json({
    autorizado: true,
    mensagem: "Usuário pode cadastrar eventos.",
    passos,
  });
});

/**
 * GET /api/eventos/:id/editar
 *
 * Verifica se o usuário pode editar o evento informado.
 */
rotasEventos.get("/:id/editar", (req, res) => {
  const evento = buscarEventoPorId(req.params.id);

  if (!evento) {
    return res.status(404).json({
      erro: "Evento não encontrado.",
      passos: passosEventoNaoEncontrado(req, req.usuario, req.params.id),
    });
  }

  const autorizado = podeGerenciarEventos(req.usuario);
  const passos = passosGestao(
    req,
    req.usuario,
    autorizado,
    `editar o evento ${evento.id}`,
  );

  if (!autorizado) {
    return res.status(403).json({
      autorizado: false,
      erro: MENSAGEM_ACESSO_NEGADO,
      mensagem: MENSAGEM_ACESSO_NEGADO,
      passos,
    });
  }

  return res.json({
    autorizado: true,
    mensagem: `Usuário pode editar o evento ${evento.id}.`,
    passos,
  });
});

/**
 * GET /api/eventos/:id
 *
 * Devolve o evento com todos os campos (palestrante/monitor) ou apenas
 * com título e horário (participante).
 */
rotasEventos.get("/:id", (req, res) => {
  const evento = buscarEventoPorId(req.params.id);

  if (!evento) {
    return res.status(404).json({
      erro: "Evento não encontrado.",
      passos: passosEventoNaoEncontrado(req, req.usuario, req.params.id),
    });
  }

  const acessoCompleto = podeVerEventoCompleto(req.usuario);

  return res.json({
    acessoCompleto,
    mensagem: acessoCompleto
      ? "Usuário pode acessar todas as informações do evento."
      : "Usuário tem acesso apenas ao título e ao horário do evento.",
    evento: filtrarEventoParaUsuario(evento, req.usuario),
    passos: passosVisualizacao(req, req.usuario, acessoCompleto),
  });
});
