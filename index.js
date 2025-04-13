import Settings from "./Settings";

import { openSpotify } from "./utils/openSpotify";
import { getSpotifyToken } from "./utils/api/getSpotifyToken";
import { getVersion } from "./utils/getVersion";
import { parseTimeToMilliseconds } from "./utils/parseTimeToMilliseconds";
import { tutorial } from "./utils/tutorial";
import { getDeviceID } from "./utils/api/getDeviceID";
import { showNotification } from "./utils/notification";
import { search } from "./utils/api/search";
import { togglePlayback } from "./utils/api/togglePlayback";
import { state } from "./utils/variables";
import { getSong } from "./utils/api/getSong";
import { setVolume } from "./utils/api/setVolume";
import { seek } from "./utils/api/seek";
import { navigatePlayer } from "./utils/api/navigatePlayer";
import { displaySongInfo } from "./render/overlay";
import { updateLocalProgress } from "./utils/updateLocalProgress";
import { playFromID } from "./utils/api/playFromID";
import "./render/dragGui";
import "./utils/keybinds";
import "./utils/chatCommand";

const version = getVersion();

let stopLoop = false;

function pingApi() {
    if (stopLoop) return;

    if (Settings.npEnabled) {
        getSong();
    }
    setTimeout(() => {
        pingApi();
    }, Number(Settings.apiPingRate));
}

register("renderOverlay", () => {
    updateLocalProgress();

    if (state.currentSongInfo && Settings.npEnabled) {
        displaySongInfo(Settings.npOverlayX, Settings.npOverlayY);
    }
});

register("gameUnload", () => {
    stopLoop = true;
});

register("command", (...arg) => {
    if (!arg) return Settings.openGUI();

    arg[0] = arg[0].toLowerCase();
    if (arg[0] != "playfromid" && arg[1]) arg[1] = arg[1].toLowerCase();

    switch (arg[0]) {
        case "copy":
            if (arg[1] === "artist" || arg[1] === "artists") {
                showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Copied&r &a${state.currentSongInfo.artists.join(", ")}&r&7 to clipboard.`, "push", 3);
                return ChatLib.command(`ct copy ${state.currentSongInfo.artists.join(", ")}`, true);
            }
            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Copied&r &a${state.currentSongInfo.name}&r&7 to clipboard.`, "push", 3);
            ChatLib.command(`ct copy ${state.currentSongInfo.name}`, true);
            break;
        case "open":
            openSpotify();
            break;
        case "version":
        case "ver":
            showNotification(`${Settings.chatPrefix}`, `&7Using Version &f${version}&7.`, "push", 3);
            break;
        case "pause":
            togglePlayback("pause");
            break;
        case "play":
        case "unpause":
            togglePlayback("play");
            break;
        case "playfromid":
            if (!arg[1] && !arg[2]) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot playfromid <playlist_id>\n&c<name>&7.`, "push", 3);
            const playlistId = arg[1];
            const playlistName = arg.slice(2).join(" ");
            playFromID(playlistId, playlistName);
            break;
        case "next":
        case "skip":
            if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
            navigatePlayer("next")
            break;
        case "previous":
        case "prev":
        case "rewind":
            if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
            navigatePlayer("previous");
            break;
        case "seek":
            if (!arg[1]) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot seek <time>&7.`, "push", 3);
            const milliseconds = parseTimeToMilliseconds(arg[1]);
            if (milliseconds !== null) {
                if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
                seek(milliseconds);
            } else {
                showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid time format.\n&f"1m30s", "53s", or milliseconds.`, "push", 3);
            }
            break;
        case "volume":
        case "vol":
            if (arg[1] && !isNaN(arg[1])) {
                setVolume(arg[1]);
            } else {
                showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot volume <1-100>&7.`, "push", 3);
            }
            break;
        case "token":
            getSpotifyToken(true);
            break;
        case "tutorial":
            if (!arg[1]) {
                tutorial();
            } else if (arg[1] === "2" || arg[1] === "3" || arg[1] === "4") {
                tutorial(Number(arg[1]));
            } else if (arg[1] === "5") {
                showNotification(`${Settings.chatPrefix}`, `&8Attempting to setup module..`, "push", 7);
                getSpotifyToken(true);
                setTimeout(() => {
                    getDeviceID(true)
                    setTimeout(() => {
                        if (Settings.settingsPremiumSpotToken && Settings.settingsDeviceID) {
                            ChatLib.chat(`\n\n${Settings.chatPrefix}&fModule &asuccessfully setup &fwithout errors! Try putting on some music!\n&7Type &8/spot info &7for a list of commands.\n\n`)
                            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Success!\n&aThe module is now setup.`, "push", 2);
                            Settings.npEnabled = true;
                        } else {
                            ChatLib.chat(`\n\n${Settings.chatPrefix}&cAn error occured during setup.\n&4If multiple devices showed up, select the correct one and enable the overlay in /spot. If none showed up, make sure the desktop app is open.\n&4If you still get errors, go through the tutorial again. &c/spot tutorial&4.\n\n`)
                            showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Error during setup.`, "push", 1);
                        }
                    }, 2500);
                }, 2500);
            } else {
                tutorial();
            }
            break;
        case "device":
        case "deviceid":
            getDeviceID(true);
            break;
        case "info":
        case "commands":
        case "cmds":
            ChatLib.chat(`${Settings.chatPrefix}&f/spot &7<copy | device | info | open | pause | play | playfromid <id> | next | previous | search <query> <limit> | seek <time> | send <all/party/guild> | token | tutorial | version | volume <1-100>>`);
            break;
        case "search":
            if (!arg[1] || !arg[2]) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot search <limit> <query>&7.`, "push", 3);
            if (isNaN(arg[1])) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot search <limit> <query>&7.`, "push", 3);
            search(arg[1], arg.slice(2).join("%20"));
            break;
        case "setup":
            showNotification(`${Settings.chatPrefix}`, `&8Attempting to setup module..`, "push", 7);
            getSpotifyToken(true);
            setTimeout(() => {
                getDeviceID(true)
                setTimeout(() => {
                    if (Settings.settingsPremiumSpotToken && Settings.settingsDeviceID) {
                        ChatLib.chat(`\n\n${Settings.chatPrefix}&fModule &asuccessfully setup &fwithout errors! Try putting on some music!\n&7Type &8/spot info &7for a list of commands.\n\n`)
                        showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Success!\n&aThe module is now setup.`, "push", 2);
                        Settings.npEnabled = true;
                    } else {
                        ChatLib.chat(`\n\n${Settings.chatPrefix}&cAn error occured during setup.\n&4If multiple devices showed up, select the correct one and enable the overlay in /spot. If none showed up, make sure the desktop app is open.\n&4If you still get errors, go through the tutorial again. &c/spot tutorial&4.\n\n`)
                        showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Error during setup.`, "push", 1);
                    }
                }, 2500);
            }, 2500);
            break;
        case "send":
            if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
            if (!arg[1] || arg[1] === "party") {
                showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Sent playing song to &aParty&r\n&7chat.`, "push", 2);
                ChatLib.command(`pc I'm listening to: ${state.currentSongInfo.name} by ${state.currentSongInfo.artists.join(", ")} on /ct import SpotPlaying.`)
            } else if (arg[1] === "guild") {
                showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Sent playing song to &aGuild&r\n&7chat.`, "push", 2);
                ChatLib.command(`gc I'm listening to: ${state.currentSongInfo.name} by ${state.currentSongInfo.artists.join(", ")} on /ct import SpotPlaying.`)

            } else if (arg[1] === "all") {
                showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Sent playing song to &aAll&r\n&7chat.`, "push", 2);
                ChatLib.command(`ac I'm listening to: ${state.currentSongInfo.name} by ${state.currentSongInfo.artists.join(", ")} on /ct import SpotPlaying.`)
            }
            break;
        default:
            ChatLib.chat(`${Settings.chatPrefix}&cInvalid command.\n&7Usage: /spot <copy | device | info | open | version | pause | play | playfromid <id> | next | previous | search <query> <limit> | seek <time> | send <all/party/guild> | token | tutorial | volume <1-100>>`);
    }
}).setName("spotplaying").setAliases("spotifyplaying", "spot", "spotify", "playingspot", "playingspotify");

register("command", () => {
    try {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://www.androidauthority.com/get-discord-token-3149920/"));
    } catch (e) {
        ChatLib.chat(`${Settings.chatPrefix}&cFailed to open the website. &7Please visit it here: &fhttps://www.androidauthority.com/get-discord-token-3149920/.`);
    }
}).setName("spotopendiscordtokentutorial")

register("command", () => {
    try {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://www.spotify.com/us/account/profile/"));
    } catch (e) {
        ChatLib.chat(`${Settings.chatPrefix}&cFailed to open the website. &7Please visit it here: &fhttps://www.spotify.com/us/account/profile/.`);
    }
}).setName("spotopenspotuseridtutorial")

ChatLib.chat(`\n&8[&a&lSpot&2&oPlaying&8] &f${version} &7by &btdarth &a&lloaded. &7(/spotify).\n`);

setTimeout(() => {
    ChatLib.chat("\n\n&8[&a&lSpot&2&oPlaying&8]\n&fType &2/spot tutorial &fto setup the module!\n\n")
}, 1250);

register("worldLoad", () => {
    if (!Settings.settingsDiscordToken) {
        setTimeout(() => {
            ChatLib.chat("\n\n&8[&a&lSpot&2&oPlaying&8]\n&fType &2/spot tutorial &fto setup the module!\n\n")
        }, 1250);
    }
})

pingApi();