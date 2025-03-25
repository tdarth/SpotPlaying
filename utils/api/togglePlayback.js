import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { getSong } from "./getSong";
import { showNotification } from "../notification";
import { getDeviceID } from "./getDeviceID";
import { state } from "../variables";

export function togglePlayback(method) {
    if (state.currentSongInfo.is_playing && method == "play") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Song is already playing!`, "push", 2);
    else if (!state.currentSongInfo.is_playing && method == "pause") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Song is already paused!`, "push", 2);

    fetch(`https://api.spotify.com/v1/me/player/${method}?device_id=${Settings.settingsDeviceID}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        },
        body: {},
        fullResponse: true
    })
        .then(() => {
            getSong();
            if (method == "play") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song unpaused.`, "push", 1);
            else return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song paused.`, "push", 1);
        })
        .catch(error => {
            if (error.includes("Player command failed: Restriction violated")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Slow down!`, "push", 2);
            if (error.includes("Device not found")) {
                if (Settings.settingsDiscordToken) {
                    return getDeviceID(true);
                } else {
                    return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid&r &cDevice ID&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                }
            }
            ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
        });
}