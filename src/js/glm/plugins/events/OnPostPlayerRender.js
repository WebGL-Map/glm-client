import GetChunkForPositionCommand from "../commands/GetChunkForPositionCommand";

/**
 * Handles functions relating to the postPlayersRender event.
 *
 * @author Tyler Bucher
 */
export default class OnPostPlayerRender {

    /**
     * The callback function for the postPlayersRender event.
     *
     * @param {Event} event the event fired.
     */
    static handle(event) {
        // Get the current time
        let start = Date.now();
        // Render the world border
        window.dataManager.texturePack.renderWorldBorder(window.dataManager.selectedWorld);
        // Request the chunks for download if any
        OnPostPlayerRender.requestDownload();
        // Process any json data from the server if there is time
        let elapsedTime = 16.66 - ((Date.now() - start) + event['elapsedTime']);
        OnPostPlayerRender.processJsonData(elapsedTime > 4 ? elapsedTime : 4);
    }

    /**
     * Request the chunks for download if any.
     */
    static requestDownload() {
        // Download for the currently selected world
        if (window.dataManager.selectedWorld != null) {
            if (window.dataManager.selectedWorld.downloadArray.length > 0) {
                // Make request to download chunks
                window.dataManager.selectedServer.webSocketClient.webSocket.send(JSON.stringify({
                    cmd     : "getChunksForPositions",
                    worldId : window.dataManager.selectedWorld.uuid,
                    dataType: "chunkPosition",
                    data    : window.dataManager.selectedWorld.downloadArray
                }));
                // Clear request array
                window.dataManager.selectedWorld.downloadArray = [];
            }
        }
    }

    /**
     * Creates new chunks from json data.
     *
     * @param {Number} timeInMilliseconds the max amount of time this function can run for.
     */
    static processJsonData(timeInMilliseconds) {
        let startTime = Date.now();
        let chunkData = null;
        // Only loop while we have enough time to do so
        while ((Date.now() - startTime) < timeInMilliseconds) {
            // Get a chunk from the queue if there is no chunk exit this function
            chunkData = window.dataManager.selectedWorld.chunkJsonQueue.pop();
            if (chunkData == null) break;
            // Decompress and decode chunk information
            let chunkDataArray  = GetChunkForPositionCommand.decompressBase64(chunkData['chunkData']).split('|');
            let heightDataArray = GetChunkForPositionCommand.decompressBase64HeightData(chunkData['chunkHeightData']);
            // Compute map key value pairs if they are absent
            let xMap            = window.dataManager.selectedWorld.chunkMap.get(chunkData['position']['x']);
            if (xMap == null) {
                xMap = new Map();
                window.dataManager.selectedWorld.chunkMap.set(chunkData['position']['x'], xMap);
            }
            // Get the current chunk at the z position
            let chunk = xMap.get(chunkData['position']['z']);
            // If chunk is null create a new chunk if it exists update it with new information
            if (chunk == null) {
                chunk = window.dataManager.texturePack.createChunk(
                    chunkDataArray,
                    heightDataArray,
                    chunkData['position']['x'],
                    0,
                    chunkData['position']['z']
                );
                xMap.set(chunkData['position']['z'], chunk);
            } else {
                window.dataManager.texturePack.updateChunk(chunk, chunkDataArray, heightDataArray);
            }
        }
    }
}