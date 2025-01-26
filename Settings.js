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

    // Now Playing

    @CheckboxProperty({
        name: "Overlay Enabled",
        description: "&7Toggles if you are able to see Now Playing overlay.",
        category: "Now Playing",
        subcategory: "Configuration"
    })
    npEnabled = true;

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("Settings", "&7A module by &atdarth &7and &2Github Copilot&7.");
    }
}

export default new Settings();
