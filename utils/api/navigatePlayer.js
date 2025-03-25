import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { getSong } from "./getSong";
import { showNotification } from "../notification";
import { getDeviceID } from "./getDeviceID";

export function navigatePlayer(method) {
    fetch(`https://api.spotify.com/v1/me/player/${method}?device_id=${Settings.settingsDeviceID}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        },
        body: {}
    })
        .then(() => {
            getSong();
            if (method == "next") showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song skipped.`, "push", 1);
            else showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Went back a song.`, "push", 1);
        })
        .catch(error => {
            if (error.includes("Player command failed: Restriction violated")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7The player cannot be\nnavigated at this time.`, "push", 2);
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