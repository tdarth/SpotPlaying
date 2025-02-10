import { getVersion } from "./utils/getVersion";
import { @Vigilant, @TextProperty, @ParagraphProperty, @ColorProperty, @ButtonProperty, @SwitchProperty, @ColorProperty, @CheckboxProperty, @SelectorProperty, @PercentSliderProperty, @SliderProperty, Color } from 'Vigilance';

const version = getVersion();

@Vigilant("SpotPlaying", `§a§lSpot§2§oPlaying §f${version} §7by §btdarth`)

class Settings {
    // Settings

    @TextProperty({
        name: "Discord Token",
        description: "Your Discord account token. This allows the module to automatically generate Spotify Tokens when they expire.",
        category: "Settings",
        placeholder: "Enter Token..",
        protected: true
    })
    settingsDiscordToken = "";

    @TextProperty({
        name: "Spotify User ID",
        description: "Your Spotify account ID. This allows the module to automatically generate Spotify Tokens when they expire.",
        category: "Settings",
        placeholder: "Enter User ID..",
        protected: true
    })
    settingsSpotifyUserId = "";

    @TextProperty({
        name: "Spotify Token",
        description: "&8You shouldn't need to modify this option.",
        category: "Settings",
        placeholder: "Enter Token..",
        protected: true
    })
    settingsPremiumSpotToken = "";

    @TextProperty({
        name: "Spotify Device ID",
        description: "&8You shouldn't need to modify this option.",
        category: "Settings",
        placeholder: "Enter ID..",
        protected: true
    })
    settingsDeviceID = "";

    @TextProperty({
        name: "API Ping Rate",
        description: "&7The time in milliseconds the API will be pinged at.\n&8A lower value may get you rate limited.",
        category: "Settings",
        placeholder: "Enter Number..",
    })
    apiPingRate = "5000";

    @TextProperty({
        name: "Chat Prefix",
        description: "What do you want the &bChat Prefix&7 to be?",
        category: "Settings",
        placeholder: "Enter Chat Prefix..",
        subcategory: "Other"
    })
    chatPrefix = "&8[&a&lSpot&2&oPlaying&8] &f";

    @ButtonProperty({
        name: "Reload ChatTriggers",
        description: "&7Reloading the module is &crequired&7 for some changes to apply.",
        placeholder: "Reload",
        category: "Settings",
        subcategory: "Other"
    })
    reloadCT() {
        Client.showTitle('&f', "&a&lReloading...", 8, 50, 8);
        ChatLib.command("chattriggers load", true);
        Client.currentGui.close()
    }

    // Now Playing

    // - Toggles -

    @CheckboxProperty({
        name: "Overlay Enabled",
        description: "&7Toggles if you are able to see Now Playing overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npEnabled = false;

    @CheckboxProperty({
        name: "Progress Bar",
        description: "&7Toggles if you are able to see the Progress Bar on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npProgressBar = true;

    @CheckboxProperty({
        name: "Progress Bar Seek",
        description: "&7Toggles if clicking a spot in the progress bar updates the song time.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npSeekBar = true;

    @CheckboxProperty({
        name: "Pause/Play Button",
        description: "&7Toggles if you are able to pause/play the current song on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npPauseButton = true;

    @CheckboxProperty({
        name: "Open Spotify on Click",
        description: "&7Toggles if you are able to open Spotify by clicking on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npHover = true;

    // Configuration

    @TextProperty({
        name: "Song Title Text",
        description: "Use the placeholder &f{song} &7to replace itself with the playing song.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npSettingsSong = "{song}";

    @TextProperty({
        name: "Artist Title Text",
        description: "Use the placeholder &f{artist} &7to replace itself with the artist of the playing song.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npSettingsArtist = "&7{artist}";

    @ColorProperty({
        name: "Overlay Color",
        description: "&7The background color of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration",
        allowAlpha: false
    })
    npBGColor = new Color(0, 0, 0);

    @ColorProperty({
        name: "Progress Bar Color",
        description: "&7The color of the progress bar.",
        category: "Now Playing",
        subcategory: "Configuration",
        allowAlpha: false
    })
    npBarColor = new Color(0, 0, 0);

    @SliderProperty({
        name: "Overlay Opacity",
        description: "&7The opacity of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration",
        min: 0,
        max: 255
    })
    npBGOpacity = 100;

    @SliderProperty({
        name: "Progress Bar Opacity",
        description: "&7The opacity of the progress bar.",
        category: "Now Playing",
        subcategory: "Configuration",
        min: 0,
        max: 255
    })
    npBarOpacity = 200;

    @TextProperty({
        name: "Pause Symbol",
        description: "Sets the text of the pause button. &8Leave blank for default.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npPauseSymbol = "││";

    @TextProperty({
        name: "Play Symbol",
        description: "Sets the text of the play button. &8Leave blank for default.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npPlaySymbol = "➤";

    @CheckboxProperty({
        name: "Text Shadows",
        description: "&7Toggles if the text in the overlay has shadows.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npTextShadow = true;

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("Now Playing", "&c&l!&r &7First time? Please run &a/spot tutorial &7before modifying options. &c&l!&r");
        this.setCategoryDescription("Settings", "&7A module by &atdarth &7and &2Github Copilot&7.");
    }
}

export default new Settings();
