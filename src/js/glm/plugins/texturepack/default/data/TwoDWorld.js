import {World} from "glm-client-base";

/**
 * Creates a new world. Mainly to be used by the Server objects.
 *
 * @author Tyler Bucher
 */
export default class TwoDWorld extends World {

    /**
     * Creates a new world.
     *
     * @param {String} id the uuid of the world.
     * @param {String} name the name of the world.
     * @param {boolean} isDefault states if this world is default.
     * @param {Vector3} spawnPoint the spawn point of the world.
     */
    constructor(id, name, isDefault, spawnPoint) {
        super(id, name, isDefault, spawnPoint);

        this.requestPlayerTime = 0;

        this.requestPlayerCommandInterval = 0;

        /**
         * @type {Map<Number, Map<Number, ChunkRequestInfo>>}
         */
        this.requestQueue = new Map();
        /**
         * @type {Array}
         */
        this.downloadArray = [];
        /**
         * @type {Array<JSON>}
         */
        this.chunkJsonQueue = [];
        /**
         * @type {Set<any>}
         */
        this.lightingQueue = new Set();
    }
}