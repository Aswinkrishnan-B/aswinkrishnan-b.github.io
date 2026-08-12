const PLAYLIST_ID =
    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";


let player = null;
let playerReady = false;
let started = false;


/* =====================================================
   ELEMENTS
===================================================== */

const startScreen =
    document.getElementById("start-screen");

const startButton =
    document.getElementById("start-button");

const musicPlayer =
    document.getElementById("music-player");

const playPause =
    document.getElementById("play-pause");

const nextButton =
    document.getElementById("next");

const trackTitle =
    document.getElementById("track-title");

const albumArt =
    document.getElementById("album-art");

const albumPlaceholder =
    document.getElementById("album-placeholder");

const clock =
    document.getElementById("clock");

const onlineNumber =
    document.getElementById("online-number");

const titleImage =
    document.getElementById("title-image");


/* =====================================================
   CHECK ASSETS
===================================================== */

titleImage.addEventListener("error", () => {

    console.error(
        "ERROR: title.png could not be loaded."
    );

    /*
        If title.png is missing, create a text fallback.
    */

    titleImage.style.display = "none";

    const fallback =
        document.createElement("div");

    fallback.id = "title-fallback";

    fallback.textContent =
        "പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി";

    fallback.style.position = "absolute";
    fallback.style.zIndex = "10";
    fallback.style.top = "11%";
    fallback.style.left = "50%";
    fallback.style.transform = "translateX(-50%)";
    fallback.style.width = "90%";
    fallback.style.textAlign = "center";
    fallback.style.color = "white";
    fallback.style.fontSize = "clamp(30px, 6vw, 72px)";
    fallback.style.fontWeight = "700";
    fallback.style.textShadow =
        "0 4px 20px rgba(0,0,0,.8)";

    document.getElementById("app")
        .appendChild(fallback);
});


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const now = new Date();

    let hours = now.getHours();

    const minutes =
        String(now.getMinutes())
        .padStart(2, "0");

    const suffix =
        hours >= 12 ? "pm" : "am";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    clock.textContent =
        `${hours}:${minutes} ${suffix}`;
}

updateClock();

setInterval(updateClock, 1000);


/* =====================================================
   DECORATIVE ONLINE COUNT
===================================================== */

let listeners = 128;

setInterval(() => {

    const movement =
        Math.floor(Math.random() * 3) - 1;

    listeners += movement;

    listeners =
        Math.max(121, Math.min(136, listeners));

    onlineNumber.textContent =
        listeners;

}, 6000);


/* =====================================================
   YOUTUBE API
===================================================== */

/*
    The YouTube IFrame API calls this function automatically
    once https://www.youtube.com/iframe_api has loaded.
*/

window.onYouTubeIframeAPIReady = function () {

    console.log("YouTube API loaded.");

    player =
        new YT.Player("youtube-player", {

            width: "1",
            height: "1",

            playerVars: {

                autoplay: 0,

                controls: 0,

                disablekb: 1,

                fs: 0,

                iv_load_policy: 3,

                playsinline: 1,

                rel: 0,

                modestbranding: 1

            },

            events: {

                onReady:
                    handlePlayerReady,

                onStateChange:
                    handlePlayerState,

                onError:
                    handlePlayerError

            }

        });

};


/* =====================================================
   PLAYER READY
===================================================== */

function handlePlayerReady(event) {

    console.log("YouTube player ready.");

    playerReady = true;

    /*
        Load the playlist.

        Using the simple string form is more reliable than
        the object form across different versions of the API.
    */

    player.loadPlaylist(
        PLAYLIST_ID
    );

}


/* =====================================================
   START
===================================================== */

startButton.addEventListener(
    "click",
    startMusic
);


function startMusic() {

    if (!playerReady || !player) {

        console.warn(
            "YouTube player is not ready yet."
        );

        return;
    }

    started = true;

    /*
        Start playback directly as a result of the
        user's click.
    */

    player.playVideo();

    startScreen.classList.add("hidden");

    musicPlayer.classList.add("visible");

    setTimeout(
        updateTrackInformation,
        700
    );
}


/* =====================================================
   PLAY / PAUSE
===================================================== */

playPause.addEventListener(
    "click",
    () => {

        if (!playerReady || !player) {
            return;
        }

        const state =
            player.getPlayerState();

        if (
            state === YT.PlayerState.PLAYING ||
            state === YT.PlayerState.BUFFERING
        ) {

            player.pauseVideo();

        } else {

            player.playVideo();

        }

    }
);


/* =====================================================
   NEXT
===================================================== */

nextButton.addEventListener(
    "click",
    () => {

        if (!playerReady || !player) {
            return;
        }

        player.nextVideo();

        setTimeout(
            updateTrackInformation,
            700
        );

    }
);


/* =====================================================
   PLAYER STATE
===================================================== */

function handlePlayerState(event) {

    console.log(
        "YouTube state:",
        event.data
    );


    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        playPause.textContent = "Ⅱ";

        updateTrackInformation();

    }


    else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        playPause.textContent = "▶";

    }


    else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        /*
            Automatically continue to the next track.
        */

        player.nextVideo();

    }


    else if (
        event.data ===
        YT.PlayerState.CUED
    ) {

        updateTrackInformation();

    }

}


/* =====================================================
   TRACK INFORMATION
===================================================== */

function updateTrackInformation() {

    if (!playerReady || !player) {
        return;
    }


    const data =
        player.getVideoData();


    if (!data) {
        return;
    }


    console.log(
        "Current video:",
        data
    );


    if (data.title) {

        trackTitle.textContent =
            data.title;

    }


    if (data.video_id) {

        loadThumbnail(
            data.video_id
        );

    }

}


/* =====================================================
   THUMBNAIL
===================================================== */

function loadThumbnail(videoId) {

    albumArt.classList.remove(
        "loaded"
    );

    albumPlaceholder.style.display =
        "flex";


    /*
        Start with high quality.
    */

    const highQuality =
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const image =
        new Image();


    image.onload = function () {

        albumArt.src =
            highQuality;

        albumArt.classList.add(
            "loaded"
        );

        albumPlaceholder.style.display =
            "none";

    };


    image.onerror = function () {

        albumArt.classList.remove(
            "loaded"
        );

    };


    image.src =
        highQuality;
}


/* =====================================================
   YOUTUBE ERRORS
===================================================== */

function handlePlayerError(event) {

    console.error(
        "YouTube error:",
        event.data
    );


    /*
        Error codes commonly encountered here:

        2    Invalid parameter
        5    HTML5 player error
        100  Video unavailable
        101  Embedding not allowed
        150  Embedding not allowed

        If one playlist item cannot be played,
        skip it instead of killing the jukebox.
    */

    if (
        event.data === 100 ||
        event.data === 101 ||
        event.data === 150
    ) {

        console.log(
            "Skipping unavailable video."
        );

        setTimeout(
            () => player.nextVideo(),
            500
        );

    }

}
