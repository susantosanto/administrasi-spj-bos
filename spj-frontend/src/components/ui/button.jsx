/**
 * Button — primitif tombol pola 21st.dev/shadcn (versi JS, blue-only).
 * Varian memakai token proyek: primary #004ac6. Area cetak tidak memakai ini.
 */
import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100',
        danger: 'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-5 min-h-[44px]',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

const Button = forwardRef(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})

export { Button, buttonVariants }
export default Button
