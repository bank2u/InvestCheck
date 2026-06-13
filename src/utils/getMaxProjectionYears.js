export function getMaxProjectionYears(userAge) {
    const maxAge = 90;
    const minYears = 5;
    const maxYears = maxAge - userAge;
    return Math.max(minYears, maxYears);
}
