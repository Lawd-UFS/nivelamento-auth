/**
 * Permissões usadas no frontend.
 *
 * Atenção didática: estas funções servem apenas para melhorar a experiência
 * (esconder/redirecionar). A decisão real de autorização é SEMPRE feita no
 * backend, que não confia em nada vindo do navegador.
 */

/** Mesma regra do servidor: palestrante com mais de 3 anos de LAWD. */
export function podeGerenciarEventos(usuario) {
  return usuario?.papel === "palestrante" && usuario?.anosNaLawd >= 3;
}
