import {Command, Event, ServerStates, WorldBorder} from "glm-client-base";
import {Vector3} from "math.gl";

/**
 * Handles events for retrieving the world list from the server.
 *
 * @author Tyler Bucher
 */
export default class GetWorldsCommand extends Command {

    /**
     * @param {Event} event the event object to pass.
     * @param {JSON} jsonObject the json object from the web socket message.
     */
    handle(event, jsonObject) {
        // Initializes the glm client and canvas and starts the request animation frame process
        window.dataManager.initGlm();
        // Dispatch events
        window.dataManager.eventManager.dispatchEvent(new Event('preGetWorlds'));
        // Get the requested server for this event
        let cServer   = window.dataManager.serverMap.get(event.target['url']);
        // Set the state of the request server
        cServer.state = ServerStates.GET_WORLDS;
        // Loop through the returned worlds given from the server
        for (let jsonWorld of jsonObject["data"]['worlds']) {
            // Checks if this world is a default world
            // meaning it will show up first in the world list and render first
            let isDefault = false;
            if (jsonWorld['default'] != null) {
                isDefault = jsonWorld['default'];
            }
            // Create the world
            let world          = window.dataManager.texturePack.createWorld(jsonWorld['id'], jsonWorld['name'], isDefault,
                new Vector3(jsonWorld['spawnPoint']['x'], jsonWorld['spawnPoint']['y'], jsonWorld['spawnPoint']['z']));
            // Set the world border for the newly created world
            let worldBorderObj = jsonWorld['worldBorder'];
            if (worldBorderObj != null) {
                let center        = jsonWorld['worldBorder']['center'];
                world.worldBorder = window.dataManager.texturePack.createWorldBorder(new Vector3(center['x'], center['y'], center['z']),
                    jsonWorld['worldBorder']['diameter']);
            }
            // Add the newly created world to the world list
            cServer.worldMap.set(jsonWorld['id'], world);
            // Set the current server and selected wold
            if (cServer === window.dataManager.primaryServer) {
                if (isDefault) {
                    window.dataManager.selectedWorld  = cServer.worldMap.get(jsonWorld['id']);
                    window.dataManager.selectedServer = cServer;
                }
            }
        }
        // Transition out of loading screen to WebGL canvas.
        $('#landingDiv').fadeOut('fast', function () {
            $('#mapDiv').css("z-index", "unset");
        });
        // Dispatch events
        window.dataManager.eventManager.dispatchEvent(new Event('postGetWorlds'));
    }
}