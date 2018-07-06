import {Command} from "glm-client-base";
import {Event} from "glm-client-base";
import {Vector3} from "math.gl";
import {ServerStates} from "glm-client-base";
import {WorldBorder} from "glm-client-base";

export default class GetWorldsCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        window.dataManager.initGlm();
        window.dataManager.eventManager.dispatchEvent(new Event('preGetWorlds'));
        let cServer   = window.dataManager.serverMap.get(event.target.url);
        cServer.state = ServerStates.GET_WORLDS;
        for (let jsonWorld of jsonObject["data"]['worlds']) {
            let idefault = false;
            if (jsonWorld['default'] != null) {
                idefault = jsonWorld['default'];
            }
            // Create world
            let world          = window.dataManager.texturePack.createWorld(jsonWorld['id'], jsonWorld['name'], idefault,
                new Vector3(jsonWorld['spawnPoint']['x'], jsonWorld['spawnPoint']['y'], jsonWorld['spawnPoint']['z']));
            // Set world border
            let worldBorderObj = jsonWorld['worldBorder'];
            if (worldBorderObj != null) {
                let center        = jsonWorld['worldBorder']['center'];
                world.worldBorder = window.dataManager.texturePack.createWorldBorder(new Vector3(center['x'], center['y'], center['z']),
                    jsonWorld['worldBorder']['diameter']);
            }

            cServer.worldMap.set(jsonWorld['id'], world);
            if (cServer === window.dataManager.primaryServer) {
                if (idefault) {
                    window.dataManager.selectedWorld  = cServer.worldMap.get(jsonWorld['id']);
                    window.dataManager.selectedServer = cServer;
                }
            }
        }
        // TODO
        $('#landingDiv').fadeOut('fast', function () {
            $('#mapDiv').css("z-index", "unset");
            //window.dataManager.initGlm();
        });
        window.dataManager.eventManager.dispatchEvent(new Event('postGetWorlds'));
    }
}