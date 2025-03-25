import Settings from "../Settings";
import { getOverlayDimensions } from "./overlay";

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

register("dragged", () => {
    if (Settings.npDragGui.isOpen()) {
        const { width, height } = getOverlayDimensions();
        const mouseX = Client.getMouseX();
        const mouseY = Client.getMouseY();

        const isMouseWithinOverlay = mouseX >= Settings.npOverlayX && mouseX <= Settings.npOverlayX + width &&
            mouseY >= Settings.npOverlayY && mouseY <= Settings.npOverlayY + height;

        if (isMouseWithinOverlay && !isDragging) {
            isDragging = true;
            dragOffsetX = mouseX - Settings.npOverlayX;
            dragOffsetY = mouseY - Settings.npOverlayY;
        }

        if (isDragging) {
            let newX = mouseX - dragOffsetX;
            let newY = mouseY - dragOffsetY;

            newX = Math.round(newX / Settings.npSnapSize) * Settings.npSnapSize;
            newY = Math.round(newY / Settings.npSnapSize) * Settings.npSnapSize;

            Settings.npOverlayX = newX;
            Settings.npOverlayY = newY;
        }
    }
});

register("guiMouseRelease", () => {
    if (isDragging) {
        isDragging = false;
    }
});