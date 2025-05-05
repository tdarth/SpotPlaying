import { state } from "../variables";
import { fetch } from "../../../tska/polyfill/Fetch";
import Settings from "../../Settings";

function parseTimeToMs(timeStr) {
    const parts = timeStr.split(':').map(p => p.trim());
    let minutes = 0, seconds = 0;

    if (parts.length === 2) {
        minutes = parseInt(parts[0], 10);
        seconds = parseFloat(parts[1]);
    } else if (parts.length === 1) {
        seconds = parseFloat(parts[0]);
    }

    return Math.round((minutes * 60 + seconds) * 1000);
}

function convertLyricsTimestampsToMs(lyricsText) {
    return lyricsText.replace(/\[(\d{2}:\d{2}(\.\d{1,3})?)\]/g, (match, timeStr) => {
        const ms = parseTimeToMs(timeStr);
        return `[${ms}]`;
    });
}

export function getLyrics(title, artist) {
    fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`, {
        method: 'GET',
    })
        .then(response => {
            let data = JSON.parse(response);
            const converted = convertLyricsTimestampsToMs(data.syncedLyrics);

            const lines = converted.split('\n').map(line => {
                const match = line.match(/\[(\d+)\](.*)/);
                if (match) {
                    return { time: parseInt(match[1]), text: match[2].trim() };
                }
                return null;
            }).filter(Boolean);

            state.lyrics = lines;
            state.currentLyricLine = 0;
        })
        .catch(error => {
            if (error.includes("TrackNotFound")) { state.lyrics = null; state.currentLyricLine = 0; return; }
            ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
        });
}
