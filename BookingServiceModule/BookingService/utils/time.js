function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function timesOverlap(s1, e1, s2, e2) {
    return toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2);
}

function isValidTime(t) {
    return /^\d{2}:\d{2}$/.test(t);
}

module.exports = { toMinutes, timesOverlap, isValidTime };
