import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount);
}

export function phoneToEmail(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `${cleanPhone}@pos.internal`;
}
