/**
 * Rotas de autenticação.
 *
 * Nesta etapa do projeto existe apenas o login (emitir o JWT) e uma rota
 * para o cliente descobrir quem é o usuário dono do token.
 * As regras de autorização (RBAC/ABAC) entram nas próximas etapas.
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { passosLoginFalha, passosLoginSucesso } from "../didatico.js";
import { buscarPorEmail, paraUsuarioPublico } from "../store.js";
import { autenticar } from "../middleware/autenticar.js";

export const rotasAutenticacao = Router();

/**
 * Rate limit específico do login.
 *
 * Sem isso, um atacante poderia testar milhares de senhas por minuto
 * (ataque de força bruta). Aqui limitamos a 5 tentativas por minuto por IP.
 *
 * Essa medida de segurança é amplamente utilizada em sistemas reais e muitos frameworks de autenticação já a incluem por padrão.
 */
const limiteLogin = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    erro: "Muitas tentativas de login. Aguarde um minuto e tente novamente.",
  },
});

/**
 * POST /api/autenticacao/entrar
 *
 * Corpo esperado:
 *   { "email": "...", "senha": "..." }
 *
 * Resposta de sucesso:
 *   { "token": "...", "usuario": { ... } }
 */
rotasAutenticacao.post("/entrar", limiteLogin, async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({
      erro: "Informe e-mail e senha.",
    });
  }

  const usuario = buscarPorEmail(email);

  // Mensagem genérica de propósito: não revelamos se o e-mail existe.
  const credenciaisInvalidas = () =>
    res.status(401).json({
      erro: "E-mail ou senha inválidos.",
      passos: passosLoginFalha(),
    });

  if (!usuario) {
    return credenciaisInvalidas();
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaConfere) {
    return credenciaisInvalidas();
  }

  const token = jwt.sign(
    {
      sub: usuario.id,
      papel: usuario.papel,
      afiliacao: usuario.afiliacao,
    },
    config.chaveSecretaJwt,
    { expiresIn: config.validadeToken },
  );

  return res.json({
    token,
    usuario: paraUsuarioPublico(usuario),
    passos: passosLoginSucesso(usuario),
  });
});

/**
 * GET /api/autenticacao/eu
 *
 * Usada pelo frontend para restaurar a sessão a partir do token salvo.
 * Exige o cabeçalho `Authorization: Bearer <token>`.
 */
rotasAutenticacao.get("/eu", autenticar, (req, res) => {
  return res.json({ usuario: req.usuario });
});

// O logout é feito apenas no frontend, apagando o token do localStorage.
// Mas vimos na aula que, caso o token seja roubado, mesmo que o cliente faça o logout, o atacante ainda poderia usar o token.
// Como poderíamos resolver isso?

/**
 * [MÉTODO HTTP] /api/autenticacao/logout
 *
 * Crie uma rota de logout que invalide o token do usuário.
 * Lembre-se que o JWT é stateless, então você precisará de uma forma de armazenar os tokens inválidos.
 * Dica: blacklist.
 */

/**
rotasAutenticacao.?("/logout", autenticar, (req, res) => {
  return res.json({ mensagem: "Logout realizado com sucesso." });
});
*/
