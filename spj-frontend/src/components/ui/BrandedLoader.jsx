/**
 * BrandedLoader — loader ASIK (identik dengan boot splash di index.html)
 * untuk semua keadaan "tunggu" di dalam aplikasi:
 *
 *  - variant="fullscreen" : layar penuh ala splash → logout, transisi berat
 *  - variant="overlay"    : lapisan frosted menutupi kontainer → proses berat
 *                           (import Excel, generate LPJ, dsb.)
 *
 * Catatan teknis:
 *  - Class animasi .asik-* (ring, halo, dots, teks) hidup GLOBAL dari
 *    <style> di index.html — tidak perlu CSS tambahan di sini.
 *  - Gradient ring memakai id sendiri (asik-ring-gradient--app) + stroke
 *    inline agar tidak berbenturan dengan <defs> splash (id unik/dokumen).
 *  - Mode gelap otomatis via rule html.dark pada CSS global yang sama.
 *  - exiting=true → animasi keluar 0.3s; parent melepas elemen setelahnya.
 */
export default function BrandedLoader({
  variant = "fullscreen",
  title = "Aplikasi Sistem Keuangan",
  subtitle = "Pertanggungjawaban Dana BOS/BOSP",
  exiting = false,
}) {
  const rings = (
    <svg className="asik-loader__rings" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="asik-ring-gradient--app" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0757EE" />
          <stop offset="55%" stopColor="#0AA5EE" />
          <stop offset="100%" stopColor="#12DCE8" />
        </linearGradient>
      </defs>
      <circle className="asik-loader__track" cx="60" cy="60" r="57" />
      <circle
        className="asik-loader__ring"
        cx="60" cy="60" r="57"
        style={{ stroke: "url(#asik-ring-gradient--app)" }}
      />
      <circle
        className="asik-loader__ring asik-loader__ring--secondary"
        cx="60" cy="60" r="57"
        style={{ stroke: "url(#asik-ring-gradient--app)" }}
      />
    </svg>
  );

  return (
    <div
      className={`${variant === "overlay" ? "app-loader-overlay" : "app-loader-screen"}${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="asik-loading">
        <div className="asik-loader">
          <span className="asik-loader__halo" />
          {rings}
          <div className="asik-loader__disc">
            <img className="asik-loader__logo" src="/asik-logo.png" alt="" draggable="false" />
          </div>
        </div>
        <div className="asik-loading__dots">
          <span></span><span></span><span></span>
        </div>
        <p className="asik-loading__title">{title}</p>
        {subtitle ? <p className="asik-loading__subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
}
