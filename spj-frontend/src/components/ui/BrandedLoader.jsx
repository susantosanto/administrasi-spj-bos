/**
 * BrandedLoader — loader ASIK (identik dengan boot splash di index.html)
 * untuk semua keadaan "tunggu" di dalam aplikasi:
 *
 *  - variant="fullscreen" : layar penuh ala splash → logout, transisi berat
 *  - variant="overlay"    : lapisan frosted menutupi kontainer → proses berat
 *                           (import Excel, generate LPJ, dsb.)
 *
 * Catatan teknis:
 *  - Class animasi .asik-* (track, comet, halo, dots) hidup GLOBAL dari
 *    <style> di index.html — tidak perlu CSS tambahan di sini.
 *  - Komet memakai conic-gradient + CSS mask, tanpa <defs>/id SVG →
 *    tidak ada benturan id antar instance (splash & in-app).
 *  - Mode gelap otomatis via rule html.dark pada CSS global yang sama.
 *  - exiting=true → animasi keluar 0.3s; parent melepas elemen setelahnya.
 */
export default function BrandedLoader({
  variant = "fullscreen",
  title = "Aplikasi Dokumentasi LPJ",
  subtitle = "Pertanggungjawaban Dana BOS/BOSP",
  exiting = false,
}) {
  const rings = (
    <>
      <span className="asik-loader__track" />
      <span className="asik-loader__comet" />
    </>
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
