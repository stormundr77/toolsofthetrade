let currentClef = "treble";
let score = 0;
let totalQ = 0;
let streak = 0;
const bottomLineY = 80;
const halfSpacing = 5;

const clefGlyphs = {
    treble: "\uE050",
    bass: "\uE062",
    alto: "\uE05C"
};

const clefButtons = document.querySelectorAll(".clef-btn");
clefButtons.forEach(function(button){
    button.textContent = "";
    const glyphSpan = document.createElement("span");
    glyphSpan.className = "glyph";
    glyphSpan.textContent = clefGlyphs[button.dataset.clef];
    button.appendChild(glyphSpan);
    button.addEventListener("click", function() {
        currentClef = button.dataset.clef;
        newNote();
        resetRangeSliders();
        updateClefGlyph();
        updateRangeLabels();
        updateSliderFill();
    });
});

const clefs = {
  treble: { bottomLineNote: "E4", range: ["C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6"] },
  bass:   { bottomLineNote: "G2", range: ["E1","F1","G1","A1","B1","C2","D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4"] },
  alto:   { bottomLineNote: "F3", range: ["D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5"] }
};

const defaultRanges = {
    treble: { from: "C4", to: "A5" },
    bass: { from: "E2", to: "C4" },
    alto: { from: "D3", to: "B4" }
};

function resetRangeSliders() {
    const maxIndex = clefs[currentClef].range.length -1;
    const fromIndex = clefs[currentClef].range.indexOf(defaultRanges[currentClef].from);
    const toIndex = clefs[currentClef].range.indexOf(defaultRanges[currentClef].to);

    document.getElementById("rangeFrom").min = 0;
    document.getElementById("rangeFrom").max = maxIndex;
    document.getElementById("rangeFrom").value = fromIndex;
    document.getElementById("rangeTo").min = 0;
    document.getElementById("rangeTo").max = maxIndex;
    document.getElementById("rangeTo").value = toIndex; 
}


function updateClefGlyph () {
    clefGlyph.textContent = clefGlyphs[currentClef];
    if (currentClef == "treble") {
     clefGlyph.setAttribute("y", 70);
    }
    if (currentClef  == "bass") {
     clefGlyph.setAttribute("y", 50);
    }   
    if (currentClef  == "alto") {
     clefGlyph.setAttribute("y", 60);
    }
}

function letterIndex(letter) {
    return{C:0, D:1, E:2, F:3, G:4, A:5, B:6}[letter];
}

function universalStep(noteName) {
    const letter = noteName[0];
    const octave = parseInt(noteName.slice(-1));
    return octave * 7 + letterIndex(letter);
}

function translateNoteName(noteName) {
    const letter = noteName[0];
    const octave = noteName.slice(-1);
    return noteNamingSystems[currentNamingSystem][letter] + octave;
}

function updateRangeLabels() {
    const fromIndex = parseInt(document.getElementById("rangeFrom").value);
    const toIndex = parseInt(document.getElementById("rangeTo").value);
    document.getElementById("rangeFromLabel").textContent = translateNoteName(clefs[currentClef].range[fromIndex]);
    document.getElementById("rangeToLabel").textContent = translateNoteName(clefs[currentClef].range[toIndex]);
}

document.getElementById("rangeFrom").addEventListener("input", function(){
    const fromSlider = document.getElementById("rangeFrom");
    const toSlider = document.getElementById("rangeTo");
    if (parseInt(fromSlider.value) > parseInt(toSlider.value)) {
        fromSlider.value = toSlider.value;
    }
    updateRangeLabels();
    updateSliderFill();
});
document.getElementById("rangeTo").addEventListener("input", function() {
    const fromSlider = document.getElementById("rangeFrom");
    const toSlider = document.getElementById("rangeTo");
    if (parseInt(fromSlider.value) > parseInt(toSlider.value)) {
        fromSlider.value = toSlider.value;
    }
    updateRangeLabels();
    updateSliderFill();
});

let correctLetter;

function stepsAboveBottomLine(noteName, clefKey) {
    return universalStep(noteName) - universalStep(clefs[clefKey].bottomLineNote);
}

function noteNameToY_fromStep(step){
   return bottomLineY - (step * halfSpacing);
}

function noteNameToY(noteName, clefKey) {
    const step = stepsAboveBottomLine(noteName, clefKey);
    return noteNameToY_fromStep(step);
}

let currentLedgerLines = [];

function drawLedgerLines(noteName, clefKey){
    currentLedgerLines.forEach(function(line)  {
        svg.removeChild(line);
    });
    currentLedgerLines = []

    const step = stepsAboveBottomLine(noteName,clefKey);

    if (step < 0) {
        for (let s =-2; s>= step; s -=2) {
            currentLedgerLines.push(drawOneLedgerLine(s));
        }
    }
    if (step > 8) {
        for (let s = 10; s <= step; s += 2){
            currentLedgerLines.push(drawOneLedgerLine(s));
        }
    }
}

function drawOneLedgerLine(step) {
    const y = noteNameToY_fromStep(step);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 140);
    line.setAttribute("x2", 160);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("class", "staff-line");
    svg.appendChild(line);
    return line;
}

const svg = document.querySelector("svg");
const note = document.createElementNS("http://www.w3.org/2000/svg", "text");
note.setAttribute("x", 142);
note.setAttribute("font-family", "Bravura");
note.setAttribute("font-size", 38);
note.setAttribute("class", "note-head");
svg.appendChild(note);
note.textContent="\uE0A2";

const clefGlyph = document.createElementNS("http://www.w3.org/2000/svg", "text");
clefGlyph.setAttribute("x", 30);
clefGlyph.setAttribute("font-family", "Bravura");
clefGlyph.setAttribute("font-size", 40);
clefGlyph.setAttribute("class", "clef-glyph");
svg.appendChild(clefGlyph);

function newNote(){
   const fromIndex = parseInt(document.getElementById("rangeFrom").value);
   const toIndex = parseInt(document.getElementById("rangeTo").value);
   const span = toIndex - fromIndex + 1;
   const randomIndex = fromIndex + Math.floor(Math.random() * span)
   const chosenNote = clefs[currentClef].range[randomIndex];
   correctLetter = chosenNote[0];
   note.setAttribute("y", noteNameToY(chosenNote, currentClef));
   drawLedgerLines(chosenNote, currentClef);
}

function updateSliderFill() {
    const fromSlider = document.getElementById("rangeFrom");
    const toSlider = document.getElementById("rangeTo");
    const max = parseInt(fromSlider.max);
    const fromPercent = (parseInt(fromSlider.value) / max) *100;
    const toPercent = (parseInt(toSlider.value) / max) * 100;
    const fill = document.querySelector(".slider-fill");
    fill.style.left = fromPercent + "%";
    fill.style.width = (toPercent-fromPercent) + "%";
}

const namingSystemSelect = document.getElementById("namingSystemSelect");

const namingSystemLabels = {
  letters: { short: "Letters", full: "Letters: C, D, E, F, G, A, B" },
  solfege: { short: "Solfege", full: "Solfege: Do, Re, Mi, Fa, Sol, La, Si" },
  german_nordic: { short: "German/Nordic", full: "German/Nordic: C, D, E, F, G, A, H" }
};

function setDropdownLabels(mode) {
    const options = namingSystemSelect.querySelectorAll("option");
    options.forEach(function(option) {
        option.textContent = namingSystemLabels[option.value][mode];
    });
}

namingSystemSelect.addEventListener("mousedown", function() {
  setDropdownLabels("full");
});

namingSystemSelect.addEventListener("focus", function() {
  setDropdownLabels("full");
});

namingSystemSelect.addEventListener("blur", function() {
  setDropdownLabels("short");
});

namingSystemSelect.addEventListener("change", function() {
    currentNamingSystem = namingSystemSelect.value;
    setDropdownLabels("short");
    updateRangeLabels();
    updateSliderFill();
    if (showLabelsCheckbox.checked) {
        updateKeyLabels();
    }
});

const noteNamingSystems = {
  letters: { C: "C", D: "D", E: "E", F: "F", G: "G", A: "A", B: "B" },
  solfege: { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" },
  german_nordic :  { C: "C", D: "D", E: "E", F: "F", G: "G", A: "A", B: "H" }
};

let currentNamingSystem = "letters";

function updateKeyLabels() {
    keyButtons.forEach(function(button) {
        const letter = button.dataset.note;
        button.textContent = noteNamingSystems[currentNamingSystem][letter];
    });
}

const keyButtons = document.querySelectorAll(".key");
keyButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        if (button.dataset.note === correctLetter){
            flash("flash-correct");
            score = score + 1;
            streak = streak + 1;
            totalQ = totalQ + 1;
            console.log("Correct!");
            note.classList.add("pop-correct");
            setTimeout(function() {
                note.classList.remove("pop-correct");
                newNote();
            }, 300);
        }
        else {
            flash("flash-wrong");
            streak = 0;
            totalQ = totalQ + 1;
            console.log("Wrong - the correct answer was " + correctLetter);
            note.classList.add("pop-wrong");
            setTimeout(function() {
                note.classList.remove("pop-wrong");
                newNote();
            }, 300);
        }
        updateScoreDisplay();
    });
});

const showLabelsCheckbox = document.getElementById("showLabels");

showLabelsCheckbox.addEventListener ("change", function() {
    if (showLabelsCheckbox.checked) {
        updateKeyLabels();
    } else {
        keyButtons.forEach(function(button) {
            button.textContent = "";
        });
    }    
});


function flash(className) {
    document.body.classList.add(className);
    setTimeout(function() {
        document.body.classList.remove(className);
    }, 300);
}

function updateScoreDisplay() {
    const accuracy = totalQ === 0 ? 0 : parseInt(score/totalQ * 100);
    document.getElementById("scoreDisplay").textContent = "Score: " + score + " | Streak: " + streak + " | Accuracy: " + accuracy + "%";
}

updateClefGlyph();
resetRangeSliders();
updateRangeLabels();
updateKeyLabels();
setDropdownLabels("short");
updateSliderFill();
newNote();