// Configuración de esta rifa. Los datos no confirmados permanecen pendientes.
export const RAFFLE = {
  beneficiary: "Perla Madrigal",
  totalTickets: 200,
  ticketPrice: 100 as number | null,
  drawDate: null as string | null,
  salesCloseDate: null as string | null,
  prize: "Tablet Acer Iconia Tab A11",
  prizeImage: "/tablet-acer-a11.png",
  whatsapp: "5216622905054",
  instagramUrl: "",
  publicUrl: "https://perlarifa12.vercel.app",
  announcement: "En cuanto se vendan los 200 boletos se anunciará al ganador.",
  purpose: "Gastos hospitalarios de Perla Madrigal",
};
export const PRICE_LABEL = RAFFLE.ticketPrice === null ? "Precio por confirmar" : `$${RAFFLE.ticketPrice} MXN`;
export function amountLabel(quantity: number) {
  return RAFFLE.ticketPrice === null ? "Importe por confirmar" : `$${quantity * RAFFLE.ticketPrice} MXN`;
}

export const WHATSAPP_URL = `https://wa.me/${RAFFLE.whatsapp}`;
export const PAYMENT_HELP_URL = `${WHATSAPP_URL}?text=${encodeURIComponent("Hola Perla, quiero participar en la rifa de la tablet Acer Iconia Tab A11, pero no puedo hacer la transferencia. ¿Me puedes ayudar?")}`;
