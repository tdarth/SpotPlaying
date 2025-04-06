import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { showNotification } from "../notification";

export function search(limit = 10, query) {
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        const data = JSON.parse(response);

        data.playlists.items.forEach(result => {
            const message = new Message(
                new TextComponent(`&a${result.name || "Unnamed"} &7(by ${result.owner?.display_name || "Unknown"}) &8(${result.tracks?.total || "0"} tracks)`).setClick("run_command", `/spot playfromid ${result.id} ${result.name || "Unnamed"}`).setHoverValue(`&8[&a&lSpot&r&2&oPlaying&r&8] &fClick to play &a${result.name || "Unnamed"}&f.`),
            );
            ChatLib.chat(message)
        });

        showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Showing results for query\n&f${query.replaceAll("%20", " ")}&7.`, "push", 2);
    })
    .catch(error => {
        if (error.includes("The access token expired") || error.includes("Only valid bearer authentication supported") || error.includes("Invalid access token")) {
            if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
            else return getSpotifyToken();
        }
        if (error.includes("Invalid limit")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7You can only search for\n&f0-50&r &7songs at one time.`, "push", 5);
        ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
    });
}