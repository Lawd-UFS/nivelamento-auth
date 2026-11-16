/**
 * Configurações centrais do servidor.
 *
 * Em produção, o segredo do JWT DEVE vir de uma variável de ambiente.
 * Aqui deixamos um valor padrão apenas para facilitar o uso em sala de aula.
 */
export const config = {
  porta: Number(process.env.PORTA ?? 3000),
  chaveSecretaJwt:
    process.env.CHAVE_SECRETA_JWT ?? 'segredo-de-desenvolvimento-nao-use-em-producao',
  validadeToken: process.env.VALIDADE_TOKEN ?? '1h',
  ambiente: process.env.NODE_ENV ?? 'development',
};
