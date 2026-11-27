/**
 * KonfirmHapusModal — modal konfirmasi hapus baris invoice ala aplikasi
 * (pengganti dialog bawaan browser). Dipakai tabel sidebar + halaman.
 *
 * Props: target {judul, pesan} | null, onBatal, onYa.
 * Versi 21st.dev/shadcn: Radix Dialog + Button primitives.
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'

export default function KonfirmHapusModal({ target, onBatal, onYa }) {
  return (
    <Dialog open={!!target} onOpenChange={(buka) => { if (!buka && onBatal) onBatal() }}>
      {target && (
        <DialogContent aria-label={target.judul || 'Konfirmasi hapus'}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 shrink-0">
                <span className="material-symbols-outlined text-xl">delete</span>
              </span>
              <DialogTitle>{target.judul || 'Hapus baris invoice?'}</DialogTitle>
            </div>
            {target.pesan && <DialogDescription>{target.pesan}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="min-h-[44px]" onClick={onBatal}>
              Batal
            </Button>
            <Button type="button" size="sm" className="min-h-[44px]" onClick={onYa}>
              Ya, hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
