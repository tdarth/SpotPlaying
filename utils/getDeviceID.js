import Settings from "../Settings";

export function getDeviceID() {
    try {
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
                    console.log(output.trim())
                    try {
                        const response = JSON.parse(output.trim());
                        const deviceIds = response.devices.map(device => device.id).join(",");

                        if (deviceIds == []) {
                            return ChatLib.chat(`${Settings.chatPrefix}&4Error! &cMake sure the &4Spotify Desktop App &cis open!`);
                        }

                        Settings.settingsDeviceID = deviceIds;
                        ChatLib.chat(`${Settings.chatPrefix}&aSuccessfully updated your &2Device IDs&a!`);
                    } catch (jsonError) {
                        console.error("SpotPlaying Error: Error parsing JSON response:", jsonError);
                    }
                } else {
                    if (errorOutput.includes("The access token expired") || errorOutput.includes("Only valid bearer authentication supported") || errorOutput.includes("Invalid access token")) return ChatLib.chat(`\n${Settings.chatPrefix}&cInvalid Spotify Token. &4Please update details found in &7(/spotify).\n`);
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