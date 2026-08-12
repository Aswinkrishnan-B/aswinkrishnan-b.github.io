const PLAYLIST_ID =
    "PL6P929LsnhPJIF6Iz2b8Dyz4oU84kI75F";

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
        String(now.getMinutes()).padStart(2, "0");

    const suffix =
        hours >= 12 ? "pm" : "am";

    hours %= 12;

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
   DECORATIVE ONLINE COUNT
===================================================== */

let listeners = 128;

setInterval(() => {

    if (!onlineNumber) return;

    listeners +=
        Math.floor(Math.random() * 3) - 1;

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

}, 6000);


/* =====================================================
   YOUTUBE IFRAME API
===================================================== */

window.onYouTubeIframeAPIReady = function () {

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
     * The iframe already contains the playlist URL.
     * We only attach the YouTube API to it.
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


/* =====================================================
   PLAYER READY
===================================================== */

function onPlayerReady() {

    console.log(
        "YouTube player ready."
    );

    playerReady = true;


    /*
     * Playlist is already loaded by the iframe URL.
     */

    setTimeout(
        updateTrackInformation,
        1500
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


            if (
                !playerReady ||
                !player
            ) {

                console.warn(
                    "YouTube player is not ready yet."
                );

                return;
            }


            console.log(
                "Starting music..."
            );


            /*
             * Called directly from the user's click.
             */

            player.playVideo();


            /*
             * Hide start screen.
             */

            if (startScreen) {

                startScreen.classList.add(
                    "hidden"
                );
            }

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

            if (
                !playerReady ||
                !player
            ) {

                return;
            }


            console.log(
                "Next track..."
            );


            player.nextVideo();

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


    switch (
        event.data
    ) {


        case YT.PlayerState.UNSTARTED:

            console.log(
                "YouTube playlist initializing..."
            );

            break;


        case YT.PlayerState.CUED:

            console.log(
                "Playlist successfully cued."
            );

            updateTrackInformation();

            break;


        case YT.PlayerState.PLAYING:

            console.log(
                "PLAYING"
            );


            /*
             * Show glass player only once
             * actual playback begins.
             */

            if (musicPlayer) {

                musicPlayer.classList.add(
                    "visible"
                );
            }


            if (playPause) {

                playPause.textContent =
                    "Ⅱ";
            }


            updateTrackInformation();

            break;


        case YT.PlayerState.PAUSED:

            console.log(
                "PAUSED"
            );


            if (playPause) {

                playPause.textContent =
                    "▶";
            }

            break;


        case YT.PlayerState.BUFFERING:

            console.log(
                "BUFFERING"
            );

            break;


        case YT.PlayerState.ENDED:

            console.log(
                "Track ended. Moving to next..."
            );


            if (player) {

                player.nextVideo();

            }

            break;

    }

}


/* =====================================================
   TRACK INFORMATION
===================================================== */

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
            "Could not read YouTube video data.",
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


/* =====================================================
   THUMBNAIL
===================================================== */

function updateThumbnail(
    videoId
) {

    if (!albumArt) {
        return;
    }


    /*
     * "videoseries" is the playlist container,
     * not an actual YouTube video ID.
     */

    if (
        !videoId ||
        videoId === "videoseries"
    ) {

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


    albumArt.src =
        url;
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
     * 100 = video unavailable
     * 101 = embedding disabled
     * 150 = embedding disabled
     */

    if (
        event.data === 100 ||
        event.data === 101 ||
        event.data === 150
    ) {

        console.warn(
            "This track cannot be embedded."
        );


        console.warn(
            "Trying the next track..."
        );


        setTimeout(
            function () {

                if (player) {

                    player.nextVideo();

                }

            },
            500
        );


        return;
    }


    /*
     * 2 = invalid parameter
     */

    if (
        event.data === 2
    ) {

        console.error(
            "Invalid YouTube player parameter."
        );

        return;
    }


    /*
     * 5 = HTML5 player error
     */

    if (
        event.data === 5
    ) {

        console.error(
            "YouTube HTML5 player error."
        );

    }

}
