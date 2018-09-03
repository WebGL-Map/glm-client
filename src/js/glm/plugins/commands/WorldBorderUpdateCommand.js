import {Command, WorldBorder} from "glm-client-base";
import {Vector3} from "math.gl";

/**
 * Handles events for retrieving the world border information from the server.
 *
 * @author Tyler Bucher
 */
export default class WorldBorderUpdateCommand extends Command {

    /**
     * @param {Event} event the event object to pass.
     * @param {JSON} jsonObject the json object from the web socket message.
     */
    handle(event, jsonObject) {
        // Get the requested server for this event
        let cServer = window.dataManager.serverMap.get(event.target['url']);
        // Get the world for this world border
        let world   = cServer.worldMap.get(jsonObject['data']['worldId']);
        if (world != null) {
            // Add world border object to world
            let worldBorderObj = jsonObject['data']['worldBorder'];
            if (worldBorderObj != null) {
                let center        = jsonObject['data']['worldBorder']['center'];
                world.worldBorder = window.dataManager.texturePack.createWorldBorder(new Vector3(center['x'], center['y'], center['z']),
                    jsonObject['data']['worldBorder']['diameter']);
            } else {
                world.worldBorder = null;
            }
        }
    }
}