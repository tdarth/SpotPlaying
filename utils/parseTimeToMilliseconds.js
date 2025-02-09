export function parseTimeToMilliseconds(timeStr) {
    const timeRegex = /^((\d+)m)?((\d+)s)?$/;
    const match = timeStr.match(timeRegex);

    if (match) {
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const seconds = match[4] ? parseInt(match[4], 10) : 0;
        return (minutes * 60 + seconds) * 1000;
    }

    if (!isNaN(timeStr)) {
        return parseInt(timeStr, 10);
    }

    return null;
}