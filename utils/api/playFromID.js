import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { showNotification } from "../notification";
import { getDeviceID } from "./getDeviceID";
import { getSong } from "./getSong";
import { getSpotifyToken } from "./getSpotifyToken";

export function playFromID(id, name) {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${Settings.settingsDeviceID}`, {
        method: 'Put',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        },
        body: {
            context_uri: `spotify:playlist:${id}`,
            offset: {
                position: 0
            }
        }
    })
        .then(() => {
            getSong();
            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Playing\n&f${name}&7.`, "push", 1);
        })
        .catch(error => {
            if (error.includes("The access token expired") || error.includes("Only valid bearer authentication supported") || error.includes("Invalid access token")) {
                if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                else return getSpotifyToken();
            }
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