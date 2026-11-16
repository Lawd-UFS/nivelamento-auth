import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const diretorioAtual = path.dirname(fileURLToPath(import.meta.url));
const caminhoDestino = path.join(diretorioAtual, '..', 'data', 'usuarios.json');

const usuariosIniciais = [
  {
    id: 'usr-001',
    nome: 'Felipe Quentino',
    email: 'felipe@lawd.ufs.br',
    senha: 'felipe123',
    papel: 'palestrante',
    afiliacao: 'LAWD',
    anosNaLawd: 4,
    criadoEm: '2026-11-01T12:05:00.000Z',
  },
  {
    id: 'usr-002',
    nome: 'Gyannine Candeias',
    email: 'gyannine@lawd.ufs.br',
    senha: 'gyannine123',
    papel: 'palestrante',
    afiliacao: 'LAWD',
    anosNaLawd: 2,
    criadoEm: '2026-11-01T12:08:00.000Z',
  },
  {
    id: 'usr-003',
    nome: 'Enzo Maia',
    email: 'enzo@lawd.ufs.br',
    senha: 'enzo123',
    papel: 'palestrante',
    afiliacao: 'LAWD',
    anosNaLawd: 2,
    criadoEm: '2026-11-01T12:10:00.000Z',
  },
  {
    id: 'usr-004',
    nome: 'Lauane Morais',
    email: 'lauane@lawd.ufs.br',
    senha: 'lauane123',
    papel: 'monitor',
    afiliacao: 'LAWD',
    anosNaLawd: 2,
    criadoEm: '2026-11-01T12:12:00.000Z',
  },
  {
    id: 'usr-005',
    nome: 'Pedro Paulo',
    email: 'pedro@lawd.ufs.br',
    senha: 'pedro123',
    papel: 'monitor',
    afiliacao: 'LAWD',
    anosNaLawd: 2,
    criadoEm: '2026-11-01T12:14:00.000Z',
  },
  {
    id: 'usr-006',
    nome: 'Bruno Saint Clair',
    email: 'bruno@lawd.ufs.br',
    senha: 'bruno123',
    papel: 'monitor',
    afiliacao: 'LAWD',
    anosNaLawd: 2,
    criadoEm: '2026-11-01T12:16:00.000Z',
  },
  {
    id: 'usr-007',
    nome: 'Diego Participante',
    email: 'participante@gmail.com',
    senha: 'participante123',
    papel: 'participante',
    afiliacao: 'externo',
    anosNaLawd: 0,
    criadoEm: '2026-11-02T09:00:00.000Z',
  },
];

const usuarios = usuariosIniciais.map(({ senha, ...usuario }) => ({
  ...usuario,
  senhaHash: bcrypt.hashSync(senha, 10),
}));

fs.mkdirSync(path.dirname(caminhoDestino), { recursive: true });
fs.writeFileSync(caminhoDestino, `${JSON.stringify(usuarios, null, 2)}\n`, 'utf8');

console.log(`Arquivo gerado: ${caminhoDestino}`);
console.log(`Usuários criados: ${usuarios.length}`);
console.log('Senhas de teste: felipe123, gyannine123, enzo123, lauane123, pedro123, bruno123, participante123');