export function checkHover(x, y, width, height) {
    if (!Client.isInGui()) return;
    const mouseX = Client.getMouseX();
    const mouseY = Client.getMouseY();
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}