const PLAYLIST_ID =
    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";

let player = null;
let playerReady = false;
let playlistLoaded = false;


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
        String(now.getMinutes())
            .padStart(2, "0");

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

setInterval(updateClock, 1000);


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

            width: "1",
            height: "1",

            playerVars: {

                autoplay: 0,

                controls: 0,

                disablekb: 1,

                fs: 0,

                playsinline: 1,

                rel: 0,

                modestbranding: 1,

                listType: "playlist",

                list: PLAYLIST_ID,

                origin:
                    window.location.origin
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


    /*
     * Give YouTube time to create the iframe,
     * then explicitly tell the browser which
     * referrer policy to use.
     */

    setTimeout(() => {

        const iframe =
            document.querySelector(
                "#youtube-player iframe"
            );

        if (iframe) {

            iframe.setAttribute(
                "referrerpolicy",
                "strict-origin-when-cross-origin"
            );

            iframe.setAttribute(
                "allow",
                "autoplay; encrypted-media"
            );

            console.log(
                "YouTube iframe configured."
            );

        }

    }, 1000);
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
     * THIS IS THE IMPORTANT PART.
     *
     * We use the object syntax because PLAYLIST_ID
     * is a playlist ID, not an array of video IDs.
     */

    console.log(
        "Loading playlist:",
        PLAYLIST_ID
    );


    try {

        player.cuePlaylist({

            listType: "playlist",

            list: PLAYLIST_ID,

            index: 0

        });

    } catch (error) {

        console.error(
            "Playlist loading exception:",
            error
        );
    }
}


/* =====================================================
   START
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
                    "Player is not ready."
                );

                return;
            }


            console.log(
                "Starting music..."
            );


            /*
             * If the playlist has successfully cued,
             * this starts the first track.
             */

            player.playVideo();


            if (startScreen) {

                startScreen.classList.add(
                    "hidden"
                );
            }


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
                state === YT.PlayerState.PLAYING ||
                state === YT.PlayerState.BUFFERING
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


        case YT.PlayerState.CUED:

            console.log(
                "Playlist successfully cued."
            );

            playlistLoaded = true;

            updateTrackInformation();

            break;


        case YT.PlayerState.PLAYING:

            console.log(
                "Playing."
            );

            if (playPause) {
                playPause.textContent = "Ⅱ";
            }

            updateTrackInformation();

            break;


        case YT.PlayerState.PAUSED:

            console.log(
                "Paused."
            );

            if (playPause) {
                playPause.textContent = "▶";
            }

            break;


        case YT.PlayerState.BUFFERING:

            console.log(
                "Buffering..."
            );

            break;


        case YT.PlayerState.ENDED:

            console.log(
                "Track ended."
            );

            player.nextVideo();

            break;
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


    albumArt.src = url;
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
     * Error 2:
     * Invalid parameter.
     *
     * If we get this here, YouTube has rejected
     * the supplied playlist ID.
     */

    if (event.data === 2) {

        console.error(
            "YouTube rejected the playlist ID."
        );

        console.error(
            "Playlist:",
            PLAYLIST_ID
        );

        console.error(
            "This is no longer an autoplay/origin problem."
        );

        return;
    }


    /*
     * Skip unavailable videos.
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
            function () {

                if (player) {
                    player.nextVideo();
                }

            },
            700
        );
    }
}
setTimeout(() => {

    const youtubeIframe =
        document.querySelector(
            "#youtube-player iframe"
        );

    if (youtubeIframe) {

        youtubeIframe.setAttribute(
            "referrerpolicy",
            "strict-origin-when-cross-origin"
        );

        youtubeIframe.setAttribute(
            "allow",
            "autoplay; encrypted-media"
        );

        console.log(
            "YouTube iframe referrer policy configured."
        );

    } else {

        console.warn(
            "YouTube iframe not found yet."
        );

    }

}, 2000);
