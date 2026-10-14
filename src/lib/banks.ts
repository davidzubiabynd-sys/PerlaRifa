// Cuenta bancaria única para transferencias de la rifa.
export type BankAccount = {
  bank: string;
  holder: string;
  clabe?: string;
  card?: string;
  account?: string;
  concept?: string;
};

// Agrega una cuenta solo cuando Perla confirme sus datos de pago.
export const BANK_ACCOUNTS: BankAccount[] = [];

export const PAYMENT_CONTACT = {
  name: "Perla Madrigal",
  whatsapp: "",
  display: "Contacto por confirmar",
};
