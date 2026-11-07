const noteTypes = {
    wholeNote: {name: "whole note", duration:48, note: "\uE0A2", rest: "\uE4E3", noteY: 70, restY: 50},
    dottedHalfNote: {name: "dotted half note", duration:36, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},
    halfNote: {name: "half note", duration:24, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},
    dottedQuarterNote: {name: "dotted quarter note", duration:18, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},
    /*halfNoteTriplet: {name: "half note triplet", duration:16, triplet: true, note: "\uE0A3", rest: "\uE4E4", noteY: 70, restY: 60},*/
    quarterNote: {name: "quarter note", duration:12, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},
    dottedEighthNote: {name: "dotted eighth note", duration:9, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
    quarterNoteTriplet: {name: "quarter note triplet", duration:8, triplet:true, note: "\uE0A4", rest: "\uE4E5", noteY: 70, restY: 60},
    eighthNote: {name: "eighth note", duration:6, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
    eighthNoteTriplet: {name: "eighth note triplet", duration:4, triplet:true, note: "\uE0A4", rest: "\uE4E6", noteY: 70, restY: 60},
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
    quarterEighthTriplet: {contents: [noteTypes.quarterNoteTriplet, noteTypes.eighthNoteTriplet]},
    eighthQuarterTriplet: {contents: [noteTypes.eighthNoteTriplet, noteTypes.quarterNoteTriplet]},
    dottedEighthSixteenth: {contents: [noteTypes.dottedEighthNote, noteTypes.sixteenthNote]},
    sixteenthDottedEighth: {contents: [noteTypes.sixteenthNote, noteTypes.dottedEighthNote]},
    twoSixteenthsEighth: {contents: [noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.eighthNote]},
    sixteenthEighthSixteenth: {contents: [noteTypes.sixteenthNote, noteTypes.eighthNote, noteTypes.sixteenthNote]},
    eighthTwoSixteenths: {contents: [noteTypes.eighthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote]},
    fourSixteenths: {contents: [noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote, noteTypes.sixteenthNote]}
};

const rhythmicGroups = {
    sixteenthNotes: [
        "dottedEighthSixteenth",
        "sixteenthDottedEighth",
        "twoSixteenthsEighth",
        "sixteenthEighthSixteenth",
        "eighthTwoSixteenths",
        "fourSixteenths"
    ],
    eighthNoteTripletGroup: [
        "eighthNoteTriplets",
        "quarterEighthTriplet",
        "eighthQuarterTriplet"
    ]
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


function booleanRandomizer() { 
    if(Math.random() >= 0.5) { 
        return true; 
    } else {return false;}
}

let legalBlocks = getLegalBlocks(getSettings());

function rhythmGenerator(legalBlocks){
    while(true) {
    const rhythmArray = [];
    let startPoint = 0;
    while (startPoint < 48) {
        const availableBlocks = legalBlocks.filter(function(block) {
            const fits = blockDuration(block) <= 48 - startPoint;
            const hasTriplet = block.contents.some(function(note) { return note.triplet; });
            return fits && (!hasTriplet || startPoint % 12 === 0);
        });
        const nextBlock = {...availableBlocks[Math.floor(Math.random() * availableBlocks.length)]};
        let currentStart = startPoint;
        nextBlock.contents.forEach(function(note) {
            const currentNote = {...note};
            currentNote.isNote = getSettings().rests ? booleanRandomizer() : true;
            currentNote.start = currentStart;
            currentStart += currentNote.duration;
            rhythmArray.push(currentNote);
            });
        startPoint += blockDuration(nextBlock);
    }

    let firstHalf = rhythmArray.filter(function(note) {
        return note.start < 24;
    });

    let secondHalf = rhythmArray.filter(function(note) {
        return note.start >= 24;
    });
    
    let firstHalfQuarterNoteEnforcement = firstHalf.some(function(note) {
        return note.duration === 3 || note.duration === 4;
    });

    let secondHalfQuarterNoteEnforcement = secondHalf.some(function(note) {
        return note.duration === 3 || note.duration === 4;
    });

    let halfMeasureEnforcer = rhythmArray.some(function(note) {
        return note.duration <=9;
    });


    if (halfMeasureEnforcer) {
        rhythmArray.forEach(function(note, index){
            if (note.start < 24 && note.start + note.duration > 24) {
                rhythmArray.splice(index, 1, ...noteSplitter(note, 24));
            }
        });
    }

    if (firstHalfQuarterNoteEnforcement) {
        rhythmArray.forEach(function(note, index){
            if (note.start < 12 && note.start + note.duration > 12) {
                rhythmArray.splice(index, 1, ...noteSplitter(note, 12));
            }
        });
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 0, 12);
            }
        }
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 12, 24);
            }
        }
    }

    if (secondHalfQuarterNoteEnforcement) {
        rhythmArray.forEach(function(note, index){
            if (note.start < 36 && note.start + note.duration > 36) {
                rhythmArray.splice(index, 1, ...noteSplitter(note, 36));
            }
        });
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 24, 36);
            }
        }
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 36, 48);
            }
        }
    }

    firstHalf = rhythmArray.filter(function(note) {
        return note.start < 24;
    });

    secondHalf = rhythmArray.filter(function(note) {
        return note.start >= 24;
    });
    
    firstHalfQuarterNoteEnforcement = firstHalf.some(function(note) {
        return note.duration === 3 || note.duration === 4;
    });

    secondHalfQuarterNoteEnforcement = secondHalf.some(function(note) {
        return note.duration === 3 || note.duration === 4;
    });

    halfMeasureEnforcer = rhythmArray.some(function(note) {
        return note.duration <=9;
    });

    if (halfMeasureEnforcer && !firstHalfQuarterNoteEnforcement) {
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 0, 24);
            }
        }
    }
    if (halfMeasureEnforcer && !secondHalfQuarterNoteEnforcement) {
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 24, 48);
            }
        }
    }

    if (!halfMeasureEnforcer && !firstHalfQuarterNoteEnforcement && !secondHalfQuarterNoteEnforcement){
        for (let index = 0; index < rhythmArray.length; index++) {
            if (!rhythmArray[index].isNote) {
                restCombiner(rhythmArray, index, 0, 48);
            }
        }
    }

    const hasNote = rhythmArray.some(function(element) {
        return element.isNote;
    });
    
    if(hasNote) {
    console.log(rhythmArray);
    return rhythmArray;
    }
}
}


function blockDuration(block) {
    let totalDuration = 0;
    block.contents.forEach(function(note){
        totalDuration += note.duration;
    });
    return totalDuration;
}

function durationMatcher(duration) {
    return Object.values(noteTypes).find(function(durationMatch) {
        return durationMatch.duration === duration;
    });
}

function noteSplitter (note, splitPoint) {
    const firstDuration = (splitPoint - note.start);
    const secondDuration = (note.start + note.duration - splitPoint);
    const firstNote = {...note, ...durationMatcher(firstDuration)};
    firstNote.start = note.start;
    if (note.isNote) {firstNote.tieStart = true};
    const secondNote = {...note, ...durationMatcher(secondDuration)};
    secondNote.start = splitPoint;
    if (note.isNote) {secondNote.tieEnd = true};
    return [firstNote, secondNote];
}

function restCombiner (rhythmArray, firstRestIndex, lowBoundary, highBoundary) {
    let numberOfRests = 0;
    let combinedRest = 0;
    for(let index = firstRestIndex; index < rhythmArray.length; index++) {

        if(rhythmArray[index].isNote || rhythmArray[index].start >= highBoundary || rhythmArray[index].start < lowBoundary) {
            break;
        }

        numberOfRests += 1;
        combinedRest += rhythmArray[index].duration;
    }
     if (numberOfRests === 0) {
        return;              // <-- nothing in range to merge, bail out
    }
    rhythmArray.splice(firstRestIndex, numberOfRests, {...durationMatcher(combinedRest), isNote: false, start: rhythmArray[firstRestIndex].start});
}
