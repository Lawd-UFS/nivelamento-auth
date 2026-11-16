/**
 * Middleware de autenticação.
 *
 * Responsabilidade única: descobrir QUEM é o usuário que fez a requisição.
 * Ele NÃO decide o que o usuário pode fazer (isso é autorização).
 * Após a execução, o usuário autenticado estará disponível em `req.usuario` para a execução da rota.
 *
 * Fluxo:
 *   1. Lê o cabeçalho `Authorization: Bearer <token>`.
 *   2. Verifica a assinatura e a validade do JWT.
 *   3. Busca o usuário atual no "banco" (garante que ele ainda existe).
 *   4. Disponibiliza o usuário em `req.usuario`.
 */
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { passosTokenInvalido } from "../didatico.js";
import { buscarPorId, paraUsuarioPublico } from "../store.js";

export function autenticar(req, res, proximo) {
  // Tenta capturar o token do cabeçalho `Authorization: Bearer <token>`.
  const cabecalho = req.headers.authorization ?? "";

  // Se não houver token, devolve 401 (não autorizado).
  if (!cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Token de autenticação não informado.",
      passos: passosTokenInvalido(req, "Authorization: Bearer ausente"),
    });
  }

  // O token é a parte depois de "Bearer ".
  const token = cabecalho.slice("Bearer ".length).trim();

  try {
    const dados = jwt.verify(token, config.chaveSecretaJwt);
    const usuario = buscarPorId(dados.sub);

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário do token não existe mais.",
        passos: passosTokenInvalido(
          req,
          "token válido, mas usuário não existe",
        ),
      });
    }

    req.usuario = paraUsuarioPublico(usuario);
    return proximo();
  } catch {
    return res.status(401).json({
      erro: "Token inválido ou expirado.",
      passos: passosTokenInvalido(
        req,
        "jwt.verify falhou · token inválido ou expirado",
      ),
    });
  }
}
