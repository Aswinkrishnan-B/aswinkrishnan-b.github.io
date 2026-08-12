const PLAYLIST_ID = "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";

let player = null;
let playerReady = false;


/* =====================================================
   GET ELEMENTS SAFELY
===================================================== */

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

const musicPlayer = document.getElementById("music-player");

const playPause = document.getElementById("play-pause");
const nextButton = document.getElementById("next");

const trackTitle = document.getElementById("track-title");

const albumArt = document.getElementById("album-art");
const albumPlaceholder = document.getElementById("album-placeholder");

const clock = document.getElementById("clock");
const onlineNumber = document.getElementById("online-number");

const titleImage = document.getElementById("title-image");


/* =====================================================
   DEBUGGING
===================================================== */

console.log("Private Bus Paattu Petti starting...");

console.log({
    startScreen,
    startButton,
    musicPlayer,
    playPause,
    nextButton,
    trackTitle,
    albumArt,
    albumPlaceholder,
    clock,
    onlineNumber,
    titleImage
});


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    if (!clock) return;

    const now = new Date();

    let hours = now.getHours();

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

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

function updateListeners() {

    if (!onlineNumber) return;

    listeners +=
        Math.floor(Math.random() * 3) - 1;

    listeners =
        Math.max(
            121,
            Math.min(136, listeners)
        );

    onlineNumber.textContent =
        listeners;
}

setInterval(updateListeners, 6000);


/* =====================================================
   TITLE FALLBACK
===================================================== */

if (titleImage) {

    titleImage.addEventListener(
        "error",
        function () {

            console.error(
                "title.png could not be loaded."
            );

            titleImage.style.display = "none";

            const fallback =
                document.createElement("div");

            fallback.textContent =
                "പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി";

            fallback.style.position = "absolute";
            fallback.style.zIndex = "10";
            fallback.style.top = "10%";
            fallback.style.left = "50%";
            fallback.style.transform =
                "translateX(-50%)";

            fallback.style.width = "90%";

            fallback.style.textAlign = "center";

            fallback.style.color = "white";

            fallback.style.fontSize =
                "clamp(30px, 6vw, 70px)";

            fallback.style.fontWeight = "700";

            fallback.style.textShadow =
                "0 4px 20px rgba(0,0,0,.8)";

            document
                .getElementById("app")
                ?.appendChild(fallback);
        }
    );

}


/* =====================================================
   START BUTTON
===================================================== */

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            console.log("Start button clicked.");

            if (!playerReady) {

                console.log(
                    "YouTube player is not ready yet."
                );

                return;
            }

            startMusic();
        }
    );

}


/* =====================================================
   START MUSIC
===================================================== */

function startMusic() {

    if (!player) {

        console.error(
            "YouTube player does not exist."
        );

        return;
    }

    console.log("Starting music...");

    player.playVideo();


    if (startScreen) {
        startScreen.classList.add("hidden");
    }

    if (musicPlayer) {
        musicPlayer.classList.add("visible");
    }


    setTimeout(
        updateTrackInformation,
        1000
    );
}


/* =====================================================
   YOUTUBE API
===================================================== */

/*
    YouTube automatically calls this function after
    https://www.youtube.com/iframe_api loads.
*/

window.onYouTubeIframeAPIReady = function () {

    console.log(
        "YouTube IFrame API loaded."
    );


    player =
        new YT.Player(
            "youtube-player",
            {

                width: "1",
                height: "1",

                playerVars: {

                    autoplay: 0,

                    controls: 0,

                    disablekb: 1,

                    fs: 0,

                    playsinline: 1,

                    rel: 0,

                    modestbranding: 1
                },

                events: {

                    onReady:
                        onPlayerReady,

                    onStateChange:
                        onPlayerStateChange,

                    onError:
                        onPlayerError
                }
            }
        );
};


/* =====================================================
   YOUTUBE READY
===================================================== */

function onPlayerReady() {

    console.log(
        "YouTube player ready."
    );

    playerReady = true;


    /*
        Load the playlist.
    */

    player.loadPlaylist(
        PLAYLIST_ID
    );
}


/* =====================================================
   PLAY / PAUSE
===================================================== */

if (playPause) {

    playPause.addEventListener(
        "click",
        function () {

            if (!playerReady) return;

            const state =
                player.getPlayerState();


            if (
                state ===
                    YT.PlayerState.PLAYING ||

                state ===
                    YT.PlayerState.BUFFERING
            ) {

                player.pauseVideo();

            } else {

                player.playVideo();

            }
        }
    );

}


/* =====================================================
   NEXT
===================================================== */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function () {

            if (!playerReady) return;

            console.log(
                "Skipping to next track."
            );

            player.nextVideo();

            setTimeout(
                updateTrackInformation,
                800
            );
        }
    );

}


/* =====================================================
   PLAYER STATE
===================================================== */

function onPlayerStateChange(event) {

    console.log(
        "Player state:",
        event.data
    );


    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        if (playPause) {
            playPause.textContent = "Ⅱ";
        }

        updateTrackInformation();
    }


    else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        if (playPause) {
            playPause.textContent = "▶";
        }

    }


    else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        /*
            Automatically continue.
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

    if (!player) return;

    const data =
        player.getVideoData();

    if (!data) return;


    console.log(
        "Current track:",
        data
    );


    if (
        trackTitle &&
        data.title
    ) {

        trackTitle.textContent =
            data.title;
    }


    if (
        data.video_id
    ) {

        updateThumbnail(
            data.video_id
        );
    }
}


/* =====================================================
   THUMBNAIL
===================================================== */

function updateThumbnail(videoId) {

    if (!albumArt) return;


    const thumbnail =
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


    albumArt.onload =
        function () {

            albumArt.classList.add(
                "loaded"
            );

            if (albumPlaceholder) {
                albumPlaceholder.style.display =
                    "none";
            }
        };


    albumArt.onerror =
        function () {

            console.error(
                "Could not load thumbnail."
            );
        };


    albumArt.src =
        thumbnail;
}


/* =====================================================
   YOUTUBE ERROR
===================================================== */

function onPlayerError(event) {

    console.error(
        "YouTube error code:",
        event.data
    );


    /*
        If a particular playlist video cannot be embedded,
        skip it.
    */

    if (
        event.data === 100 ||
        event.data === 101 ||
        event.data === 150
    ) {

        setTimeout(
            function () {

                if (player) {
                    player.nextVideo();
                }

            },
            700
        );
    }
}
