import { useState, useEffect, useRef } from "react";
import {
  Users,
  Upload,
  Search,
  Trash2,
  UserCheck,
  Briefcase,
} from "lucide-react";
import PageContainer from "../../ui/organisms/PageContainer";
import PageHeader from "../../ui/organisms/PageHeader";
import { Tabs, TabList, Tab, TabPanel } from "../../ui/molecules/Tabs";
import Card from "../../ui/molecules/Card";
import Badge from "../../ui/atoms/Badge";
import Button from "../../ui/atoms/Button";
import Input from "../../ui/atoms/Input";
import EmptyState from "../../ui/molecules/EmptyState";
import Spinner from "../../ui/atoms/Spinner";
import storageHelper from "../../utils/storageHelper";
import { parseGuruTendikExcel } from "../../utils/guruTendikParser";

const STATUS_BADGE = {
  PNS: "bg-primary-soft text-primary",
  PPPK: "bg-success/10 text-success",
  CPNS: "bg-info/10 text-info",
  Honorer: "bg-warning/10 text-warning",
};

const ROLE_HONOR_OPTIONS = [
  { value: "tendik", label: "Tendik Umum", color: "bg-surface-muted text-text-muted", icon: "badge" },
  { value: "perpus", label: "Perpustakaan", color: "bg-primary/10 text-primary", icon: "menu_book" },
  { value: "penjaga", label: "Penjaga", color: "bg-success/10 text-success", icon: "security" },
];

export default function DataGuruPage() {
  const [tab, setTab] = useState("guru");
  const [searchQuery, setSearchQuery] = useState("");
  const [guru, setGuru] = useState([]);
  const [tendik, setTendik] = useState([]);
  const [showUploadGuru, setShowUploadGuru] = useState(false);
  const [showUploadTendik, setShowUploadTendik] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const guruFileRef = useRef(null);
  const tendikFileRef = useRef(null);

  useEffect(() => {
    const storedGuru = storageHelper.get("data_guru", null);
    if (storedGuru && storedGuru.length > 0) {
      setGuru(storedGuru);
    }

    const storedTendik = storageHelper.get("data_tendik", null);
    if (storedTendik && storedTendik.length > 0) {
      setTendik(storedTendik);
    }
  }, []);

  const handleUploadClick = () => {
    if (tab === "guru") {
      guruFileRef.current?.click();
    } else {
      tendikFileRef.current?.click();
    }
  };

  const handleFileUpload = async (e, jenis) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("File harus berformat Excel (.xlsx atau .xls)");
      return;
    }

    setIsUploading(true);
    try {
      const result = await parseGuruTendikExcel(file);
      if (result.total === 0) {
        toast.error("Tidak ada data yang ditemukan");
        return;
      }

      const detectedJenis = jenis || result.jenis || "guru";

      if (detectedJenis === "tendik") {
        setTendik(result.items);
        storageHelper.set("data_tendik", result.items);
        setShowUploadTendik(false);
      } else {
        setGuru(result.items);
        storageHelper.set("data_guru", result.items);
        setShowUploadGuru(false);
      }

      toast.success(`${detectedJenis === "tendik" ? "Tendik" : "Guru"} berhasil diupload! ${result.total} data`);
    } catch (error) {
      toast.error(`Gagal memproses file: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (jenis === "tendik" && tendikFileRef.current) tendikFileRef.current.value = "";
      if (jenis !== "tendik" && guruFileRef.current) guruFileRef.current.value = "";
    }
  };

  const handleDelete = (id, type) => {
    if (type === "tendik") {
      const updated = tendik.filter((g) => g.id !== id);
      setTendik(updated);
      storageHelper.set("data_tendik", updated);
    } else {
      const updated = guru.filter((g) => g.id !== id);
      setGuru(updated);
      storageHelper.set("data_guru", updated);
    }
    toast.success("Data berhasil dihapus");
  };

  const handleRoleHonorChange = (id, newRole) => {
    const updated = tendik.map((t) => {
      if (t.id === id) {
        return { ...t, roleHonor: newRole };
      }
      return t;
    });
    setTendik(updated);
    storageHelper.set("data_tendik", updated);

    const roleLabel = ROLE_HONOR_OPTIONS.find((r) => r.value === newRole)?.label || newRole;
    toast.success(`Role honor diubah ke "${roleLabel}"`);
  };

  const getRoleBadge = (role) => {
    const option = ROLE_HONOR_OPTIONS.find((r) => r.value === role);
    if (!option) return ROLE_HONOR_OPTIONS[0]; // default: tendik
    return option;
  };

  const currentList = tab === "guru" ? guru : tendik;
  const filteredList = currentList.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nip?.includes(searchQuery)
  );

  const hasUploadFormOpen = tab === "guru" ? showUploadGuru : showUploadTendik;
  const toggleUpload = () => {
    if (tab === "guru") setShowUploadGuru((v) => !v);
    else setShowUploadTendik((v) => !v);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Data Guru & Tendik"
        description="Kelola data pendidik dan tenaga kependidikan dari Dapodik"
        actions={
          <Button
            variant="primary"
            onClick={handleUploadClick}
            loading={isUploading}
          >
            {isUploading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploading ? "Memproses…" : "Upload Excel"}
          </Button>
        }
      />

      <input
        type="file"
        ref={guruFileRef}
        onChange={(e) => handleFileUpload(e, "guru")}
        accept=".xlsx, .xls"
        className="hidden"
        id="guru-upload"
      />
      <input
        type="file"
        ref={tendikFileRef}
        onChange={(e) => handleFileUpload(e, "tendik")}
        accept=".xlsx, .xls"
        className="hidden"
        id="tendik-upload"
      />

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="guru">
              <UserCheck className="w-4 h-4 mr-2 inline" />
              Guru
              <Badge variant="default" className="ml-2">
                {guru.length}
              </Badge>
            </Tab>
            <Tab value="tendik">
              <Briefcase className="w-4 h-4 mr-2 inline" />
              Tendik
              <Badge variant="default" className="ml-2">
                {tendik.length}
              </Badge>
            </Tab>
          </TabList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            placeholder="Cari nama atau NIP…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-border">
        {filteredList.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? "Data tidak ditemukan" : `Belum ada data ${tab}`}
            description={
              searchQuery
                ? "Coba gunakan kata kunci lain."
                : "Upload file Excel dari Dapodik untuk mengisi data secara otomatis."
            }
            actionLabel={!searchQuery ? "Upload Excel" : undefined}
            onAction={!searchQuery ? handleUploadClick : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-text-muted border-b border-border">
                <tr>
                  {tab === "guru" ? (
                    <>
                      <th className="px-4 py-3 font-medium">Nama</th>
                      <th className="px-4 py-3 font-medium">NIP</th>
                      <th className="px-4 py-3 font-medium">NUPTK</th>
                      <th className="px-4 py-3 font-medium">Golongan</th>
                      <th className="px-4 py-3 font-medium">Jabatan</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Aksi</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-medium">Nama</th>
                      <th className="px-4 py-3 font-medium">NIP</th>
                      <th className="px-4 py-3 font-medium">NUPTK</th>
                      <th className="px-4 py-3 font-medium">Jenis PTK</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Role Honor</th>
                      <th className="px-4 py-3 font-medium text-right">Aksi</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.map((item) => {
                  const isTendik = tab === "tendik";
                  const currentRole = isTendik ? getRoleBadge(item.roleHonor) : null;
                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-high">
                        {item.nama || "-"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {item.nip || "-"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {item.nuptk || "-"}
                      </td>
                      {tab === "guru" ? (
                        <>
                          <td className="px-4 py-3 text-text-muted">
                            {item.golongan || "-"}
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {item.jabatan || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                item.status === "PNS"
                                  ? "primary"
                                  : item.status === "PPPK"
                                  ? "success"
                                  : item.status === "CPNS"
                                  ? "info"
                                  : "default"
                              }
                              size="sm"
                            >
                              {item.status}
                            </Badge>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-text-muted">
                            {item.jenisPtk || item.jabatan || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                item.status === "Aktif" ? "success" : "default"
                              }
                              size="sm"
                            >
                              {item.status || "Aktif"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.roleHonor || "tendik"}
                              onChange={(e) =>
                                handleRoleHonorChange(item.id, e.target.value)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 ${currentRole.color}`}
                            >
                              {ROLE_HONOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger/10"
                          onClick={() => handleDelete(item.id, tab === "tendik" ? "tendik" : "guru")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {hasUploadFormOpen && (
        <Card className="mt-6 p-6 border-border">
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 transition-all duration-300 bg-surface-muted/50">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <span className="text-4xl text-primary">cloud_upload</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text-high mb-2">
              Upload Data {tab === "guru" ? "Guru" : "Tendik"}
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              File Excel Dapodik — data akan langsung terisi otomatis
            </p>
            <input
              type="file"
              ref={tab === "guru" ? guruFileRef : tendikFileRef}
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e, tab === "guru" ? "guru" : "tendik")}
              className="hidden"
              id={`${tab}-upload`}
            />
            <label
              htmlFor={`${tab}-upload`}
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
            <p className="text-xs text-text-low mt-4">Format: .xlsx atau .xls</p>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
