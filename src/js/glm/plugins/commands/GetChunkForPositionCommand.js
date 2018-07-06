import {Command} from "glm-client-base";

export default class GetChunkForPositionCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        for (let chunk of jsonObject['data']['chunks']) {
            let cServer = window.dataManager.serverMap.get(event.target.url);
            let world   = cServer.worldMap.get(jsonObject['data']['worldId']);
            if (world != null) {
                world.chunkJsonQueue.push(chunk);
            }
        }
    }

    static decompressBase64(base64String) {
        let binData      = atob(base64String);
        let binDataArray = [];
        for (let i = 0; i < binData.length; i++) {
            binDataArray.push(binData.charCodeAt(i));
        }
        let decompressedBinDataArray = (new Zlib.Gunzip(binDataArray)).decompress();
        return String.fromCharCode.apply(String, decompressedBinDataArray);
    }

    static decompressBase64HeightData(base64String) {
        let binData      = atob(base64String);
        let binDataArray = [];
        for (let i = 0; i < binData.length; i++) {
            binDataArray.push(binData.charCodeAt(i));
        }
        let decompressedBinDataArray = (new Zlib.Gunzip(binDataArray)).decompress();
        let intArray                 = [];
        for (let i = 0; i < decompressedBinDataArray.length; i += 4) {
            intArray.push(((0xFF & decompressedBinDataArray[i]) << 24) | ((0xFF & decompressedBinDataArray[i + 1]) << 16) |
                ((0xFF & decompressedBinDataArray[i + 2]) << 8) | (0xFF & decompressedBinDataArray[i + 3]));
        }
        return intArray;
    }
}