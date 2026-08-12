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


            player.playVideo();


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


    switch (event.data) {

        case YT.PlayerState.PLAYING:

            console.log(
                "PLAYING"
            );


            if (musicPlayer) {

                musicPlayer.classList.add(
                    "visible"
                );

                musicPlayer.classList.add(
                    "is-playing"
                );
            }


            if (playPause) {

                playPause.setAttribute(
                    "aria-label",
                    "Pause"
                );

                playPause.setAttribute(
                    "title",
                    "Pause"
                );
            }

            break;


        case YT.PlayerState.PAUSED:

            console.log(
                "PAUSED"
            );


            if (musicPlayer) {

                musicPlayer.classList.remove(
                    "is-playing"
                );
            }


            if (playPause) {

                playPause.setAttribute(
                    "aria-label",
                    "Play"
                );

                playPause.setAttribute(
                    "title",
                    "Play"
                );
            }

            break;


        case YT.PlayerState.BUFFERING:

            console.log(
                "BUFFERING"
            );

            break;


        case YT.PlayerState.CUED:

            console.log(
                "Playlist successfully cued."
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


        case YT.PlayerState.UNSTARTED:

            console.log(
                "YouTube playlist initializing..."
            );

            break;
    }
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


    if (event.data === 2) {

        console.error(
            "Invalid YouTube player parameter."
        );

        return;
    }


    if (event.data === 5) {

        console.error(
            "YouTube HTML5 player error."
        );
    }
}
