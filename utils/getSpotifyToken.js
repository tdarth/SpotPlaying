import Settings from "../Settings";
import { showNotification } from "./notification";

export function getSpotifyToken(forceMsg = false) {
    try {
        if (Settings.updateMessages || forceMsg) showNotification(`${Settings.chatPrefix}`, `&8Updating your Spotify Token..`, "push", 1);

        let command = `powershell.exe -Command "& {
            $headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = '${Settings.settingsDiscordToken}' };
            $url = 'https://discord.com/api/v9/users/@me/connections/spotify/${Settings.settingsSpotifyUserId}/access-token';
            Invoke-RestMethod -Uri $url -Method Get -Headers $headers | Select-Object -ExpandProperty access_token
        }"`

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

                if (output.trim()) {
                    try {
                        const accessToken = output.trim()
                        Settings.settingsPremiumSpotToken = accessToken;
                        if (Settings.updateMessages || forceMsg) showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Updated your&r &aSpotify Token&7.`, "push", 1);
                    } catch (jsonError) {
                        console.error("SpotPlaying Error: Error parsing JSON response:", jsonError);
                    }
                } else {
                    if (errorOutput.includes("Unauthorized")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cDiscord Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                    if (errorOutput.includes("405: Method Not Allowed")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid&r &cSpotify Acccount ID&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                    if (errorOutput.includes("Unknown Connection")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Please link your&r &cSpotify Account&r&7 to your&r &cDiscord Account&r&7.`, "push", 5);
                    ChatLib.chat(`${Settings.chatPrefix}&cAn error occured. &4${errorOutput}`);
                }
            }
        };

        checkProcess();
    } catch (e) {
        console.error(`${Settings.chatPrefix}Error executing PowerShell command: ${e}`);
        ChatLib.chat(`${Settings.chatPrefix}&cException: &4${e}`);
    }
}