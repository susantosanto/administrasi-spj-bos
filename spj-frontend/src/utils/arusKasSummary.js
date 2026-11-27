const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** Build side-by-side semester totals from the BKU monthly summary source. */
export function ringkasanSemester(monthlySummaries = []) {
  const byMonth = new Map((Array.isArray(monthlySummaries) ? monthlySummaries : [])
    .map((item) => [Number(item.bulan), item]))
  return [
    { id: 'S1', label: 'Semester 1', months: [1, 2, 3, 4, 5, 6] },
    { id: 'S2', label: 'Semester 2', months: [7, 8, 9, 10, 11, 12] },
  ].map((semester) => ({
    ...semester,
    pengeluaran: semester.months.reduce((total, month) => total + (Number(byMonth.get(month)?.totalPengeluaran) || 0), 0),
    penerimaan: semester.months.reduce((total, month) => total + (Number(byMonth.get(month)?.totalPenerimaan) || 0), 0),
    rincianBulanan: semester.months.map((month) => ({
      bulan: month,
      namaBulan: BULAN[month - 1],
      pengeluaran: Number(byMonth.get(month)?.totalPengeluaran) || 0,
      penerimaan: Number(byMonth.get(month)?.totalPenerimaan) || 0,
    })),
  }))
}
