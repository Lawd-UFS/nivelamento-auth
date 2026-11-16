/** Formata uma data completa, como "1 de novembro de 2026 às 09:00". */
export function formatarData(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

/** Formata data e hora de forma curta, como "23/11/2026, 19:00". */
export function formatarDataHora(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}
