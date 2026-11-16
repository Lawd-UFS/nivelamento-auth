/**
 * Ponto de entrada do servidor Express.
 *
 * Em desenvolvimento, o Vite roda separado (porta 5173) e faz proxy de
 * `/api` para cá. Em produção, o Express também serve o build do React.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config } from './config.js';
import { rotasAutenticacao } from './routes/autenticacao.js';
import { rotasEventos } from './routes/eventos.js';

const diretorioAtual = path.dirname(fileURLToPath(import.meta.url));
const diretorioBuild = path.resolve(diretorioAtual, '..', 'client', 'dist');

const app = express();

app.use(express.json());

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
app.use('/api/autenticacao', rotasAutenticacao);
app.use('/api/eventos', rotasEventos);

// Qualquer rota /api desconhecida responde JSON (e não o HTML do React).
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota de API não encontrada.' });
});

// ---------------------------------------------------------------------------
// Frontend (somente em produção, após `npm run build`)
// ---------------------------------------------------------------------------
if (fs.existsSync(diretorioBuild)) {
  app.use(express.static(diretorioBuild));

  // Fallback do SPA: qualquer rota não-API devolve o index.html.
  app.get('*', (req, res) => {
    res.sendFile(path.join(diretorioBuild, 'index.html'));
  });
}

// ---------------------------------------------------------------------------
// Tratamento de erros não capturados
// ---------------------------------------------------------------------------
app.use((erro, req, res, proximo) => {
  console.error('[erro não tratado]', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(config.porta, () => {
  console.log(`Servidor SEMAC ouvindo em http://localhost:${config.porta}`);
  console.log(`Ambiente: ${config.ambiente}`);
});
