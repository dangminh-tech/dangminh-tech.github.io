
/**
 * 1. Render songs
 * 2. Scrolltop
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playlist = $('.playlist');
const player = $('#player');
const dashboard = $('.dashboard');
const cd = $('.cd');
const cdWidth = cd.offsetWidth;
const current = $('.current-song');
const cd_thumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.play-pause');
const btnPrev = $('.previous');
const btnNext = $('.next');
const btnRandom = $('.random');
const progress = $('#progress');
const btnRepeat = $('.repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    alreadyPlayed: [],
    isFirstTime: true,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_CONFIG')) || {
        isRandom: false,
        isRepeat: false
    },
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem('PLAYER_CONFIG', JSON.stringify(this.config));
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        btnRandom.classList.toggle('active', this.isRandom);
        this.isRepeat = this.config.isRepeat;
        btnRepeat.classList.toggle('active', this.isRepeat);
    },
    songs: [
        {
            name: 'Enemy',
            author: 'Imagine Dragon',
            image: './assets/songs/enemy/lmht-imagine-dragons-tim-tran-hat-enemy-1.jpg',
            path: './assets/songs/enemy/Imagine Dragons x JID - Enemy (Lyrics).mp3'
        },
        {
            name: 'Bad Guy',
            author: 'Billie Eilish',
            image: './assets/songs/bad guy/badguy.jpg',
            path: './assets/songs/bad guy/Billie Eilish - bad guy (Lyrics).mp3'
        },
        {
            name: 'Chandelier',
            author: 'Sia',
            image: './assets/songs/chandelier/maxresdefault.jpg',
            path: './assets/songs/chandelier/Sia - Chandelier (Lyrics).mp3'
        },
        {
            name: 'Demons',
            author: 'Imagine Dragon',
            image: './assets/songs/demons/maxresdefault (1).jpg',
            path: './assets/songs/demons/Imagine Dragons - Demons lyrics.mp3'
        },
        {
            name: 'Save your tears',
            author: 'The Weeknd',
            image: './assets/songs/save yours tears/saveyourtear.jpg',
            path: './assets/songs/save yours tears/The Weeknd - Save Your Tears (Official Music Video).mp3'
        },
        {
            name: 'See you again',
            author: 'Wiz Khalifa ft. Charlie Puth',
            image: './assets/songs/see you again/download.jfif',
            path: './assets/songs/see you again/Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack.mp3'
        },
        {
            name: 'We don\'t talk anymore',
            author: 'Charlie Puth',
            image: './assets/songs/we dont talk anymore/52514.jpg',
            path: './assets/songs/we dont talk anymore/Charlie Puth - We Don\'t Talk Anymore (feat. Selena Gomez) [Official Video].mp3'
        },

    ],
    definesProperty() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadCurrentSong() {
        current.innerText = this.currentSong.name;
        cd_thumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    render() {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index='${index}'>
                <div class="image" style="background-image: url('${song.image}');">

                </div>
                <div class="info">
                    <h3 class="name">${song.name}</h3>
                    <p class="author">${song.author}</p>
                </div>
                <div class="setting">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = html.join('');
    },

    handelEvent() {
        const rotateCd = cd_thumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 15000,
            iterations: Infinity
        })
        rotateCd.pause();

        document.onscroll = (e) => {
            const scroll = document.documentElement.scrollTop;
            const newWidth = cdWidth - scroll > 0 ? cdWidth - scroll : 0;
            cd.style.width = newWidth + 'px';
            cd.style.opacity = newWidth / cdWidth;
        }

        playBtn.onclick = () => {
            if (!this.isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        }

        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add('playing');
            rotateCd.play();

        }

        audio.ontimeupdate = () => {
            let currentPostition = Math.floor(audio.currentTime / audio.duration * 100) || 0;
            progress.value = currentPostition;
        }

        progress.onchange = () => {
            audio.currentTime = progress.value * audio.duration / 100;
        }

        audio.onended = () => {
            if (this.isRepeat) {
            } else if (this.isRandom) {
                this.playRandomSong();
            } else {
                this.nextSong();
            }
            loadAndPlay();
            this.render();
            this.scrollToSong()
        }

        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove('playing');
            rotateCd.pause();
        }

        const loadAndPlay = () => {
            this.loadCurrentSong();
            rotateCd.play();
            audio.play();
        }

        btnNext.onclick = () => {
            audio.pause();
            if (this.isRandom) {
                this.playRandomSong();
            } else {
                this.nextSong();
            }
            loadAndPlay();
            this.render();
            this.scrollToSong()
        }

        btnPrev.onclick = () => {
            audio.pause();
            if (this.isRandom) {
                this.playRandomSong();
            } else {
                this.prevSong();
            }
            loadAndPlay();
            this.render();
            this.scrollToSong()
        }

        btnRandom.onclick = () => {
            this.randomSong();
        }

        btnRepeat.onclick = () => {
            this.repeatSong();
        }

        playlist.onclick = (e) => {
            let songNode = e.target.closest('.song:not(.active)');
            let options = e.target.closest('.setting');
            if (songNode && !options) {
                this.currentIndex = songNode.dataset.index;
                console.log(this.currentIndex, songNode.dataset.index)
                this.render();
                loadAndPlay();
            }
        }


    },
    scrollToSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView(
                {
                    behavior: "smooth",
                    block: "end",
                    inline: "center"
                }
            )
        }, 100);
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
    },
    randomSong() {
        this.isRandom = !this.isRandom;
        btnRandom.classList.toggle('active', this.isRandom);
        this.setConfig('isRandom', this.isRandom);
    },
    repeatSong() {
        this.isRepeat = !this.isRepeat;
        btnRepeat.classList.toggle('active', this.isRepeat);
        this.setConfig('isRepeat', this.isRepeat);
    },
    playRandomSong() {
        if (this.isFirstTime) {
            this.isFirstTime = false;
            this.alreadyPlayed.push(this.currentIndex);
        }
        let newIndex;
        if (this.alreadyPlayed.length === this.songs.length) {
            this.alreadyPlayed.splice(0);
        }
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.alreadyPlayed.includes(newIndex));
        this.currentIndex = newIndex;
        this.alreadyPlayed.push(this.currentIndex);
    },
    start() {
        this.definesProperty()
        this.loadCurrentSong();
        this.handelEvent();
        this.loadConfig();
        this.render();
    }
}


app.start();