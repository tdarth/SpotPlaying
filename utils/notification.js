import Settings from "../Settings";

const EssentialAPI = Java.type('gg.essential.api.EssentialAPI');
const EssentialNotifs = EssentialAPI.getNotifications();
const EssentialConfig = EssentialAPI.getConfig();

const EnableNotifications = new Message(
    new TextComponent(`${Settings.chatPrefix}&fEssential Notifications are &cdisabled.\n&fClick this message to &aenable&f them. (Required for Module).`).setClick("run_command", "/spotenablenotifications").setHoverValue(`${Settings.chatPrefix}&7Click to enable notifications.`)
);

export function showNotification(title, message, type, length, action, action2) {
    if (EssentialConfig.disableAllNotifications) return ChatLib.chat(EnableNotifications);
    switch (type) {
        case "push":
            if (length) {
                EssentialNotifs.push(title, message, length);
            } else {
                EssentialNotifs.push(title, message);
            }
            break;
        case "pushAction":
            if (action) {
                EssentialNotifs.push(title, message, () => action());
            }
            break;
        case "pushActionDuration":
            if (action && length) {
                EssentialNotifs.push(title, message, length, () => action());
            }
            break;
        case "pushActionDurationClose":
            if (action && length && action2) {
                EssentialNotifs.push(title, message, length, () => action(), () => action2());
            }
            break;
        default:
            throw new Error(`Unknown notification type: ${type}`);
    }
}

register("command", () => {
    EssentialConfig.disableAllNotifications = false;
    ChatLib.chat(`${Settings.chatPrefix}&fEssential Notifications have been &a&nenabled&f.`);
}).setName("spotenablenotifications");