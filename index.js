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

function displaySongInfo(songInfo, x) {
    if (!songInfo) return; // Add null check

    const formattedTitle = `&f${songInfo.name}`;
    const formattedArtist = songInfo.artists && songInfo.artists.length > 0 ? `&7${songInfo.artists.join(", ")}` : "Local File";

    const currentProgress = Math.min(localProgress, songInfo.duration_ms);
    const minutes = Math.floor(currentProgress / 60000);
    const seconds = Math.floor((currentProgress % 60000) / 1000).toString().padStart(2, "0");
    const durationMinutes = Math.floor(songInfo.duration_ms / 60000);
    const durationSeconds = Math.floor((songInfo.duration_ms % 60000) / 1000).toString().padStart(2, "0");
    const progressText = `&aTime: ${minutes}:${seconds} / ${durationMinutes}:${durationSeconds}`;

    const padding = 10;
    const lineSpacing = 5;
    const titleWidth = Renderer.getStringWidth(formattedTitle);
    const artistWidth = Renderer.getStringWidth(formattedArtist);
    const timerWidth = Renderer.getStringWidth(progressText);

    const boxWidth = Math.max(titleWidth, artistWidth, timerWidth) + padding * 2;

    const lineHeight = 10;
    const progressBarHeight = 5;
    const boxHeight = 3 * lineHeight + 2 * lineSpacing + padding * 2 + progressBarHeight + lineSpacing;

    const boxX = x;
    const boxY = 5;

    Renderer.drawRect(Renderer.color(0, 0, 0, 100), boxX, boxY, boxWidth, boxHeight);

    Renderer.drawString(formattedTitle, boxX + padding, boxY + padding);

    Renderer.drawString(formattedArtist, boxX + padding, boxY + padding + lineHeight + lineSpacing);

    Renderer.drawString(progressText, boxX + padding, boxY + padding + 2 * (lineHeight + lineSpacing));

    const progressBarWidth = boxWidth - padding * 2;
    const progressBarX = boxX + padding;
    const progressBarY = boxY + padding + 3 * (lineHeight + lineSpacing);
    const filledBarWidth = Math.floor((currentProgress / songInfo.duration_ms) * progressBarWidth);

    Renderer.drawRect(Renderer.color(50, 50, 50, 150), progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    Renderer.drawRect(Renderer.color(0, 255, 0, 200), progressBarX, progressBarY, filledBarWidth, progressBarHeight);
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
    const apiKey = "5efd91ea85702905e17d2800bbb613bd";
    request({
        url: "https://untitledapi.onrender.com/getplayingsong",
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
            currentSongInfo = null;
            if (error.isAxiosError) {
                if (JSON.stringify(error.response.data, null, 2).includes("Invalid access token") || JSON.stringify(error.response.data, null, 2).includes("Only valid bearer authentication supported") || JSON.stringify(error.response.data, null, 2).includes("The access token expired,") || JSON.stringify(error.response.data, null, 2).includes("Unauthorized access")) {
                    if (Settings.showErrors) {
                        ChatLib.chat(`\n${Settings.chatPrefix}&cInvalid Token. &4Please update your token. &7(/spotify).\n`);
                    } else {
                        console.log(`\n${Settings.chatPrefix}&cInvalid Token. &4Please update your token. &7(/spotify).\n`);
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
    }, 10000);
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
        displaySongInfo(currentSongInfo, overlayX);
    }
});

register("command", (arg) => {
    if (!arg) return Settings.openGUI();

    arg = arg.toLowerCase();
    
    if (arg == "copy") {
        ChatLib.chat(`${Settings.chatPrefix}&fCopied &7${currentSongInfo.name} &fto clipboard.`);
        ChatLib.command(`ct copy ${currentSongInfo.name}`, true);
    }
}).setName("spotplaying").setAliases("spotifyplaying", "spot", "spotify", "playingspot", "playingspotify");

pingApi();