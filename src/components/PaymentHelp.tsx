import { PAYMENT_HELP_URL } from "@/lib/raffle";

export function PaymentHelp() {
  return (
    <div className="mt-4 rounded-xl border border-border bg-emerald/5 p-4 text-center">
      <p className="font-semibold text-emerald-deep">¿No puedes hacer la transferencia?</p>
      <p className="mt-1 text-sm text-muted-foreground">Mándame un mensaje por WhatsApp y te ayudo con tu pago.</p>
      <a href={PAYMENT_HELP_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-emerald px-5 py-3 text-sm font-bold text-white">💬 Enviar mensaje por WhatsApp</a>
    </div>
  );
}
