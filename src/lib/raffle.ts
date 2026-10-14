// Configuración de esta rifa. Los datos no confirmados permanecen pendientes.
export const RAFFLE = {
  beneficiary: "Perla Madrigal",
  totalTickets: 200,
  ticketPrice: null as number | null,
  drawDate: null as string | null,
  salesCloseDate: null as string | null,
  prize: "Tablet Acer A11",
  prizeImage: "/tablet-acer-a11.png",
  whatsapp: "",
  instagramUrl: "",
  publicUrl: "",
};
export const PRICE_LABEL = RAFFLE.ticketPrice === null ? "Precio por confirmar" : `$${RAFFLE.ticketPrice} MXN`;
export function amountLabel(quantity: number) {
  return RAFFLE.ticketPrice === null ? "Importe por confirmar" : `$${quantity * RAFFLE.ticketPrice} MXN`;
}
