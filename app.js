/* ============================================================
   പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി — YouTube Music playlist version
   No login required for anyone. Uses the YouTube IFrame Player
   API (kept off-screen) so playback stays free for all visitors,
   with our own glass pause/skip controls on top.
   ============================================================ */
const PLAYLIST_ID = "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";

const els = {
  startScreen: document.getElementById("startScreen"),
  startBtn: document.getElementById("startBtn"),
  player: document.getElementById("player"),
  albumArt: document.getElementById("albumArt"),
  trackName: document.getElementById("trackName"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  iconPlay: document.getElementById("iconPlay"),
  iconPause: document.getElementById("iconPause"),
  skipBtn: document.getElementById("skipBtn")
};

let ytPlayer = null;

/* ---------------- Load the YouTube IFrame API script ---------------- */
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player("ytHost", {
    height: "200",
    width: "300",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: () => {
        // Player is ready; playback starts only after the visitor taps Start.
      },
      onStateChange: onPlayerStateChange
    }
  });
};

/* ---------------- Tap-to-start (browsers require one user gesture) ---------------- */
els.startBtn.addEventListener("click", () => {
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") {
    // API not ready yet — try again shortly.
    setTimeout(() => els.startBtn.click(), 300);
    return;
  }
  ytPlayer.playVideo();
  els.startScreen.classList.add("hidden");
  els.player.classList.remove("hidden");
});

/* ---------------- UI updates ---------------- */
function onPlayerStateChange(event) {
  const YTState = window.YT.PlayerState;

  if (event.data === YTState.PLAYING || event.data === YTState.PAUSED) {
    updateTrackInfo();
  }

  const isPlaying = event.data === YTState.PLAYING;
  els.iconPlay.classList.toggle("hidden", isPlaying);
  els.iconPause.classList.toggle("hidden", !isPlaying);
}

function updateTrackInfo() {
  const data = ytPlayer.getVideoData ? ytPlayer.getVideoData() : null;
  if (!data) return;
  els.trackName.textContent = data.title || "—";
  if (data.video_id) {
    els.albumArt.src = `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg`;
  }
}

/* ---------------- Controls: pause/resume + skip only ---------------- */
els.playPauseBtn.addEventListener("click", () => {
  if (!ytPlayer) return;
  const state = ytPlayer.getPlayerState();
  if (state === window.YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
});

els.skipBtn.addEventListener("click", () => {
  if (ytPlayer && typeof ytPlayer.nextVideo === "function") {
    ytPlayer.nextVideo();
  }
});

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
   Decorative animated number, not a real visitor count — a
   static GitHub Pages site can't know real concurrent visitors
   without a live backend. */
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
