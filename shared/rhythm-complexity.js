const complexityLevels = {
    1: {dottedHalfNote:true, halfNote:true, quarterNote:true, rests:false, onlyOnBeatQuestions: true},
    2: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, rests:false, onlyOnBeatQuestions: true},
    3: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, dottedQuarterEighth:true, rests:false,onlyOnBeatQuestions: true},
    4: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, dottedQuarterEighth:true, eighthNote:true, rests:true, onlyOnBeatQuestions: true},
    5: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, dottedQuarterEighth:true, eighthNote:false, sixteenthNotes:true, rests:true, onlyOnBeatQuestions: true},
    6: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, dottedQuarterEighth:true, eighthNote:false, sixteenthNotes:true, eighthNoteTripletGroup:true, rests:true, onlyOnBeatQuestions: true},
    7: {dottedHalfNote:true, halfNote:true, quarterNote:true, pairEighths:true, dottedQuarterEighth:true, eighthNote:true, sixteenthNotes:true, eighthNoteTripletGroup:true, rests:true, onlyOnBeatQuestions: false}
}

let currentLevel = 7;

function getSettings() {
    return complexityLevels[currentLevel];
}


/*let legalBlocks = getLegalBlocks(settings);

document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox){
    checkbox.addEventListener("change", function() {
        settings[checkbox.id] = checkbox.checked;
        legalBlocks = getLegalBlocks(settings);
        rhythmGenerator(legalBlocks);
    });
}); 


const settings = {
    quarterNote: true,
    halfNote: true,
    dottedHalfNote: true,
    dottedQuarterEighth: true,
    eighthNote: true,
    pairEighths: true,
    eighthNoteTripletGroup: true,
    sixteenthNotes: true
};

*/