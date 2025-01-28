import Settings from "./Settings";
import { request } from "axios";
import PogObject from "PogData";

const spotToken = new PogObject("SpotPlaying", {
    token: "",
});

let currentSongInfo = null;
let lastUpdateTime = Date.now();
let localProgress = 0;

let overlayX = -200; // Start off-screen
let targetX = 5; // Target position when visible
let animationSpeed = 5; // Speed of the sliding animation

let isHovering = false;

function displaySongInfo(songInfo, x, isHovering) {
    if (!songInfo) return; // Add null check

    const formattedTitle = `&f${songInfo.name}`;
    const formattedArtist = songInfo.artists && songInfo.artists.length > 0 ? `&7${songInfo.artists.join(", ")}` : "Local File";

    const currentProgress = Math.min(localProgress, songInfo.duration_ms);
    const minutes = Math.floor(currentProgress / 60000);
    const seconds = Math.floor((currentProgress % 60000) / 1000).toString().padStart(2, "0");
    const durationMinutes = Math.floor(songInfo.duration_ms / 60000);
    const durationSeconds = Math.floor((songInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0");
    const progressText = `&a${minutes}:${seconds} / ${durationMinutes}:${durationSeconds}`;

    const padding = 10;
    const lineSpacing = 5;
    const titleWidth = Renderer.getStringWidth(formattedTitle);
    const artistWidth = Renderer.getStringWidth(formattedArtist);
    const timerWidth = Renderer.getStringWidth(progressText);

    const boxWidth = Math.max(titleWidth, artistWidth, timerWidth) + padding * 2;

    const lineHeight = 10;
    const progressBarHeight = 5;
    let boxHeight = 3 * lineHeight + 2 * lineSpacing + padding * 2;

    if (Settings.npProgressBar) {
        boxHeight += progressBarHeight + lineSpacing;
    } else {
        boxHeight -= lineSpacing * 3; // Adjust to remove extra spacing
    }

    const boxX = x;
    const boxY = 5;

    const bgColor = Settings.npBGColor;
    const barColor = Settings.npBarColor; // why out of range error if i try to preset a value??

    Renderer.drawRect(Renderer.color(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), Settings.npBGOpacity), boxX, boxY, boxWidth, boxHeight);

    Renderer.drawString(formattedTitle, boxX + padding, boxY + padding);

    Renderer.drawString(formattedArtist, boxX + padding, boxY + padding + lineHeight + lineSpacing);

    if (Settings.npProgressBar) {
        const progressBarWidth = boxWidth - padding * 2;
        const progressBarX = boxX + padding;
        const progressBarY = boxY + padding + 3 * (lineHeight + lineSpacing);
        const filledBarWidth = Math.floor((currentProgress / songInfo.duration_ms) * progressBarWidth);

        // Center the progress text
        const progressTextX = progressBarX + (progressBarWidth - timerWidth) / 2;
        Renderer.drawString(progressText, progressTextX, boxY + padding + 2 * (lineHeight + lineSpacing));

        Renderer.drawRect(Renderer.color(50, 50, 50, 150), progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
        Renderer.drawRect(Renderer.color(barColor.getRed(), barColor.getGreen(), barColor.getBlue(), Settings.npBarOpacity), progressBarX, progressBarY, filledBarWidth, progressBarHeight);
    }

    // Draw additional text only when hovering
    if (isHovering && Settings.npHover) {
        const additionalText = "&8Click to open Spotify.";
        const additionalTextWidth = Renderer.getStringWidth(additionalText);
        const additionalTextX = boxX + (boxWidth - additionalTextWidth) / 2;
        const additionalTextY = boxY + boxHeight + 10; // Increase the Y position to make more space

        Renderer.drawString(additionalText, additionalTextX, additionalTextY, true);
    }
}

// Function to check if the mouse is hovering over the overlay
function checkHover(x, y, width, height) {
    const mouseX = Client.getMouseX();
    const mouseY = Client.getMouseY();
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function updateLocalProgress() {
    if (currentSongInfo && currentSongInfo.is_playing) {
        const now = Date.now();
        const elapsed = now - lastUpdateTime;
        localProgress += elapsed;
        lastUpdateTime = now;
        if (localProgress >= currentSongInfo.duration_ms + 1000) {
            currentSongInfo = null;
        }
    }
}

function getSong() {
    const apiKey = Settings.settingsApiKey;
    request({
        url: Settings.apiUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey,
            "X-SPOT-TOKEN": spotToken.token,
        }
    })
        .then(response => {
            if (response.data && response.data.name) {
                console.log(JSON.stringify(response.data));
                currentSongInfo = response.data;
                if (!currentSongInfo.artists || currentSongInfo.artists.length === 0 || currentSongInfo.artists[0] === "") {
                    currentSongInfo.artists = ["Local File"];
                }
                localProgress = currentSongInfo.progress_ms;
                lastUpdateTime = Date.now();
            } else {
                currentSongInfo = null;
            }            
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes("'NoneType' object is not subscriptable")) {
                currentSongInfo = {
                    name: "Advertisement",
                    artists: ["Time to get Spotify Premium"],
                    duration_ms: 0,
                    progress_ms: 0,
                    is_playing: true
                };
                localProgress = 0;
                lastUpdateTime = Date.now();
            } else {
                currentSongInfo = null;
            }
            if (error.isAxiosError) {
                if (JSON.stringify(error.response.data, null, 2).includes("Invalid access token") || JSON.stringify(error.response.data, null, 2).includes("Only valid bearer authentication supported") || JSON.stringify(error.response.data, null, 2).includes("The access token expired,") || JSON.stringify(error.response.data, null, 2).includes("Unauthorized access")) {
                    if (Settings.showErrors) {
                        ChatLib.chat(`\n${Settings.chatPrefix}&cInvalid Spotify Token or API Key. &4Please update details found in. &7(/spotify).\n`);
                    } else {
                        ChatLib.chat(`\n${Settings.chatPrefix}&cInvalid Spotify Token or API Key. &4Please update details found in. &7(/spotify).\n`);
                    }
                } else {
                    if (Settings.showErrors) {
                        ChatLib.chat(`\n${Settings.chatPrefix}&cError while fetching Spotify data: &4${JSON.stringify(error.response.data, null, 2)}\n`);
                    } else {
                        console.log(`\n${Settings.chatPrefix}&cError while fetching Spotify data: &4${JSON.stringify(error.response.data, null, 2)}\n`);
                    }
                }
            } else {
                if (Settings.showErrors) {
                    ChatLib.chat(`\n${Settings.chatPrefix}&cAn error occured while pinging the API.\n`);
                }  else {
                    console.log(`\n${Settings.chatPrefix}&cAn error occured while pinging the API.\n`);
                }
            }
        });
}

function pingApi() {
    spotToken.token = Settings.settingsSpotToken;
    spotToken.save();

    if (Settings.npEnabled) {
        getSong();
    } else {

    }
    setTimeout(() => {
        pingApi();
    }, Number(Settings.apiPingRate));
}

function openSpotify() {
    try {
        const process = java.lang.Runtime.getRuntime().exec("cmd /c start shell:AppsFolder\\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify");
        const exitCode = process.waitFor();
        if (exitCode !== 0) {
            try {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
            } catch (e) {
                ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
                console.log(`SpotPlaying Error: ${e}`);
            }
        }
    } catch (e) {
        try {
            java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
        } catch (e) {
            ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
            console.log(`SpotPlaying Error: ${e}`);
        }
    }
}

register("renderOverlay", () => {
    updateLocalProgress();
    if (currentSongInfo && Settings.npEnabled) {
        if (overlayX < targetX) {
            overlayX += animationSpeed;
            if (overlayX > targetX) overlayX = targetX;
        }
    } else {
        if (overlayX > -200) {
            overlayX -= animationSpeed;
            if (overlayX < -200) overlayX = -200;
        }
    }
    if (overlayX > -200) {
        // Check if hovering over the overlay
        isHovering = false;
        if (currentSongInfo) {
            const boxWidth = Math.max(Renderer.getStringWidth(`&f${currentSongInfo.name}`), Renderer.getStringWidth(`&7${currentSongInfo.artists.join(", ")}`), Renderer.getStringWidth(`&a${Math.floor(localProgress / 60000)}:${Math.floor((localProgress % 60000) / 1000).toString().padStart(2, "0")} / ${Math.floor(currentSongInfo.duration_ms / 60000)}:${Math.floor((currentSongInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0")}`)) + 20;
            const boxHeight = 3 * 10 + 2 * 5 + 20 + 5 + 5;
            isHovering = checkHover(overlayX, 5, boxWidth, boxHeight);
        }
        displaySongInfo(currentSongInfo, overlayX, isHovering);
    }
});

register("clicked", (mouseX, mouseY, button, isPressed) => {
    if (isPressed && isHovering && Settings.npHover) {
        openSpotify();
    }
});

register("command", (arg) => {
    if (!arg) return Settings.openGUI();

    arg = arg.toLowerCase();
    
    if (arg == "copy") {
        ChatLib.chat(`${Settings.chatPrefix}&fCopied &7${currentSongInfo.name} &fto clipboard.`);
        ChatLib.command(`ct copy ${currentSongInfo.name}`, true);
    } else if (arg === "open") {
        openSpotify();
    }
}).setName("spotplaying").setAliases("spotifyplaying", "spot", "spotify", "playingspot", "playingspotify");

pingApi();