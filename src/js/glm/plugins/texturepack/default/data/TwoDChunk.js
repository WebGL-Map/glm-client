import {Chunk} from "glm-client-base";
import {Vector3} from "math.gl";

export default class TwoDChunk extends Chunk {

    /**
     * Creates a chunk for blocks.
     *
     * @param {Vector3} position the position of this chunk.
     */
    constructor(position) {
        super(position);

        this.northNeighbor = new Vector3(position.x, position.y, position.z - 1);
        this.westNeighbor  = new Vector3(position.x - 1, position.y, position.z);
        this.southNeighbor = new Vector3(position.x, position.y, position.z + 1);
        this.eastNeighbor  = new Vector3(position.x + 1, position.y, position.z);

        this.vertexData    = null;
        this.vertexHandler = null;
        /** @type {*} */
        this.colorData = null;
        this.colorHandler = null;

        this.heightData = new Array(16);
        for (let i = 0; i < 16; i++) {
            this.heightData[i] = new Array(16);
        }
        this.blockInfo = new Array(16);
        for (let i = 0; i < 16; i++) {
            this.blockInfo[i] = new Array(16);
        }

        this.drawReady = false;
    }

    /**
     *
     * @param glContext
     */
    generateRender(glContext, northNeighbor, westNeighbor, southNeighbor, eastNeighbor) {
        this.drawReady = true;//todo remove
        let cIndex     = 0;
        let vecColor   = new Vector3();
        let vecColor0  = new Vector3();
        let vecColor1  = new Vector3();
        let vecColor2  = new Vector3();
        let vecColor3  = new Vector3();
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 16; i++) {
                // Get color info
                let blockType       = this.blockInfo[i][j].first;
                let blockTypeString = blockType.first + ':' + blockType.second;
                let intColor        = window.dataManager.texturePack.colorObject.colors.get(blockTypeString);
                this._setRgbFromInt(vecColor, intColor);
                if (this.heightData[i][j] % 2 === 0) {
                    this._changeColorLuminosity(vecColor, -0.01);
                }
                vecColor0.set(vecColor.x, vecColor.y, vecColor.z);
                let mod0 = false;
                vecColor1.set(vecColor.x, vecColor.y, vecColor.z);
                let mod1 = false;
                vecColor2.set(vecColor.x, vecColor.y, vecColor.z);
                let mod2 = false;
                vecColor3.set(vecColor.x, vecColor.y, vecColor.z);
                let mod3 = false;

                let thisHeight       = this.heightData[i][j];
                let northBlockHeight = j > 0 ? this.heightData[i][j - 1] :
                    this._getBlockHeight(i, j, 0, northNeighbor, westNeighbor, southNeighbor, eastNeighbor);
                let westBlockHeight  = i > 0 ? this.heightData[i - 1][j] :
                    this._getBlockHeight(i, j, 1, northNeighbor, westNeighbor, southNeighbor, eastNeighbor);
                let southBlockHeight = j < 15 ? this.heightData[i][j + 1] :
                    this._getBlockHeight(i, j, 2, northNeighbor, westNeighbor, southNeighbor, eastNeighbor);
                let eastBlockHeight  = i < 15 ? this.heightData[i + 1][j] :
                    this._getBlockHeight(i, j, 3, northNeighbor, westNeighbor, southNeighbor, eastNeighbor);

                if (northBlockHeight > thisHeight || eastBlockHeight > thisHeight) {
                    let vval = northBlockHeight > thisHeight ? northBlockHeight - thisHeight : eastBlockHeight > thisHeight ? eastBlockHeight - thisHeight : 1;
                    vval /= 255;
                    vval = 0.13 + (vval * (1.0 - 0.13));
                    this._changeColorLuminosity(vecColor0, -vval);
                    this._changeColorLuminosity(vecColor1, -vval);
                    this._changeColorLuminosity(vecColor2, -vval);
                    this._changeColorLuminosity(vecColor3, -vval);
                } else if (westBlockHeight === thisHeight+1 || southBlockHeight === thisHeight+1) {
                    this._changeColorLuminosity(vecColor0, 0.13);
                    this._changeColorLuminosity(vecColor1, 0.13);
                    this._changeColorLuminosity(vecColor2, 0.13);
                    this._changeColorLuminosity(vecColor3, 0.13);
                }

                /*if (westBlockHeight < thisHeight) {
                    this._changeColorLuminosity(vecColor0, 0.2);
                    this._changeColorLuminosity(vecColor1, 0.2);
                    mod0 = mod1 = true;
                } else if (westBlockHeight > thisHeight) {
                    this._changeColorLuminosity(vecColor0, -0.2);
                    this._changeColorLuminosity(vecColor1, -0.2);
                    mod0 = mod1 = true;
                }
                if (northBlockHeight < thisHeight) {
                    if(!mod0) this._changeColorLuminosity(vecColor0, 0.2);
                    this._changeColorLuminosity(vecColor3, 0.2);
                    mod0 = mod3 = true;
                } else if (northBlockHeight > thisHeight) {
                    if(!mod0) this._changeColorLuminosity(vecColor0, -0.2);
                    this._changeColorLuminosity(vecColor3, -0.2);
                    mod0 = mod3 = true;
                }
                if (eastBlockHeight < thisHeight) {
                    this._changeColorLuminosity(vecColor2, 0.2);
                    if(!mod3) this._changeColorLuminosity(vecColor3, 0.2);
                    mod2 = mod3 = true;
                } else if (eastBlockHeight > thisHeight) {
                    this._changeColorLuminosity(vecColor2, -0.2);
                    if(!mod3) this._changeColorLuminosity(vecColor3, -0.2);
                    mod2 = mod3 = true;
                }*/


                vecColor0.set(vecColor0.x / 255, vecColor0.y / 255, vecColor0.z / 255);
                vecColor1.set(vecColor1.x / 255, vecColor1.y / 255, vecColor1.z / 255);
                vecColor2.set(vecColor2.x / 255, vecColor2.y / 255, vecColor2.z / 255);
                vecColor3.set(vecColor3.x / 255, vecColor3.y / 255, vecColor3.z / 255);
                let a                    = 1;
                // First triangle
                this.colorData[cIndex++] = vecColor0.x;
                this.colorData[cIndex++] = vecColor0.y;
                this.colorData[cIndex++] = vecColor0.z;
                this.colorData[cIndex++] = a;
                this.colorData[cIndex++] = vecColor1.x;
                this.colorData[cIndex++] = vecColor1.y;
                this.colorData[cIndex++] = vecColor1.z;
                this.colorData[cIndex++] = a;
                this.colorData[cIndex++] = vecColor3.x;
                this.colorData[cIndex++] = vecColor3.y;
                this.colorData[cIndex++] = vecColor3.z;
                this.colorData[cIndex++] = a;
                // Second triangle
                this.colorData[cIndex++] = vecColor1.x;
                this.colorData[cIndex++] = vecColor1.y;
                this.colorData[cIndex++] = vecColor1.z;
                this.colorData[cIndex++] = a;
                this.colorData[cIndex++] = vecColor2.x;
                this.colorData[cIndex++] = vecColor2.y;
                this.colorData[cIndex++] = vecColor2.z;
                this.colorData[cIndex++] = a;
                this.colorData[cIndex++] = vecColor3.x;
                this.colorData[cIndex++] = vecColor3.y;
                this.colorData[cIndex++] = vecColor3.z;
                this.colorData[cIndex++] = a;
            }
        }
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.colorData, glContext.STATIC_DRAW);
    }

    /**
     * Attempts to lighten or darken a color.
     *
     * @param {Vector3} col the color in integer form.
     * @param {int} amt the amount to brighten or darken -1 to 1.
     */
    _changeColorLuminosity(col, amt) {
        if (amt === 0) return;
        // Change red
        col.x += (255 * amt);
        if (col.x > 255) col.x = 255;
        else if (col.x < 0) col.x = 0;
        // change green
        col.y += (255 * amt);
        if (col.y > 255) col.y = 255;
        else if (col.y < 0) col.y = 0;
        // change blue
        col.z += (255 * amt);
        if (col.z > 255) col.z = 255;
        else if (col.z < 0) col.z = 0;
    }

    /**
     * Converts an int to a vec3.
     * @param {int} intColor the int to convert.
     * @return {Vector3} the convert value.
     */
    _getRgbFromInt(intColor) {
        return new Vector3((intColor >> 16) & 0xFF, (intColor >> 8) & 0xFF, intColor & 0xFF);
    }

    /**
     * Converts an int to a vec3.
     * @param {Vector3} vec
     * @param {int} intColor the int to convert.
     */
    _setRgbFromInt(vec, intColor) {
        vec.x = (intColor >> 16) & 0xFF;
        vec.y = (intColor >> 8) & 0xFF;
        vec.z = intColor & 0xFF;
    }

    _getBlockHeight(cx, cz, intPos, northNeighbor, westNeighbor, southNeighbor, eastNeighbor) {
        switch (intPos) {
            case 0:
                return northNeighbor.heightData[cx][15];
            case 1:
                return westNeighbor.heightData[15][cz];
            case 2:
                return southNeighbor.heightData[cx][0];
            case 3:
                return eastNeighbor.heightData[0][cz];
        }
    }

    /**
     * @param {WebGLRenderingContext} glContext
     */
    render(glContext) {
        if (!this.drawReady) return;

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.vertexAttribPointer(0, 2, glContext.FLOAT, false, 0, 0);

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.vertexAttribPointer(1, 4, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.TRIANGLES, 0, 1536);
    }
}