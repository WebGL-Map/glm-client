import {Command} from "glm-client-base";
import {Vector3} from "math.gl";
import {WorldBorder} from "glm-client-base";

export default class WorldBorderUpdateCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        let cServer = window.dataManager.serverMap.get(event.target.url);
        let world = cServer.worldMap.get(jsonObject['data']['worldId']);
        if(world != null) {
            let worldBorderObj = jsonObject['data']['worldBorder'];
            if(worldBorderObj != null) {
                let center = jsonObject['data']['worldBorder']['center'];
                world.worldBorder = window.dataManager.texturePack.createWorldBorder(new Vector3(center['x'], center['y'], center['z']),
                    jsonObject['data']['worldBorder']['diameter']);
            } else {
                world.worldBorder = null;
            }
        }
    }
}