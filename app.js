/* =========================================================
   PRIVATE BUS PAATTU PETTI
   YouTube playlist + current song card
========================================================= */

"use strict";


/* =========================================================
   PLAYLIST
========================================================= */

const PLAYLIST_ID =
    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD";


/* =========================================================
   GLOBALS
========================================================= */

let player = null;
let youtubeReady = false;
let started = false;
let currentVideoId = null;


/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

const startScreen = $("start-screen");
const startButton = $("start-button");

const musicPlayer = $("music-player");
const playPause = $("play-pause");
const nextButton = $("next");

const songCard = $("song-card");
const songArt = $("song-art");
const songTitle = $("song-title");
const songArtist = $("song-artist");


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    const clock = $("clock");

    if (clock) {
        clock.textContent = time;
    }
}

updateClock();

setInterval(updateClock, 1000);


/* =========================================================
   DECORATIVE ONLINE COUNTER
========================================================= */

function updateOnlineCount() {

    const countElement =
        $("online-count");

    if (!countElement) {
        return;
    }

    const base = 128;

    const variation =
        Math.floor(Math.random() * 11) - 5;

    countElement.textContent =
        Math.max(
            120,
            base + variation
        );
}

updateOnlineCount();

setInterval(
    updateOnlineCount,
    30000
);


/* =========================================================
   YOUTUBE IFRAME API
========================================================= */

window.onYouTubeIframeAPIReady = function () {

    youtubeReady = true;

    console.log(
        "YouTube IFrame API loaded."
    );

    createPlayer();
};


/* =========================================================
   CREATE YOUTUBE PLAYER
========================================================= */

function createPlayer() {

    if (player) {
        return;
    }

    player = new YT.Player(
        "youtube-player",
        {

            width: "1",
            height: "1",

            playerVars: {

                /*
                 * EXACT PLAYLIST
                 */

                listType: "playlist",

                list:
                    "PLkX31-lqoSPdV5dI4SQPTYxxlwRiSOLzD",

                autoplay: 0,

                controls: 0,

                disablekb: 1,

                fs: 0,

                playsinline: 1,

                rel: 0,

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
}


/* =========================================================
   PLAYER READY
========================================================= */

function onPlayerReady() {

    console.log(
        "YouTube player ready."
    );

    try {

        player.setLoop(true);

    } catch (error) {

        console.warn(
            "Could not enable playlist looping.",
            error
        );
    }
}


/* =========================================================
   START MUSIC
========================================================= */

function startMusic() {

    if (!player || !youtubeReady) {

        console.warn(
            "YouTube player is not ready yet."
        );

        return;
    }

    started = true;

    console.log(
        "Starting playlist:",
        PLAYLIST_ID
    );

    try {

        player.playVideo();

    } catch (error) {

        console.error(
            "Could not start player:",
            error
        );
    }


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
}


/* =========================================================
   START BUTTON
========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startMusic
    );
}


/* =========================================================
   PLAYER STATE CHANGE
========================================================= */

function onPlayerStateChange(event) {

    console.log(
        "YouTube player state:",
        event.data
    );


    /* PLAYING */

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        if (musicPlayer) {

            musicPlayer.classList.add(
                "visible"
            );

            musicPlayer.classList.add(
                "is-playing"
            );
        }


        updateSongCard();
    }


    /* PAUSED */

    else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        if (musicPlayer) {

            musicPlayer.classList.remove(
                "is-playing"
            );
        }
    }


    /* ENDED */

    else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        if (musicPlayer) {

            musicPlayer.classList.remove(
                "is-playing"
            );
        }


        /*
         * Move to the next playlist item.
         */

        setTimeout(
            () => {

                try {

                    player.nextVideo();

                } catch (error) {

                    console.warn(
                        "Could not advance playlist.",
                        error
                    );
                }

            },
            300
        );
    }
}


/* =========================================================
   UPDATE CURRENT SONG CARD
========================================================= */

function updateSongCard() {

    if (
        !player ||
        typeof player.getVideoData !==
            "function"
    ) {

        return;
    }


    const data =
        player.getVideoData();


    if (
        !data ||
        !data.video_id
    ) {

        console.warn(
            "No current video data."
        );

        return;
    }


    const videoId =
        data.video_id;


    /*
     * Don't repeatedly reload the same
     * artwork when YouTube fires multiple
     * PLAYING events.
     */

    if (
        videoId === currentVideoId &&
        songCard &&
        songCard.classList.contains(
            "visible"
        )
    ) {

        return;
    }


    currentVideoId =
        videoId;


    const titleText =
        cleanYouTubeText(
            data.title
        ) ||
        "Unknown song";


    /*
     * YouTube's API exposes the channel/uploader
     * as "author". This is the closest reliable
     * artist field available through the IFrame API.
     */

    const artistText =
        cleanYouTubeText(
            data.author
        ) ||
        "YouTube";


    /*
     * Square YouTube thumbnail.
     *
     * hqdefault is more reliable than
     * maxresdefault because it exists for
     * most videos.
     */

    const thumbnail =
        `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;


    /* SONG TITLE */

    if (songTitle) {

        songTitle.textContent =
            titleText;
    }


    /* ARTIST / CHANNEL */

    if (songArtist) {

        songArtist.textContent =
            artistText;
    }


    /* ALBUM ART */

    if (songArt) {

        songArt.style.opacity =
            "0";


        songArt.onload =
            function () {

                songArt.style.opacity =
                    "1";
            };


        songArt.onerror =
            function () {

                /*
                 * Fallback thumbnail.
                 */

                songArt.onerror =
                    null;

                songArt.src =
                    `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/default.jpg`;
            };


        songArt.src =
            thumbnail;

        songArt.alt =
            titleText;
    }


    /* SHOW CARD */

    if (songCard) {

        songCard.classList.add(
            "visible"
        );
    }


    console.log(
        "Current song:",
        {
            videoId: videoId,
            title: titleText,
            artist: artistText,
            thumbnail: thumbnail
        }
    );
}


/* =========================================================
   CLEAN YOUTUBE TEXT
========================================================= */

function cleanYouTubeText(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

if (playPause) {

    playPause.addEventListener(
        "click",
        () => {

            if (!player) {
                return;
            }


            const state =
                player.getPlayerState();


            if (
                state ===
                YT.PlayerState.PLAYING
            ) {

                player.pauseVideo();

            } else {

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
        () => {

            if (!player) {
                return;
            }


            try {

                player.nextVideo();

            } catch (error) {

                console.error(
                    "Could not skip to next song:",
                    error
                );
            }
        }
    );
}


/* =========================================================
   YOUTUBE ERRORS
========================================================= */

function onPlayerError(event) {

    console.error(
        "YouTube error:",
        event.data
    );


    /*
     * These videos cannot normally be
     * embedded or played.
     */

    const skippableErrors = [
        2,
        5,
        100,
        101,
        150
    ];


    if (
        skippableErrors.includes(
            event.data
        )
    ) {

        console.warn(
            "Unavailable video. Skipping..."
        );


        setTimeout(
            () => {

                try {

                    player.nextVideo();

                } catch (error) {

                    console.error(
                        "Could not skip video.",
                        error
                    );
                }

            },
            700
        );
    }
}


/* =========================================================
   FALLBACK API DETECTION
========================================================= */

setTimeout(
    () => {

        if (
            !youtubeReady &&
            window.YT
        ) {

            youtubeReady = true;

            console.log(
                "YouTube API detected by fallback."
            );

            createPlayer();
        }

    },
    5000
);
