const EssentialAPI = Java.type('gg.essential.api.EssentialAPI');
const EssentialNotifs = EssentialAPI.getNotifications();

export function showNotification(title, message, type, length, action, action2) {
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