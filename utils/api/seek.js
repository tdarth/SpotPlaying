import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { showNotification } from "../notification";
import { getSong } from "./getSong";
import { getDeviceID } from "./getDeviceID";

export function seek(time) {
    fetch(`https://api.spotify.com/v1/me/player/seek?device_id=${Settings.settingsDeviceID}&position_ms=${time}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        },
        body: {}
    })
        .then(() => {
            getSong();
            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song position set to\n&a${time}ms&r&7.`, "push", 1);
        })
        .catch(error => {
            if (error.includes("The access token expired") || error.includes("Only valid bearer authentication supported") || error.includes("Invalid access token")) {
                if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                else return getSpotifyToken();
            }
            if (error.includes("position_ms cannot be negative") || error.includes("position_ms must be a number")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7You can't seek to that time.`, "push", 5);
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