import { getSong } from "./api/getSong";
import { state } from "./variables";

export function updateLocalProgress() {
    if (state.currentSongInfo && state.currentSongInfo.is_playing) {
        const now = Date.now();
        const elapsed = now - state.lastUpdateTime;
        state.localProgress += elapsed;
        state.lastUpdateTime = now;

        if (!state.stopBarUpdating && state.localProgress >= state.currentSongInfo.duration_ms + 1000) {
            if (state.currentSongInfo.name === "Advertisement") return;
            state.stopBarUpdating = true;
            setTimeout(() => {
                getSong();
            }, 250);
            state.stopBarUpdating = true;
        }
    } else {
        state.lastUpdateTime = Date.now();
    }
}