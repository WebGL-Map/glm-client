import {Command} from "glm-client-base";

export default class GetServersCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        for (let url of jsonObject['data']['servers']) {
            let urlData = url.split(':');
            window.dataManager.connectToServer(urlData[0], urlData[1]);
        }
    }
}