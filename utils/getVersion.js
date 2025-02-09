export function getVersion() {
    const metadata = FileLib.read("SpotPlaying", "metadata.json");
    return JSON.parse(metadata).version;
}