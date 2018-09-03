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
         * @type {Array<Array<Number>>}
         */
        this.ppar = [];
        /**
         * @type {Array<Array<Number>>}
         */
        this.pnar = [];
        /**
         * @type {Array<Array<Number>>}
         */
        this.npar = [];
        /**
         * @type {Array<Array<Number>>}
         */
        this.nnar = [];
    }

    /**
     * Sets and computes the array map for a value.
     *
     * @param {Number} x the x position.
     * @param {Number} y the y position.
     * @param {Number} z the z position.
     * @param {Number} value the value to set.
     */
    setAndCompute(x, y, z, value) {
        let xAbs = Math.abs(x);
        let zZbs = Math.abs(z);
        if (x > -1) {
            if (z > -1) {
                if (this.ppar[x] == null) {
                    this.ppar[x] = [];
                }
                this.ppar[x][z] = value;
            } else {
                if (this.pnar[x] == null) {
                    this.pnar[x] = [];
                }
                this.pnar[x][zZbs] = value;
            }
        } else {
            if (z > -1) {
                if (this.npar[xAbs] == null) {
                    this.npar[xAbs] = [];
                }
                this.npar[xAbs][z] = value;
            } else {
                if (this.nnar[xAbs] == null) {
                    this.nnar[xAbs] = [];
                }
                this.nnar[xAbs][zZbs] = value;
            }
        }
    }

    /**
     * @param {Number} x the x position of the block.
     * @param {Number} y the y position of the block.
     * @param {Number} z the z position of the block.
     * @return {Number|undefined} the block type id or undefined.
     */
    getBlockType(x, y, z) {
        let xAbs = Math.abs(x);
        let zAbs = Math.abs(z);
        if (x > -1) {
            if (z > -1) {
                return this.ppar[x] !== undefined ? this.ppar[x][z] : undefined;
            } else {
                return this.pnar[x] !== undefined ? this.pnar[x][zAbs] : undefined;
            }
        } else {
            if (z > -1) {
                return this.npar[xAbs] !== undefined ? this.npar[xAbs][z] : undefined;
            } else {
                return this.nnar[xAbs] !== undefined ? this.nnar[xAbs][zAbs] : undefined;
            }
        }
    }
}