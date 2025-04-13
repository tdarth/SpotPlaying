import Settings from "../Settings";
import { state } from "./variables";

register("chat", (chat, player) => {
    if (!Settings.chatCommands) return;
    let name = player.split(" ").length > 0 ? player.split(" ")[1] : player;
    if (state.currentSongInfo.name === "Advertisement") return setTimeout(() => { ChatLib.command(`${chat.charAt(0)}c ${name}, I'm listening to an Advertisement on /ct import SpotPlaying.`) }, 250);
    setTimeout(() => { ChatLib.command(`${chat.charAt(0)}c ${name}, I'm listening to: ${state.currentSongInfo.name} by ${state.currentSongInfo.artists.join(", ")} on /ct import SpotPlaying.`) }, 250);
}).setCriteria("${chat} > ${player}: !song")