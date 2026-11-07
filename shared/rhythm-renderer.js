const rhythmStartX = 100;
const rhythmEndX = 270;
const stemOffset = 9.7;
const flagOffset = 9.5;
const beamStartOffset = 10;
const beamEndOffset = 10.6;
const flagSize = 25;
const noteheadSize = 35;
const flagClearance = 0.6;
const restHorizontalAdjustment = -0.8;

const preferredWidths = {
    "sixteenth note": 1.8,
    "dotted sixteenth note": 2,
    "eighth note": 2.4,
    "dotted eighth note": 2.9,
    "eighth note triplet": 2.4,
    "quarter note triplet": 3.2,
    "quarter note": 3.5,
    "dotted quarter note": 4.5,
    "half note": 6,
    "dotted half note": 6.5,
    "whole note": 8.0
};

const svg = document.querySelector("svg");

const clefGlyph = document.createElementNS("http://www.w3.org/2000/svg", "text");
clefGlyph.setAttribute("x", 30);
clefGlyph.setAttribute("y", 70);
clefGlyph.setAttribute("font-family", "Bravura");
clefGlyph.setAttribute("font-size", 40);
clefGlyph.setAttribute("class", "clef-glyph");
svg.appendChild(clefGlyph);
clefGlyph.textContent = "\uE050";

function renderRhythm(rhythm) { //BIG OVERARCHING FUNCTION BRO

const oldNoteGroups = svg.querySelectorAll(".note-group");
oldNoteGroups.forEach(function(group) {
    group.remove();
});

const oldSymbols = svg.querySelectorAll(".note-adjacent-symbol");
oldSymbols.forEach(function(group) {
    group.remove();
});

let currentX = 0;

rhythm.forEach(function(note, index){
    note.x = currentX;

    const nextIsRest = index+1<rhythm.length && !rhythm[index+1].isNote;
    const isFlaggedDuration = note.isNote && (note.duration === 6 || note.duration === 3);
    if(nextIsRest && isFlaggedDuration){
        currentX += preferredWidths[note.name] + flagClearance;
    } else if (!note.isNote && note.duration !== 3) {
        currentX += preferredWidths[note.name] + restHorizontalAdjustment;
    } else {
    currentX += preferredWidths[note.name];
    }
});

const minimumGap = 2;
let minimumSpacingAdded = 0;
for (let index = 0; index < rhythm.length - 1; index ++){
    const gap = rhythm[index+1].x - rhythm[index].x;
    const adjustment = minimumGap - gap;
    if (gap < minimumGap){
        for(let i = index + 1; i < rhythm.length; i ++){
            rhythm[i].x += adjustment;
        }
    minimumSpacingAdded += adjustment;
    }
}
currentX += minimumSpacingAdded;

const xPerUnit = (rhythmEndX - rhythmStartX) / currentX;

const sixteenthAndTripletChecker = rhythm.some(function(note) {
    return note.duration === 3 || note.duration === 4;
}); 

const eighthChecker = rhythm.some(function(note) {
    return note.duration === 6;
});

rhythm.forEach(function(element, index) {
    const elementX = rhythmStartX + (element.x * xPerUnit); 
    element.svgX = elementX;
    const previousExists = index>0;
    let previousBeam = false;
    let previousWithinBoundary = false;
    if (previousExists) {
        const previousBeamable = rhythm[index-1].isNote && (rhythm[index-1].duration <=6 || (rhythm[index-1].duration === 9 && element.isNote && element.duration === 3));
        const previousQuarterRegion = Math.floor(rhythm[index-1].start / 12);
        const previousBeamBoundary = 12 * (previousQuarterRegion + 1);
        const previousHalfRegion = Math.floor(rhythm[index-1].start / 24); 
        const previousHalfBoundary = 24 * (previousHalfRegion + 1);
        if (sixteenthAndTripletChecker) {
            previousWithinBoundary = rhythm[index-1].start + rhythm[index-1].duration < previousBeamBoundary;
        } else {
            previousWithinBoundary = rhythm[index-1].start + rhythm[index-1].duration < previousHalfBoundary;
        }
        previousBeam = previousBeamable && previousWithinBoundary;
    }

    const nextExists = index + 1 <= rhythm.length - 1;
    const nextElementX = nextExists ? rhythmStartX + (rhythm[index+1].x * xPerUnit) : null;
    const nextNextExists = index + 2 <= rhythm.length - 1;
    const nextNextElementX = nextNextExists ? rhythmStartX + (rhythm[index+2].x * xPerUnit) : null;
    const currentBeamable = element.isNote && (element.duration <= 6 || (nextExists && element.duration === 9 && rhythm[index+1].isNote && rhythm[index+1].duration === 3) || (nextExists && element.duration === 3 && rhythm[index+1].isNote && rhythm[index+1].duration === 9));
    const nextBeamable = nextExists && rhythm[index+1].isNote && (rhythm[index+1].duration <= 6 || (element.duration === 3 && rhythm[index+1].isNote && rhythm[index+1].duration === 9));
    const quarterRegion = Math.floor(element.start / 12);
    const beamBoundary = 12 * (quarterRegion + 1);
    const halfRegion = Math.floor(element.start / 24);   // NEW
    const halfBoundary = 24 * (halfRegion + 1);
    let staysWithinBoundary;
    if (sixteenthAndTripletChecker) {
        staysWithinBoundary = element.start + element.duration < beamBoundary;
    } else {
        staysWithinBoundary = element.start + element.duration < halfBoundary;
    }
    let nextNextWithinBoundary = false;
    if (nextNextExists) {
        nextNextWithinBoundary = (rhythm[index+1].start + rhythm[index+1].duration <= beamBoundary) && (rhythm[index+2].start + rhythm[index+2].duration) <= beamBoundary;
    }

    const mixedTriplet = (element.triplet && nextExists && rhythm[index + 1].triplet && staysWithinBoundary && (element.duration != rhythm[index+1].duration)) ||
    (element.triplet && nextExists && nextNextExists &&
        rhythm[index + 1].triplet && rhythm[index + 2].triplet &&
        element.duration === 4 && rhythm[index + 1].duration === 4 && rhythm[index + 2].duration === 4 &&
        (!element.isNote || !rhythm[index + 1].isNote || !rhythm[index + 2].isNote) &&
        staysWithinBoundary && nextNextWithinBoundary //this is the logic for if one of the notes of a three eighth note triplet is a rest
    );
    
    const shouldBeam = nextExists && currentBeamable && nextBeamable && staysWithinBoundary;

    const newNoteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    newNoteGroup.setAttribute("class", "note-group");
    svg.appendChild(newNoteGroup); 

    const newNote = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newNote.setAttribute("x", elementX);
    newNote.setAttribute("font-family", "Bravura");
    newNote.setAttribute("font-size", noteheadSize);
    newNote.setAttribute("class", "note-head");
    newNoteGroup.appendChild(newNote);
    newNote.textContent= element.isNote ? element.note : element.rest;
    newNote.setAttribute ("y", element.isNote ? element.noteY : element.restY);

    if (element.duration < 48 && element.isNote) {
        const newStem = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newStem.setAttribute("x1", elementX + stemOffset);
        newStem.setAttribute("x2", elementX + stemOffset);
        newStem.setAttribute("y1", 70);
        newStem.setAttribute("y2", 45);
        newStem.setAttribute("class", "note-stem");
        newNoteGroup.appendChild(newStem);
    }  
    
    if ((element.duration === 9 || element.duration === 6 || element.duration === 4) && element.isNote && !(previousBeam || shouldBeam)) {
        const newEighthFlag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newEighthFlag.setAttribute("font-family", "Bravura");
        newEighthFlag.setAttribute("font-size", flagSize);
        newEighthFlag.setAttribute("class", "note-flag");
        newEighthFlag.setAttribute("x", elementX + flagOffset);
        newEighthFlag.setAttribute("y", 46);
        newEighthFlag.setAttribute("fill", "var(--ink)");
        newEighthFlag.textContent = "\uE240";
        newNoteGroup.appendChild(newEighthFlag);
    }

    if (element.duration === 3 && element.isNote && !(previousBeam || shouldBeam)) {
        const newSixteenthFlag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newSixteenthFlag.setAttribute("font-family", "Bravura");
        newSixteenthFlag.setAttribute("font-size", 30);
        newSixteenthFlag.setAttribute("class", "note-flag");
        newSixteenthFlag.setAttribute("x", elementX + flagOffset);
        newSixteenthFlag.setAttribute("y", 45);
        newSixteenthFlag.setAttribute("fill", "var(--ink)");
        newSixteenthFlag.textContent = "\uE242";
        newNoteGroup.appendChild(newSixteenthFlag);
    }
    
    if (element.duration === 36 || element.duration === 18 || element.duration === 9) {
        const newDot = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newDot.setAttribute("font-family", "Bravura");
        newDot.setAttribute("font-size", 31);
        newDot.setAttribute("class", "note-dot");
        if (element.duration === 9 && !shouldBeam && !nextBeamable && element.isNote){
            newDot.setAttribute("x", elementX + 17);
        } else {
         newDot.setAttribute("x", elementX + 13);
        }
        newDot.setAttribute("y", element.isNote ? 66 : 56);
        newDot.setAttribute("fill", "var(--ink)");
        newDot.textContent = "\uE044";
        newNoteGroup.appendChild(newDot);
    }

    if (shouldBeam) {
        const currentBeamX = elementX + beamStartOffset;
        const nextBeamX = nextElementX + beamEndOffset;
        const beamY = 46.82;
        const newBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newBeam.setAttribute("x1", currentBeamX);
        newBeam.setAttribute("x2", nextBeamX);
        newBeam.setAttribute("y1", beamY);
        newBeam.setAttribute("y2", beamY);
        newBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newBeam);
    }

    if (shouldBeam && element.duration === 3 && rhythm[index+1].duration === 3) {
        const currentSecondBeamX = elementX + beamStartOffset;
        const nextSecondBeamX = nextElementX + beamEndOffset;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", currentSecondBeamX);
        newSecondBeam.setAttribute("x2", nextSecondBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }

    if(shouldBeam && element.duration === 9 && rhythm[index+1].duration === 3){
        const currentSecondBeamX = elementX + beamStartOffset;
        const nextSecondBeamX = nextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.6;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", partialBeamX);
        newSecondBeam.setAttribute("x2", nextSecondBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }

    if(shouldBeam && element.duration === 3 && rhythm[index+1].duration === 9){
        const currentSecondBeamX = elementX + beamStartOffset;
        const nextSecondBeamX = nextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.4;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", currentSecondBeamX);
        newSecondBeam.setAttribute("x2", partialBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }
    //8th 16th 16threst
    if(element.isNote && nextNextExists && nextBeamable && nextNextWithinBoundary && element.duration === 6 && rhythm[index+1].duration === 3 && rhythm[index+1].isNote && rhythm[index+2].duration === 3 && !rhythm[index+2].isNote){
        const currentSecondBeamX = elementX + beamStartOffset;
        const nextSecondBeamX = nextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.6;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", partialBeamX);
        newSecondBeam.setAttribute("x2", nextSecondBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }

    //16th 8th 16threst
    if(element.isNote && nextNextExists && nextBeamable && nextNextWithinBoundary && element.duration === 3 && rhythm[index+1].duration === 6 && rhythm[index+1].isNote && rhythm[index+2].duration === 3 && !rhythm[index+2].isNote){
        const currentSecondBeamX = elementX + beamStartOffset;
        const nextSecondBeamX = nextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.4;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", currentSecondBeamX);
        newSecondBeam.setAttribute("x2", partialBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }
    //16threst 16th 8th
    if(!element.isNote && nextNextExists && nextBeamable && nextNextWithinBoundary && element.duration === 3 && rhythm[index+1].duration === 3 && rhythm[index+1].isNote && rhythm[index+2].duration === 6 && rhythm[index+2].isNote && (!previousExists || (previousExists && previousWithinBoundary))){
        const currentSecondBeamX = nextElementX + beamStartOffset;
        const nextSecondBeamX = nextNextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.4;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", currentSecondBeamX);
        newSecondBeam.setAttribute("x2", partialBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }
    //16threst 8th 16th
    if(!element.isNote && nextNextExists && nextBeamable && nextNextWithinBoundary && element.duration === 3 && rhythm[index+1].duration === 6 && rhythm[index+1].isNote && rhythm[index+2].duration === 3 && rhythm[index+2].isNote){
        const currentSecondBeamX = nextElementX + beamStartOffset;
        const nextSecondBeamX = nextNextElementX + beamEndOffset;
        const partialBeamX = currentSecondBeamX + (nextSecondBeamX - currentSecondBeamX) * 0.6;
        const secondBeamY = 51;
        const newSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondBeam.setAttribute("x1", partialBeamX);
        newSecondBeam.setAttribute("x2", nextSecondBeamX);
        newSecondBeam.setAttribute("y1", secondBeamY);
        newSecondBeam.setAttribute("y2", secondBeamY);
        newSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondBeam);
    }
    //16th 8th 16th
    if(nextNextExists && shouldBeam && nextNextWithinBoundary && element.duration === 3 && rhythm[index+1].duration === 6 && rhythm[index+2].isNote && rhythm[index+2].duration ===3){
        const currentFirstSecondBeamX = elementX + beamStartOffset;
        const nextFirstSecondBeamX = nextElementX + beamEndOffset;
        const partialFirstBeamX = currentFirstSecondBeamX + (nextFirstSecondBeamX - currentFirstSecondBeamX) * 0.4;
        const secondBeamY = 51;
        const newFirstSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newFirstSecondBeam.setAttribute("x1", currentFirstSecondBeamX);
        newFirstSecondBeam.setAttribute("x2", partialFirstBeamX);
        newFirstSecondBeam.setAttribute("y1", secondBeamY);
        newFirstSecondBeam.setAttribute("y2", secondBeamY);
        newFirstSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newFirstSecondBeam);

        const currentSecondSecondBeamX = nextElementX + beamStartOffset;
        const nextSecondSecondBeamX = nextNextElementX + beamEndOffset;
        const partialSecondBeamX = currentSecondSecondBeamX + (nextSecondSecondBeamX - currentSecondSecondBeamX) * 0.6;
        const newSecondSecondBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newSecondSecondBeam.setAttribute("x1", partialSecondBeamX);
        newSecondSecondBeam.setAttribute("x2", nextSecondSecondBeamX);
        newSecondSecondBeam.setAttribute("y1", secondBeamY);
        newSecondSecondBeam.setAttribute("y2", secondBeamY);
        newSecondSecondBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newSecondSecondBeam);
    }

    if (element.triplet && 
        nextExists && rhythm[index + 1].triplet && 
        nextNextExists && rhythm[index+2].triplet && 
        element.duration === 4 && rhythm[index+1].duration === 4 && rhythm[index+2].duration === 4 &&
        element.isNote && rhythm[index+1].isNote && rhythm[index+2].isNote &&
        staysWithinBoundary && nextNextWithinBoundary) {
        const newTripletNumber = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newTripletNumber.setAttribute("class", "note-adjacent-symbol");
        newTripletNumber.setAttribute("x", nextElementX + stemOffset);
        newTripletNumber.setAttribute("y", 38);
        newTripletNumber.setAttribute("font-family", "Bravura");
        newTripletNumber.setAttribute("font-size", 20);
        newTripletNumber.setAttribute("class", "triplet-number");
        newTripletNumber.setAttribute("text-anchor", "middle");
        newTripletNumber.setAttribute("fill", "var(--ink)")
        newTripletNumber.textContent = "\uE883";
        newNoteGroup.appendChild(newTripletNumber);
    }

    if (mixedTriplet) {
        const bracketStartX = elementX + 2.5; 
        let bracketEndX = nextElementX + stemOffset + 2.54;
        if(element.duration ===4 && rhythm[index+1].duration === 4) {
            if (rhythm[index+2].isNote) {
                bracketEndX = nextNextElementX + stemOffset + 2.2;
            }
            if (!rhythm[index+2].isNote) {
                bracketEndX = nextNextElementX + stemOffset;
            }
        }
        const bracketY = 40;
        const hookLength = 7;
        const newTripletBracket = document.createElementNS("http://www.w3.org/2000/svg", "path");
        newTripletBracket.setAttribute("class", "note-adjacent-symbol");
        newTripletBracket.setAttribute(
            "d",
            `M ${bracketStartX} ${bracketY}
             L ${bracketStartX} ${bracketY - hookLength}
             L ${bracketEndX} ${bracketY - hookLength}
             L ${bracketEndX} ${bracketY}`
        );

        newTripletBracket.setAttribute("fill", "none");
        newTripletBracket.setAttribute("stroke", "var(--ink)");
        newTripletBracket.setAttribute("stroke-width", 1.5);
        svg.appendChild(newTripletBracket);

        const newTripletNumber = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newTripletNumber.classList.add("note-adjacent-symbol");
        newTripletNumber.setAttribute("x", (bracketStartX + bracketEndX) / 2);
        newTripletNumber.setAttribute("y", bracketY - hookLength - 2);
        newTripletNumber.setAttribute("font-family", "Bravura");
        newTripletNumber.setAttribute("font-size", 20);
        newTripletNumber.classList.add("triplet-number");
        newTripletNumber.setAttribute("text-anchor", "middle");
        newTripletNumber.setAttribute("fill", "var(--ink)");
        newTripletNumber.textContent = "\uE883";
        svg.appendChild(newTripletNumber);  
    }


    if(element.tieStart && rhythm[index + 1].tieEnd) {
        const tieStartX = elementX + 4;
        const tieEndX = nextElementX + 4.7;
        const tieY = element.noteY + 5;
        const tieThickness = 3;
        const newTie = document.createElementNS("http://www.w3.org/2000/svg", "path");
        newTie.setAttribute("class", "note-adjacent-symbol");
        newTie.setAttribute("d", 
            `M ${tieStartX} ${tieY} 
            C ${tieStartX + 5} ${tieY + 5}, 
            ${tieEndX - 5} ${tieY + 5}, 
            ${tieEndX} ${tieY}
            C ${tieEndX - 4} ${tieY + tieThickness},
            ${tieStartX + 4} ${tieY + tieThickness},
            ${tieStartX} ${tieY}
            Z`);
        newTie.setAttribute("fill", "var(--ink)");
        svg.appendChild(newTie);
    }
});
}