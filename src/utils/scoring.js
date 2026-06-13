export function calculateScore(answers) {
    let total = 0;
    for (let i = 1; i <= 10; i++) {
        if (answers[i] !== undefined) {
            total += answers[i];
        }
    }
    return total;
}
export function calculateRiskLevel(score) {
    if (score < 15)
        return 1;
    if (score < 22)
        return 2;
    if (score < 30)
        return 3;
    if (score < 37)
        return 4;
    return 5;
}
export function getScoreRange(level) {
    switch (level) {
        case 1: return '10-14';
        case 2: return '15-21';
        case 3: return '22-29';
        case 4: return '30-36';
        case 5: return '37-40';
    }
}
