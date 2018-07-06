import {Command} from "glm-client-base";
import {Vector3} from "math.gl";

export default class GetPlayersCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        for (let player of jsonObject['data']['players']) {
            let cServer = window.dataManager.serverMap.get(event.target.url);
            let world   = cServer.worldMap.get(jsonObject['data']['worldId']);
            if (world != null) {
                world.playerMap.clear();
                world.requestPlayerCommandInterval = jsonObject['data']['commandInterval'];
                let pplayer = world.playerMap.get(player['id']);
                if(pplayer == null) {
                    world.playerMap.set(player['id'], window.dataManager.texturePack.createPlayer(player['name']
                        , player['id'], new Vector3(player['position']['x'], player['position']['y'], player['position']['z'])));
                } else {
                    pplayer.position.x = player['position']['x'];
                    pplayer.position.x = player['position']['y'];
                    pplayer.position.x = player['position']['z'];
                    window.dataManager.texturePack.updatePlayer(pplayer, pplayer.position);
                }
            }
        }
    }
}