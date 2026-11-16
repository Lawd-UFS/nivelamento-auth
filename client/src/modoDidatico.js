/**
 * Preferência do "modo didático".
 *
 * Ligado (padrão): mostra o modal animado explicando cada etapa.
 * Desligado: navegação normal, sem animações.
 */
const CHAVE = 'semac.modoDidatico';

export function lerModoDidatico() {
  try {
    return localStorage.getItem(CHAVE) !== 'off';
  } catch {
    return true;
  }
}

export function salvarModoDidatico(ativo) {
  try {
    localStorage.setItem(CHAVE, ativo ? 'on' : 'off');
  } catch {
    // Sem localStorage, o modo simplesmente não é persistido.
  }
}
