/**
 * Dialog — primitif modal pola 21st.dev/shadcn berbasis Radix (versi JS).
 * Dipakai untuk modal layar (konfirmasi, form). Tidak dipakai di area cetak.
 */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '../../lib/utils'

function Dialog({ ...props }) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close {...props} />
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-[1px]', className)}
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[201] grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl',
          'animate-dialog-in',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <div className={cn('text-base font-bold text-slate-900', className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <div className={cn('text-xs text-slate-500', className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
export default Dialog
