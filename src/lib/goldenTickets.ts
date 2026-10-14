// Boletos de Oro: premios instantáneos con patrocinadores.
// El número se marca al usuario como "dorado" únicamente cuando ya fue apartado,
// para no revelar los premios antes de tiempo en el panel de inicio.

export type GoldenTicket = {
  number: number;
  prize: string;
  sponsor: string;
};

export const GOLDEN_TICKETS: GoldenTicket[] = [
  { number: 92, prize: "Pizza Grande Pepperoni", sponsor: "Patrocinador A" },
  { number: 260, prize: "Pizza Grande Pepperoni", sponsor: "Patrocinador A" },
  { number: 468, prize: "Burro Percherón Mediano", sponsor: "Patrocinador B" },
  { number: 571, prize: "Burro Percherón Mediano", sponsor: "Patrocinador B" },
  { number: 998, prize: "Burro Percherón Mediano", sponsor: "Patrocinador B" },
  { number: 820, prize: "Cena para 2 · 2 Burros Medianos", sponsor: "Patrocinador B" },
  { number: 774, prize: "Bebidas gratis", sponsor: "Patrocinador D" },
  { number: 958, prize: "Charola de 12 mini pancakes", sponsor: "Patrocinador E" },
  { number: 632, prize: "Charola de 12 mini pancakes", sponsor: "Patrocinador E" },
  { number: 315, prize: "Ensalada chica", sponsor: "Patrocinador F" },
  { number: 550, prize: "Entrada + 1 platillo", sponsor: "Patrocinador G" },
  { number: 123, prize: "Entrada + 1 platillo", sponsor: "Patrocinador G" },
];

const MAP = new Map<number, GoldenTicket>(GOLDEN_TICKETS.map((g) => [g.number, g]));

export function isGoldenTicket(n: number): boolean {
  return MAP.has(n);
}

export function getGoldenTicket(n: number): GoldenTicket | undefined {
  return MAP.get(n);
}
