// Cuenta bancaria única para transferencias de la rifa.
export type BankAccount = {
  bank: string;
  holder: string;
  clabe?: string;
  card?: string;
  account?: string;
  concept?: string;
};

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: "Mercado Pago W",
    holder: "Titular de ejemplo",
    clabe: "000000000000000000",
    concept: "Tu nombre completo",
  },
];

export const PAYMENT_CONTACT = {
  name: "Organizador de ejemplo",
  whatsapp: "0000000000000",
  display: "Configura tu teléfono",
};
