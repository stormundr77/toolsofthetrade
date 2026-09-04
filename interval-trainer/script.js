let score = 0;
let totalQ = 0;
let streak = 0;
let correctInterval;
let highernote;
let lowernote;
const minstep = 0;
const maxstep = 8;
const intervalNames = ["", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];




const svg = document.querySelector("svg");

const clefGlyph = document.createElementNS("http://www.w3.org/2000/svg", "text");
clefGlyph.setAttribute("x", 30);
clefGlyph.setAttribute("y", 70);
clefGlyph.setAttribute("font-family", "Bravura");
clefGlyph.setAttribute("font-size", 40);
clefGlyph.setAttribute("class", "clef-glyph");
svg.appendChild(clefGlyph);
clefGlyph.textContent = "\uE050";


const intervalButtons = document.querySelectorAll(".interval");
intervalButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        if (parseInt(button.dataset.interval) === correctInterval){
            flash("flash-correct");
            score = score + 1;
            streak = streak + 1;
            totalQ = totalQ + 1;
            console.log("Correct!");
            highernote.classList.add("pop-correct");
            lowernote.classList.add("pop-correct");
            setTimeout(function() {
                highernote.classList.remove("pop-correct");
                lowernote.classList.remove("pop-correct");
                newQuestion();
            }, 300);
        }
        else {
            flash("flash-wrong");
            streak = 0;
            totalQ = totalQ + 1;
            console.log("Wrong - the correct answer was " + correctInterval);
            highernote.classList.add("pop-wrong");
            lowernote.classList.add("pop-wrong")
            setTimeout(function() {
                highernote.classList.remove("pop-wrong");
                lowernote.classList.remove("pop-wrong");
                newQuestion();
            }, 300);
        }
        updateScoreDisplay();
    });
});

function newInterval(maxIntervalSteps) {
    const stepsApart = Math.floor(Math.random() * maxIntervalSteps) + 1;
    return stepsApart;
}

function newStartingStep(stepsApart) {
    const startingNoteRange = 8 - stepsApart;
    const startingNote = Math.floor(Math.random() * startingNoteRange);
    return startingNote;
}

function drawInterval (startingStep, stepsApart) {
    highernote = document.createElementNS("http://www.w3.org/2000/svg", "text");
    highernote.setAttribute("x", 170);
    highernote.setAttribute("font-family", "Bravura");
    highernote.setAttribute("font-size", 38);
    highernote.setAttribute("class", "note-head");
    svg.appendChild(highernote);
    highernote.textContent="\uE0A2";
    highernote.setAttribute ("y", stepsToY(startingStep + stepsApart));
    
    lowernote = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lowernote.setAttribute("x", 130);
    lowernote.setAttribute("font-family", "Bravura");
    lowernote.setAttribute("font-size", 38);
    lowernote.setAttribute("class", "note-head");
    svg.appendChild(lowernote);
    lowernote.textContent="\uE0A2";
    lowernote.setAttribute  ("y" , stepsToY(startingStep)); 
}

function newQuestion(){
    const notes = document.querySelectorAll(".note-head");
    notes.forEach(function(note) {
        note.remove();
    });
    const maxInterval = 7
    const interval = newInterval(maxInterval);
    correctInterval = interval + 1;
    const startingStep = newStartingStep(interval);
    drawInterval(startingStep, interval);
}



function stepsToY(steps){
    const bottomLineY = 80;
    const halfSpacing = 5;
    return bottomLineY - (halfSpacing*steps);
}

const toSlider = document.getElementById("rangeTo");

function updateRangeLabels() {
    const toValue = parseInt(toSlider.value);
    const intervalName = intervalNames[toValue];

    document.getElementById("rangeToLabel").textContent = intervalName;
}

toSlider.addEventListener("input", function(){
    updateRangeLabels();
    updateSliderFill();
});


function updateSliderFill() {
    const toSlider = document.getElementById("rangeTo");
    const toPercent = (parseInt(toSlider.value-1) / 6) * 100;
    const fill = document.querySelector(".slider-fill");
    fill.style.width = (toPercent + "%");
}


function updateScoreDisplay() {
    const accuracy = totalQ === 0 ? 0 : parseInt(score/totalQ * 100);
    document.getElementById("scoreDisplay").textContent = "Score: " + score + " | Streak: " + streak + " | Accuracy: " + accuracy + "%";
}


function flash(className) {
    document.body.classList.add(className);
    setTimeout(function() {
        document.body.classList.remove(className);
    }, 300);
}


newQuestion();
updateSliderFill();