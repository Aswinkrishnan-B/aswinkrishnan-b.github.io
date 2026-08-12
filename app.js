/* =========================================================
   പ്രൈവറ്റ് ബസ് പാട്ട് പെട്ടി
   YouTube Music Jukebox
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const PLAYLIST_ID =
    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";


/* =========================================================
   GLOBAL PLAYER STATE
========================================================= */

let player = null;

let playerReady = false;

let started = false;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const startScreen =
    document.getElementById(
        "start-screen"
    );

const startButton =
    document.getElementById(
        "start-button"
    );

const musicPlayer =
    document.getElementById(
        "music-player"
    );

const playPause =
    document.getElementById(
        "play-pause"
    );

const nextButton =
    document.getElementById(
        "next"
    );

const trackTitle =
    document.getElementById(
        "track-title"
    );

const albumArt =
    document.getElementById(
        "album-art"
    );

const albumPlaceholder =
    document.getElementById(
        "album-placeholder"
    );

const clock =
    document.getElementById(
        "clock"
    );

const onlineNumber =
    document.getElementById(
        "online-number"
    );


console.log(
    "Private Bus Paattu Petti starting..."
);


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    if (!clock) {
        return;
    }


    const now =
        new Date();


    let hours =
        now.getHours();


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const suffix =
        hours >= 12
            ? "pm"
            : "am";


    hours =
        hours % 12;


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


/* =========================================================
   DECORATIVE ONLINE COUNT
========================================================= */

let listeners = 128;


function updateListeners() {

    if (!onlineNumber) {
        return;
    }


    listeners +=
        Math.floor(
            Math.random() * 3
        ) - 1;


    listeners =
        Math.max(
            121,
            Math.min(
                136,
                listeners
            )
        );


    onlineNumber.textContent =
        listeners;
}


setInterval(
    updateListeners,
    6000
);


/* =========================================================
   YOUTUBE IFRAME API
========================================================= */

/*
    IMPORTANT:

    index.html loads this app.js BEFORE the YouTube API.

    Therefore this callback already exists when YouTube
    calls window.onYouTubeIframeAPIReady().
*/

window.onYouTubeIframeAPIReady =
    function () {

        console.log(
            "YouTube IFrame API loaded."
        );


        const iframe =
            document.getElementById(
                "youtube-player"
            );


        if (!iframe) {

            console.error(
                "YouTube iframe not found."
            );

            return;
        }


        console.log(
            "YouTube iframe found."
        );


        /*
         * Connect the IFrame API to the existing iframe.
         */

        player =
            new YT.Player(
                iframe,
                {

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


/* =========================================================
   PLAYER READY
========================================================= */

function onPlayerReady() {

    console.log(
        "YouTube player ready."
    );


    playerReady = true;


    /*
     * The playlist is already specified in the iframe URL:
     *
     * /embed/videoseries?list=...
     *
     * Therefore we don't call loadPlaylist().
     */

    setTimeout(
        function () {

            updateTrackInformation();

        },
        1000
    );
}


/* =========================================================
   START BUTTON
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            console.log(
                "Start button clicked."
            );


            if (
                !playerReady ||
                !player
            ) {

                console.warn(
                    "YouTube player is not ready yet."
                );

                return;
            }


            started = true;


            console.log(
                "Starting music..."
            );


            /*
             * This is executed directly from the
             * user's click, allowing browser audio
             * playback.
             */

            player.playVideo();


            /*
             * Hide the landing screen.
             */

            if (startScreen) {

                startScreen.classList.add(
                    "hidden"
                );
            }


            /*
             * Show the glass player.
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


/* =========================================================
   PLAY / PAUSE
========================================================= */

if (playPause) {

    playPause.addEventListener(
        "click",
        function () {

            if (
                !playerReady ||
                !player
            ) {

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

            }

            else {

                player.playVideo();

            }

        }
    );

}


/* =========================================================
   NEXT SONG
========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function () {

            if (
                !playerReady ||
                !player
            ) {

                return;
            }


            console.log(
                "Skipping to next track..."
            );


            player.nextVideo();


            setTimeout(
                updateTrackInformation,
                1000
            );

        }
    );

}


/* =========================================================
   YOUTUBE PLAYER STATE
========================================================= */

function onPlayerStateChange(
    event
) {

    console.log(
        "Player state:",
        event.data
    );


    switch (
        event.data
    ) {


        /* ---------------------------------------------
           UNSTARTED
        --------------------------------------------- */

        case YT.PlayerState.UNSTARTED:

            console.log(
                "YouTube playlist initializing..."
            );

            break;


        /* ---------------------------------------------
           CUED
        --------------------------------------------- */

        case YT.PlayerState.CUED:

            console.log(
                "Playlist successfully cued."
            );


            updateTrackInformation();

            break;


        /* ---------------------------------------------
           PLAYING
        --------------------------------------------- */

        case YT.PlayerState.PLAYING:

            console.log(
                "PLAYING"
            );


            if (playPause) {

                playPause.textContent =
                    "Ⅱ";
            }


            updateTrackInformation();

            break;


        /* ---------------------------------------------
           PAUSED
        --------------------------------------------- */

        case YT.PlayerState.PAUSED:

            console.log(
                "PAUSED"
            );


            if (playPause) {

                playPause.textContent =
                    "▶";
            }


            break;


        /* ---------------------------------------------
           BUFFERING
        --------------------------------------------- */

        case YT.PlayerState.BUFFERING:

            console.log(
                "BUFFERING"
            );

            break;


        /* ---------------------------------------------
           ENDED
        --------------------------------------------- */

        case YT.PlayerState.ENDED:

            console.log(
                "Track ended. Moving to next..."
            );


            /*
             * Automatically continue through
             * the playlist.
             */

            if (player) {

                player.nextVideo();

            }

            break;

    }

}


/* =========================================================
   TRACK INFORMATION
========================================================= */

function updateTrackInformation() {

    if (
        !playerReady ||
        !player
    ) {

        return;
    }


    let data;


    try {

        data =
            player.getVideoData();

    }

    catch (error) {

        console.warn(
            "Could not get YouTube video data.",
            error
        );

        return;
    }


    if (!data) {
        return;
    }


    console.log(
        "Current track:",
        data
    );


    /*
     * Song title
     */

    if (
        trackTitle &&
        data.title
    ) {

        trackTitle.textContent =
            data.title;
    }


    /*
     * Thumbnail
     */

    if (
        data.video_id
    ) {

        updateThumbnail(
            data.video_id
        );
    }

}


/* =========================================================
   THUMBNAIL
========================================================= */

function updateThumbnail(
    videoId
) {

    if (!albumArt) {
        return;
    }


    const thumbnailURL =
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
                "YouTube thumbnail unavailable."
            );

        };


    albumArt.src =
        thumbnailURL;
}


/* =========================================================
   YOUTUBE ERROR HANDLER
========================================================= */

function onPlayerError(
    event
) {

    console.error(
        "YouTube error code:",
        event.data
    );


    /*
     * 2
     * Invalid parameter
     */

    if (
        event.data === 2
    ) {

        console.error(
            "YouTube rejected the player configuration."
        );

        return;
    }


    /*
     * 5
     * HTML5 player error
     */

    if (
        event.data === 5
    ) {

        console.error(
            "YouTube HTML5 player error."
        );

        return;
    }


    /*
     * 100
     * Video unavailable
     *
     * 101 / 150
     * Embedding disabled
     */

    if (

        event.data === 100 ||
        event.data === 101 ||
        event.data === 150

    ) {

        console.warn(
            "This track cannot be embedded. Skipping..."
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
