import {Command} from "glm-client-base";

/**
 * Handles events for reading chunk data from the server.
 *
 * @author Tyler Bucher
 */
export default class GetChunkForPositionCommand extends Command {

    /**
     * @param {Event} event the event object to pass.
     * @param {JSON} jsonObject the json object from the web socket message.
     */
    handle(event, jsonObject) {
        // Loop through the chunks returned by the server
        let cServer = window.dataManager.serverMap.get(event.target['url']);
        for (let chunk of jsonObject['data']['chunks']) {
            // Push chunk to json queue so we do not occupy the whole render frame
            let world = cServer.worldMap.get(jsonObject['data']['worldId']);
            if (world !== null) {
                world.chunkJsonQueue.push(chunk);
            }
        }
    }

    /**
     * Expands a base64 string into binary data then decompresses it from gzip.
     *
     * @param base64String the string to decompress.
     * @return {string} the decompressed gzip string.
     */
    static decompressBase64(base64String) {
        // Convert base64 string into bin data
        let binData      = atob(base64String);
        let binDataArray = [];
        // Convert bin data back into characters
        for (let i = 0; i < binData.length; i++) {
            binDataArray.push(binData.charCodeAt(i));
        }
        // Decompress character array into original data
        let decompressedBinDataArray = (new Zlib.Gunzip(binDataArray)).decompress();
        return String.fromCharCode.apply(String, decompressedBinDataArray);
    }

    /**
     * Expands a base64 string into binary data then decompresses it from gzip.
     *
     * @param base64String the string to decompress.
     * @return {Array<Number>} the decompressed 32bit integer array.
     */
    static decompressBase64HeightData(base64String) {
        // Convert base64 string into bin data
        let binData      = atob(base64String);
        let binDataArray = [];
        // Convert bin data back into characters
        for (let i = 0; i < binData.length; i++) {
            binDataArray.push(binData.charCodeAt(i));
        }
        // Decompress character array back into bin data
        let decompressedBinDataArray = (new Zlib.Gunzip(binDataArray)).decompress();
        let intArray                 = [];
        // Convert bin data into 32 bit integer array
        for (let i = 0; i < decompressedBinDataArray.length; i += 4) {
            intArray.push(((0xFF & decompressedBinDataArray[i]) << 24) | ((0xFF & decompressedBinDataArray[i + 1]) << 16) |
                ((0xFF & decompressedBinDataArray[i + 2]) << 8) | (0xFF & decompressedBinDataArray[i + 3]));
        }
        return intArray;
    }
}