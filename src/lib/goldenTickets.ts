// Boletos de Oro: premios instantáneos con patrocinadores.
// El número se marca al usuario como "dorado" únicamente cuando ya fue apartado,
// para no revelar los premios antes de tiempo en el panel de inicio.

export type GoldenTicket = {
  number: number;
  prize: string;
  sponsor: string;
};

// Sin premios instantáneos confirmados para esta rifa.
export const GOLDEN_TICKETS: GoldenTicket[] = [];

const MAP = new Map<number, GoldenTicket>(GOLDEN_TICKETS.map((g) => [g.number, g]));

export function isGoldenTicket(n: number): boolean {
  return MAP.has(n);
}

export function getGoldenTicket(n: number): GoldenTicket | undefined {
  return MAP.get(n);
}
