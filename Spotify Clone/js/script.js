console.log('Hello World!');

let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds || seconds < 0)) {
        return 'Invalid Input';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <div>
                <img class="invert" src="img/music.svg" alt="music icon">
                <div class="info">
                    <div>${song.replaceAll('%20', ' ')}</div>
                    <div>Sarvesh</div>
                </div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach((element, index) => {
        element.addEventListener('click', () => {
            playMusic(element.querySelector('.info').firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = 'img/pause.svg';
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.cardContainer');

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        
        if (element.href.includes('/songs') && !element.href.includes('info.json')) {
            let folder = element.href.split('/').slice(-2)[0];

            // Get the metadeta of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                <img src="/songs/${folder}/cover.jpg" alt="Chillout Lounge">
                <div class="play">
                    <i class="fa fa-play" aria-hidden="true"></i>
                </div>
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>
            `;
        }
    };

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });

    });

}


async function main() {

    // Get the list of all the songs
    await getSongs("songs");
    folder = "songs";
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();


    // Attach an event listener to the play, next and previous buttons
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = 'img/pause.svg';
        }
        else {
            currentSong.pause();
            play.src = 'img/play.svg';
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector('.circle').style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Add an event listener to the seekbar
    document.querySelector('.seekbar').addEventListener('click', (event) => {
        let percent = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = `${percent}%`;
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Add an event listener for hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    // Add an event listener for hamburger
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-120%';
    });

    // Add event listener for previous buttons
    previous.addEventListener('click', () => {
        let currentIndex = songs.indexOf(currentSong.src.split(`/${folder}/`)[1]);
        if (currentIndex === 0) {
            currentIndex = songs.length;
        }
        playMusic(songs[currentIndex - 1]);
    });

    // Add event listener for next buttons
    next.addEventListener('click', () => {
        let currentIndex = songs.indexOf(currentSong.src.split(`/${folder}/`)[1]);
        if (currentIndex === songs.length - 1) {
            currentIndex = -1;
        }
        playMusic(songs[currentIndex + 1]);
    });

    // Add event listener for volume
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('input', (event) => {
        currentSong.volume = parseInt(event.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector('.volume>img').src = document.querySelector('.volume>img').src.replace('mute.svg', 'volume.svg');
        }
    });

    // Add event listener to mute track
    document.querySelector('.volume>img').addEventListener('click', (event) => {
        if (event.target.src.includes('volume.svg')) {
            event.target.src = event.target.src.replace('volume.svg', 'mute.svg');
            currentSong.volume = 0;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
        }
        else {
            event.target.src = event.target.src.replace('mute.svg', 'volume.svg');
            currentSong.volume = 0.10;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 10;
        }
    });


}

main();

