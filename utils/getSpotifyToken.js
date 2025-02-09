import Settings from "../Settings";

export function getSpotifyToken() {
    try {
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
                        ChatLib.chat(`${Settings.chatPrefix}&aSuccessfully updated your &2Spotify Token&a!`);
                    } catch (jsonError) {
                        console.error("SpotPlaying Error: Error parsing JSON response:", jsonError);
                    }
                } else {
                    if (errorOutput.includes("Unauthorized")) return ChatLib.chat(`${Settings.chatPrefix}&cInvalid Discord Token. &4Please update details found in &7(/spotify).`);
                    if (errorOutput.includes("405: Method Not Allowed")) return ChatLib.chat(`${Settings.chatPrefix}&cInvalid Spotify Account ID. &4Please update details found in &7(/spotify).`)
                    if (errorOutput.includes("Unknown Connection")) return ChatLib.chat(`${Settings.chatPrefix}&cYou must have your &4Spotify &caccount linked to your &4Discord &caccount.`);
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