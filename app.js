/* ============================================================
   പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി — Spotify playlist player
   Fill in the two values below before deploying.
   ============================================================ */
const CLIENT_ID = "7d4537e8436f4f6bb93b8e6f093bb5e0";
const PLAYLIST_ID = "21iS4SeHFzpuWCAGIh8PFH"; // just the ID, not the full URL
const REDIRECT_URI = window.location.origin + window.location.pathname; // must match Spotify dashboard exactly
/* ============================================================ */

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
setInterval(tickClock, 1000 * 15); // minute-resolution display, cheap to refresh

/* ---------------- Simulated "online" badge ----------------
   NOTE: this is a decorative animated number, not a real visitor
   count — a static GitHub Pages site has no way to know how many
   people currently have the page open without a live backend
   (e.g. a Firebase Realtime Database presence system). Wire that
   in later if a real count is wanted. */
let onlineCount = 18 + Math.floor(Math.random() * 20);
function updateOnlineBadge() {
  const el = document.getElementById("onlineCount");
  if (!el) return;
  const drift = Math.floor(Math.random() * 5) - 2; // -2..+2
  onlineCount = Math.max(6, Math.min(64, onlineCount + drift));
  el.textContent = onlineCount;
}
updateOnlineBadge();
setInterval(updateOnlineBadge, 5000 + Math.random() * 4000);

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-currently-playing"
].join(" ");

const els = {
  loginScreen: document.getElementById("loginScreen"),
  loginBtn: document.getElementById("loginBtn"),
  player: document.getElementById("player"),
  albumArt: document.getElementById("albumArt"),
  trackName: document.getElementById("trackName"),
  trackArtist: document.getElementById("trackArtist"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  iconPlay: document.getElementById("iconPlay"),
  iconPause: document.getElementById("iconPause"),
  skipBtn: document.getElementById("skipBtn"),
  progressFill: document.getElementById("progressFill"),
  statusLine: document.getElementById("statusLine")
};

let spotifyPlayer = null;
let deviceId = null;
let progressTimer = null;

/* ---------------- PKCE helpers ---------------- */
function randomString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

async function sha256base64url(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function startLogin() {
  const verifier = randomString(64);
  sessionStorage.setItem("pkce_verifier", verifier);
  const challenge = await sha256base64url(verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge
  });
  window.location = "https://accounts.spotify.com/authorize?" + params.toString();
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem("pkce_verifier");
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error("token exchange failed");
  const data = await res.json();
  saveTokens(data);
  return data.access_token;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) return null;
  const data = await res.json();
  saveTokens(data);
  return data.access_token;
}

function saveTokens(data) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("token_expires_at", String(Date.now() + data.expires_in * 1000));
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
}

async function getValidToken() {
  const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);
  if (Date.now() < expiresAt - 30000) return localStorage.getItem("access_token");
  return refreshAccessToken();
}

/* ---------------- Boot sequence ---------------- */
(async function boot() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    setStatus("Spotify-ൽ നിന്ന് സൈൻ ഇൻ ചെയ്യുന്നു…");
    try {
      await exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, REDIRECT_URI);
    } catch (e) {
      setStatus("ലോഗിൻ പരാജയപ്പെട്ടു, വീണ്ടും ശ്രമിക്കുക.");
      return;
    }
  }

  const token = await getValidToken();
  if (token) {
    showPlayerScreen();
    initSpotifySDK();
  } else {
    els.loginScreen.classList.remove("hidden");
  }
})();

els.loginBtn.addEventListener("click", startLogin);

function showPlayerScreen() {
  els.loginScreen.classList.add("hidden");
  els.player.classList.remove("hidden");
}

function setStatus(msg) {
  els.statusLine.textContent = msg || "";
}

/* ---------------- Web Playback SDK ---------------- */
window.onSpotifyWebPlaybackSDKReady = () => {
  // SDK script loaded; actual player is created once we have a token (initSpotifySDK).
};

function initSpotifySDK() {
  if (typeof Spotify === "undefined") {
    // script still loading — retry shortly
    setTimeout(initSpotifySDK, 300);
    return;
  }

  spotifyPlayer = new Spotify.Player({
    name: "പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി",
    getOAuthToken: async (cb) => cb(await getValidToken()),
    volume: 0.85
  });

  spotifyPlayer.addListener("ready", ({ device_id }) => {
    deviceId = device_id;
    setStatus("");
    startPlaylist();
  });

  spotifyPlayer.addListener("not_ready", () => setStatus("കണക്ഷൻ നഷ്ടപ്പെട്ടു…"));
  spotifyPlayer.addListener("initialization_error", () => setStatus("Player തുടങ്ങാൻ കഴിഞ്ഞില്ല."));
  spotifyPlayer.addListener("authentication_error", () => setStatus("ലോഗിൻ കാലഹരണപ്പെട്ടു, പേജ് റീലോഡ് ചെയ്യുക."));
  spotifyPlayer.addListener("account_error", () => setStatus("Spotify Premium അക്കൗണ്ട് വേണം."));

  spotifyPlayer.addListener("player_state_changed", (state) => {
    if (!state) return;
    updateUI(state);
  });

  spotifyPlayer.connect();
}

async function startPlaylist() {
  const token = await getValidToken();

  // Turn shuffle on for this device before starting playback
  await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${deviceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ context_uri: `spotify:playlist:${PLAYLIST_ID}` })
  });
}

function updateUI(state) {
  const track = state.track_window.current_track;
  if (track) {
    els.trackName.textContent = track.name;
    els.trackArtist.textContent = track.artists.map(a => a.name).join(", ");
    const art = track.album.images[0]?.url;
    if (art) els.albumArt.src = art;
  }

  const isPaused = state.paused;
  els.iconPlay.classList.toggle("hidden", !isPaused);
  els.iconPause.classList.toggle("hidden", isPaused);

  clearInterval(progressTimer);
  updateProgress(state.position, state.duration);
  if (!isPaused) {
    let pos = state.position;
    progressTimer = setInterval(() => {
      pos += 1000;
      updateProgress(pos, state.duration);
    }, 1000);
  }
}

function updateProgress(position, duration) {
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
  els.progressFill.style.width = pct + "%";
}

/* ---------------- Controls: pause/resume + skip only ---------------- */
els.playPauseBtn.addEventListener("click", () => {
  if (spotifyPlayer) spotifyPlayer.togglePlay();
});

els.skipBtn.addEventListener("click", () => {
  if (spotifyPlayer) spotifyPlayer.nextTrack();
});
