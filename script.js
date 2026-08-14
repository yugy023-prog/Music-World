// ========================================
// MUSIC WORLD - MUSIC SEARCH & PLAYER
// ========================================

// ---------- HTML ELEMENTS ----------

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


// ---------- VARIABLES ----------

let songs = [];
let currentSongIndex = -1;

let isShuffle = false;
let isRepeat = false;


// ========================================
// SEARCH MUSIC
// ========================================

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.trim();

    if (searchText === "") {
        musicList.innerHTML = "";
        songs = [];
        return;
    }

    searchMusic(searchText);

});


// ========================================
// GET MUSIC FROM API
// ========================================

async function searchMusic(query) {

    try {

        musicList.innerHTML = "<li>Searching...</li>";

        const url =
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        songs = data.results.filter(song => song.previewUrl);

        displaySongs(songs);

    }

    catch (error) {

        console.error("Search error:", error);

        musicList.innerHTML =
            "<li>Unable to load music. Try again.</li>";

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

    songArray.forEach((song, index) => {

        const li = document.createElement("li");

        li.className = "song";

        li.innerHTML = `
            
            <img 
                src="${song.artworkUrl100}"
                alt="${escapeHTML(song.trackName)}"
            >

            <div class="song-info">
                <h4>${escapeHTML(song.trackName)}</h4>
                <p>${escapeHTML(song.artistName)}</p>
            </div>

        `;

        // Click song
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
        return;
    }

    currentSongIndex = index;

    const song = songs[index];

    // Set audio
    audio.src = song.previewUrl;

    // Update information
    songTitle.textContent = song.trackName;
    artistName.textContent = song.artistName;

    // Play
    audio.play()
        .then(() => {

            updatePlayIcon();

        })
        .catch(error => {

            console.log("Playback error:", error);

        });

}


// ========================================
// PLAY / PAUSE
// ========================================

playBtn.addEventListener("click", function () {

    if (!audio.src) {

        if (songs.length > 0) {
            playSong(0);
        }

        return;

    }

    if (audio.paused) {

        audio.play();

    } else {

        audio.pause();

    }

});


// ========================================
// UPDATE PLAY ICON
// ========================================

audio.addEventListener("play", function () {

    updatePlayIcon();

});

audio.addEventListener("pause", function () {

    updatePlayIcon();

});


function updatePlayIcon() {

    if (audio.paused) {

        playIcon.classList.remove("fa-pause");
        playIcon.classList.add("fa-play");

    } else {

        playIcon.classList.remove("fa-play");
        playIcon.classList.add("fa-pause");

    }

}


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

    if (isShuffle) {

        nextIndex =
            Math.floor(Math.random() * songs.length);

    } else {

        nextIndex =
            currentSongIndex + 1;

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

    shuffleBtn.classList.toggle("active", isShuffle);

});


// ========================================
// REPEAT
// ========================================

repeatBtn.addEventListener("click", function () {

    isRepeat = !isRepeat;

    repeatBtn.classList.toggle("active", isRepeat);

});


// ========================================
// SONG ENDED
// ========================================

audio.addEventListener("ended", function () {

    if (isRepeat) {

        audio.currentTime = 0;
        audio.play();

    } else {

        playNextSong();

    }

});


// ========================================
// AUDIO DURATION
// ========================================

audio.addEventListener("loadedmetadata", function () {

    duration.textContent =
        formatTime(audio.duration);

});


// ========================================
// CURRENT TIME
// ========================================

audio.addEventListener("timeupdate", function () {

    if (!audio.duration) {
        return;
    }

    currentTime.textContent =
        formatTime(audio.currentTime);

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    progressFill.style.width =
        percentage + "%";

});


// ========================================
// PROGRESS BAR CLICK
// ========================================

progressBar.addEventListener("click", function (event) {

    if (!audio.duration) {
        return;
    }

    const width =
        progressBar.clientWidth;

    const clickPosition =
        event.offsetX;

    const percentage =
        clickPosition / width;

    audio.currentTime =
        percentage * audio.duration;

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

    const remainingSeconds =
        Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;

}


// ========================================
// PREVENT HTML IN SONG DATA
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}