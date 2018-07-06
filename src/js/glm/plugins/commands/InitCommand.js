import {Command} from "glm-client-base";
import {GlobalStates} from "glm-client-base";
import {Event} from "glm-client-base";
import Util from "../Util";
import {ServerStates} from "glm-client-base";
import {Entry} from "glm-client-base";

export default class InitCommand extends Command {

    /**
     * @param event
     * @param {JSON} jsonObject
     */
    handle(event, jsonObject) {
        window.dataManager.eventManager.dispatchEvent(new Event('preInit'));
        let server                            = window.dataManager.serverMap.get(event.target.url);
        server.state                          = ServerStates.INIT;
        server.name                           = jsonObject['data']['serverName'];
        //change server name
        let urlData                           = Util.getIpAndPort(event.currentTarget.url);
        //set chunk cache lifetime
        window.dataManager.chunkCacheLifetime = jsonObject['data']['cacheLifetime'];
        // set cpp traits and types
        for (let blockData of jsonObject['data']['states']) {
            // Split block type and block traits
            let splitData     = blockData.split('[');
            // Get and add block types
            let blockTypeData = splitData[0].split(':');
            InitCommand.addBlockTypeIfNotPresent(blockTypeData[0], blockTypeData[1]);
            // Fix block traits if present
            if (splitData.length === 2) {
                splitData[1]    = splitData[1].slice(0, -1);
                // Get and block traits
                let blockTraits = splitData[1].split(',');
                let blockTrait  = null;
                for (let kvp of blockTraits) {
                    // Add block traits
                    blockTrait = kvp.split('=');
                    InitCommand.addBlockTraitIfNotPresent(blockTrait[0], blockTrait[1]);
                }
            }
        }
        // Set loading text
        let serverInitNum = 0;
        for (let server of window.dataManager.serverMap.values()) {
            if (server.state >= ServerStates.INIT) {
                serverInitNum++;
            }
        }
        if (serverInitNum === window.dataManager.serverMap.size) {
            if (window.dataManager.state === GlobalStates.LOADING) {
                window.dataManager.loadingTextElement.text("Requesting worlds..");
            }
        }
        // get worlds after init
        window.dataManager.serverMap.get(event.target.url).webSocketClient.getNative().send(JSON.stringify({
            cmd: "getWorlds"
        }));
        window.dataManager.eventManager.dispatchEvent(new Event('postInit'));
    }

    static addBlockTypeIfNotPresent(mod, type) {
        for (let /** @type {Entry}*/ entry of window.dataManager.blockTypes) {
            if (entry.first === mod && entry.second === type) {
                return;
            }
        }
        window.dataManager.blockTypes.push(new Entry(mod, type));
    }

    static addBlockTraitIfNotPresent(key, value) {
        for (let /** @type {Entry}*/ entry of window.dataManager.blockTraits) {
            if (entry.first === key && entry.second === value) {
                return;
            }
        }
        window.dataManager.blockTraits.push(new Entry(key, value));
    }
}