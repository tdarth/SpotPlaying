import Settings from "../Settings";
import { showNotification } from "./notification";

export function getDeviceID(forceMsg = false) {
    try {
        if (Settings.updateMessages || forceMsg) showNotification(`${Settings.chatPrefix}`, `&8Updating your Device ID..`, "push", 1);

        let command = `powershell.exe -Command "& {
            $headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = 'Bearer ${Settings.settingsPremiumSpotToken}' };
            $url = 'https://api.spotify.com/v1/me/player/devices';
            $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers;
            $response | ConvertTo-Json -Depth 10
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
                        const response = JSON.parse(output.trim());
                        const deviceIds = response.devices.map(device => device.id).join(",");

                        if (deviceIds == []) {
                            return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Make sure the&r &cDesktop App&r\n&7is open.`, "push", 5);
                        }

                        Settings.settingsDeviceID = deviceIds;
                        if (Settings.updateMessages || forceMsg) showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Updated your&r &aDevice ID&r&7.`, "push", 1);
                    } catch (jsonError) {
                        console.error("SpotPlaying Error: Error parsing JSON response:", jsonError);
                    }
                } else {
                    if (errorOutput.includes("The access token expired") || errorOutput.includes("Only valid bearer authentication supported") || errorOutput.includes("Invalid access token")) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
                    ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${errorOutput}`);
                }
            }
        };

        checkProcess();
    } catch (e) {
        console.error(`${Settings.chatPrefix}Error executing PowerShell command: ${e}`);
        ChatLib.chat(`${Settings.chatPrefix}&cException: &4${e}`);
    }
}