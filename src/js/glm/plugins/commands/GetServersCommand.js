import {Command} from "glm-client-base";

/**
 * Handles events for retrieving the list of servers from the server.
 *
 * @author Tyler Bucher
 */
export default class GetServersCommand extends Command {

    /**
     * @param {Event} event the event object to pass.
     * @param {JSON} jsonObject the json object from the web socket message.
     */
    handle(event, jsonObject) {
        // Loop through the server addresses returned by the server
        for (let url of jsonObject['data']['servers']) {
            let urlData = url.split(':');
            // Connect to the other servers as well
            window.dataManager.connectToServer(urlData[0], urlData[1]);
        }
    }
}