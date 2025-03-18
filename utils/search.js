import Settings from "../Settings";
import { showNotification } from "./notification";

export function search(query, limit, forceMsg = false) {
    if (isNaN(limit)) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7The limit argument must be a\n&7number.`, "push", 3);

    try {
        if (Settings.updateMessages || forceMsg) showNotification(`${Settings.chatPrefix}`, `&8Searching..`, "push", 1);

        let command = `powershell.exe -Command "& {
            $OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
            $headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = 'Bearer ${Settings.settingsPremiumSpotToken}' };
            $url = 'https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=${limit}';
            $response = Invoke-WebRequest -Uri $url -Method Get -Headers $headers;
            $json = $response.Content | ConvertFrom-Json;
            Add-Type -AssemblyName System.Web;
            $json.playlists.items | ForEach-Object {
                $playlistUrl = $_.external_urls.spotify;
                $playlistId = $playlistUrl -replace '^https://open.spotify.com/playlist/', '';
                $name = [System.Net.WebUtility]::HtmlDecode($_.name);
                $description = [System.Net.WebUtility]::HtmlDecode($_.description);
                Write-Host '&aName:&2' $name;
                Write-Host '&7Description:&8' $description;
                Write-Host '&6Playlist ID:&e' $playlistId;
                Write-Host '&8&m--------------------------';
            }
        }"`;

        const process = java.lang.Runtime.getRuntime().exec(command);

        const checkProcess = () => {
            if (process.isAlive()) {
                setTimeout(checkProcess, 50);
            } else {
                const reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream(), "UTF-8"));
                let line;
                let output = [];
                while ((line = reader.readLine()) !== null) {
                    output.push(line);
                }
                reader.close();

                const errorReader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getErrorStream(), "UTF-8"));
                let errorOutput = "";
                while ((line = errorReader.readLine()) !== null) {
                    errorOutput += line + "\n";
                }
                errorReader.close();

                process.waitFor();

                if (output.length > 0) {
                    showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Showing playlists from search result&r &a${query}&7.`, "push", 2);

                    let currentMessage = "";
                    let playlistId = "";
                    let playlistName = "";

                    ChatLib.chat("&8&m--------------------------");

                    output.forEach(msgLine => {
                        if (msgLine.startsWith("&aName:&2")) {
                            playlistName = msgLine.replace("&aName:&2", "").trim();
                        }

                        if (msgLine.startsWith("&6Playlist ID:&e")) {
                            playlistId = msgLine.replace("&6Playlist ID:&e", "").trim();
                        }

                        if (msgLine === "&8&m--------------------------") {
                            if (currentMessage.trim()) {
                                const clickableMessage = new Message(
                                    new TextComponent(currentMessage.trim()).setClick("run_command", `/spot playfromid ${playlistId} ${playlistName}`).setHoverValue(`&8[&a&lSpot&r&2&oPlaying&r&8] &fClick to play &a${playlistName}&f!`),
                                );                                  
                                ChatLib.chat(clickableMessage);
                                ChatLib.chat("&8&m--------------------------");
                            }
                            currentMessage = "";
                        } else {
                            currentMessage += msgLine + "\n";
                        }
                    });
                    if (currentMessage.trim()) {
                        const clickableMessage = new Message(
                            new TextComponent(currentMessage.trim()).setClick("run_command", `/spot playfromid ${playlistId} ${playlistName}`).setHoverValue(`&8[&a&lSpot&r&2&oPlaying&r&8] &fClick to play &a${playlistName}&f!`),
                        );                                  
                        ChatLib.chat(clickableMessage);
                    }
                } else {
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