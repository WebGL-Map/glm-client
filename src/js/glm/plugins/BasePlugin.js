import {Plugin} from "glm-client-base";
import {OnPostInitGlListener} from "./events/OnPostInitGlListener";
import InitCommand from "./commands/InitCommand";
import GetWorldsCommand from "./commands/GetWorldsCommand";
import GetChunkForPositionCommand from "./commands/GetChunkForPositionCommand";
import GetServersCommand from "./commands/GetServersCommand";
import DefaultTexturePack from "./texturepack/default/DefaultTexturePack";
import WorldBorderUpdateCommand from "./commands/WorldBorderUpdateCommand";
import OnPostPlayerRender from "./events/OnPostPlayerRender";

/**
 * The base plugin class.
 *
 * @author Tyler Bucher.
 */
export default class BasePlugin extends Plugin {

    /**
     * Registers vars and callbacks for this plugin.
     */
    static registerPlugin(colorObj) {
        let plugin = new BasePlugin();
        plugin.colorObj = colorObj;
        window.dataManager.pluginManager.registerPlugin(plugin);
        // Pass uuid to base glm
        window.GLM_CONFIG.uuid = window.DEFAULT_PLUGIN_CONFIG.uuid;
    }

    /**
     * Creates this plugin.
     */
    constructor() {
        super();
        this.colorObj = null;
    }

    /**
     * Initializes this plugin with the glm core lib.
     */
    initialize() {
        // Register events
        window.dataManager.eventManager.registerListener('postInitGl', OnPostInitGlListener.handle);
        window.dataManager.eventManager.registerListener('postPlayersRender', OnPostPlayerRender.handle);
        // Register command listeners
        window.dataManager.commandRegistrar.registerCommand('init', new InitCommand());
        window.dataManager.commandRegistrar.registerCommand('getServers', new GetServersCommand());
        window.dataManager.commandRegistrar.registerCommand('getWorlds', new GetWorldsCommand());
        window.dataManager.commandRegistrar.registerCommand('getChunkForPosition', new GetChunkForPositionCommand());
        window.dataManager.commandRegistrar.registerCommand('worldBorderUpdate', new WorldBorderUpdateCommand());
        // Register texture pack for rendering
        window.dataManager.texturePack = new DefaultTexturePack(window.dataManager.canvasElement[0], this.colorObj);
    }
}