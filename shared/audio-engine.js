const audioEngine = (() => {

let muted = true;
let audioContext;
const samples = new Map();
const samplePromises = new Map();

const pitchClasses = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
};

const noteNames = [
    "C", "Cs", "D", "Ds", "E", "F",
    "Fs", "G", "Gs", "A", "As", "B"
];

function getMidiNote(note) {
    const match = note.match(/^([A-G])([#b]?)(-?\d+)$/);

    if (!match) {return null;}

    const octave = Number(match[3]);
    const octaveConversion = (octave + 1) * 12;

    let accidental = 0;
    if (match[2] === "#") {accidental = 1;}
    if (match[2] === "b") {accidental = -1;}

    const midiNumber = octaveConversion + accidental + pitchClasses[match[1]];

    return midiNumber;
}

function getSampleName (midiNumber) {
    const noteName = noteNames[(midiNumber % 12)];
    const octave = Math.floor(midiNumber / 12) - 1;
    
    return noteName + octave + ".ogg";
}

async function loadSamples(notes) {
    const promises = [];

    for (const note of notes) {
        const midiNumber = getMidiNote(note);

        if (samples.has(midiNumber)) {
            continue;
        }

        if (samplePromises.has(midiNumber)) {
            promises.push(samplePromises.get(midiNumber));
            continue;
        }

        const sampleName = getSampleName(midiNumber);
        const samplePath = `../shared/audio/piano/${sampleName}`;

        const promise = fetch(samplePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${sampleName}`);
                }

                return response.arrayBuffer();
            })
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                samples.set(midiNumber, buffer);
            })
            .catch(error => {
                samplePromises.delete(midiNumber);
                throw error;
            });

        samplePromises.set(midiNumber, promise);
        promises.push(promise);
    }

    await Promise.all(promises);
}

async function preloadNotes(notes) {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    await loadSamples(notes);
}

async function initializeAudio() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }
}

async function toggleMute() {
    muted = !muted;

    if (!muted) {
        try {
            await initializeAudio();
        } catch (error) {
            muted = true;
            console.error("Audio initialization failed:", error);
        }
    }

    return muted;
}

function playNote(note) {
    if (muted || !audioContext || audioContext.state !== "running"){
        return;
    }

    const midiNumber = getMidiNote(note);
    const buffer = samples.get(midiNumber);

    if (!buffer) {
        console.warn(`Sample not found for ${note}`);
        return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
}

    return {
        toggleMute,
        playNote,
        preloadNotes,
        isMuted: () => muted
    };
})();