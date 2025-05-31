import { getVersion } from "./utils/getVersion";
import { @Vigilant, @TextProperty, @ParagraphProperty, @ColorProperty, @ButtonProperty, @SwitchProperty, @ColorProperty, @CheckboxProperty, @SelectorProperty, @PercentSliderProperty, @SliderProperty, Color } from 'Vigilance';

const version = getVersion();

@Vigilant("SpotPlaying", `§a§lSpot§2§oPlaying §f${version} §7by §btdarth`)

class Settings {
    npDragGui = new Gui();

    // Settings

    @TextProperty({
        name: "Discord Token",
        description: "Your Discord account token. This allows the module to automatically generate Spotify Tokens when they expire.",
        category: "Settings",
        subcategory: "API Access",
        placeholder: "Enter Token..",
        protected: true
    })
    settingsDiscordToken = "";

    @TextProperty({
        name: "Spotify User ID",
        description: "Your Spotify account ID. This allows the module to automatically generate Spotify Tokens when they expire.",
        category: "Settings",
        subcategory: "API Access",
        placeholder: "Enter User ID..",
        protected: true
    })
    settingsSpotifyUserId = "";

    @TextProperty({
        name: "Spotify Token",
        description: "&8You shouldn't need to modify this option.",
        category: "Settings",
        subcategory: "API Access",
        placeholder: "Enter Token..",
        protected: true
    })
    settingsPremiumSpotToken = "";

    @TextProperty({
        name: "Spotify Device ID",
        description: "&8Run /spot device if this option is blank.",
        category: "Settings",
        subcategory: "API Access",
        placeholder: "Enter ID..",
        protected: true
    })
    settingsDeviceID = "";

    @TextProperty({
        name: "API Ping Rate",
        description: "&7The time in milliseconds the API will be pinged at.\n&8It is highly recommended to keep this value at 5000.",
        category: "Settings",
        subcategory: "Configuration",
        placeholder: "Enter Number.."
    })
    apiPingRate = "5000";

    @TextProperty({
        name: "Chat Prefix",
        description: "What do you want the &bChat Prefix&7 to be?",
        category: "Settings",
        placeholder: "Enter Chat Prefix..",
        subcategory: "Other"
    })
    chatPrefix = "&8[&a&lSpot&r&2&oPlaying&r&8]&r &f";

    @ButtonProperty({
        name: "Reload ChatTriggers",
        description: "&7Reloading the module can &8*hopefully* &7fix any weird bugs you may get.",
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

    @ButtonProperty({
        name: "&e&oMove Overlay",
        description: "Allows you to drag the overlay to move it.",
        placeholder: "Click",
        category: "Now Playing"
    })
    openDrag() {
        this.npDragGui.open();
    }

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
        name: "Player Controls",
        description: "&7Toggles if you are able to use Player Controls found when hovering over the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npPlayerControls = true;

    @CheckboxProperty({
        name: "Middle Click to Open Spotify",
        description: "&7Toggles if you are able to open Spotify by middle clicking the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npMiddleClick = true;

    @CheckboxProperty({
        name: "Song Lyrics",
        description: "&7Toggles if song lyrics on supported songs are displayed under the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npLyrics = true;

    @SelectorProperty({
        name: "&e&oLyric Animation",
        description: "&7Changes how the lyrics are rendered on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -",
        options: ["Plain", "Highlight Lyric", "Fall into Place", "Fall into Place + Explosion"]
    })
    npLyricAnimation = 0;

    @CheckboxProperty({
        name: "&e&oShorten Song Lyrics",
        description: "&7Toggles if song lyrics are cut off... if they don't fit the box.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npShortenLyrics = true;

    // Position
    
    @SliderProperty({
        name: "&e&oOverlay X",
        description: "The X position of the overlay.",
        category: "Now Playing",
        subcategory: "Position",
        min: 0,
        max: 1000
    })
    npOverlayX = 5;

    @SliderProperty({
        name: "&e&oOverlay Y",
        description: "The Y position of the overlay.",
        category: "Now Playing",
        subcategory: "Position",
        min: 0,
        max: 1000
    })
    npOverlayY = 5;

    @SliderProperty({
        name: "&e&oSnap Size",
        description: "The snap size of the overlay.",
        category: "Now Playing",
        subcategory: "Position",
        min: 1,
        max: 10
    })
    npSnapSize = 5;


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

    @TextProperty({
        name: "&e&oProgress Bar Text",
        description: "&7The text that appears above the progress bar.&r\n&8Default: {minutes}:{seconds} / {endminutes}:{endseconds}.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npBarText = "&a{minutes}:{seconds} / {endminutes}:{endseconds}";

    @TextProperty({
        name: "&e&oLyric Text",
        description: "Use the placeholder &f{lyric} &7to replace itself with the current line of lyrics.",
        category: "Now Playing",
        placeholder: "Enter Text..",
        subcategory: "Configuration"
    })
    npLyricText = "{lyric}";

    @SliderProperty({
        name: "Overlay Size",
        description: "The size of the Overlay.\n&8Text size is not changed. 50 is the default.",
        category: "Now Playing",
        subcategory: "Configuration",
        min: 1,
        max: 100
    })
    npSizeMultiplier = 50;

    @SelectorProperty({
        name: "Image Quality",
        description: "Depending on the Overlay Size, a lower/higher quality may look less pixelated.",
        category: "Now Playing",
        subcategory: "Configuration",
        options: ["640x640", "300x300", "60x60"]
    })
    npImageQuality = 0;

    @ColorProperty({
        name: "Overlay Color",
        description: "&7The background color of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration",
        allowAlpha: false
    })
    npBGColor = new Color(0, 0, 0);

    @ColorProperty({
        name: "&e&oProgress Bar Color",
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
        name: "&e&oProgress Bar Opacity",
        description: "&7The opacity of the progress bar.",
        category: "Now Playing",
        subcategory: "Configuration",
        min: 0,
        max: 255
    })
    npBarOpacity = 200;

    @TextProperty({
        name: "&e&oSong Lyrics Explosion Strength",
        description: "The velocity applied to each character during an explosion.\n&8Default: 0.5",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npLyricExplosionStrength = "0.5";

    @TextProperty({
        name: "&e&oSong Lyrics Explosion Gravity",
        description: "The gravity applied to each character during an explosion.\n&8Default: 0.0005",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npLyricGravity = "0.0005";

    @CheckboxProperty({
        name: "Text Shadows",
        description: "&7Toggles if the text in the overlay has shadows.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npTextShadow = true;

    // Miscellaneous
    @CheckboxProperty({
        name: "Chat Commands",
        description: "&7Sends your playing song if a player types &f!song&7 in Party, Guild, or Officer chat.",
        category: "Now Playing",
        subcategory: "Miscellaneous"
    })
    chatCommands = true;

    constructor() {
        this.initialize(this);
        this.addDependency("&e&oMove Overlay", "Overlay Enabled");
        this.addDependency("&e&oOverlay X", "Overlay Enabled");
        this.addDependency("&e&oOverlay Y", "Overlay Enabled");
        this.addDependency("&e&oSnap Size", "Overlay Enabled");
        this.addDependency("&e&oProgress Bar Color", "Progress Bar");
        this.addDependency("&e&oProgress Bar Text", "Progress Bar");
        this.addDependency("&e&oLyric Text", "Song Lyrics");
        this.addDependency("&e&oProgress Bar Opacity", "Progress Bar");
        this.addDependency("&e&oLyric Animation", "Song Lyrics");
        this.addDependency("&e&oShorten Song Lyrics", "Song Lyrics");
        this.addDependency("&e&oSong Lyrics Explosion Strength", "Song Lyrics");
        this.addDependency("&e&oSong Lyrics Explosion Gravity", "Song Lyrics");
        this.setCategoryDescription("Now Playing", "&c&l!&r &7First time? Please run &a/spot tutorial &7before modifying options. &c&l!&r\nOptions titled &e&olike this&r require another feature to be enabled.");
        this.setCategoryDescription("Settings", "&7A module by &atdarth &7and &2Github Copilot&7.\n&c&lDo not share these tokens with anyone!&r");
    }
}

export default new Settings();
