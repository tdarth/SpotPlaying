import Settings from "../Settings";

export function openSpotify() {
    try {
        const process = java.lang.Runtime.getRuntime().exec("cmd /c start shell:AppsFolder\\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify");
        const exitCode = process.waitFor();
        if (exitCode !== 0) {
            try {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
            } catch (e) {
                ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
                console.error(`SpotPlaying Error: ${e}`);
            }
        }
    } catch (e) {
        try {
            java.awt.Desktop.getDesktop().browse(new java.net.URI("https://open.spotify.com"));
        } catch (e) {
            ChatLib.chat(`${Settings.chatPrefix}&cFailed to open Spotify. &4Check console for errors.`);
            console.error(`SpotPlaying Error: ${e}`);
        }
    }
}