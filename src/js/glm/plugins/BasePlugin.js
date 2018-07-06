import {Plugin} from "glm-client-base";
import {OnPostInitGlListener} from "./events/OnPostInitGlListener";
import InitCommand from "./commands/InitCommand";
import GetWorldsCommand from "./commands/GetWorldsCommand";
import GetChunkForPositionCommand from "./commands/GetChunkForPositionCommand";
import GetServersCommand from "./commands/GetServersCommand";
import DefaultTexturePack from "./texturepack/default/DefaultTexturePack";
import WorldBorderUpdateCommand from "./commands/WorldBorderUpdateCommand";
import OnPostPlayerRender from "./events/OnPostPlayerRender";
import GetPlayersCommand from "./commands/GetPlayersCommand";

export default class BasePlugin extends Plugin {

    static registerPlugin() {
        window.dataManager.pluginManager.registerPlugin(new BasePlugin());
    }

    constructor() {
        super();
    }

    initialize() {
        window.dataManager.eventManager.registerListener('postInitGl', OnPostInitGlListener.handle);
        window.dataManager.eventManager.registerListener('postPlayersRender', OnPostPlayerRender.handle);

        window.dataManager.commandRegistrar.registerCommand('init', new InitCommand());
        window.dataManager.commandRegistrar.registerCommand('getServers', new GetServersCommand());
        window.dataManager.commandRegistrar.registerCommand('getWorlds', new GetWorldsCommand());
        window.dataManager.commandRegistrar.registerCommand('getChunkForPosition', new GetChunkForPositionCommand());
        window.dataManager.commandRegistrar.registerCommand('worldBorderUpdate', new WorldBorderUpdateCommand());
        window.dataManager.commandRegistrar.registerCommand('getPlayers', new GetPlayersCommand());

        window.dataManager.texturePack = new DefaultTexturePack(window.dataManager.canvasElement[0]);
    }
}