// What the user owns. Quantity only: value = quantity x live price, never stored.
export type Position = { symbol: string; name: string; quantity: number; currency: "EUR" | "USD" };

export const positions: Position[] = [
  { symbol: "LHV1T", name: "LHV Group", quantity: 1200, currency: "EUR" },
  { symbol: "TAL1T", name: "Tallink Grupp", quantity: 3000, currency: "EUR" },
  { symbol: "TKM1T", name: "Tallinna Kaubamaja", quantity: 150, currency: "EUR" },
  { symbol: "EFT1T", name: "Enefit Green", quantity: 400, currency: "EUR" },
  { symbol: "CPA1T", name: "Coop Pank", quantity: 500, currency: "EUR" },
  { symbol: "AAPL", name: "Apple", quantity: 12, currency: "USD" },
  { symbol: "MSFT", name: "Microsoft", quantity: 8, currency: "USD" },
  { symbol: "NOVO", name: "Novo Nordisk", quantity: 30, currency: "EUR" },
  { symbol: "ASML", name: "ASML", quantity: 4, currency: "EUR" },
  { symbol: "NOKIA", name: "Nokia", quantity: 2500, currency: "EUR" },
];
