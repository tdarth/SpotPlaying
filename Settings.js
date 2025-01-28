import { @Vigilant, @TextProperty, @ParagraphProperty, @ColorProperty, @ButtonProperty, @SwitchProperty, @ColorProperty, @CheckboxProperty, @SelectorProperty, @PercentSliderProperty, @SliderProperty, Color } from 'Vigilance';

const metadata = FileLib.read("SpotPlaying", "metadata.json");
const version = JSON.parse(metadata).version;

@Vigilant("SpotPlaying", `§a§lSpot§2§oPlaying §f${version} §7by §btdarth`)

class Settings {
    npDragGui = new Gui();

    // Settings

    @TextProperty({
        name: "Spotify Token",
        description: "A Spotify Account Access Token.\n&cTokens expire every &4hour&c.",
        category: "Settings",
        placeholder: "Enter Token..",
    })
    settingsSpotToken = "";

    @CheckboxProperty({
        name: "Show Errors",
        description: "&7Toggles if errors are displayed in chat.",
        category: "Settings",
    })
    showErrors = true;

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

    // Developer

    @TextProperty({
        name: "API URL",
        description: "&7The API URL used to fetch Spotify data.",
        category: "Settings",
        placeholder: "Enter Link..",
        subcategory: "z Developer z"
    })
    apiUrl = "https://untitledapi.onrender.com/getplayingsong";

    @TextProperty({
        name: "API Key",
        description: "&7The API Key used to fetch Spotify data.",
        category: "Settings",
        placeholder: "Enter Chat Prefix..",
        subcategory: "z Developer z"
    })
    settingsApiKey = "5efd91ea85702905e17d2800bbb613bd";

    @TextProperty({
        name: "API Ping Rate",
        description: "&7The time in milliseconds the API will be pinged at.",
        category: "Settings",
        placeholder: "Enter Chat Prefix..",
        subcategory: "z Developer z"
    })
    apiPingRate = "10000";

    // Now Playing

    // - Toggles -

    @CheckboxProperty({
        name: "Overlay Enabled",
        description: "&7Toggles if you are able to see Now Playing overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npEnabled = true;

    @CheckboxProperty({
        name: "Progress Bar",
        description: "&7Toggles if you are able to see the Progress Bar on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npProgressBar = true;

    @CheckboxProperty({
        name: "Open Spotify on Click",
        description: "&7Toggles if you are able to open Spotify by clicking on the overlay.",
        category: "Now Playing",
        subcategory: "- Toggles -"
    })
    npHover = true;

    // Configuration

    @ColorProperty({
        name: "Overlay Color",
        description: "&7The background color of the overlay.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npBGColor = new Color(0, 0, 0);

    @ColorProperty({
        name: "Progress Bar Color",
        description: "&7The color of the progress bar.",
        category: "Now Playing",
        subcategory: "Configuration"
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

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("Settings", "&7A module by &atdarth &7and &2Github Copilot&7.");
    }
}

export default new Settings();
