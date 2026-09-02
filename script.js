// ========================================
// MUSIC WORLD - AUDIUS VERSION
// ========================================
//
// NOTE ON THE CATALOG: Audius is a free, independent-artist library
// (open protocol, no signup / no API key needed to read from it).
// It has real songs across many moods and genres, but like Jamendo
// it is NOT a mirror of commercial Bollywood/Punjabi/major-label
// catalogs - those are licensed content and no free/legal API hands
// out their full audio. Search terms like "hindi", "punjabi", "love",
// "sad", "party" will return whatever independent tracks Audius has
// tagged that way, which is real but narrower than mainstream radio.
//


// ========================================
// API
// ========================================

// Audius is an open protocol - no client ID / API key needed.
// "app_name" is just a courtesy identifier for their stats, not a secret.
const API_BASE = "https://discoveryprovider.audius.co";
const APP_NAME = "MusicWorld";


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

const bgLayerA = document.getElementById("bg-layer-a");
const bgLayerB = document.getElementById("bg-layer-b");

const bgPickerBtn = document.getElementById("bg-picker-btn");
const bgFileInput = document.getElementById("bg-file-input");
const bgClearBtn = document.getElementById("bg-clear-btn");
const bgPickerLabel = document.getElementById("bg-picker-label");


// ========================================
// VARIABLES
// ========================================

let songs = [];

let currentSongIndex = -1;

let isShuffle = false;

let isRepeat = false;

let searchTimer;

// Custom background photos (chosen by the user from their own device)
let customBackgrounds = [];   // array of object URLs
let customBgIndex = 0;
let customBgTimer = null;

// Which of the two crossfade layers is currently on top
let activeBgLayer = "a";

const CUSTOM_BG_INTERVAL_MS = 8000; // how long each user photo stays on screen


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

            `${API_BASE}/v1/tracks/search` +

            `?query=${encodeURIComponent(query)}` +

            `&app_name=${APP_NAME}`;


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error("API request failed");

        }


        const data = await response.json();


        console.log("Audius API:", data);


        // Map Audius' track shape onto the same {name, artist_name, image, audio}
        // shape the rest of this file already expects, so nothing else changes.
        songs = (data.data || []).map(function (track) {

            const art = track.artwork || {};

            return {

                name: track.title,

                artist_name: track.user ? track.user.name : "Unknown Artist",

                image: art["480x480"] || art["1000x1000"] || art["150x150"] || "",

                audio: `${API_BASE}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`

            };

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
    //
    // If the user has picked their own photos, those keep running
    // as a slideshow and we leave them alone. Otherwise every new
    // song fades to its own album art.
    // ------------------------------------

    if (customBackgrounds.length === 0) {

        setBackground(song.image);

    }


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
// BACKGROUND: CROSSFADE BETWEEN TWO LAYERS
// ========================================

function setBackground(url) {

    const incoming = activeBgLayer === "a" ? bgLayerB : bgLayerA;
    const outgoing = activeBgLayer === "a" ? bgLayerA : bgLayerB;

    incoming.style.backgroundImage = `url("${url}")`;

    // Force the browser to fade the new layer in and the old one out
    incoming.classList.add("is-visible");
    outgoing.classList.remove("is-visible");

    activeBgLayer = activeBgLayer === "a" ? "b" : "a";

}


// ========================================
// BACKGROUND: USER'S OWN GALLERY PHOTOS
// ========================================

function startCustomSlideshow() {

    if (customBgTimer || customBackgrounds.length === 0) {

        return;

    }


    customBgIndex = 0;

    setBackground(customBackgrounds[customBgIndex]);


    customBgTimer = setInterval(function () {

        // Loop back to the first photo once we reach the end
        customBgIndex = (customBgIndex + 1) % customBackgrounds.length;

        setBackground(customBackgrounds[customBgIndex]);

    }, CUSTOM_BG_INTERVAL_MS);

}


function stopCustomSlideshow() {

    if (customBgTimer) {

        clearInterval(customBgTimer);

        customBgTimer = null;

    }

}


bgPickerBtn.addEventListener("click", function () {

    bgFileInput.click();

});


bgFileInput.addEventListener("change", function () {

    const files = Array.from(bgFileInput.files || []);

    if (files.length === 0) {

        return;

    }


    // Clean up any previously chosen photos first
    customBackgrounds.forEach(function (url) {

        URL.revokeObjectURL(url);

    });


    stopCustomSlideshow();


    customBackgrounds = files.map(function (file) {

        return URL.createObjectURL(file);

    });


    bgPickerLabel.textContent = `Background (${customBackgrounds.length})`;

    bgClearBtn.hidden = false;


    startCustomSlideshow();

});


bgClearBtn.addEventListener("click", function () {

    stopCustomSlideshow();


    customBackgrounds.forEach(function (url) {

        URL.revokeObjectURL(url);

    });


    customBackgrounds = [];

    bgPickerLabel.textContent = "Background";

    bgClearBtn.hidden = true;


    // Fall back to the current song's own album art, if any
    if (currentSongIndex !== -1 && songs[currentSongIndex]) {

        setBackground(songs[currentSongIndex].image);

    }

});


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