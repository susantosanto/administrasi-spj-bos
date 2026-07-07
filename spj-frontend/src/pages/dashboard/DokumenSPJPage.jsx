import { useState, useEffect } from "react";
import storageHelper from "../../utils/storageHelper";
import Topbar from "../../components/layout/Topbar";
import { useToast } from "../../components/ui/Toast";

// Dokumen yang sudah ada di halaman Dokumen Wajib (tidak ditampilkan di sini)
const DOKUMEN_WAJIB_IDS = ["D-PBJ", "D-RK", "D-BK", "D-KS", "D-PD", "D-PB"];

const DOKUMEN_TYPES = [
  // Honor & Narasumber
  {
    id: "HON",
    nama: "Honorarium",
    deskripsi: "SK + Daftar Penerima + Kwitansi",
    kategori: "Honor & Narasumber",
    gradient: "from-blue-500 to-indigo-600",
    icon: "payments",
    subItems: ["SK Kepala Sekolah", "Daftar Penerima Honor", "Kwitansi"],
    templateTitle: "SURAT KEPUTUSAN HONORARIUM",
  },
  {
    id: "HON-P",
    nama: "Honor Pelaksana",
    deskripsi: "SK + Daftar Penerima Kegiatan",
    kategori: "Honor & Narasumber",
    gradient: "from-blue-500 to-indigo-600",
    icon: "how_to_reg",
    subItems: ["SK Pelaksana", "Daftar Hadir", "Kwitansi"],
    templateTitle: "SURAT KEPUTUSAN HONOR PELAKSANA",
  },
  {
    id: "NSB",
    nama: "Narasumber",
    deskripsi: "Surat Undangan + Kwitansi",
    kategori: "Honor & Narasumber",
    gradient: "from-blue-500 to-indigo-600",
    icon: "record_voice_over",
    subItems: ["Surat Undangan", "Daftar Hadir Narsum", "Kwitansi Honor"],
    templateTitle: "SURAT TUGAS NARASUMBER",
  },

  // Perjalanan Dinas
  {
    id: "PD",
    nama: "Perjalanan Dinas",
    deskripsi: "SPPD + Surat Tugas + Resume",
    kategori: "Perjalanan Dinas",
    gradient: "from-emerald-500 to-teal-600",
    icon: "flight_takeoff",
    subItems: [
      "Surat Tugas",
      "SPPD",
      "Resume Perjalanan",
      "Kwitansi Transport",
    ],
    templateTitle: "SURAT PERINTAH PERJALANAN DINAS",
  },

  // Makan & Minum
  {
    id: "MR",
    nama: "Mamin Rapat",
    deskripsi: "Undangan + Daftar Hadir + Foto",
    kategori: "Makan & Minum",
    gradient: "from-orange-500 to-amber-600",
    icon: "restaurant",
    subItems: [
      "Surat Undangan",
      "Daftar Hadir",
      "Resume Rapat",
      "Foto Kegiatan",
    ],
    templateTitle: "DAFTAR HADIR RAPAT",
  },
  {
    id: "MK",
    nama: "Mamin Kegiatan",
    deskripsi: "Undangan/Surat Perintah + Daftar Hadir",
    kategori: "Makan & Minum",
    gradient: "from-orange-500 to-amber-600",
    icon: "lunch_dining",
    subItems: ["Surat Perintah/Undangan", "Daftar Hadir", "Resume", "Foto"],
    templateTitle: "DAFTAR HADIR KEGIATAN",
  },
  {
    id: "MT",
    nama: "Mamin Tamu",
    deskripsi: "Undangan + Daftar Hadir + Foto",
    kategori: "Makan & Minum",
    gradient: "from-orange-500 to-amber-600",
    icon: "local_cafe",
    subItems: ["Surat Undangan", "Daftar Hadir", "Foto"],
    templateTitle: "DAFTAR HADIR TAMU",
  },

  // Dokumen Pendukung
  {
    id: "PG",
    nama: "Penggandaan",
    deskripsi: "Master + Jumlah Lembar",
    kategori: "Penggandaan dan Cetak",
    gradient: "from-purple-500 to-violet-600",
    icon: "content_copy",
    subItems: ["Daftar Master", "Jumlah Lembar", "Bukti Pembayaran"],
    templateTitle: "DAFTAR PENGGANDAAN",
  },
  {
    id: "CF",
    nama: "Cetak Foto",
    deskripsi: "Bukti Dok Foto",
    kategori: "Penggandaan dan Cetak",
    gradient: "from-purple-500 to-violet-600",
    icon: "photo_camera",
    subItems: ["Daftar Foto", "Bukti Cetak"],
    templateTitle: "BUKTI CETAK FOTO",
  },
  {
    id: "CB",
    nama: "Cetak Banner",
    deskripsi: "Bukti Foto Banner/Spanduk",
    kategori: "Penggandaan dan Cetak",
    gradient: "from-purple-500 to-violet-600",
    icon: "panorama",
    subItems: ["Desain Banner", "Bukti Pemasangan"],
    templateTitle: "BUKTI CETAK BANNER",
  },

  // Sewa & Pemeliharaan
  {
    id: "SW",
    nama: "Sewa Mobilitas",
    deskripsi: "Sewa Mobilitas/Sound/Kendaraan",
    kategori: "Sewa & Pemeliharaan",
    gradient: "from-rose-500 to-pink-600",
    icon: "car_rental",
    subItems: ["Surat Perjanjian Sewa", "Bukti Pembayaran", "SIM/STNK"],
    templateTitle: "SURAT PERJANJIAN SEWA",
  },
  {
    id: "PL",
    nama: "Pemeliharaan",
    deskripsi: "Servis Fasilitas/Peralatan/Bangunan",
    kategori: "Sewa & Pemeliharaan",
    gradient: "from-rose-500 to-pink-600",
    icon: "handyman",
    subItems: ["Surat Perintah Kerja", "Daftar Pekerjaan", "Bukti Pembayaran"],
    templateTitle: "SURAT PERINTAH KERJA",
  },
  {
    id: "TG",
    nama: "Tagihan",
    deskripsi: "Tagihan Listrik/Air",
    kategori: "Sewa & Pemeliharaan",
    gradient: "from-rose-500 to-pink-600",
    icon: "bolt",
    subItems: ["Invoice Tagihan", "Bukti Pembayaran", "Resume Pemakaian"],
    templateTitle: "BUKTI PEMBAYARAN TAGIHAN",
  },

  // Workshop
  {
    id: "WS-I",
    nama: "Workshop Internal",
    deskripsi: "Undangan + Daftar Hadir + Proposal",
    kategori: "Workshop",
    gradient: "from-cyan-500 to-sky-600",
    icon: "groups_3",
    subItems: [
      "Undangan",
      "Daftar Hadir",
      "Proposal",
      "Resume",
      "Foto",
      "Honor Narsum",
    ],
    templateTitle: "LAPORAN WORKSHOP INTERNAL",
  },
  {
    id: "WS-E",
    nama: "Workshop Eksternal",
    deskripsi: "Undangan + Daftar Hadir + Surat Tugas",
    kategori: "Workshop",
    gradient: "from-cyan-500 to-sky-600",
    icon: "school",
    subItems: [
      "Undangan",
      "Daftar Hadir",
      "Surat Tugas Pemberangkatan",
      "Resume",
      "Foto",
    ],
    templateTitle: "LAPORAN WORKSHOP EKSTERNAL",
  },

  // Pengadaan & Rekening Koran
  {
    id: "PR",
    nama: "PR Pengadaan",
    deskripsi: "Proposal + Program Kerja + Surat",
    kategori: "Pengadaan & Rekening Koran",
    gradient: "from-gray-600 to-slate-700",
    icon: "shopping_cart",
    subItems: [
      "Proposal Pengadaan",
      "Program Kerja",
      "Surat Permohonan",
      "Negosiasi",
    ],
    templateTitle: "PROPOSAL PENGADAAN",
  },
  {
    id: "RK",
    nama: "Rekening Koran",
    deskripsi: "Surat Permohonan + Pengantar + Kuasa",
    kategori: "Pengadaan & Rekening Koran",
    gradient: "from-gray-600 to-slate-700",
    icon: "account_balance",
    subItems: [
      "Surat Permohonan Cetak",
      "Surat Pengantar",
      "Surat Kuasa Cetak",
    ],
    templateTitle: "SURAT PERMOHONAN CETAK REKENING KORAN",
  },
  {
    id: "DH",
    nama: "Daftar Hadir",
    deskripsi: "Form daftar hadir kegiatan",
    kategori: "Pengadaan & Rekening Koran",
    gradient: "from-gray-600 to-slate-700",
    icon: "group_add",
    subItems: ["Nama", "Jabatan", "Tanda Tangan", "Keterangan"],
    templateTitle: "DAFTAR HADIR",
    isFormTemplate: true,
    formFields: [
      {
        name: "kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        placeholder: "Contoh: Rapat Komite Sekolah",
      },
      { name: "tanggal", label: "Tanggal", type: "date" },
      {
        name: "tempat",
        label: "Tempat",
        type: "text",
        placeholder: "Ruang Guru / Aula",
      },
      {
        name: "waktu",
        label: "Waktu",
        type: "text",
        placeholder: "08:00 - 12:00 WIB",
      },
    ],
  },
  {
    id: "SU",
    nama: "Surat Undangan",
    deskripsi: "Template surat undangan resmi",
    kategori: "Pengadaan & Rekening Koran",
    gradient: "from-gray-600 to-slate-700",
    icon: "mail",
    subItems: ["Perihal", "Yang Diundang", "Hari/Tanggal", "Tempat", "Acara"],
    templateTitle: "SURAT UNDANGAN",
    isFormTemplate: true,
    formFields: [
      {
        name: "nomor",
        label: "Nomor Surat",
        type: "text",
        placeholder: "001/UND/III/2025",
      },
      {
        name: "kepada",
        label: "Kepada Yth.",
        type: "text",
        placeholder: "Nama / Jabatan",
      },
      {
        name: "perihal",
        label: "Perihal",
        type: "text",
        placeholder: "Undangan Rapat Komite",
      },
      {
        name: "tanggal",
        label: "Hari/Tanggal",
        type: "text",
        placeholder: "Senin, 20 Januari 2025",
      },
      {
        name: "waktu",
        label: "Waktu",
        type: "text",
        placeholder: "08:00 WIB - Selesai",
      },
      {
        name: "tempat",
        label: "Tempat",
        type: "text",
        placeholder: "Ruang Rapat Utama",
      },
    ],
  },

  // Dokumen Pelengkap (sebelumnya Realisasi BOSP)
  {
    id: "R-CVR",
    nama: "Cover",
    deskripsi: "Cover laporan SPJ BOS/BOSP",
    kategori: "Dokumen Pelengkap",
    gradient: "from-orange-500 to-red-600",
    icon: "folder",
    subItems: ["Nama Sekolah", "Tahun Anggaran", "Dana BOSP"],
    templateTitle: "COVER LAPORAN SPJ",
  },
  {
    id: "R-SKT",
    nama: "Sekat Cover",
    deskripsi: "Sekat pembatas cover laporan",
    kategori: "Dokumen Pelengkap",
    gradient: "from-orange-500 to-red-600",
    icon: "view_agenda",
    subItems: ["Informasi Sekolah", "Periode Laporan"],
    templateTitle: "SEKAT COVER LAPORAN",
  },
  {
    id: "R-ALR",
    nama: "Realisasi Penggunaan Dana",
    deskripsi: "Tabel realisasi anggaran vs penggunaan",
    kategori: "Dokumen Pelengkap",
    gradient: "from-orange-500 to-red-600",
    icon: "table_chart",
    subItems: ["Kode Rekening", "Anggaran", "Realisasi", "Selisih"],
    templateTitle: "REALISASI PENGGUNAAN DANA",
  },
  {
    id: "R-ILB",
    nama: "Instrumen Laporan BOS",
    deskripsi: "Form instrumen pelaporan BOS",
    kategori: "Dokumen Pelengkap",
    gradient: "from-orange-500 to-red-600",
    icon: "assignment",
    subItems: ["Instrumen 1-10", "Checklist Kelengkapan", "Verifikasi"],
    templateTitle: "INSTRUMEN LAPORAN BOS",
  },
].filter((d) => !DOKUMEN_WAJIB_IDS.includes(d.id));

const KATEGORI_FILTER = [
  { id: "semua", label: "Semua" },
  { id: "BKU Utama", label: "BKU Utama" },
  { id: "Dokumen Pelengkap", label: "Dokumen Pelengkap" },
];

export default function DokumenSPJPage() {
  const [items, setItems] = useState({});
  const [filter, setFilter] = useState("semua");
  const [selectedDokumen, setSelectedDokumen] = useState(null);
  const [formData, setFormData] = useState({});
  const toast = useToast();

  useEffect(() => {
    const stored = storageHelper.get("dokumen_spj", {});
    setItems(stored);
  }, []);

  const getStatus = (id) => items[id]?.status || "Belum";
  const getStatusStyle = (status) => {
    switch (status) {
      case "Lengkap":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const toggleStatus = (id) => {
    const current = getStatus(id);
    const next =
      current === "Belum" ? "Draft" : current === "Draft" ? "Lengkap" : "Belum";
    const updated = { ...items, [id]: { ...(items[id] || {}), status: next } };
    setItems(updated);
    storageHelper.set("dokumen_spj", updated);
    toast.success(`Status diubah ke ${next}`);
  };

  const handleOpenDokumen = (dokumen) => {
    setSelectedDokumen(dokumen);
    setFormData({});
  };

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveForm = () => {
    toast.success(
      `Form "${selectedDokumen.nama}" berhasil disimpan (simulasi)`,
    );
    setSelectedDokumen(null);
    setFormData({});
  };

  const filteredDokumen =
    filter === "semua"
      ? DOKUMEN_TYPES
      : filter === "BKU Utama"
        ? DOKUMEN_TYPES.filter(
            (d) => !["Dokumen Pelengkap"].includes(d.kategori),
          )
        : DOKUMEN_TYPES.filter((d) => d.kategori === filter);

  const grouped = {};
  filteredDokumen.forEach((d) => {
    if (!grouped[d.kategori]) grouped[d.kategori] = [];
    grouped[d.kategori].push(d);
  });

  const totalLengkap = DOKUMEN_TYPES.filter(
    (d) => getStatus(d.id) === "Lengkap",
  ).length;
  const totalDraft = DOKUMEN_TYPES.filter(
    (d) => getStatus(d.id) === "Draft",
  ).length;
  const totalBelum = DOKUMEN_TYPES.filter(
    (d) => !items[d.id]?.status || items[d.id]?.status === "Belum",
  ).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dokumen SPJ"
        subtitle="Susun dan cetak dokumen pertanggungjawaban"
      />

      <div className="p-lg space-y-lg flex-1">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary">
                description
              </span>
              <span className="font-label-md text-text-high">
                Total Dokumen
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">
              {DOKUMEN_TYPES.length}
            </h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
              <span className="font-label-md text-text-high">Lengkap</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-green-600">
              {totalLengkap}
            </h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-yellow-600">
                edit_note
              </span>
              <span className="font-label-md text-text-high">Draft</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-yellow-600">
              {totalDraft}
            </h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-red-600">
                radio_button_unchecked
              </span>
              <span className="font-label-md text-text-high">Belum</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-red-600">
              {totalBelum}
            </h3>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-sm">
          {KATEGORI_FILTER.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-lg py-2 rounded-lg font-label-md transition-all active:scale-95 ${
                filter === f.id
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Document Cards Grid */}
        {Object.entries(grouped).map(([kategori, docs]) => (
          <div key={kategori} className="space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {kategori}
              <span className="text-text-low text-sm font-normal">
                ({docs.length} dokumen)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
              {docs.map((d) => {
                const status = getStatus(d.id);
                return (
                  <div
                    key={d.id}
                    className="bg-surface-container-lowest rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => handleOpenDokumen(d)}
                  >
                    <div
                      className={`h-20 bg-gradient-to-r ${d.gradient} flex items-center justify-between p-md`}
                    >
                      <span className="material-symbols-outlined text-white text-3xl">
                        {d.icon}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(d.id);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(status)} bg-white/90 backdrop-blur-sm hover:scale-105 transition-transform`}
                      >
                        {status}
                      </button>
                    </div>
                    <div className="p-md">
                      <h4 className="font-label-md text-text-high font-semibold">
                        {d.nama}
                      </h4>
                      <p className="text-text-low text-xs mt-1 line-clamp-2">
                        {d.deskripsi}
                      </p>
                      <div className="flex items-center gap-sm mt-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Cetak ${d.nama}`);
                          }}
                          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-lg">
                            print
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Download ${d.nama}`);
                          }}
                          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-lg">
                            download
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Batch Actions */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-md">
            Aksi Massal
          </h3>
          <div className="flex flex-wrap gap-md">
            <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">print</span>
              Cetak Semua Dokumen Lengkap
            </button>
            <button className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-3 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Export Semua ke PDF
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal - Template Preview + Form */}
      {selectedDokumen && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg"
          onClick={() => setSelectedDokumen(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`h-20 bg-gradient-to-r ${selectedDokumen.gradient} flex items-center justify-between p-lg shrink-0`}
            >
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-white text-4xl">
                  {selectedDokumen.icon}
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-white">
                    {selectedDokumen.nama}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedDokumen.kategori}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDokumen(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content - Split View */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
                {/* Left: Template Preview */}
                <div className="p-lg space-y-md">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      visibility
                    </span>
                    Preview Template
                  </h3>
                  {/* Prototype Warning */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-md flex items-start gap-sm">
                    <span className="material-symbols-outlined text-amber-600 text-lg">
                      construction
                    </span>
                    <div>
                      <p className="font-label-md text-amber-800">
                        Prototype / Blueprint
                      </p>
                      <p className="text-amber-700 text-xs">
                        Format template dokumen ini masih dalam tahap
                        pengembangan dan belum bisa ditampilkan secara lengkap.
                      </p>
                    </div>
                  </div>
                  {/* Template Placeholder */}
                  <div className="bg-white border-2 border-dashed border-outline-variant rounded-xl p-xl text-center min-h-[300px] flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-6xl mb-4">
                      {selectedDokumen.icon}
                    </span>
                    <p className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">
                      {selectedDokumen.templateTitle || selectedDokumen.nama}
                    </p>
                    <p className="text-text-low text-sm">
                      Format dokumen akan ditampilkan di sini
                    </p>
                    <div className="mt-4 p-md bg-surface-container-low rounded-lg w-full max-w-xs">
                      <p className="text-text-low text-xs italic">
                        Dokumen ini memerlukan:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {selectedDokumen.subItems?.map((item, i) => (
                          <li
                            key={i}
                            className="text-text-high text-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>{" "}
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right: Form Input */}
                <div className="p-lg space-y-md bg-surface-container-low/30">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      edit
                    </span>
                    Input Form Manual
                  </h3>
                  <p className="text-text-low text-sm">
                    Isi data yang diperlukan untuk dokumen ini. Form ini
                    bersifat optional.
                  </p>

                  {selectedDokumen.isFormTemplate &&
                  selectedDokumen.formFields ? (
                    <div className="space-y-md">
                      {selectedDokumen.formFields.map((field, i) => (
                        <div key={i} className="space-y-xs">
                          <label className="font-label-md text-text-high">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder={field.placeholder || ""}
                            value={formData[field.name] || ""}
                            onChange={(e) =>
                              handleFormChange(field.name, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-md">
                      <div className="space-y-xs">
                        <label className="font-label-md text-text-high">
                          Keterangan Tambahan
                        </label>
                        <textarea
                          className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          rows={3}
                          placeholder="Catatan atau keterangan tambahan..."
                          value={formData.keterangan || ""}
                          onChange={(e) =>
                            handleFormChange("keterangan", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-xs">
                        <label className="font-label-md text-text-high">
                          Catatan
                        </label>
                        <textarea
                          className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          rows={2}
                          placeholder="Catatan internal..."
                          value={formData.catatan || ""}
                          onChange={(e) =>
                            handleFormChange("catatan", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-sm pt-md border-t border-outline-variant">
                    <button
                      onClick={handleSaveForm}
                      className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md"
                    >
                      <span className="material-symbols-outlined">save</span>
                      Simpan Draft
                    </button>
                    <button
                      onClick={() => {
                        toggleStatus(selectedDokumen.id);
                        toast.success("Status diubah");
                        setSelectedDokumen(null);
                      }}
                      className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-2 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md"
                    >
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      Tandai Lengkap
                    </button>
                    <button
                      onClick={() => {
                        toast.info(`Cetak ${selectedDokumen.nama}`);
                      }}
                      className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-2 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md"
                    >
                      <span className="material-symbols-outlined">print</span>
                      Cetak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
