import {Command, Entry, Event, GlobalStates, ServerStates} from "glm-client-base";

/**
 * Handles events for retrieving the initial information from a server.
 *
 * @author Tyler Bucher
 */
export default class InitCommand extends Command {

    /**
     * @param {Event} event the event object to pass.
     * @param {JSON} jsonObject the json object from the web socket message.
     */
    handle(event, jsonObject) {
        // Dispatch events
        window.dataManager.eventManager.dispatchEvent(new Event('preInit'));
        let server                            = window.dataManager.serverMap.get(event.target['url']);
        server.state                          = ServerStates.INIT;
        server.name                           = jsonObject['data']['serverName'];
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
        // Dispatch events
        window.dataManager.eventManager.dispatchEvent(new Event('postInit'));
    }

    /**
     * Adds a block type to the block type list if it is not present.
     *
     * @param {String} mod the mod id of the block.
     * @param {String} type the type of the item.
     */
    static addBlockTypeIfNotPresent(mod, type) {
        for (let /** @type {Entry}*/ entry of window.dataManager.blockTypes) {
            if (entry.first === mod && entry.second === type) {
                return;
            }
        }
        window.dataManager.blockTypes.push(new Entry(mod, type));
    }

    /**
     * Adds a block trait to the block traits list if it is not present.
     *
     * @param {String} key the trait name.
     * @param {String} value the trait value.
     */
    static addBlockTraitIfNotPresent(key, value) {
        for (let /** @type {Entry}*/ entry of window.dataManager.blockTraits) {
            if (entry.first === key && entry.second === value) {
                return;
            }
        }
        window.dataManager.blockTraits.push(new Entry(key, value));
    }
}