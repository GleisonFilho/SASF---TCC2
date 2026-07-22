export function calcAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export const WEEKDAY_NAMES_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const MONTH_NAMES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/**
 * Nome do dia/mês por extenso montado manualmente em vez de via
 * toLocaleDateString: em alguns Android com Hermes sem dados completos de
 * ICU, o nome retornado pelo Intl pode vir errado mesmo com a data correta.
 * getDay()/getDate()/getMonth() são sempre hora local do aparelho, confiáveis.
 */
export function formatFullDatePt(date: Date, options: { weekday?: boolean; year?: boolean } = {}): string {
  const parts: string[] = [];
  if (options.weekday) parts.push(`${WEEKDAY_NAMES_PT[date.getDay()]}, `);
  parts.push(`${date.getDate()} de ${MONTH_NAMES_PT[date.getMonth()]}`);
  if (options.year) parts.push(` de ${date.getFullYear()}`);
  return parts.join('');
}
