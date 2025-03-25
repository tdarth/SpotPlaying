import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { showNotification } from "../notification";

export function getSpotifyToken(forceMsg = false) {
    if (forceMsg) showNotification(`${Settings.chatPrefix}`, `&8Updating your Spotify Token..`, "push", 1);
    fetch(`https://discord.com/api/v9/users/@me/connections/spotify/${Settings.settingsSpotifyUserId}/access-token`, {
        method: 'GET',
        headers: {
            'Authorization': `${Settings.settingsDiscordToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        const data = JSON.parse(response);

        if (data.access_token) Settings.settingsPremiumSpotToken = data.access_token;
        else showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Token not found.`, "push", 5);

        if (forceMsg) showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Updated your&r &aSpotify Token&7.`, "push", 1);
    })
    .catch(error => {
        if (error.includes("Unauthorized")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cDiscord Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
        if (error.includes("405: Method Not Allowed")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid&r &cSpotify Account ID&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
        if (error.includes("Unknown Connection")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Please link your&r &cSpotify Account&r&7 to your&r &cDiscord Account&r&7.`, "push", 5);
        ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
    });
}