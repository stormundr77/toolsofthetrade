const rhythmStartX = 100;
const rhythmEndX = 270;

const svg = document.querySelector("svg");

const clefGlyph = document.createElementNS("http://www.w3.org/2000/svg", "text");
clefGlyph.setAttribute("x", 30);
clefGlyph.setAttribute("y", 70);
clefGlyph.setAttribute("font-family", "Bravura");
clefGlyph.setAttribute("font-size", 40);
clefGlyph.setAttribute("class", "clef-glyph");
svg.appendChild(clefGlyph);
clefGlyph.textContent = "\uE050";

const rhythm = rhythmGenerator(legalBlocks);

const sixteenthChecker = rhythm.some(function(note) {
        return note.duration === 3;
    }); 

rhythm.forEach(function(element, index) {
    const previousExists = index>0;
    let previousBeam = false;
    if (previousExists) {
        const previousBeamable = rhythm[index-1].isNote && rhythm[index-1].duration <=6;
        const previousQuarterRegion = Math.floor(rhythm[index-1].start / 12);
        const previousBeamBoundary = 12 * (previousQuarterRegion + 1);
        let previousWithinBoundary;
        if (sixteenthChecker) {
            previousWithinBoundary = rhythm[index-1].start + rhythm[index-1].duration < previousBeamBoundary;
        } else {
            previousWithinBoundary = rhythm[index-1].start + rhythm[index-1].duration < 24;
        }
        previousBeam = previousBeamable && previousWithinBoundary;
    }

    const nextExists = index + 1 <= rhythm.length-1;
    const currentBeamable = element.isNote && element.duration <= 6;
    const nextBeamable = nextExists && rhythm[index+1].isNote && rhythm[index+1].duration <= 6;
    const quarterRegion = Math.floor(element.start / 12);
    const beamBoundary = 12 * (quarterRegion + 1);
    let staysWithinBoundary;
    if (sixteenthChecker) {
        staysWithinBoundary = element.start + element.duration < beamBoundary;
    } else {
        staysWithinBoundary = element.start + element.duration < 24;
    }
    console.log(element.start, element.duration, nextExists, currentBeamable, nextBeamable, staysWithinBoundary);
    const shouldBeam = nextExists && currentBeamable && nextBeamable && staysWithinBoundary;

    const newNoteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    newNoteGroup.setAttribute("class", "note-group");
    svg.appendChild(newNoteGroup); 

    const newNote = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newNote.setAttribute("x", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)));
    console.log("start:", element.start, "x:", newNote.getAttribute("x"));
    newNote.setAttribute("font-family", "Bravura");
    newNote.setAttribute("font-size", 38);
    newNote.setAttribute("class", "note-head");
    newNoteGroup.appendChild(newNote);
    newNote.textContent= element.isNote ? element.note : element.rest;
    newNote.setAttribute ("y", element.isNote ? element.noteY : element.restY);

    if (element.duration < 48 && element.isNote) {
        const newStem = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newStem.setAttribute("x1", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 10.3); //bravura notehead stem attachment offset value, adjusted for our SVG rendering
        newStem.setAttribute("x2", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 10.3);
        newStem.setAttribute("y1", 70);
        newStem.setAttribute("y2", 45);
        newStem.setAttribute("class", "note-stem");
        newNoteGroup.appendChild(newStem);
    }  
    
    if (element.duration === 6 && element.isNote && !(previousBeam || shouldBeam)) {
        const newEighthFlag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newEighthFlag.setAttribute("font-family", "Bravura");
        newEighthFlag.setAttribute("font-size", 30);
        newEighthFlag.setAttribute("class", "note-flag");
        newEighthFlag.setAttribute("x", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 10);
        newEighthFlag.setAttribute("y", 45);
        newEighthFlag.setAttribute("fill", "var(--ink)");
        newEighthFlag.textContent = "\uE240";
        newNoteGroup.appendChild(newEighthFlag);
    }

    if (element.duration === 3 && element.isNote && !(previousBeam || shouldBeam)) {
        const newSixteenthFlag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newSixteenthFlag.setAttribute("font-family", "Bravura");
        newSixteenthFlag.setAttribute("font-size", 30);
        newSixteenthFlag.setAttribute("class", "note-flag");
        newSixteenthFlag.setAttribute("x", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 10);
        newSixteenthFlag.setAttribute("y", 45);
        newSixteenthFlag.setAttribute("fill", "var(--ink)");
        newSixteenthFlag.textContent = "\uE242";
        newNoteGroup.appendChild(newSixteenthFlag);
    }
    
    if (element.dotted) {
        const newDot = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newDot.setAttribute("font-family", "Bravura");
        newDot.setAttribute("font-size", 31);
        newDot.setAttribute("class", "note-dot");
        newDot.setAttribute("x", rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 13);
        newDot.setAttribute("y", element.isNote ? 66 : 56);
        newDot.setAttribute("fill", "var(--ink)");
        newDot.textContent = "\uE044";
        newNoteGroup.appendChild(newDot);
    }

    if (shouldBeam) {
        const currentBeamX = rhythmStartX + (element.start * ((rhythmEndX - rhythmStartX) / 48)) + 10.3;
        const nextBeamX = rhythmStartX + (rhythm[index+1].start * ((rhythmEndX - rhythmStartX) / 48)) + 10.3;
        const beamY = 45;
        const newBeam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newBeam.setAttribute("x1", currentBeamX);
        newBeam.setAttribute("x2", nextBeamX);
        newBeam.setAttribute("y1", beamY);
        newBeam.setAttribute("y2", beamY);
        newBeam.setAttribute("class", "note-beam");
        newNoteGroup.appendChild(newBeam);
    }
});