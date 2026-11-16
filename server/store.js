/**
 * "Banco de dados" em memória carregado a partir de arquivos JSON.
 *
 * Para o escopo didático deste projeto não usamos um banco real:
 * usuários e eventos são lidos uma única vez, na inicialização do servidor,
 * e mantidos em memória.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const diretorioAtual = path.dirname(fileURLToPath(import.meta.url));
const caminhoUsuarios = path.join(diretorioAtual, "data", "usuarios.json");
const caminhoEventos = path.join(diretorioAtual, "data", "eventos.json");

/** @type {Array<{id:string,nome:string,email:string,senhaHash:string,papel:string,afiliacao:string,anosNaLawd:number,criadoEm:string}>} */
let usuarios = [];

/** @type {Array<{id:string,titulo:string,horario:string,local:string,descricao:string,criadoPor:string}>} */
let eventos = [];

function carregarArquivos() {
  usuarios = JSON.parse(fs.readFileSync(caminhoUsuarios, "utf8"));
  eventos = JSON.parse(fs.readFileSync(caminhoEventos, "utf8"));
}

carregarArquivos();

/* ------------------------------------------------------------------------ */
/* Usuários                                                                 */
/* ------------------------------------------------------------------------ */

/** Retorna todos os usuários (sem expor o hash da senha). */
export function listarUsuarios() {
  return usuarios.map(paraUsuarioPublico);
}

/** Busca um usuário pelo e-mail (comparação sem diferenciar maiúsculas). */
export function buscarPorEmail(email) {
  const emailNormalizado = String(email).trim().toLowerCase();
  return usuarios.find((usuario) => usuario.email === emailNormalizado) ?? null;
}

/** Busca um usuário pelo id. */
export function buscarPorId(id) {
  return usuarios.find((usuario) => usuario.id === id) ?? null;
}

/**
 * Remove campos sensíveis antes de devolver o usuário para o cliente.
 * Nunca envie `senhaHash` em uma resposta HTTP!
 */
export function paraUsuarioPublico(usuario) {
  if (!usuario) return null;

  const { senhaHash, ...usuarioPublico } = usuario;
  return usuarioPublico;
}

/* ------------------------------------------------------------------------ */
/* Eventos                                                                  */
/* ------------------------------------------------------------------------ */

/** Retorna todos os eventos da SEMAC. */
export function listarEventos() {
  return eventos;
}

/** Busca um evento pelo id. */
export function buscarEventoPorId(id) {
  return eventos.find((evento) => evento.id === id) ?? null;
}
