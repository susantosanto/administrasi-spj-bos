import { useState, useEffect, useRef } from "react";
import {
  Building2,
  UserCircle2,
  Image as ImageIcon,
  Users,
  Upload,
  Save,
} from "lucide-react";
import storageHelper from "../../utils/storageHelper";
import { parseSekolahExcel } from "../../utils/sekolahParser";
import { useToast } from "../../components/ui/Toast";
import PersonelFotoTab from "../../components/dokumentasi/PersonelFotoTab";
import PageContainer from "../../ui/organisms/PageContainer";
import PageHeader from "../../ui/organisms/PageHeader";
import { Tabs, TabList, Tab, TabPanel } from "../../ui/molecules/Tabs";
import Card from "../../ui/molecules/Card";
import FormField from "../../ui/molecules/FormField";
import Input from "../../ui/atoms/Input";
import Button from "../../ui/atoms/Button";
import Badge from "../../ui/atoms/Badge";

const defaultData = {
  npsn: "",
  namaSekolah: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  alamat: "",
  email: "",
  tahunAnggaran: "",
  allFields: [],
  pejabat: {
    ks: { nama: "", nip: "" },
    bendahara: { nama: "", nip: "" },
    pengawas: { nama: "", nip: "" },
    sekdik: { nama: "", nip: "" },
  },
};

const PEJABAT_ROLES = [
  { key: "ks", label: "Kepala Sekolah", color: "primary" },
  { key: "bendahara", label: "Bendahara", color: "success" },
  { key: "pengawas", label: "Pengawas Bina", color: "warning" },
  { key: "sekdik", label: "Sekretaris Dinas", color: "info" },
];

export default function DataSekolahPage() {
  const [tab, setTab] = useState("sekolah");
  const [data, setData] = useState(defaultData);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pejabatChanges, setPejabatChanges] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoDinasPreview, setLogoDinasPreview] = useState(null);
  const [logoGugusPreview, setLogoGugusPreview] = useState(null);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const logoDinasInputRef = useRef(null);
  const logoGugusInputRef = useRef(null);

  useEffect(() => {
    const stored = storageHelper.get("data_sekolah", null);
    if (stored) setData(stored);
    const savedLogo = storageHelper.get("logo_sekolah", null);
    if (savedLogo) setLogoPreview(savedLogo);
    const savedLogoDinas = storageHelper.get("logo_dinas", null);
    if (savedLogoDinas) setLogoDinasPreview(savedLogoDinas);
    const savedLogoGugus = storageHelper.get("logo_gugus", null);
    if (savedLogoGugus) setLogoGugusPreview(savedLogoGugus);
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error("Format file tidak didukung. Gunakan PNG, JPG, atau SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setLogoPreview(base64);
      storageHelper.set("logo_sekolah", base64);
      toast.success("Logo sekolah berhasil disimpan");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    storageHelper.remove("logo_sekolah");
    toast.success("Logo sekolah berhasil dihapus");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleLogoDinasUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error("Format file tidak didukung. Gunakan PNG, JPG, atau SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setLogoDinasPreview(base64);
      storageHelper.set("logo_dinas", base64);
      toast.success("Logo dinas berhasil disimpan");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogoDinas = () => {
    setLogoDinasPreview(null);
    storageHelper.remove("logo_dinas");
    toast.success("Logo dinas berhasil dihapus");
    if (logoDinasInputRef.current) logoDinasInputRef.current.value = "";
  };

  const handleLogoGugusUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error("Format file tidak didukung. Gunakan PNG, JPG, atau SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setLogoGugusPreview(base64);
      storageHelper.set("logo_gugus", base64);
      toast.success("Logo gugus berhasil disimpan");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogoGugus = () => {
    setLogoGugusPreview(null);
    storageHelper.remove("logo_gugus");
    toast.success("Logo gugus berhasil dihapus");
    if (logoGugusInputRef.current) logoGugusInputRef.current.value = "";
  };

  const updatePejabat = (jabatan, field, value) => {
    setData((prev) => ({
      ...prev,
      pejabat: { ...prev.pejabat, [jabatan]: { ...prev.pejabat[jabatan], [field]: value } },
    }));
    setPejabatChanges(true);
  };

  const handleSavePejabat = () => {
    storageHelper.set("data_sekolah", { ...data });
    setPejabatChanges(false);
    toast.success("Data pejabat berhasil disimpan");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("File harus berformat Excel (.xlsx atau .xls)");
      return;
    }
    setIsUploading(true);
    try {
      const result = await parseSekolahExcel(file);
      const header = result.header;
      const newData = {
        ...data,
        npsn: header.npsn || data.npsn,
        namaSekolah: header.nama_sekolah || data.namaSekolah,
        alamat: header.alamat || data.alamat,
        kabupaten: header.kabupaten || data.kabupaten,
        provinsi: header.provinsi || data.provinsi,
        kecamatan: header.kecamatan || data.kecamatan,
        tahunAnggaran: header.tahunAnggaran || data.tahunAnggaran,
        allFields: result.allFields || [],
      };
      const stored = storageHelper.get("data_sekolah", null);
      storageHelper.set("data_sekolah", {
        ...(stored || data),
        ...newData,
        allFields: result.allFields || stored?.allFields || [],
        pejabat: stored?.pejabat || data.pejabat,
      });
      setData(newData);
      setShowUpload(false);
      toast.success(
        `Data sekolah berhasil diupload: ${header.nama_sekolah || header.npsn || "-"}`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Gagal memproses file: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const grouped = { identitas: [], pelengkap: [], kontak: [], periodik: [], sanitasi: [] };
  let currentGroup = "identitas";
  const allFields = data.allFields || [];

  allFields.forEach((f) => {
    const sec = (f.section || "").toLowerCase();
    if (sec.includes("pelengkap")) currentGroup = "pelengkap";
    else if (sec.includes("kontak")) currentGroup = "kontak";
    else if (sec.includes("periodik")) currentGroup = "periodik";
    else if (sec.includes("sanitasi")) currentGroup = "sanitasi";
    if (grouped[currentGroup]) grouped[currentGroup].push(f);
  });

  const hasSchoolData = data.npsn || data.namaSekolah || allFields.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Data Sekolah"
        description="Profil sekolah dan pejabat"
        actions={
          tab === "sekolah" ? (
            <Button
              variant="primary"
              onClick={() => setShowUpload(!showUpload)}
              loading={isUploading}
            >
              {showUpload ? "Tutup" : "Upload Excel"}
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="sekolah">
              <Building2 className="w-4 h-4 mr-2 inline" />
              Data Sekolah
            </Tab>
            <Tab value="pejabat">
              <UserCircle2 className="w-4 h-4 mr-2 inline" />
              Pejabat Sekolah
            </Tab>
            <Tab value="logo">
              <ImageIcon className="w-4 h-4 mr-2 inline" />
              Logo Sekolah
            </Tab>
            <Tab value="personel">
              <Users className="w-4 h-4 mr-2 inline" />
              Foto Personel
            </Tab>
          </TabList>

          <TabPanel value="sekolah" className="mt-4">
            {showUpload && (
              <Card className="p-6 mb-6">
                <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 transition-all duration-300 bg-surface-muted/50">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <span className="text-4xl text-primary">cloud_upload</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-high mb-2">
                    Upload Data Sekolah
                  </h3>
                  <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                    Upload file Excel Dapodik — data profil sekolah akan langsung
                    terisi otomatis
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="sekolah-upload"
                  />
                  <label
                    htmlFor="sekolah-upload"
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-md text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      isUploading
                        ? "bg-text-muted text-surface cursor-not-allowed"
                        : "bg-primary text-on-primary hover:bg-primary-hover shadow-sm hover:shadow-primary/25 active:scale-[0.98]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isUploading ? "sync" : "upload"}
                    </span>
                    {isUploading ? "Memproses…" : "Pilih File Excel"}
                  </label>
                  <p className="text-xs text-text-low mt-4">
                    Format: .xlsx atau .xls
                  </p>
                </div>
              </Card>
            )}

            {!hasSchoolData ? (
              <Card className="p-10 text-center border-border">
                <div className="w-24 h-24 rounded-3xl bg-surface-muted flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl text-border-strong">school</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text-high mb-3">
                  Belum Ada Data Sekolah
                </h3>
                <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto">
                  Upload file Excel untuk mengisi data profil sekolah secara otomatis
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowUpload(true)}
                  className="px-8 py-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data Sekolah
                </Button>
              </Card>
            ) : (
              <Card className="p-6 mb-6 border-border">
                <div className="relative bg-gradient-to-r from-primary via-primary to-primary-hover p-8 overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                      <span className="text-3xl text-white">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                        Profil Sekolah
                      </span>
                      <h2 className="text-2xl font-bold text-white leading-tight mb-4">
                        {data.namaSekolah || "SD NEGERI …"}
                      </h2>
                      <div className="flex flex-wrap gap-2.5">
                        {data.npsn && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">
                              fingerprint
                            </span>
                            NPSN: {data.npsn}
                          </span>
                        )}
                        {data.tahunAnggaran && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">
                              calendar_month
                            </span>
                            TA {data.tahunAnggaran}
                          </span>
                        )}
                        {data.kecamatan && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">
                              location_on
                            </span>
                            {data.kecamatan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border mt-6">
                  {[
                    { key: "identitas", title: "Identitas Sekolah", icon: "badge" },
                    { key: "pelengkap", title: "Data Pelengkap", icon: "list_alt" },
                    { key: "kontak", title: "Kontak Sekolah", icon: "contact_mail" },
                    { key: "periodik", title: "Data Periodik", icon: "date_range" },
                    { key: "sanitasi", title: "Sanitasi", icon: "water_drop" },
                  ].map((section) => {
                    const fields = grouped[section.key];
                    if (!fields || fields.length === 0) return null;
                    return (
                      <div key={section.key}>
                        <div className="px-6 py-4 bg-surface-muted">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-text-low text-xl">
                              {section.icon}
                            </span>
                            <h4 className="font-semibold text-text-high">
                              {section.title}
                            </h4>
                            <span className="text-xs text-text-low bg-border px-2 py-0.5 rounded-full ml-auto">
                              {fields.length} field
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                          {fields.map((f, i) => (
                            <div key={i} className="p-4 hover:bg-surface-muted transition-colors">
                              <p className="text-xs font-semibold text-text-low uppercase tracking-wider mb-1.5">
                                {f.label}
                              </p>
                              <p className="text-sm font-medium text-text-high">
                                {f.value || (
                                  <span className="text-text-low font-normal italic">
                                    Belum diisi
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-4 bg-surface-muted border-t border-border mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-text-low text-xs font-medium">
                      Total {allFields.length} field data tersimpan
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowUpload(true)}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Upload Ulang
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabPanel>

          <TabPanel value="pejabat" className="mt-4">
            <Card className="p-6 mb-6 border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-text-high">Pejabat Sekolah</h3>
                  <p className="text-text-muted text-sm">
                    Data pejabat untuk tanda tangan dokumen LPJ
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {PEJABAT_ROLES.map((role, idx) => (
                <Card key={role.key} className="p-6 border-border hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      idx === 0 ? "bg-primary/10" :
                      idx === 1 ? "bg-success/10" :
                      idx === 2 ? "bg-warning/10" :
                      "bg-info/10"
                    }`}>
                      <UserCircle2 className={`w-5 h-5 ${
                        idx === 0 ? "text-primary" :
                        idx === 1 ? "text-success" :
                        idx === 2 ? "text-warning" :
                        "text-info"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">{role.label}</h4>
                      <p className="text-xs text-text-low">Data untuk tanda tangan</p>
                    </div>
                    {data.pejabat[role.key].nama && (
                      <Badge variant="success" size="sm">
                        Terisi
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Nama Lengkap" htmlFor={`pejabat-${role.key}-nama`}>
                      <Input
                        id={`pejabat-${role.key}-nama`}
                        value={data.pejabat[role.key].nama}
                        onChange={(e) => updatePejabat(role.key, "nama", e.target.value)}
                        placeholder={`Nama ${role.label}`}
                      />
                    </FormField>
                    <FormField label="NIP" htmlFor={`pejabat-${role.key}-nip`}>
                      <Input
                        id={`pejabat-${role.key}-nip`}
                        value={data.pejabat[role.key].nip}
                        onChange={(e) => updatePejabat(role.key, "nip", e.target.value)}
                        placeholder="NIP. 000000000000000000"
                      />
                    </FormField>
                  </div>
                </Card>
              ))}

              {pejabatChanges && (
                <div className="flex justify-end mt-4">
                  <Button variant="primary" onClick={handleSavePejabat}>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel value="logo" className="mt-4">
            <Card className="p-6 mb-6 border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-warning" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-text-high">Logo Sekolah</h3>
                  <p className="text-text-muted text-sm">
                    Upload logo untuk dokumen dan surat-menyurat
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {logoPreview && <Badge variant="success" size="sm">Sekolah</Badge>}
                  {logoDinasPreview && <Badge variant="info" size="sm">Dinas</Badge>}
                  {logoGugusPreview && <Badge variant="warning" size="sm">Gugus</Badge>}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  key: "sekolah",
                  label: "Logo Sekolah",
                  desc: "Identitas sekolah",
                  color: "warning",
                  preview: logoPreview,
                  setPreview: setLogoPreview,
                  remove: handleRemoveLogo,
                  inputRef: logoInputRef,
                  inputId: "logo-upload",
                  storageKey: "logo_sekolah",
                  successMsg: "Logo sekolah berhasil disimpan",
                },
                {
                  key: "dinas",
                  label: "Logo Dinas",
                  desc: "Dinas Pendidikan",
                  color: "info",
                  preview: logoDinasPreview,
                  setPreview: setLogoDinasPreview,
                  remove: handleRemoveLogoDinas,
                  inputRef: logoDinasInputRef,
                  inputId: "logo-dinas-upload",
                  storageKey: "logo_dinas",
                  successMsg: "Logo dinas berhasil disimpan",
                },
                {
                  key: "gugus",
                  label: "Logo Gugus",
                  desc: "Gugus sekolah",
                  color: "info",
                  preview: logoGugusPreview,
                  setPreview: setLogoGugusPreview,
                  remove: handleRemoveLogoGugus,
                  inputRef: logoGugusInputRef,
                  inputId: "logo-gugus-upload",
                  storageKey: "logo_gugus",
                  successMsg: "Logo gugus berhasil disimpan",
                },
              ].map((logo) => (
                <Card key={logo.key} className="p-5 border-border">
                  <div className="px-4 py-3 bg-surface-muted border-b border-border mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <Building2 className={`w-5 h-5 text-${logo.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-high">{logo.label}</h4>
                        <p className="text-[10px] text-text-low">{logo.desc}</p>
                      </div>
                      {logo.preview && (
                        <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-success rounded text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <input
                      type="file"
                      ref={logo.inputRef}
                      accept="image/*"
                      onChange={logo.key === "sekolah" ? handleLogoUpload : logo.key === "dinas" ? handleLogoDinasUpload : handleLogoGugusUpload}
                      className="hidden"
                      id={logo.inputId}
                    />
                    <label htmlFor={logo.inputId} className="block cursor-pointer group">
                      <div className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 overflow-hidden">
                        {logo.preview ? (
                          <img src={logo.preview} alt={logo.label} className="w-full h-full object-contain p-4" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-4xl text-text-low group-hover:text-primary transition-colors">
                              add_a_photo
                            </span>
                            <span className="text-[10px] text-text-low mt-2 group-hover:text-primary transition-colors">
                              Upload Logo
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] text-text-low">PNG/JPG, maks 2MB</p>
                      {logo.preview && (
                        <button
                          onClick={logo.remove}
                          className="text-[10px] text-danger hover:text-danger/90 font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 p-6 border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-info">info</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-high">Informasi Upload Logo</h4>
                  <ul className="text-xs text-text-low space-y-1">
                    <li>
                      <span className="font-semibold">Logo Sekolah</span> —
                      Ditampilkan di pojok kiri atas dokumen surat
                    </li>
                    <li>
                      <span className="font-semibold">Logo Dinas</span> —
                      Ditampilkan di pojok kanan atas dokumen surat
                    </li>
                    <li>
                      <span className="font-semibold">Logo Gugus</span> — Digunakan
                      untuk surat edaran gugus
                    </li>
                    <li>
                      <span className="font-semibold">Format:</span> PNG, JPG,
                      JPEG, SVG (maks 2MB)
                    </li>
                    <li>
                      <span className="font-semibold">Rekomendasi:</span>
                      200x200px dengan background transparan
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel value="personel" className="mt-4">
            <PersonelFotoTab />
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}
