const noteTypes = {
    wholeNote: {name: "whole note", duration:48, note: "\uE0A2", rest: "\uE4E3", noteY: 70, restY: 50},
    dottedHalfNote: {name: "dotted half note", duration:36, dotted: true, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},
    halfNote: {name: "half note", duration:24, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},
    dottedQuarterNote: {name: "dotted quarter note", duration:18, dotted: true, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},
    /*halfNoteTriplet: {name: "half note triplet", duration:16, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},*/
    quarterNote: {name: "quarter note", duration:12, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},
    dottedEighthNote: {name: "dotted eighth note", duration:9, dotted: true, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
    /*quarterNoteTriplet: {name: "quarter note triplet", duration:8, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},*/
    eighthNote: {name: "eighth note", duration:6, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
    eighthNoteTriplet: {name: "eighth note triplet", duration:4, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
    sixteenthNote: {name: "sixteenth note", duration:3, note: "\uE0A4", rest: "\uE4E7", noteY: 70, restY: 60},
}

const rhythmicBlocks = {
    quarterNote: {contents: [noteTypes.quarterNote]},
    halfNote: {contents: [noteTypes.halfNote]},
    dottedHalfNote: {contents: [noteTypes.dottedHalfNote]},
    dottedQuarterEighth: {contents: [noteTypes.dottedQuarterNote, noteTypes.eighthNote]},
    eighthNote: {contents: [noteTypes.eighthNote]},
    pairEighths: {contents: [noteTypes.eighthNote, noteTypes.eighthNote]},
    eighthNoteTriplets: {contents: [noteTypes.eighthNoteTriplet, noteTypes.eighthNoteTriplet, noteTypes.eighthNoteTriplet]},
    dottedEighthSixteenth: {contents: [noteTypes.dottedEighthNote, noteTypes.sixteenthNote]},
    twoSixteenthsEighth: {contents: [noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.eighthNote]},
    sixteenthEighthSixteenth: {contents: [noteTypes.sixteenthNote, noteTypes.eighthNote, noteTypes.sixteenthNote]},
    eighthTwoSixteenths: {contents: [noteTypes.eighthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote]},
    fourSixteenths: {contents: [noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote]}
};

const rhythmicGroups = {
    sixteenthNotes: [
        "dottedEighthSixteenth",
        "twoSixteenthsEighth",
        "sixteenthEighthSixteenth",
        "eighthTwoSixteenths",
        "fourSixteenths"
    ]
};

const settings = {
    quarterNote: true,
    halfNote: true,
    dottedHalfNote: true,
    dottedQuarterEighth: true,
    eighthNote: true,
    pairEighths: true,
    eighthNoteTriplets: true,
    sixteenthNotes: true
};

function getLegalBlocks(settings){
    const settingNames = Object.keys(settings);
    const legalBlocks = [];
    settingNames.forEach(function(name) {
        if (name in rhythmicBlocks && settings[name] === true) {
        legalBlocks.push(rhythmicBlocks[name]);
        } else if (name in rhythmicGroups && settings[name] === true) { 
            rhythmicGroups[name].forEach(function(blockName) {
                legalBlocks.push(rhythmicBlocks[blockName]); });
        }
    });
    return legalBlocks;
}

let legalBlocks = getLegalBlocks(settings);

document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox){
    checkbox.addEventListener("change", function() {
        settings[checkbox.id] = checkbox.checked;
        legalBlocks = getLegalBlocks(settings);
        rhythmGenerator(legalBlocks);
    });
});

function booleanRandomizer() { 
    if(Math.random() >= 0.5) { 
        return true; 
    } else {return false;}
}


function rhythmGenerator(legalBlocks){
    const rhythmArray = [];
    let startPoint = 0;
    while (startPoint < 48) {
        const availableBlocks = legalBlocks.filter(function(block) {
            return blockDuration(block) <= 48 - startPoint;
        });
        const nextBlock = {...availableBlocks[Math.floor(Math.random() * availableBlocks.length)]};
        let currentStart = startPoint;
        nextBlock.contents.forEach(function(note) {
            const currentNote = {...note};
            currentNote.isNote = true;
            currentNote.start = currentStart;
            currentStart += currentNote.duration;
            rhythmArray.push(currentNote);
            });
        console.log(startPoint, "OLD");
        startPoint += blockDuration(nextBlock);
        console.log(startPoint, "NEW");
        console.log(blockDuration(nextBlock));
    }
    console.log(rhythmArray);
    return rhythmArray;
}


function blockDuration(block) {
    let totalDuration = 0;
    block.contents.forEach(function(note){
        totalDuration += note.duration;
    });
    return totalDuration;
}

function durationMatcher(duration) {
    return noteTypes.find(function(durationMatch) {
        return durationMatch.duration === duration;
    });
}

console.log(getLegalBlocks(settings));

/*function splitCondition (note){
            if (note.start < 24 && note.start + note.duration > 24 ) {
                return true;
        } else {return false;}
}

function noteSplitter (note) {
    const firstDuration = (24 - note.start);
    const secondDuration = (note.start + note.duration - 24);
    console.log(firstDuration, secondDuration);
    const firstNote = {...durationMatcher(firstDuration)};
    firstNote.start = note.start;
    if (note.isNote) {firstNote.tieStart = true};
    const secondNote = {...durationMatcher(secondDuration)};
    secondNote.start = 24;
    if (note.isNote) {secondNote.tieEnd = true};
    const splitterNoteReturn = [firstNote, secondNote];
    return splitterNoteReturn;
}*/