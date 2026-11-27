import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** cn — classnames merge (pola shadcn/21st.dev, versi JS). */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
