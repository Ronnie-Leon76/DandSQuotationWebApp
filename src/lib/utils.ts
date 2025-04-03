import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


 export const formatAmount = (amount: number) => {
  return `Ksh ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
