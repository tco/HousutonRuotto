(function(window, document, undefined){

    var elements = [
        { id: "hip",                src: "materials/H_Lantio_Ruotimo.svg" },
        { id: "arm-left-elbow",     src: "materials/H_Kyynarvarsi_Ruotimo.svg" },
        { id: "arm-left-hand",      src: "materials/H_Kasi6_Ruotimo.svg" },
        { id: "torso",              src: "materials/H_Torso_Ruotimo.svg" },
        { id: "arm-right-shoulder", src: "materials/H_Olkavarsi_Ruotimo.svg" },
        { id: "arm-right-elbow",    src: "materials/H_Kyynarvarsi_Ruotimo.svg" },
        { id: "arm-right-hand",     src: "materials/H_Kasi6_Ruotimo.svg" },
        { id: "head",               src: "materials/H_Paa_muokattava_Ruotimo.svg" },
        { id: "eye-left",           src: "materials/H_Silma3.svg" },
        { id: "eye-right",          src: "materials/H_Silma5.svg" },
        { id: "mouth-s",            src: "materials/H_Suu_Ruotimo2.svg" },
        { id: "mouth-o",            src: "materials/H_Silma3.svg" },
        { id: "mouth-n",            src: "materials/H_Suu_Ruotimo.svg" },
        { id: "mouth-i",            src: "materials/H_Suu_Suvi.svg" },
        { id: "mouth-a",            src: "materials/H_Suu_Pasi3.svg" },
        { id: "mouth-u",            src: "materials/H_Silma5.svg" }
    ];

    function isArray(array) {
        return array && Object.prototype.toString.call(array) === '[object Array]';
    }

    function isEmptyArray(array) {
        return isArray(array) && array.length === 0;
    }

    function createAndAddElement(container, element, id) {
        var domElement = document.createElement(element);
        if(id) {
            domElement.id = id;
        } else {
            domElement.id = element;
        }
        container.appendChild(domElement);

        return domElement;
    }

    var Ruotto = window.Ruotto = function Ruotto(containerId, playButtonId) {
        var self = this;

        this.container = document.getElementById(containerId);
        this.playButton = document.getElementById(playButtonId);
        this.tracks = [];
        this.sequences = {};

        this.audio = createAndAddElement(this.container, 'audio');
        this.sequenceStarted = false;
        createAndAddElement(this.container, 'div', 'wall-left');
        createAndAddElement(this.container, 'div', 'wall-right');
        this.ruotto = createAndAddElement(this.container, 'div', 'ruotto');
        this.text = createAndAddElement(this.container, 'div', 'text');
        this.previousMouth = 'n';
        this.ruotto.classList.add(this.previousMouth);

        elements.forEach(function(part) {
            var ruottoPart = createAndAddElement(self.ruotto, 'img', part.id);
            ruottoPart.src = part.src;
        });

    };

    Ruotto.prototype.addTrack = function addTrack(track, sequence) {
        var self = this, sequences = self.sequences[track] || [];
        self.tracks.push(track);

        function addSequence(sequence) {
            if(isEmptyArray(sequence)) {
                sequences.push(sequence);
            } else {
                sequences = sequences.concat(sequence);
            }
            self.sequences[track] = sequences;
        }

        if(sequence) {
            addSequence(sequence)
        }

        return {
            addSequence: addSequence
        }
    };

    Ruotto.prototype.getRandomTrack = function getRandomTrack() {
        return this.tracks[Math.floor(Math.random() * this.tracks.length)];
    };

    Ruotto.prototype.runSequenceText = function runSequenceText(instruction) {
        if(instruction.text) {
            this.text.innerHTML = this.text.innerHTML + instruction.text + ' ';
        }
        if(!this.text.classList.contains('show')) {
            this.text.classList.add('show');
        }
    };

    Ruotto.prototype.runSequenceMouth = function runSequenceMouth(instruction) {
        this.ruotto.classList.remove(this.previousMouth);
        this.previousMouth = instruction.mouth;
        this.ruotto.classList.add(instruction.mouth);
    };

    Ruotto.prototype.runSequence = function runSequence(sequence) {
        var self = this;
        if(Math.floor(this.audio.currentTime) === 0 && !this.sequenceStarted) {
            this.sequenceStarted = true;
            sequence.forEach(function(instruction) {
                setTimeout(function() {
                    self.runSequenceMouth(instruction);
                    self.runSequenceText(instruction);
                }, instruction.timeout);
            });
        }
    };

    Ruotto.prototype.reset = function reset() {
        this.ruotto.classList.remove('reveal');
        this.playButton.classList.remove('hide');
        this.text.classList.remove('show');
        this.text.innerHTML = '';
        this.sequenceStarted = false;
        this.container.removeChild(this.audio);
        this.audio = createAndAddElement(this.container, 'audio');
    };

    Ruotto.prototype.play = function play(track) {
        var self = this;
        this.playButton.classList.add('hide');
        this.ruotto.classList.add('reveal');

        function play() {
            self.audio.currentTime = 0;
            self.audio.play();
        }

        function timeUpdate() {
            self.runSequence(self.sequences[track]);
        }

        this.audio.addEventListener('loadeddata', play);
        this.audio.addEventListener('timeupdate', timeUpdate);
        this.audio.addEventListener('ended', function() {
            self.audio.removeEventListener('loadeddata', play);
            self.audio.removeEventListener('timeupdate', timeUpdate);
            self.reset();
        });
        this.audio.src = track;
        this.audio.play();
    }

}(window, window.document));
