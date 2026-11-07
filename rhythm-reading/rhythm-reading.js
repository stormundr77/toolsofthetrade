const newRhythmButton = document.querySelector("#newRhythmButton");
const rangeTo = document.querySelector("#rangeTo");
let questionValue;
const questionDisplay = document.querySelector("#questionDisplay");
let attemptCounter;
let streak = 0;
let score = 0;
let totalQ = 0;

newRhythmButton.addEventListener("click", function() { 
    generateNewRhythm();
});

function generateNewRhythm() {
    attemptCounter = 0;
    const settings = getSettings();
    const legalBlocks = getLegalBlocks(settings);
    const rhythm = rhythmGenerator(legalBlocks);
    
    const questionTargets = getQuestionTargets(rhythm, settings);
    questionValue = questionGenerator(questionTargets);
    const questionPosition = questionPositions.find(position => position.start === questionValue);
    questionDisplay.textContent = `Where is ${questionPosition.name}?`;
    
    
    renderRhythm(rhythm);

    const interactiveAreas = getInteractiveAreas(settings, rhythm);
    drawInteractiveAreas(interactiveAreas);

    console.log("Interactive areas:", interactiveAreas);
}

function updateComplexityFill () {
    const slider = document.querySelector("#rangeTo");
    const fill = document.querySelector(".slider-fill");

    const percentage = ((slider.value-slider.min) / (slider.max-slider.min)) * 100;

    fill.style.width = percentage + "%";
}

function getInteractiveAreas(settings, rhythm) {
    const interactivePositions = [];
    const beatDivisions = beatDivisionChecker(rhythm);

    let subdivision;
    if (settings.sixteenthNotes) {
        subdivision = 3;
    } else if (settings.eighthNote || settings.pairEighths) {
        subdivision = 6;
    } else {
        subdivision = 12;
    }

    for (let beat = 0; beat < 4; beat++) {
        const beatStart = beat * 12;
        if (beatDivisions[beat]) {
            interactivePositions.push(
                beatStart,
                beatStart + 4,
                beatStart + 8
            );
        }
        else {
            for (let position = beatStart;
                 position < beatStart + 12;
                 position += subdivision) {
                interactivePositions.push(position);
            }
        }
    }

    const interactiveAreas = [];

    interactivePositions.forEach(function(targetStart, index) {
        const leftVisualX = getVisualX(targetStart, rhythm);
        const nextPosition = interactivePositions[index + 1];
        const rightVisualX = nextPosition ? getVisualX(nextPosition, rhythm) : rhythmEndX;
        interactiveAreas.push({start: targetStart, left: leftVisualX, right: rightVisualX})
    });

    return interactiveAreas;
}

function drawInteractiveAreas(interactiveAreas) {
    document.querySelectorAll('.interactive-area').forEach(element => element.remove());
    const viewBox = svg.viewBox.baseVal;
    interactiveAreas.forEach(function(area) {

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.classList.add("interactive-area");
        rect.setAttribute("x", area.left);
        rect.setAttribute("y", viewBox.y);
        rect.setAttribute("width", area.right - area.left);
        rect.setAttribute("height", viewBox.height);
        rect.setAttribute("fill", "transparent");
        rect.setAttribute("pointer-events", "all");
        svg.appendChild(rect);
        rect.addEventListener("click", function() {
            checkAnswer(area.start);
        });
    });
}

function getVisualX(position, rhythm){
    for (let rhythmindex = 0; rhythmindex < rhythm.length; rhythmindex ++) {
            const element = rhythm[rhythmindex];
            const elementEnd = element.start + element.duration;

            if (position >= element.start && position < elementEnd) {
                const nextElement = rhythm[rhythmindex + 1]
                const nextX = nextElement ? nextElement.svgX : rhythmEndX;
                const fraction = (position - element.start) / element.duration;
                const visualX = element.svgX + (nextX - element.svgX) * fraction;
                
                return visualX;
            }
        }
}


rangeTo.addEventListener("input", function() {
    currentLevel = Number(rangeTo.value);
    updateComplexityFill();
})

const questionPositions = [
    // Beat 1
    { start: 0, name: "beat 1" },
    { start: 3, name: "the e of 1" },
    { start: 4, name: "the trip- of 1" },
    { start: 6, name: "the and of 1" },
    { start: 8, name: "the -let of 1" },
    { start: 9, name: "the a of 1" },

    // Beat 2
    { start: 12, name: "beat 2" },
    { start: 15, name: "the e of 2" },
    { start: 16, name: "the trip- of 2" },
    { start: 18, name: "the and of 2" },
    { start: 20, name: "the -let of 2" },
    { start: 21, name: "the a of 2" },

    // Beat 3
    { start: 24, name: "beat 3" },
    { start: 27, name: "the e of 3" },
    { start: 28, name: "the trip- of 3" },
    { start: 30, name: "the and of 3" },
    { start: 32, name: "the -let of 3" },
    { start: 33, name: "the a of 3" },

    // Beat 4
    { start: 36, name: "beat 4" },
    { start: 39, name: "the e of 4" },
    { start: 40, name: "the trip- of 4" },
    { start: 42, name: "the and of 4" },
    { start: 44, name: "the -let of 4" },
    { start: 45, name: "the a of 4" }
];


function getQuestionTargets(rhythmArray, settings) {
    const questionTargets = [];
    if (settings.onlyOnBeatQuestions) {
        rhythmArray.forEach(function(element){
            questionTargets.push(element.start);
        });
    } else {
        beatDivisionChecker(rhythmArray).forEach(function(division,index) {
            const startPoint = index*12;
            if (division) {
                questionTargets.push(startPoint, startPoint + 4, startPoint + 8);
            }
            else{
                questionTargets.push(startPoint, startPoint + 3, startPoint + 6, startPoint + 9);
            }
        });
    }
    return questionTargets;
}

function questionGenerator (questionTargets){
    return questionTargets[Math.floor(Math.random() * questionTargets.length)];
}

function checkAnswer(answer){
   if (answer === questionValue){
        flash("flash-correct");
        score += 1;
        totalQ += 1;
        streak += 1;
        setTimeout(function(){
        generateNewRhythm();
        }, 300);
        updateScoreDisplay();
   }
   else {
    flash("flash-wrong");
    attemptCounter += 1;
    streak = 0;
    updateScoreDisplay();
    if (attemptCounter === 3) {
        totalQ += 1;
        setTimeout(function(){
        generateNewRhythm();
        }, 300);
        updateScoreDisplay();
    }
   }
}

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

function beatDivisionChecker(rhythmArray) {

    const firstBeat = rhythmArray.filter(function(element) {
        return element.start < 12;
    });

    const secondBeat = rhythmArray.filter(function(element) {
        return element.start >= 12 && element.start < 24;
    });

    const thirdBeat = rhythmArray.filter(function(element) {
        return element.start >= 24 && element.start < 36;
    });

    const fourthBeat = rhythmArray.filter(function(element) {
        return element.start >= 36;
    });

    const beatDivisions = [
        firstBeat.some(function(element) {return element.triplet;}),
        secondBeat.some(function(element) {return element.triplet;}),
        thirdBeat.some(function(element) {return element.triplet;}),
        fourthBeat.some(function(element) {return element.triplet;})
    ];

    return beatDivisions;
}


updateComplexityFill();