/* ============================================================
   പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി — public Spotify embed version
   No login, no Client ID needed — playback is fully handled by
   Spotify's own embed iframe in index.html.
   ============================================================ */

/* ---------------- Clock ---------------- */
function tickClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = `${h}:${m} ${ampm}`;
}
tickClock();
setInterval(tickClock, 1000 * 15);

/* ---------------- Simulated "online" badge ----------------
   Decorative animated number, not a real visitor count — see
   earlier note: a static GitHub Pages site can't know real
   concurrent visitors without a live backend. */
let onlineCount = 18 + Math.floor(Math.random() * 20);
function updateOnlineBadge() {
  const el = document.getElementById("onlineCount");
  if (!el) return;
  const drift = Math.floor(Math.random() * 5) - 2;
  onlineCount = Math.max(6, Math.min(64, onlineCount + drift));
  el.textContent = onlineCount;
}
updateOnlineBadge();
setInterval(updateOnlineBadge, 5000 + Math.random() * 4000);
