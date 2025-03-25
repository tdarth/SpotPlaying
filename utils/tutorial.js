const TokenInstructionMessage = new Message(
    new TextComponent("&8[&a&lSpot&2&oPlaying&8] &fTo obtain your &9Discord Token&f, please click &e&l&nHERE&f &ffor instructions.\n").setClick("run_command", "/spotopendiscordtokentutorial").setHoverValue("Click to open a website containing instructions on how to obtain your &9Discord Token&f.")
);

const SpotUserIDInstructionMessage = new Message(
    new TextComponent("&8[&a&lSpot&2&oPlaying&8] &fTo obtain your &aSpotify User ID&f, please click &e&l&nHERE&f &fand copy the string of characters found under &7Username&f. You may have to login to your &aSpotify Account&f.\n").setClick("run_command", "/spotopenspotuseridtutorial").setHoverValue("Click to open a website containing instructions on how to obtain your &aSpotify Username&f.")
);

export function tutorial(progress = 0) {
    if (!progress) {
        ChatLib.chat(`\n&8[&a&lSpot&2&oPlaying&8] &fThank you for installing &a&lSpot&2&oPlaying&f!\n`)
        setTimeout(() => {
            ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fThis module requires your &cDiscord Token&f, &cSpotify User ID&f, and &4Linking your Spotify Account with your Discord Account&f.\n`)
            setTimeout(() => {
                ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fAll sensitive tokens are &c&nonly used&f with the official &9Discord&f and &aSpotify &fAPI.\n`)
                setTimeout(() => {
                    ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fTo setup this module, please link your &aSpotify Account &fwith your &9Discord Account&f.\n`)
                    setTimeout(() => {
                        ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fThis can be done in\n&7Discord Settings -> Connections -> View More -> Spotify&f.\n`)
                        setTimeout(() => {
                            ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fOnce you have connected &cboth accounts &ftogether, type &2/spot tutorial 2 &fto continue with the setup.\n`)
                        }, 6000);
                    }, 6000);
                }, 6000);
            }, 5000);
        }, 3000);
    } else if (progress === 2) {
        ChatLib.chat(`\n&8[&a&lSpot&2&oPlaying&8] &fNext, you must enter your &9Discord Token &finto the module.\n`)
        setTimeout(() => {
            ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fAs a reminder, &7ALL &fsensitive tokens are &c&nonly used&f with the official &9Discord&f and &aSpotify &fAPI.\n`)
            setTimeout(() => {
                ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &cAs a warning&f, all tokens are kept in a file stored in &4plain text&f.\n`)
                setTimeout(() => {
                    ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fIf you would like to continue the setup, please type &2/spot tutorial 3&f.\n`)
                }, 6000);
            }, 6000);
        }, 5000);
    } else if (progress === 3) {
        ChatLib.chat(TokenInstructionMessage)
        setTimeout(() => {
            ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fOnce you have your &9Discord Token&f, type &2/spot &fand paste it in. Then, type &2/spot tutorial 4 &fto continue.\n`)
        }, 3000);
    } else if (progress === 4) {
        ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fTo continue, you now need to input your &aSpotify User ID&f.\n`)
        setTimeout(() => {
            ChatLib.chat(SpotUserIDInstructionMessage);
            setTimeout(() => {
                ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fOnce you have your &aSpotify User ID&f, type &2/spot &fand paste it in.\n`)
                setTimeout(() => {
                    ChatLib.chat(`&8[&a&lSpot&2&oPlaying&8] &fWhen your &7token &fis in the Settings Menu, open the &aSpotify Desktop Player&f, and type &2/spot tutorial 5&f.\n`)
                }, 4000);
            }, 4000);
        }, 5000);
    }
}