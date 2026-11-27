/**
 * Input — primitif input + search pola 21st.dev/shadcn (versi JS).
 * Konsisten dengan gaya form Data Sekolah (bg-slate-50, ring primary).
 */
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

const SearchInput = forwardRef(function SearchInput({ className, ...props }, ref) {
  return (
    <div className={cn('relative', className)}>
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
        search
      </span>
      <Input ref={ref} type="search" className="pl-11 pr-4" {...props} />
    </div>
  )
})

export { Input, SearchInput }
export default Input
