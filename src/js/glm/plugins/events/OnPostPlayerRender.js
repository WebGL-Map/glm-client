import GetChunkForPositionCommand from "../commands/GetChunkForPositionCommand";

export default class OnPostPlayerRender {

    static handle(event) {
        let start = Date.now();
        window.dataManager.texturePack.renderWorldBorder(window.dataManager.selectedWorld);
        OnPostPlayerRender.requestDownload();
        let ttime = 16.66 - ((Date.now() - start) + event.elapsedTime);
        start = Date.now();
        OnPostPlayerRender.processJsonData(ttime > 4 ? ttime : 4);
        ttime -= Date.now() - start;
        window.dataManager.texturePack.processLighting(ttime > 4 ? ttime : 4);
    }

    static requestDownload() {
        if (window.dataManager.selectedWorld != null) {
            if (window.dataManager.selectedWorld.downloadArray.length > 0) {
                window.dataManager.selectedServer.webSocketClient.webSocket.send(JSON.stringify({
                    cmd     : "getChunksForPositions",
                    worldId : window.dataManager.selectedWorld.uuid,
                    dataType: "chunkPosition",
                    data    : window.dataManager.selectedWorld.downloadArray
                }));
                window.dataManager.selectedWorld.downloadArray = [];
            }
        }
    }

    static processJsonData(timeInMilliseconds) {
        let startTime = Date.now();
        let chunkData = null;
        while ((Date.now() - startTime) < timeInMilliseconds) {
            chunkData = window.dataManager.selectedWorld.chunkJsonQueue.pop();
            if (chunkData == null) break;

            let chunkDataArray  = GetChunkForPositionCommand.decompressBase64(chunkData['chunkData']).split('|');
            let heightDataArray = GetChunkForPositionCommand.decompressBase64HeightData(chunkData['chunkHeightData']);

            let xMap = window.dataManager.selectedWorld.chunkMap.get(chunkData['position']['x']);
            if (xMap == null) {
                xMap = new Map();
                window.dataManager.selectedWorld.chunkMap.set(chunkData['position']['x'], xMap);
            }
            let chunk = xMap.get(chunkData['position']['z']);
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
            window.dataManager.selectedWorld.lightingQueue.add(chunk);
        }
    }
}