import { Keybind } from "../../KeybindFix";

import { state } from "./variables";
import { showNotification } from "./notification";
import { seek } from "../utils/api/seek";
import { setVolume } from "../utils/api/setVolume";
import { togglePlayback } from "../utils/api/togglePlayback";
import { navigatePlayer } from "../utils/api/navigatePlayer";

new Keybind("-5 Seconds", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    seek(state.currentSongInfo.progress_ms - 5000);
});

new Keybind("+5 Seconds", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    seek(state.currentSongInfo.progress_ms + 5000);
});

new Keybind("Decrease Volume", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    setVolume(state.currentSongInfo.volume_percent - 5);
});

new Keybind("Increase Volume", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    setVolume(state.currentSongInfo.volume_percent + 5);
});

new Keybind("Pause/Play", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (state.currentSongInfo.is_playing) {
        togglePlayback("pause");
    } else {
        togglePlayback("play");
    }
});

new Keybind("Previous Song", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    navigatePlayer("previous");
});

new Keybind("Skip Song", Keyboard.KEY_NONE, "§a§lSpot§2§oPlaying").registerKeyPress(() => {
    if (state.currentSongInfo.name === "Advertisement") return showNotification(`${Settings.chatPrefix}`, `&c&l✖&r &7Wait for the &cAD&7 to finish.`, "push", 3);
    navigatePlayer("next");
});
