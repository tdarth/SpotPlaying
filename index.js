import Settings from "./Settings";
import { Keybind } from "../KeybindFix";

import { checkHover } from "./utils/checkHover";
import { openSpotify } from "./utils/openSpotify";
import { getSpotifyToken } from "./utils/getSpotifyToken";
import { getVersion } from "./utils/getVersion";
import { parseTimeToMilliseconds } from "./utils/parseTimeToMilliseconds";
import { tutorial } from "./utils/tutorial";
import { getDeviceID } from "./utils/getDeviceID";
import { showNotification } from "./utils/notification";

const version = getVersion();

let currentSongInfo = null;
let lastUpdateTime = Date.now();
let localProgress = 0;

let targetX = 5;

let isHovering = false;
let isHoveringSymbol = false;

let stopBarUpdating = false;

let stopLoop = false;

function displaySongInfo(songInfo, x, isHovering) {
    if (!songInfo) return;

    const formattedTitle = Settings.npSettingsSong.replace("{song}", songInfo.name);
    const formattedArtist = songInfo.artists && songInfo.artists.length > 0
        ? Settings.npSettingsArtist.replace("{artist}", songInfo.artists.join(", "))
        : "Local File";

    const currentProgress = Math.min(localProgress, songInfo.duration_ms);
    const minutes = Math.floor(currentProgress / 60000);
    const seconds = Math.floor((currentProgress % 60000) / 1000).toString().padStart(2, "0");
    const durationMinutes = Math.floor(songInfo.duration_ms / 60000);
    const durationSeconds = Math.floor((songInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0");
    const progressText = `&a${minutes}:${seconds} / ${durationMinutes}:${durationSeconds}`;

    const padding = 10;
    const symbolPadding = 5;
    const lineSpacing = 5;
    const playSymbol = Settings.npPlaySymbol || "➤";
    const pauseSymbol = Settings.npPauseSymbol || "││";

    const playSymbolWidth = Renderer.getStringWidth(playSymbol);
    const paddedPauseSymbol = pauseSymbol.padEnd(playSymbolWidth - Renderer.getStringWidth(pauseSymbol) + pauseSymbol.length);

    const titleWidth = Renderer.getStringWidth(formattedTitle);
    const artistWidth = Renderer.getStringWidth(formattedArtist);
    const timerWidth = Renderer.getStringWidth(progressText);
    const symbolWidth = Settings.npPauseButton ? playSymbolWidth : 0;

    const boxWidth = Math.max(titleWidth + symbolWidth + padding * 2 + symbolPadding, artistWidth, timerWidth) + padding * 2;

    const lineHeight = 10;
    const progressBarHeight = 5;
    let boxHeight = 3 * lineHeight + 2 * lineSpacing + padding * 2;

    if (Settings.npProgressBar) {
        boxHeight += progressBarHeight + lineSpacing;
    } else {
        boxHeight -= lineSpacing * 3;
    }

    const boxX = x;
    const boxY = 5;

    const bgColor = Settings.npBGColor;
    const barColor = Settings.npBarColor;

    Renderer.drawRect(Renderer.color(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), Settings.npBGOpacity), boxX, boxY, boxWidth, boxHeight);

    Renderer.drawString(formattedTitle, boxX + padding, boxY + padding, Settings.npTextShadow);

    Renderer.drawString(formattedArtist, boxX + padding, boxY + padding + lineHeight + lineSpacing, Settings.npTextShadow);

    if (Settings.npProgressBar) {
        const progressBarWidth = boxWidth - padding * 2;
        const progressBarX = boxX + padding;
        const progressBarY = boxY + padding + 3 * (lineHeight + lineSpacing);
        const filledBarWidth = Math.floor((currentProgress / songInfo.duration_ms) * progressBarWidth);

        const progressTextX = progressBarX + (progressBarWidth - timerWidth) / 2;
        Renderer.drawString(progressText, progressTextX, boxY + padding + 2 * (lineHeight + lineSpacing), Settings.npTextShadow);

        Renderer.drawRect(Renderer.color(50, 50, 50, 150), progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        Renderer.drawRect(Renderer.color(barColor.getRed(), barColor.getGreen(), barColor.getBlue(), Settings.npBarOpacity), progressBarX, progressBarY, filledBarWidth, progressBarHeight);

        if (isHovering && checkHover(progressBarX, progressBarY, progressBarWidth, progressBarHeight)) {
            isHoveringSymbol = true;
        } else {
            isHoveringSymbol = false;
        }
    }

    if (isHovering && Settings.npHover) {
        const additionalText = "&8Click to open Spotify.";
        const additionalTextWidth = Renderer.getStringWidth(additionalText);
        const additionalTextX = boxX + (boxWidth - additionalTextWidth) / 2;
        const additionalTextY = boxY + boxHeight + 10;

        Renderer.drawString(additionalText, additionalTextX, additionalTextY, true);
    }

    if (Settings.npPauseButton) {
        const symbol = songInfo.is_playing ? paddedPauseSymbol : playSymbol;
        const symbolX = boxX + boxWidth - symbolWidth - padding;
        const symbolY = boxY + padding;

        Renderer.drawString(symbol, symbolX, symbolY, true);

        if (checkHover(symbolX, symbolY, symbolWidth, lineHeight)) {
            isHoveringSymbol = true;
        } else {
            isHoveringSymbol = false;
        }
    }
}

function handleSeekClick(progressBarX, progressBarWidth, songDuration) {
    const mouseX = Client.getMouseX();
    const progressBarXAdjusted = progressBarX;
    const clickPosition = Math.floor(Math.max(0, Math.min(progressBarWidth, mouseX - progressBarXAdjusted)));
    const seekPosition = Math.floor((clickPosition / progressBarWidth) * songDuration);

    if (Settings.npSeekBar) modifyPlayer("seek", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", seekPosition);
}

function updateLocalProgress() {
    if (currentSongInfo && currentSongInfo.is_playing) {
        const now = Date.now();
        const elapsed = now - lastUpdateTime;
        localProgress += elapsed;
        lastUpdateTime = now;

        if (!stopBarUpdating && localProgress >= currentSongInfo.duration_ms + 1000) {
            if (currentSongInfo.name === "Advertisement") return;
            stopBarUpdating = true;
            setTimeout(() => {
                getSong();
            }, 250);
            stopBarUpdating = true;
        }
    } else {
        lastUpdateTime = Date.now();
    }
}

function getSong() {
    if (!Settings.npEnabled) return;
    stopBarUpdating = false;

    const command = `
powershell.exe -Command "& {
    $OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8;
    $headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = 'Bearer ${Settings.settingsPremiumSpotToken}' };
    $url = 'https://api.spotify.com/v1/me/player';
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers;
    Write-Host ($response | ConvertTo-Json -Compress);
}"`;

    try {
        const process = java.lang.Runtime.getRuntime().exec(command);

        const checkProcess = () => {
            if (process.isAlive()) {
                setTimeout(checkProcess, 50);
            } else {
                try {
                    const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream(), "UTF-8"));
                    let line;
                    let output = "";
                    while ((line = reader.readLine()) !== null) {
                        output += line + "\n";
                    }
                    reader.close();

                    process.waitFor();

                    if (output.trim()) {
                        try {
                            const response = JSON.parse(output.trim());

                            if (response) {
                                let name = "Unknown";
                                let artists = ["Local File"];
                                let duration_ms = 0;

                                if (response.currently_playing_type === "ad") {
                                    name = "Advertisement";
                                    artists = ["Time to buy premium!"];
                                } else if (response.item) {
                                    name = response.item.name || "Unknown";
                                    artists = response.item.artists.map(artistStr => {
                                        const nameMatch = artistStr.match(/name=([^;]+);/);
                                        return nameMatch ? nameMatch[1] : "Local File";
                                    });
                                    duration_ms = response.item.duration_ms || 0;
                                }

                                currentSongInfo = {
                                    name: name,
                                    artists: artists,
                                    duration_ms: duration_ms,
                                    progress_ms: response.progress_ms || 0,
                                    is_playing: response.is_playing || false,
                                    image_link: response.item && response.item.album.images.length > 0 ? response.item.album.images[0].url : "",
                                    currently_playing_type: response.currently_playing_type || "unknown",
                                    volume_percent: response.device.volume_percent || 0,
                                };

                                const now = Date.now();
                                const elapsed = now - lastUpdateTime;
                                localProgress = currentSongInfo.progress_ms + elapsed;
                                lastUpdateTime = now;
                            } else {
                                console.error("SpotPlaying Error: Invalid response structure:", response);
                            }
                        } catch (jsonError) {
                            console.error("SpotPlaying Error: Error parsing JSON response:", jsonError);
                        }
                    } else {
                        if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                        getSpotifyToken(false);
                    }
                } catch (readError) {
                    console.error("SpotPlaying Error: Error reading process output:", readError);
                }
            }
        };

        checkProcess();
    } catch (e) {
        console.error(`Error executing PowerShell command: ${e}`);
    }
}

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

    if (currentSongInfo && Settings.npEnabled) {
        isHovering = false;
        const boxWidth = Math.max(
            Renderer.getStringWidth(`&f${currentSongInfo.name}`),
            Renderer.getStringWidth(`&7${currentSongInfo.artists.join(", ")}`),
            Renderer.getStringWidth(`&a${Math.floor(localProgress / 60000)}:${Math.floor((localProgress % 60000) / 1000).toString().padStart(2, "0")} / ${Math.floor(currentSongInfo.duration_ms / 60000)}:${Math.floor((currentSongInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0")}`)
        ) + 20;
        const boxHeight = 3 * 10 + 2 * 5 + 20 + 5 + 5;
        isHovering = checkHover(targetX, 5, boxWidth, boxHeight);

        displaySongInfo(currentSongInfo, targetX, isHovering);
    }
});

register("clicked", (mouseX, mouseY, button, isPressed) => {
    if (isPressed) {
        if (isHovering && Settings.npHover) {
            openSpotify();
        }

        if (isHoveringSymbol) {
            if (currentSongInfo.is_playing) {
                modifyPlayer("pause", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
                currentSongInfo.is_playing = false;
            } else {
                modifyPlayer("play", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
                currentSongInfo.is_playing = true;
            }
        }

        if (Settings.npProgressBar && isHovering) {
            const padding = 10;
            const lineHeight = 10;
            const lineSpacing = 5;
            const progressBarHeight = 5;

            const progressBarX = targetX + padding;
            const boxWidth = Math.max(
                Renderer.getStringWidth(`&f${currentSongInfo.name}`),
                Renderer.getStringWidth(`&7${currentSongInfo.artists.join(", ")}`),
                Renderer.getStringWidth(`&a${Math.floor(localProgress / 60000)}:${Math.floor((localProgress % 60000) / 1000).toString().padStart(2, "0")} / ${Math.floor(currentSongInfo.duration_ms / 60000)}:${Math.floor((currentSongInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0")}`)
            ) + 2 * padding;
            const progressBarWidth = boxWidth - 2 * padding;

            const progressBarY = 5 + padding + 2 * (lineHeight + lineSpacing) + lineHeight + lineSpacing;

            if (mouseX >= progressBarX && mouseX <= progressBarX + progressBarWidth && mouseY >= progressBarY && mouseY <= progressBarY + progressBarHeight) {
                handleSeekClick(progressBarX, progressBarWidth, currentSongInfo.duration_ms);
            }
        }
    }
});

function modifyPlayer(option, token, device_id, method, extra = 0) {
    try {
        let command = "";
        let url = `https://api.spotify.com/v1/me/player/${option}?device_id=${device_id}`;
        let headers = `@{ 'Content-Type' = 'application/json'; 'Authorization' = 'Bearer ${token}' }`;

        if (option == "seek") {
            url += `&position_ms=${extra}`;
        } else if (option == "volume") {
            url += `&volume_percent=${extra}`;
        } else if (!["play", "pause", "next", "previous"].includes(option)) {
            showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid argument passed to&r &cmodifyPlayer()&r&7.`, "push", 3);
            return;
        }

        command = `powershell.exe -Command "& {
            $headers = ${headers};
            $url = '${url}';
            Invoke-RestMethod -Uri $url -Method ${method} -Headers $headers
        }"`;

        const process = java.lang.Runtime.getRuntime().exec(command);

        const checkProcess = () => {
            if (process.isAlive()) {
                setTimeout(checkProcess, 50);
            } else {
                const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream(), "UTF-8"));
                let line;
                let output = "";
                while ((line = reader.readLine()) !== null) {
                    output += line + "\n";
                }
                reader.close();

                const errorReader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getErrorStream(), "UTF-8"));
                let errorOutput = "";
                while ((line = errorReader.readLine()) !== null) {
                    errorOutput += line + "\n";
                }
                errorReader.close();

                process.waitFor();

                if (errorOutput.trim()) {
                    if (errorOutput.includes("Player command failed: Restriction violated")) return ChatLib.chat(`${Settings.chatPrefix}&cAn error occured for one of the following reasons:\n&7- You tried pausing/playing on a song that is already paused/playing.\n&7- You tried skipping/rewinding on an ad.\n&7- You tried seeking during an ad.`);
                    if (errorOutput.includes("volume_percent must be in the range 0 to 100")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7You can only set the volume between &c0-100&r&7.`, "push", 5);
                    if (errorOutput.includes("Device not found")) {
                        if (!Settings.settingsDiscordToken) {
                            return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid&r &cDevice ID&r&7. Please update options found in&r &8/spotify&r&7.`, "push", 5);
                        } else {
                            return getDeviceID();
                        }
                    }
                    if (errorOutput.includes("The access token expired") || errorOutput.includes("Only valid bearer authentication supported") || errorOutput.includes("Invalid access token")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                    ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${errorOutput}`);
                    if (errorOutput.includes("position_ms cannot be negative") || errorOutput.includes("position_ms must be a number")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7You can't seek to that time.`, "push", 5);
                    ChatLib.chat(`${Settings.chatPrefix}&cAn error occured. &4${errorOutput}`);
                } else {
                    getSong();
                    if (option == "pause") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song paused.`, "push", 1);
                    if (option == "play") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song unpaused.`, "push", 1);
                    if (option == "next") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Skipped song.`, "push", 1);
                    if (option == "previous") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Went back a song.`, "push", 1);
                    if (option == "seek") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Song position set to &a${extra}ms&r&7.`, "push", 1);
                    if (option == "volume") return showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Volume set to &a${extra}%&r&7.`, "push", 1);
                }
            }
        };

        checkProcess();
    } catch (e) {
        console.error(`${Settings.chatPrefix}Error executing PowerShell command: ${e}`);
        ChatLib.chat(`${Settings.chatPrefix}&cException: &4${e}`);
    }
}

register("gameUnload", () => {
    stopLoop = true;
});

register("command", (arg, arg2) => {
    if (!arg) return Settings.openGUI();

    arg = arg.toLowerCase();
    if (arg2) arg2 = arg2.toLowerCase();

    if (arg == "copy") {
        if (arg2 === "artist" || arg2 === "artists") {
            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Copied&r &a${currentSongInfo.artists.join(", ")}&r&7 to clipboard.`, "push", 3);
            return ChatLib.command(`ct copy ${currentSongInfo.artists.join(", ")}`, true);
        }
        showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Copied&r &a${currentSongInfo.name}&r&7 to clipboard.`, "push", 3);
        ChatLib.command(`ct copy ${currentSongInfo.name}`, true);
    } else if (arg === "open") {
        openSpotify();
    } else if (arg === "version" || arg === "ver") {
        showNotification(`${Settings.chatPrefix}`, `&7Using Version &f${version}&7.`, "push", 3);
    } else if (arg === "pause") {
        modifyPlayer("pause", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
    } else if (arg === "play" || arg === "unpause") {
        modifyPlayer("play", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
    } else if (arg === "next" || arg === "skip") {
        if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
        modifyPlayer("next", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Post");
    } else if (arg === "previous" || arg === "prev" || arg === "rewind") {
        if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
        modifyPlayer("previous", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Post");
    } else if (arg === "seek" && arg2) {
        const milliseconds = parseTimeToMilliseconds(arg2);
        if (milliseconds !== null) {
            if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
            modifyPlayer("seek", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", milliseconds);
        } else {
            showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid time format.\n&f"1m30s", "53s", or milliseconds.`, "push", 3);
        }
    } else if (arg === "volume" || arg === "vol") {
        if (arg2 && !isNaN(arg2)) {
            modifyPlayer("volume", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", arg2);
        } else if (!arg2 || isNaN(arg2)) {
            showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid usage.\n&c/spot volume <1-100>&7.`, "push", 3);
        }
    } else if (arg === "token") {
        getSpotifyToken(true);
    } else if (arg === "tutorial") {
        if (!arg2) {
            tutorial();
        } else if (arg2 === "2" || arg2 === "3" || arg2 === "4") {
            tutorial(Number(arg2));
        } else if (arg2 === "5") {
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
                        ChatLib.chat(`\n\n${Settings.chatPrefix}&cAn error occured during setup.\n&4Make sure the Spotify Desktop App is open!\n&4If you still get errors, go through the tutorial again. &c/spot tutorial&4.\n\n`)
                        showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Error during setup.`, "push", 1);
                    }
                }, 2500);
            }, 2500);
        } else {
            tutorial();
        }
    } else if (arg === "device" || arg === "deviceid") {
        getDeviceID(true);
    } else if (arg === "info" || arg === "commands" || arg === "cmds") {
        ChatLib.chat(`${Settings.chatPrefix}&f/spot &7<copy | device | info | open | pause | play | next | previous | seek <time> | token | tutorial | version | volume <1-100>>`);
    } else {
        ChatLib.chat(`${Settings.chatPrefix}&cInvalid command.\n&7Usage: /spot <copy | device | info | open | version | pause | play | next | previous | seek <time> | token | tutorial | volume <1-100>>`);
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

new Keybind("-5 Seconds", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    modifyPlayer("seek", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", currentSongInfo.progress_ms - 5000);
});

new Keybind("+5 Seconds", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    modifyPlayer("seek", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", currentSongInfo.progress_ms + 5000);
});

new Keybind("Increase Volume", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    modifyPlayer("volume", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", currentSongInfo.volume_percent - 5);
});

new Keybind("Decrease Volume", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    modifyPlayer("volume", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put", currentSongInfo.volume_percent + 5);
});

new Keybind("Pause/Play", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (currentSongInfo.is_playing) {
        modifyPlayer("pause", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
    } else {
        modifyPlayer("play", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Put");
    }
});

new Keybind("Previous Song", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    modifyPlayer("previous", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Post");
});

new Keybind("Skip Song", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    modifyPlayer("next", Settings.settingsPremiumSpotToken, Settings.settingsDeviceID, "Post");
});

ChatLib.chat(`\n&8[&a&lSpot&2&oPlaying&8] &f${version} &7by &btdarth &a&lloaded. &7(/spotify).\n`);

if (!Settings.settingsDiscordToken) {
    setTimeout(() => {
        ChatLib.chat("\n\n&8[&a&lSpot&2&oPlaying&8]\n&fType &2/spot tutorial &fto setup the module!\n\n")
    }, 1250);
}

pingApi();