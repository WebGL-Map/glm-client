/**
 * Holds the color data for block rendering.
 *
 * @author Tyler Bucher
 */
export default class Colors {

    /**
     * Creates a new color object instance.
     *
     * @param {Object} colorObj the object to parse for color information.
     */
    constructor(colorObj) {
        this._nativeColors = colorObj;
        for (let prop in this._nativeColors) {
            if (this._nativeColors.hasOwnProperty(prop)) {
                this._nativeColors[prop] = parseInt(this._nativeColors[prop], 16);
            }
        }
        // Setup color map and array indexing for faster reading
        this.colorMap       = new Map(Object.entries(this._nativeColors));
        this.colorIndexMap  = new Map();
        this.fastColorArray = new Array(this.colorMap.size);
        let index           = 0;
        for (let [key, val] of this.colorMap) {
            this.colorIndexMap.set(key, index);
            this.fastColorArray[index++] = val;
        }
    }
}