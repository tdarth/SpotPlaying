import { state } from "../variables";
import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { getSpotifyToken } from "./getSpotifyToken";
import { getLyrics } from "./getLyrics";

let previousSongName = "";

export function getSong() {
    if (!Settings.npEnabled) return;
    state.stopBarUpdating = false;

    fetch("https://api.spotify.com/v1/me/player/", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`
        }
    })
        .then(response => {
            const data = JSON.parse(response);

            if (data) {
                let name = "Unknown";
                let artists = ["Local File"];
                let duration_ms = 0;

                if (data.currently_playing_type === "ad") {
                    name = "Advertisement";
                    artists = ["Time to buy premium!"];
                } else if (data.item) {
                    name = data.item.name || "Unknown";
                    artists = data.item.artists.map(artistStr => {
                        const nameMatch = artistStr.name ? artistStr.name : "Local File";
                        return nameMatch;
                    });
                    duration_ms = data.item.duration_ms || 0;
                }

                if (name !== previousSongName) {
                    getLyrics(name, artists.join(" "));
                    previousSongName = name;
                }

                state.currentSongInfo = {
                    name: name,
                    artists: artists,
                    duration_ms: duration_ms,
                    progress_ms: data.progress_ms || 0,
                    is_playing: data.is_playing || false,
                    currently_playing_type: data.currently_playing_type || "unknown",
                    volume_percent: data.device.volume_percent || 0,
                    song_image: data.item?.album?.images?.[Settings.npImageQuality]?.url || "https://picsum.photos/200"
                };

                const now = Date.now();
                const elapsed = now - state.lastUpdateTime;
                state.localProgress = state.currentSongInfo.progress_ms + elapsed;
                state.lastUpdateTime = now;
            } else {
                console.error("SpotPlaying Error: Invalid response structure:", data);
            }
        })
        .catch(error => {
            if (error.includes("The access token expired") || error.includes("Only valid bearer authentication supported") || error.includes("Invalid access token")) {
                if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                else return getSpotifyToken();
            }
            ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
        });
}
