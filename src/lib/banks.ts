// Cuenta bancaria única para transferencias de la rifa.
export type BankAccount = {
  bank: string;
  holder: string;
  clabe?: string;
  card?: string;
  account?: string;
  concept?: string;
};

export const BANK_ACCOUNTS: BankAccount[] = [{
  bank: "BANCOPPEL",
  holder: "Perla Madrigal",
  card: "4169 1606 2587 5035",
  concept: "Tu nombre completo",
}];

export const PAYMENT_CONTACT = {
  name: "Perla Madrigal",
  whatsapp: "5216622905054",
  display: "662 290 5054",
};
