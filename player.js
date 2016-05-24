window.addEventListener('load', init, false);
var context;
var Player = {}

function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}


Player.load = function(filename) {
    if(this.sound) {
        this.sound.pause();
        this.src.src = filename;
    } else {
        this.sound = document.createElement("audio");
        this.sound.preload = "auto";

        var src = document.createElement("source");
        src.src = filename;
        this.src = src;
        this.sound.appendChild(src);
    }

    this.sound.load();
    this.speed  = 1.00;
    this.volume = 1.00;

    document.getElementById('speedRange').value = this.speed * 100;
    document.getElementById('speedField').value = this.speed.toFixed(2);
    document.getElementById('volumeRange').value = this.volume * 100;
    document.getElementById('volumeField').value = this.volume.toFixed(2);
}

Player.play = function() {
    if(!this.sound)
        return;

    this.sound.play();
}

Player.pause = function() {
    if(!this.sound)
        return;

    this.sound.pause();
}

Player.stop = function() {
    if(!this.sound)
        return;

    this.sound.pause();
    this.sound.load();
    this.sound.volume = this.volume;
    this.sound.playbackRate = this.speed;
}

Player.changeVolume = function(element) {
    if(!this.sound)
        return;

    var volumeSlider = document.getElementById("volumeRange");
    var volumeField  = document.getElementById("volumeField");

    // Non-linear volume control
    var volume = parseFloat(element.value) / parseFloat(element.max);
    volume = volume * volume;
    
    if(element == volumeSlider) {
        volumeField.value = volume;
        this.sound.volume = volume;
        this.volume = volume;
    } else if (element == volumeField) {
        // Check for valid input
        if(isFinite(volume) && volume <= element.max && volume >= element.min) {
            volumeSlider.value = volume * 100;
            this.sound.volume = volume;
            this.volume = volume;
        } else {
        // Revert if too high or low
            volumeField.value = this.volume;
        }
    } else {
        alert('Invalid element!');
    }
}

Player.changeSpeed = function(element) {
    if(!this.sound)
        return;

    var speedSlider = document.getElementById("speedRange");
    var speedField  = document.getElementById("speedField");
    var speed = parseFloat(element.value);

    if(element == speedSlider) {
        speed = speed / 100.0;
        speedField.value = speed;
        this.sound.playbackRate = speed;
        this.speed = speed;
    } else if(element == speedField) {
        // Check for valid input
        if(isFinite(speed) && speed <= element.max && speed >= element.min) {
            speedSlider.value = speed * 100;
            this.sound.playbackRate = speed;
            this.speed = speed;
        } else {
        // Revert if too high or low
            speedField.value = this.speed;
        }
    } else {
        alert('Invalid element!');
    }
}
