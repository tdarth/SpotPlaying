import { fetch } from "../../../tska/polyfill/Fetch";

import Settings from "../../Settings";
import { showNotification } from "../notification";

let device_ids = [];

export function getDeviceID(forceMsg = false) {
    if (forceMsg) showNotification(`${Settings.chatPrefix}`, `&8Updating Device ID..`, "push", 1);
    fetch(`https://api.spotify.com/v1/me/player/devices/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${Settings.settingsPremiumSpotToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        const data = JSON.parse(response);

        data.devices.forEach(device => {
            if (device.id) device_ids.push(device.id);
        });

        if (device_ids.length == 0) showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Make sure the&r &cDesktop App&r\n&7is open.`, "push", 5);
        else if (device_ids.length == 1) {
            Settings.settingsDeviceID = device_ids[0];
            showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Updated your&r &aDevice ID&r&7.`, "push", 1);
        } else {
            ChatLib.chat(`\n${Settings.chatPrefix}&fMultiple &cdevices &ffound.\n&7Please select your current device.`);
            data.devices.forEach((device, index) => {
                const DeviceMessage = new Message(
                    new TextComponent(`&8- &a&lDevice #${index + 1} &f${device.name} &7(${device.type})`)
                        .setClick("run_command", `/spotsetdeviceid ${device_ids[index]}`)
                        .setHoverValue(`${Settings.chatPrefix}&fClick to set your Device to &a${device.name} &7(${device.type})&f.`)
                );
                ChatLib.chat(DeviceMessage);
            });
        }

        device_ids.length = 0;
    })
    .catch(error => {
        if (error.includes("The access token expired") || error.includes("Only valid bearer authentication supported") || error.includes("Invalid access token")) {
            if (!Settings.settingsDiscordToken) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Invalid or expired&r &cSpotify Token&r&7.\nPlease update options found in&r &8/spotify&r&7.`, "push", 5);
            else return getSpotifyToken();
        }
        ChatLib.chat(`${Settings.chatPrefix}&cAn error occurred. &4${error}`);
    });
}

register("command", (deviceID) => {
    if (!deviceID) return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Please provide a&r &cDevice ID&r&7.`, "push", 5);
    Settings.settingsDeviceID = deviceID;
    showNotification(`${Settings.chatPrefix}`, `&a&l✔&r &7Updated your&r &aDevice ID&r&7.`, "push", 1);
}).setName("spotsetdeviceid");