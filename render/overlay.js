import Settings from "../Settings";
import { state } from "../utils/variables";
import { togglePlayback } from "../utils/api/togglePlayback";
import { navigatePlayer } from "../utils/api/navigatePlayer";
import { openSpotify } from "../utils/openSpotify";
import { getSong } from "../utils/api/getSong";

let lastArtworkURL = null;
let currentArtwork = null;
let overlayWidth = 0;
let overlayHeight = 0;

let oldImageSetting = Settings.npImageQuality;

const settingsGui = Java.type("gg.essential.vigilance.gui.SettingsGui");

function shortenTextToFitWithHighlight(text, maxWidth, currentTimeMs, lyrics, currentLine) {
    const ellipsis = "...";
    let shortenedText = text;

    while (Renderer.getStringWidth(shortenedText + ellipsis) > maxWidth && shortenedText.length > 0) {
        shortenedText = shortenedText.slice(0, -1);
    }

    const visibleText = shortenedText;

    let highlightedLyrics = "";
    const lyricWords = visibleText.split(' ');
    const lineStartTime = lyrics[currentLine].time;
    const lineEndTime = lyrics[currentLine + 1]?.time ?? (lineStartTime + 4000);
    const lineDuration = lineEndTime - lineStartTime;

    const wordWeights = lyricWords.map(w => w.length);
    const totalWeight = wordWeights.reduce((a, b) => a + b, 0);

    let elapsed = 0;

    for (let i = 0; i < lyricWords.length; i++) {
        const word = lyricWords[i];
        const weight = wordWeights[i];
        const wordDuration = (weight / totalWeight) * lineDuration;

        const wordStartTime = lineStartTime + elapsed;
        const wordEndTime = wordStartTime + wordDuration;

        const color = (currentTimeMs >= wordStartTime && currentTimeMs < wordEndTime) ? "&f" : "&7";
        highlightedLyrics += color + word + " ";

        elapsed += wordDuration;
    }

    highlightedLyrics += "&7" + ellipsis;

    return highlightedLyrics;
}

function shortenTextToFit(text, maxWidth) {
    const ellipsis = "...";
    while (Renderer.getStringWidth(text + ellipsis) > maxWidth && text.length > 0) {
        text = text.slice(0, -1);
    }
    return text + ellipsis;
}

export function displaySongInfo(x, y) {
    if (!state.currentSongInfo || !Settings.npEnabled) return;
    if (Settings.npImageQuality != oldImageSetting) { oldImageSetting = Settings.npImageQuality; getSong(); }

    const { name, artists, duration_ms } = state.currentSongInfo;
    const formattedTitle = Settings.npSettingsSong.replaceAll("{song}", name);
    const formattedArtist = Settings.npSettingsArtist.replaceAll("{artist}", artists.join(", ")) || "Local File";

    const currentProgress = Math.min(state.localProgress / 1000, duration_ms / 1000);
    let minutes = Math.floor(currentProgress / 60);
    let seconds = Math.floor(currentProgress % 60).toString().padStart(2, "0");
    let durationMinutes = Math.floor((duration_ms / 1000) / 60);
    let durationSeconds = Math.floor((duration_ms / 1000) % 60).toString().padStart(2, "0");

    const progressText = Settings.npBarText
        .replaceAll("{minutes}", `${minutes}`)
        .replaceAll("{seconds}", `${seconds}`)
        .replaceAll("{endminutes}", `${durationMinutes}`)
        .replaceAll("{endseconds}", `${durationSeconds}`);

    const padding = 10 * Settings.npSizeMultiplier / 50;
    const lineSpacing = 5 * Settings.npSizeMultiplier / 50;
    const lineHeight = 10 * Settings.npSizeMultiplier / 50;
    const progressBarHeight = 5 * Settings.npSizeMultiplier / 50;
    const artworkSize = 50 * Settings.npSizeMultiplier / 50;

    const titleWidth = Renderer.getStringWidth(formattedTitle);
    const artistWidth = Renderer.getStringWidth(formattedArtist);
    const timerWidth = Renderer.getStringWidth(progressText);
    const boxWidth = Math.max(titleWidth, artistWidth, timerWidth) + padding * 3 + artworkSize;
    let boxHeight = Math.max(3 * lineHeight + 2 * lineSpacing + padding * 2, artworkSize + padding * 2);

    if (Settings.npProgressBar) {
        boxHeight += progressBarHeight + lineSpacing;
    } else {
        boxHeight -= lineSpacing * 3;
    }

    let lyricsHeight = 0;
    if (Settings.npLyrics && state.lyrics?.length > 0) {
        lyricsHeight = 10 * Settings.npSizeMultiplier / 50;
        boxHeight += lyricsHeight;
    }

    overlayWidth = boxWidth;
    overlayHeight = boxHeight;

    const bgColor = Settings.npBGColor;
    const barColor = Settings.npBarColor;
    Renderer.drawRect(Renderer.color(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), Settings.npBGOpacity), x, y, boxWidth, boxHeight + 20 * Settings.npSizeMultiplier / 50);

    const textX = x + padding * 2 + artworkSize;
    Renderer.drawString(formattedTitle, textX, y + padding, Settings.npTextShadow);
    Renderer.drawString(formattedArtist, textX, y + padding + lineHeight + lineSpacing, Settings.npTextShadow);

    if (Settings.npProgressBar) {
        const progressBarWidth = boxWidth - padding * 2;
        const progressBarX = x + padding;
        const progressBarY = y + padding + 3 * (lineHeight + lineSpacing) + 30 * Settings.npSizeMultiplier / 50;
        const filledBarWidth = Math.floor((currentProgress / (duration_ms / 1000)) * progressBarWidth);

        Renderer.drawString(progressText, progressBarX + (progressBarWidth - timerWidth) / 2, y + padding + 2 * (lineHeight + lineSpacing) + 30 * Settings.npSizeMultiplier / 50, Settings.npTextShadow);
        Renderer.drawRect(Renderer.color(50, 50, 50, 150), progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        Renderer.drawRect(Renderer.color(barColor.getRed(), barColor.getGreen(), barColor.getBlue(), Settings.npBarOpacity), progressBarX, progressBarY, filledBarWidth, progressBarHeight);
    }

    if (state.currentSongInfo.song_image && state.currentSongInfo.song_image !== lastArtworkURL && !state.stopBarUpdating) {
        lastArtworkURL = state.currentSongInfo.song_image;
        try {
            const thread = new Thread(() => {
                currentArtwork = Image.fromUrl(state.currentSongInfo.song_image);
            });
            thread.start();
        } catch (e) {
            return;
        }
    }

    if (currentArtwork) {
        const imgWidth = currentArtwork.getTextureWidth();
        const imgHeight = currentArtwork.getTextureHeight();
        const ratio = Math.max(imgWidth / artworkSize, imgHeight / artworkSize);
        const width = imgWidth / ratio;
        const height = imgHeight / ratio;
        currentArtwork.draw(x + padding, y + padding, width, height);
    }

    const mouseX = Client.getMouseX();
    const mouseY = Client.getMouseY();
    const isHovering = mouseX >= x && mouseX <= x + boxWidth && mouseY >= y && mouseY <= y + boxHeight + 50 * Settings.npSizeMultiplier / 50;

    const iconSize = 20 * Settings.npSizeMultiplier / 50;
    const iconSpacing = 10 * Settings.npSizeMultiplier / 50;

    if (isHovering && Client.isInGui() && !Settings.npDragGui.isOpen() && Settings.npPlayerControls) {
        const iconBoxWidth = iconSize * 3 + iconSpacing * 2;
        const iconBoxHeight = iconSize;
        const iconBoxX = x + (boxWidth - iconBoxWidth) / 2;
        const iconBoxY = y + boxHeight + 20 * Settings.npSizeMultiplier / 50;

        Renderer.drawRect(Renderer.color(bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue(), Settings.npBGOpacity), iconBoxX, iconBoxY, iconBoxWidth, iconBoxHeight);

        const totalSpacing = iconBoxWidth - iconSize * 3;
        const spacingBetweenIcons = totalSpacing / 3;

        const icon1X = iconBoxX + spacingBetweenIcons;
        const icon2X = iconBoxX + iconSize + spacingBetweenIcons * 2;
        const icon3X = iconBoxX + iconSize * 2 + spacingBetweenIcons * 3;

        Renderer.drawString("<", icon1X + iconSize / 4, iconBoxY + 5 * Settings.npSizeMultiplier / 50, Settings.npTextShadow);
        Renderer.drawString("O", icon2X + iconSize / 4, iconBoxY + 5 * Settings.npSizeMultiplier / 50, Settings.npTextShadow);
        Renderer.drawString(">", icon3X + iconSize / 4, iconBoxY + 5 * Settings.npSizeMultiplier / 50, Settings.npTextShadow);
    }
    let previousSongTitle = "";

    if (state.lyrics?.length > 0 && Settings.npLyrics) {
        const currentTimeMs = state.localProgress;
        let currentLine = state.currentLyricLine;

        if (state.currentSongInfo.name !== previousSongTitle) {
            currentLine = 0;
            previousSongTitle = state.currentSongInfo.name;
        }

        if (currentTimeMs < state.lyrics[0].time) return;

        if (currentTimeMs >= state.lyrics[currentLine + 1]?.time) {
            while (currentLine < state.lyrics.length - 1 && currentTimeMs >= state.lyrics[currentLine + 1].time) {
                currentLine++;
            }
        } else if (currentTimeMs < state.lyrics[currentLine]?.time) {
            while (currentLine > 0 && currentTimeMs < state.lyrics[currentLine].time) {
                currentLine--;
            }
        }

        state.currentLyricLine = currentLine;

        const lyricY = y + padding + 3 * (lineHeight + lineSpacing) +
            (Settings.npProgressBar ? 30 * Settings.npSizeMultiplier / 50 + progressBarHeight + lineSpacing : 15 * Settings.npSizeMultiplier / 50);

        if (Settings.npBetterLyrics) {
            const lyricText = state.lyrics[currentLine]?.text ?? "";
            if (!lyricText) return;

            const lyricWords = lyricText.split(' ');

            const lineStartTime = state.lyrics[currentLine].time;
            const lineEndTime = state.lyrics[currentLine + 1]?.time ?? (lineStartTime + 4000);
            const lineDuration = lineEndTime - lineStartTime;

            const wordWeights = lyricWords.map(w => w.length);
            const totalWeight = wordWeights.reduce((a, b) => a + b, 0);

            let highlightedLyrics = "";
            let elapsed = 0;

            for (let i = 0; i < lyricWords.length; i++) {
                const word = lyricWords[i];
                const weight = wordWeights[i];
                const wordDuration = (weight / totalWeight) * lineDuration;

                const wordStartTime = lineStartTime + elapsed;
                const wordEndTime = wordStartTime + wordDuration;

                const color = (currentTimeMs >= wordStartTime && currentTimeMs < wordEndTime) ? "&f" : "&7";
                highlightedLyrics += color + word + " ";

                elapsed += wordDuration;
            }

            let finalLyrics = highlightedLyrics;

            if (Settings.npShortenLyrics && Renderer.getStringWidth(finalLyrics) > boxWidth - 10) {
                const stripped = finalLyrics.removeFormatting();
                const shortened = shortenTextToFitWithHighlight(stripped, boxWidth - 10, currentTimeMs, state.lyrics, currentLine);
                finalLyrics = shortened;
            }

            const lyricX = x + (boxWidth - Renderer.getStringWidth(finalLyrics)) / 2;
            Renderer.drawString(finalLyrics, lyricX, lyricY, Settings.npTextShadow);
        } else {
            const lyricText = state.lyrics[currentLine]?.text ?? "";
            if (!lyricText) return;

            let finalText = lyricText;

            if (Settings.npShortenLyrics && Renderer.getStringWidth(finalText) > boxWidth - 10) {
                finalText = shortenTextToFit(finalText, boxWidth - 10);
            }

            const lyricX = x + (boxWidth - Renderer.getStringWidth(finalText)) / 2;
            Renderer.drawString(finalText, lyricX, lyricY, Settings.npTextShadow);
        }
    }
}

register('clicked', (x, y, button, held) => {
    if (button == 0 && !held && Client.isInGui() && Settings.npPlayerControls) {
        if (Client.currentGui.get() instanceof settingsGui) return;
        if (Settings.npDragGui.isOpen()) return;

        const iconSize = 20 * Settings.npSizeMultiplier / 50;
        const iconSpacing = 10 * Settings.npSizeMultiplier / 50;

        const iconBoxWidth = iconSize * 3 + iconSpacing * 2;
        const iconBoxX = Settings.npOverlayX + (overlayWidth - iconBoxWidth) / 2;
        const iconBoxY = Settings.npOverlayY + overlayHeight + 20 * Settings.npSizeMultiplier / 50;

        const totalSpacing = iconBoxWidth - iconSize * 3;
        const spacingBetweenIcons = totalSpacing / 3;

        const icon1X = iconBoxX + spacingBetweenIcons;
        const icon2X = iconBoxX + iconSize + spacingBetweenIcons * 2;
        const icon3X = iconBoxX + iconSize * 2 + spacingBetweenIcons * 3;

        if (x >= icon1X && x <= icon1X + iconSize && y >= iconBoxY && y <= iconBoxY + iconSize) {
            navigatePlayer("previous");
        } else if (x >= icon2X && x <= icon2X + iconSize && y >= iconBoxY && y <= iconBoxY + iconSize) {
            if (state.currentSongInfo.is_playing) togglePlayback("pause");
            else togglePlayback("play");
        } else if (x >= icon3X && x <= icon3X + iconSize && y >= iconBoxY && y <= iconBoxY + iconSize) {
            navigatePlayer("next");
        }
    }

    if (button == 2 && !held && Client.isInGui() && Settings.npMiddleClick) {
        if (Client.currentGui.get() instanceof settingsGui) return;
        if (Settings.npDragGui.isOpen()) return;

        const { width, height } = getOverlayDimensions();
        if (x >= 0 && x <= width && y >= 0 && y <= height) openSpotify();
    }
});

export function getOverlayDimensions() {
    return { width: overlayWidth, height: overlayHeight };
}