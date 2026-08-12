const PLAYLIST_ID =
    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";

let player = null;
let playerReady = false;


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


/* =====================================================
   STARTUP
===================================================== */

console.log(
    "Private Bus Paattu Petti starting..."
);


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    if (!clock) return;

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

setInterval(
    updateClock,
    1000
);


/* =====================================================
   FAKE ONLINE COUNT
===================================================== */

let listeners = 128;

setInterval(() => {

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

}, 6000);


/* =====================================================
   YOUTUBE API
===================================================== */

window.onYouTubeIframeAPIReady = function () {

    console.log(
        "YouTube IFrame API loaded."
    );


    player = new YT.Player(
        "youtube-player",
        {

            /*
             * The player itself is essentially invisible.
             */

            width: "1",
            height: "1",


            /*
             * IMPORTANT:
             *
             * Load the playlist HERE rather than calling
             * loadPlaylist() after initialization.
             */

            playerVars: {

                autoplay: 0,

                controls: 0,

                disablekb: 1,

                fs: 0,

                playsinline: 1,

                rel: 0,

                /*
                 * Playlist
                 */

                listType: "playlist",

                list: PLAYLIST_ID,

                /*
                 * Required/recommended origin for the
                 * IFrame API.
                 */

                origin: window.location.origin
            },


            events: {

                onReady:
                    onPlayerReady,

                onStateChange:
                    onPlayerStateChange,

                onError:
                    onPlayerError,

                onAutoplayBlocked:
                    onAutoplayBlocked
            }
        }
    );
};


/* =====================================================
   PLAYER READY
===================================================== */

function onPlayerReady() {

    console.log(
        "YouTube player ready."
    );

    playerReady = true;


    /*
     * We deliberately DO NOT call:
     *
     * player.loadPlaylist(...)
     *
     * here.
     *
     * The playlist was already supplied in playerVars.
     */


    /*
     * Give YouTube a moment to cue the first video,
     * then inspect it.
     */

    setTimeout(
        updateTrackInformation,
        1200
    );
}


/* =====================================================
   START BUTTON
===================================================== */

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            console.log(
                "Start button clicked."
            );


            if (!playerReady || !player) {

                console.warn(
                    "YouTube player is not ready."
                );

                return;
            }


            console.log(
                "Starting music..."
            );


            /*
             * This is called directly as the result
             * of the user's click, so browser autoplay
             * policy should permit it.
             */

            player.playVideo();


            /*
             * Remove start screen.
             */

            if (startScreen) {

                startScreen.classList.add(
                    "hidden"
                );
            }


            /*
             * Show glass player.
             */

            if (musicPlayer) {

                musicPlayer.classList.add(
                    "visible"
                );
            }


            setTimeout(
                updateTrackInformation,
                1000
            );
        }
    );
}


/* =====================================================
   PLAY / PAUSE
===================================================== */

if (playPause) {

    playPause.addEventListener(
        "click",
        function () {

            if (!playerReady || !player) {
                return;
            }


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

            if (!playerReady || !player) {
                return;
            }


            console.log(
                "Next track..."
            );


            player.nextVideo();


            setTimeout(
                updateTrackInformation,
                1000
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


    switch (event.data) {


        case YT.PlayerState.UNSTARTED:

            console.log(
                "Playlist/player initializing..."
            );

            break;


        case YT.PlayerState.ENDED:

            console.log(
                "Track ended. Moving to next..."
            );

            player.nextVideo();

            break;


        case YT.PlayerState.PLAYING:

            console.log(
                "Playing."
            );


            if (playPause) {

                playPause.textContent =
                    "Ⅱ";
            }


            updateTrackInformation();

            break;


        case YT.PlayerState.PAUSED:

            console.log(
                "Paused."
            );


            if (playPause) {

                playPause.textContent =
                    "▶";
            }

            break;


        case YT.PlayerState.BUFFERING:

            console.log(
                "Buffering..."
            );

            break;


        case YT.PlayerState.CUED:

            console.log(
                "Video cued."
            );

            updateTrackInformation();

            break;
    }
}


/* =====================================================
   AUTOPLAY BLOCKED
===================================================== */

function onAutoplayBlocked() {

    console.warn(
        "YouTube autoplay was blocked."
    );

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


    if (data.video_id) {

        updateThumbnail(
            data.video_id
        );
    }
}


/* =====================================================
   THUMBNAIL
===================================================== */

function updateThumbnail(videoId) {

    if (!albumArt) {
        return;
    }


    const url =
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


    albumArt.classList.remove(
        "loaded"
    );


    if (albumPlaceholder) {

        albumPlaceholder.style.display =
            "flex";
    }


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

            console.warn(
                "Thumbnail unavailable."
            );
        };


    albumArt.src = url;
}


/* =====================================================
   YOUTUBE ERRORS
===================================================== */

function onPlayerError(event) {

    console.error(
        "YouTube error code:",
        event.data
    );


    /*
     * 2   = Invalid parameter
     * 5   = HTML5 player error
     * 100 = Video unavailable/private
     * 101 = Embedding prohibited
     * 150 = Embedding prohibited
     */

    if (
        event.data === 100 ||
        event.data === 101 ||
        event.data === 150
    ) {

        console.log(
            "Skipping unavailable/non-embeddable track."
        );


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
