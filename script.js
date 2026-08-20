// ========================================
// MUSIC WORLD - JAMENDO VERSION
// ========================================


// ========================================
// API
// ========================================

// For testing only
const CLIENT_ID = "709fa152";


// ========================================
// HTML ELEMENTS
// ========================================

const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("musics");

const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");

const audio = document.getElementById("audio");

const playBtn = document.getElementById("play-btn");
const playIcon = document.getElementById("play-icon");

const previousBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");

const progressFill = document.getElementById("progress-fill");
const progressBar = document.getElementById("bar1");


// ========================================
// VARIABLES
// ========================================

let songs = [];

let currentSongIndex = -1;

let isShuffle = false;

let isRepeat = false;

let searchTimer;


// ========================================
// SEARCH MUSIC
// ========================================

searchInput.addEventListener("input", function () {

    const query = searchInput.value.trim();

    clearTimeout(searchTimer);

    if (query === "") {

        musicList.innerHTML = "";

        songs = [];

        return;

    }


    // Wait a little before API call
    searchTimer = setTimeout(function () {

        searchMusic(query);

    }, 500);

});


// ========================================
// SEARCH JAMENDO API
// ========================================

async function searchMusic(query) {

    try {

        musicList.innerHTML = "<li>Searching...</li>";


        const url =

            `https://api.jamendo.com/v3.0/tracks/` +

            `?client_id=${CLIENT_ID}` +

            `&format=json` +

            `&limit=20` +

            `&namesearch=${encodeURIComponent(query)}` +

            `&audioformat=mp32`;


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error("API request failed");

        }


        const data = await response.json();


        console.log("Jamendo API:", data);


        songs = data.results.filter(function (song) {

            return song.audio;

        });


        displaySongs(songs);

    }

    catch (error) {

        console.error("API ERROR:", error);

        musicList.innerHTML =

            "<li>Unable to load music.</li>";

    }

}


// ========================================
// DISPLAY SONGS
// ========================================

function displaySongs(songArray) {

    musicList.innerHTML = "";


    if (songArray.length === 0) {

        musicList.innerHTML =

            "<li>No songs found.</li>";

        return;

    }


    songArray.forEach(function (song, index) {

        const li = document.createElement("li");

        li.className = "song";


        li.innerHTML = `

            <img 
                src="${song.image}"
                alt="${escapeHTML(song.name)}"
            >

            <div class="song-info">

                <h4>${escapeHTML(song.name)}</h4>

                <p>${escapeHTML(song.artist_name)}</p>

            </div>

        `;


        // CLICK SONG

        li.addEventListener("click", function () {

            playSong(index);

        });


        musicList.appendChild(li);

    });

}


// ========================================
// PLAY SONG
// ========================================

function playSong(index) {

    if (!songs[index]) {

        console.log("Song not found");

        return;

    }


    currentSongIndex = index;

    const song = songs[index];


    console.log("Playing:", song.name);

    console.log("Audio URL:", song.audio);


    // ------------------------------------
    // UPDATE PLAYER TEXT
    // ------------------------------------

    songTitle.textContent = song.name;

    artistName.textContent = song.artist_name;


    // ------------------------------------
    // SET FULL AUDIO
    // ------------------------------------

    audio.src = song.audio;

    audio.load();


    // ------------------------------------
    // CHANGE BACKGROUND
    // ------------------------------------

    document.body.style.backgroundImage = `

        linear-gradient(
            rgba(0,0,0,0.70),
            rgba(0,0,0,0.88)
        ),

        url("${song.image}")

    `;


    document.body.style.backgroundSize = "cover";

    document.body.style.backgroundPosition = "center";

    document.body.style.backgroundAttachment = "fixed";

    document.body.style.backgroundRepeat = "no-repeat";


    // ------------------------------------
    // PLAY AUDIO
    // ------------------------------------

    audio.play()

        .then(function () {

            console.log("Music playing");

        })

        .catch(function (error) {

            console.error("AUDIO ERROR:", error);

        });

}


// ========================================
// PLAY / PAUSE
// ========================================

playBtn.addEventListener("click", function () {

    if (songs.length === 0) {

        return;

    }


    // No song selected

    if (currentSongIndex === -1) {

        playSong(0);

        return;

    }


    if (audio.paused) {

        audio.play();

    }

    else {

        audio.pause();

    }

});


// ========================================
// PLAY ICON
// ========================================

audio.addEventListener("play", function () {

    playIcon.classList.remove("fa-play");

    playIcon.classList.add("fa-pause");

});


audio.addEventListener("pause", function () {

    playIcon.classList.remove("fa-pause");

    playIcon.classList.add("fa-play");

});


// ========================================
// NEXT SONG
// ========================================

nextBtn.addEventListener("click", function () {

    playNextSong();

});


function playNextSong() {

    if (songs.length === 0) {

        return;

    }


    let nextIndex;


    // SHUFFLE MODE

    if (isShuffle) {

        nextIndex = Math.floor(

            Math.random() * songs.length

        );

    }

    else {

        nextIndex = currentSongIndex + 1;


        if (nextIndex >= songs.length) {

            nextIndex = 0;

        }

    }


    playSong(nextIndex);

}


// ========================================
// PREVIOUS SONG
// ========================================

previousBtn.addEventListener("click", function () {

    if (songs.length === 0) {

        return;

    }


    let previousIndex =

        currentSongIndex - 1;


    if (previousIndex < 0) {

        previousIndex = songs.length - 1;

    }


    playSong(previousIndex);

});


// ========================================
// SHUFFLE
// ========================================

shuffleBtn.addEventListener("click", function () {

    isShuffle = !isShuffle;


    shuffleBtn.classList.toggle(

        "active",

        isShuffle

    );


    console.log(

        "Shuffle:",

        isShuffle

    );

});


// ========================================
// REPEAT
// ========================================

repeatBtn.addEventListener("click", function () {

    isRepeat = !isRepeat;


    repeatBtn.classList.toggle(

        "active",

        isRepeat

    );


    console.log(

        "Repeat:",

        isRepeat

    );

});


// ========================================
// WHEN SONG ENDS
// ========================================

audio.addEventListener("ended", function () {

    if (isRepeat) {

        audio.currentTime = 0;

        audio.play();

    }

    else {

        playNextSong();

    }

});


// ========================================
// SONG DURATION
// ========================================

audio.addEventListener(

    "loadedmetadata",

    function () {

        duration.textContent =

            formatTime(audio.duration);

    }

);


// ========================================
// UPDATE PROGRESS BAR
// ========================================

audio.addEventListener(

    "timeupdate",

    function () {

        if (!audio.duration) {

            return;

        }


        currentTime.textContent =

            formatTime(audio.currentTime);


        const percentage =

            (audio.currentTime / audio.duration) * 100;


        progressFill.style.width =

            percentage + "%";

    }

);


// ========================================
// CLICK PROGRESS BAR
// ========================================

progressBar.addEventListener(

    "click",

    function (event) {

        if (!audio.duration) {

            return;

        }


        const rect =

            progressBar.getBoundingClientRect();


        const clickPosition =

            event.clientX - rect.left;


        const percentage =

            clickPosition / rect.width;


        audio.currentTime =

            percentage * audio.duration;

    }

);


// ========================================
// FORMAT TIME
// ========================================

function formatTime(seconds) {

    if (isNaN(seconds)) {

        return "0:00";

    }


    const minutes =

        Math.floor(seconds / 60);


    const secondsLeft =

        Math.floor(seconds % 60);


    return `${minutes}:${secondsLeft

        .toString()

        .padStart(2, "0")}`;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}