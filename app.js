/* =========================================================
   പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി
   YouTube Music Playlist Player
========================================================= */

/*
    Playlist:
    https://music.youtube.com/playlist?list=PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD
*/

const PLAYLIST_ID = "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";

let player = null;
let playerReady = false;
let hasStarted = false;
let pendingStart = false;


/* =========================================================
   DOM
========================================================= */

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const playerContainer = document.getElementById("playerContainer");

const playButton = document.getElementById("playButton");
const nextButton = document.getElementById("nextButton");

const songTitle = document.getElementById("songTitle");
const songThumbnail = document.getElementById("songThumbnail");

const clock = document.getElementById("clock");
const listenerCount = document.getElementById("listenerCount");


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const suffix = hours >= 12 ? "pm" : "am";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    clock.textContent = `${hours}:${minutes} ${suffix}`;
}

updateClock();

setInterval(updateClock, 1000);


/* =========================================================
   SIMULATED ONLINE COUNT
========================================================= */

let fakeListeners = 127;

function updateFakeListeners() {

    /*
        Decorative only.
        This is deliberately NOT a real visitor counter.
    */

    const change = Math.floor(Math.random() * 3) - 1;

    fakeListeners += change;

    fakeListeners = Math.max(
        118,
        Math.min(139, fakeListeners)
    );

    listenerCount.textContent = fakeListeners;
}

setInterval(updateFakeListeners, 7000);


/* =========================================================
   YOUTUBE API
========================================================= */

function loadYouTubeAPI() {

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";

    document.head.appendChild(script);
}


/*
    YouTube calls this function automatically once
    the IFrame Player API has loaded.
*/

window.onYouTubeIframeAPIReady = function () {

    player = new YT.Player("youtube-player", {

        width: "200",
        height: "200",

        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,

            listType: "playlist",
            list: PLAYLIST_ID,

            /*
                The origin helps YouTube identify the
                embedding website when hosted on GitHub Pages.
            */
            origin: window.location.origin
        },

        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }

    });
};


/* =========================================================
   PLAYER READY
========================================================= */

function onPlayerReady() {

    playerReady = true;

    /*
        Explicitly load the playlist so the player knows
        the playlist structure before playback begins.
    */

    player.loadPlaylist({
        list: PLAYLIST_ID,
        listType: "playlist",
        index: 0
    });

    /*
        If the visitor clicked Start before the API had
        finished loading, start playback now.
    */

    if (pendingStart) {
        startPlayback();
    }
}


/* =========================================================
   START
========================================================= */

startButton.addEventListener("click", function () {

    pendingStart = true;

    if (playerReady) {
        startPlayback();
    }

});


function startPlayback() {

    if (!player || !playerReady) {
        return;
    }

    hasStarted = true;
    pendingStart = false;

    /*
        This call occurs as a consequence of the user's
        button click, satisfying browser autoplay policy.
    */

    player.playVideo();

    startScreen.classList.add("hidden");
    playerContainer.classList.add("visible");

    updateSongInfo();
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

playButton.addEventListener("click", function () {

    if (!player || !playerReady) {
        return;
    }

    const state = player.getPlayerState();

    if (
        state === YT.PlayerState.PLAYING ||
        state === YT.PlayerState.BUFFERING
    ) {

        player.pauseVideo();

    } else {

        player.playVideo();

    }

});


/* =========================================================
   PLAY BUTTON ICON
========================================================= */

function updatePlayButton() {

    if (!player || !playerReady) {
        return;
    }

    const state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {

        playButton.textContent = "Ⅱ";
        playButton.setAttribute("aria-label", "Pause");

    } else {

        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", "Play");

    }
}


/* =========================================================
   NEXT SONG
========================================================= */

nextButton.addEventListener("click", function () {

    if (!player || !playerReady) {
        return;
    }

    player.nextVideo();

    setTimeout(updateSongInfo, 500);

});


/* =========================================================
   PLAYER STATE
========================================================= */

function onPlayerStateChange(event) {

    updatePlayButton();

    switch (event.data) {

        case YT.PlayerState.PLAYING:

            updateSongInfo();

            break;


        case YT.PlayerState.PAUSED:

            updatePlayButton();

            break;


        case YT.PlayerState.ENDED:

            /*
                Move to the next playlist item.

                The API playlist handles the ordering.
            */

            player.nextVideo();

            setTimeout(updateSongInfo, 500);

            break;


        case YT.PlayerState.CUED:

            updateSongInfo();

            break;

    }

}


/* =========================================================
   SONG INFORMATION
========================================================= */

function updateSongInfo() {

    if (!player || !playerReady) {
        return;
    }

    const videoData = player.getVideoData();

    if (!videoData) {
        return;
    }

    const title = videoData.title;
    const videoId = videoData.video_id;

    if (title) {
        songTitle.textContent = title;
    }

    if (videoId) {

        /*
            YouTube's standard thumbnail endpoint.

            maxresdefault is attempted first.
            If unavailable, fallback to hqdefault.
        */

        const maxThumbnail =
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        const fallbackThumbnail =
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        songThumbnail.classList.remove("loaded");

        songThumbnail.src = maxThumbnail;

        songThumbnail.onload = function () {

            songThumbnail.classList.add("loaded");

        };

        songThumbnail.onerror = function () {

            songThumbnail.onerror = null;

            songThumbnail.src = fallbackThumbnail;

            songThumbnail.onload = function () {
                songThumbnail.classList.add("loaded");
            };

        };

    }

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function onPlayerError(event) {

    console.warn(
        "YouTube Player Error:",
        event.data
    );

    /*
        If an individual video is unavailable, automatically
        move to the next playlist item.
    */

    if (player && playerReady) {

        setTimeout(function () {

            player.nextVideo();
            updateSongInfo();

        }, 1000);

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

loadYouTubeAPI();
