import {TexturePack} from "glm-client-base";
import {Shader} from "glm-client-base";
import {Program} from "glm-client-base";
import {Matrix4, Vector3} from "math.gl";
import TwoDChunk from "./data/TwoDChunk";
import {Entry} from "glm-client-base";
import {Block} from "glm-client-base";
import Colors from "./Colors";
import {WorldBorder} from "glm-client-base";
import {ChunkRequestInfo} from "glm-client-base";
import {Player} from "glm-client-base";
import TwoDWorld from "./data/TwoDWorld";
import TwoDWorldBorder from "./data/TwoDWorldBorder";
import TwoDPlayer from "./data/TwoDPlayer";

export default class DefaultTexturePack extends TexturePack {

    constructor(canvasElement) {
        super();

        this.canvasElement = canvasElement;
        /** @type {WebGLRenderingContext} */
        this.glContext = null;
        this.chunkRenderRange = [4];
        this.colorObject      = new Colors();
    }

    /**
     *
     */
    init() {
        /** @type {WebGLRenderingContext} */
        this.glContext = this.canvasElement.getContext("experimental-webgl");
        this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);
        this.glContext.enable(this.glContext.BLEND);
        this.glContext.blendFunc(this.glContext.SRC_ALPHA, this.glContext.ONE_MINUS_SRC_ALPHA);
        this.glContext.depthFunc(this.glContext.LESS);
        this.glContext.clearColor(0.0, 0.0, 0.0, 1.0);

        this.vertex_shader_vc_source   =
            "precision highp float;\n" +
            "attribute vec2 position;\n" +
            "attribute vec4 color;\n" +
            "\n" +
            "uniform mat4 model;\n" +
            "uniform mat4 view;\n" +
            "uniform mat4 projection;\n" +
            "\n" +
            "varying vec4 oColor;\n" +
            "\n" +
            "void main() {\n" +
            "    oColor = color;\n" +
            "    mat4 mvp = projection * view * model;\n" +
            "    gl_Position = mvp * vec4(position.x, 0, position.y, 1.0);\n" +
            "}";
        this.fragment_shader_vc_source =
            "precision mediump float;\n" +
            "varying vec4 oColor;\n" +
            "\n" +
            "void main() {\n" +
            "    gl_FragColor = oColor;\n" +
            "}";
        this.vertex_shader_vc          = new Shader(this.glContext, this.glContext.VERTEX_SHADER, this.vertex_shader_vc_source);
        this.fragment_shader_vc        = new Shader(this.glContext, this.glContext.FRAGMENT_SHADER, this.fragment_shader_vc_source);

        if (!this.vertex_shader_vc.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.vertex_shader_vc.nativeShader));
        }
        if (!this.fragment_shader_vc.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.fragment_shader_vc.nativeShader));
        }

        this.shaderProgram_vc = new Program(this.glContext);
        this.shaderProgram_vc.attachShader(this.glContext, this.vertex_shader_vc);
        this.shaderProgram_vc.attachShader(this.glContext, this.fragment_shader_vc);

        this.glContext.bindAttribLocation(this.shaderProgram_vc.nativeProgram, 0, "position");
        this.glContext.bindAttribLocation(this.shaderProgram_vc.nativeProgram, 1, "color");

        this.shaderProgram_vc.link(this.glContext);
        this.shaderProgram_vc.validate(this.glContext);

        if (!this.shaderProgram_vc.verify(this.glContext)) {
            console.log("Shader program error.");
        }

        this.modelMatrix      = new Matrix4();
        this.hFovDegree       = 45;
        this.fov              = (this.hFovDegree * Math.PI) / 180.0;
        this.aspectRatio      = this.canvasElement.width / this.canvasElement.height;
        this.near             = 0.1;
        this.far              = 8192.0;
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.perspective({fov: this.fov, aspect: this.aspectRatio, near: this.near, far: this.far});

        this.dragCoefficient = (this.canvasElement.height / 2) / Math.tan(this.fov / 2);

        this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);

        this.uni_vc_model = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "model");
        this.glContext.uniformMatrix4fv(this.uni_vc_model, false, this.modelMatrix.toFloat32Array());

        this.uni_vc_view = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "view");
        this.glContext.uniformMatrix4fv(this.uni_vc_view, false, this.modelMatrix.toFloat32Array());

        this.uni_vc_projection = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "projection");
        this.glContext.uniformMatrix4fv(this.uni_vc_projection, false, this.projectionMatrix.toFloat32Array());

        this.glContext.useProgram(null);

        this._hookEvents();
    }

    _hookEvents() {
        //Resize Event
        window.dataManager.bodyElement[0].onresize = function () {
            window.dataManager.texturePack.canvasElement.width  = window.innerWidth;
            window.dataManager.texturePack.canvasElement.height = window.innerHeight;
            window.dataManager.stats.dom.style.left             = (window.innerWidth - 105) + "px";
            window.dataManager.texturePack.aspectRatio          =
                window.dataManager.texturePack.canvasElement.width / window.dataManager.texturePack.canvasElement.height;
            window.dataManager.texturePack.projectionMatrix.perspective({
                fov   : window.dataManager.texturePack.fov,
                aspect: window.dataManager.texturePack.aspectRatio,
                near  : window.dataManager.texturePack.near,
                far   : window.dataManager.texturePack.far
            });

            window.dataManager.texturePack.dragCoefficient = (window.dataManager.texturePack.canvasElement.height / 2)
                / Math.tan(window.dataManager.texturePack.fov / 2);

            window.dataManager.texturePack.glContext.useProgram(
                window.dataManager.texturePack.shaderProgram_vc.nativeProgram);
            window.dataManager.texturePack.glContext.uniformMatrix4fv(
                window.dataManager.texturePack.uni_vc_projection,
                false,
                window.dataManager.texturePack.projectionMatrix.toFloat32Array()
            );
            window.dataManager.texturePack.glContext.viewport(0, 0,
                window.dataManager.texturePack.glContext.canvas.width,
                window.dataManager.texturePack.glContext.canvas.height);
        };
        //
        // Add mouse down event.
        this.canvasElement.addEventListener('mousedown', function (event) {
            if (event.which === 1) {
                window.dataManager.texturePack.mouseDown = true;
            }
            window.dataManager.texturePack.lastX = event.pageX;
            window.dataManager.texturePack.lastY = event.pageY;
            event.preventDefault();
        });
        // Add mouse down event.
        this.canvasElement.addEventListener('mousemove', function (event) {
            if (window.dataManager.texturePack.mouseDown) {
                let far         = window.dataManager.selectedWorld.camera.position.y;
                let coefficient = far / window.dataManager.texturePack.dragCoefficient;
                let dx          = coefficient * (event.pageX - window.dataManager.texturePack.lastX);
                let dz          = coefficient * (event.pageY - window.dataManager.texturePack.lastY);

                let nx                                             = window.dataManager.selectedWorld.camera.position.x - dx;
                let nz                                             = window.dataManager.selectedWorld.camera.position.z - dz;
                window.dataManager.selectedWorld.camera.position.x = nx;
                window.dataManager.selectedWorld.camera.position.z = nz;
                window.dataManager.selectedWorld.camera.lookAt.x   = nx;
                window.dataManager.selectedWorld.camera.lookAt.z   = nz;

                window.dataManager.selectedWorld.camera.dirty = true;
            }
            window.dataManager.texturePack.lastX = event.pageX;
            window.dataManager.texturePack.lastY = event.pageY;
            event.preventDefault();
        });
        // Add mouse down event.
        this.canvasElement.addEventListener('mouseup', function (event) {
            if (event.which === 1) {
                window.dataManager.texturePack.mouseDown = false;
            }
            event.preventDefault();
        });
        //Scroll event
        this.canvasElement.addEventListener('mousewheel', function (event) {
            let px = window.dataManager.texturePack.lastX / window.dataManager.texturePack.canvasElement.width;
            let py = window.dataManager.texturePack.lastY / window.dataManager.texturePack.canvasElement.height;

            let far               = Math.abs(window.dataManager.selectedWorld.camera.position.y);
            let verticalDistFar   = far * Math.tan(window.dataManager.texturePack.fov / 2);
            let hFov              = 2 * Math.atan(window.dataManager.texturePack.aspectRatio * Math.tan(window.dataManager.texturePack.fov / 2));
            let horizontalDistFar = far * Math.tan(hFov / 2);

            let rx = (window.dataManager.selectedWorld.camera.position.x - horizontalDistFar) + (px * (horizontalDistFar * 2));
            let ry = (window.dataManager.selectedWorld.camera.position.z - verticalDistFar) + (py * (verticalDistFar * 2));

            far               = Math.abs(window.dataManager.selectedWorld.camera.position.y + (event.wheelDeltaY > 0 ? -15 : 15));
            verticalDistFar   = far * Math.tan(window.dataManager.texturePack.fov / 2);
            hFov              = 2 * Math.atan(window.dataManager.texturePack.aspectRatio * Math.tan(window.dataManager.texturePack.fov / 2));
            horizontalDistFar = far * Math.tan(hFov / 2);

            let nrx = (window.dataManager.selectedWorld.camera.position.x - horizontalDistFar) + (px * (horizontalDistFar * 2));
            let nry = (window.dataManager.selectedWorld.camera.position.z - verticalDistFar) + (py * (verticalDistFar * 2));

            let deltaRx = rx - nrx;
            let deltaRy = ry - nry;

            window.dataManager.selectedWorld.camera.position.x += deltaRx;
            window.dataManager.selectedWorld.camera.position.y += event.wheelDeltaY > 0 ? -15 : 15;
            if (window.dataManager.selectedWorld.camera.position.y < 0) {
                window.dataManager.selectedWorld.camera.position.y = 0;
            }
            window.dataManager.selectedWorld.camera.position.z += deltaRy;
            window.dataManager.selectedWorld.camera.dirty = true;
            event.preventDefault();
        });

        // Touch Events
        this.canvasElement.addEventListener('touchstart', function (event) {
            if (event.touches.length === 1) {
                let touch0                           = event.touches.item(0);
                window.dataManager.texturePack.lastX = touch0.clientX;
                window.dataManager.texturePack.lastY = touch0.clientY;
            }
            // pinch gesture
            if (event.touches.length === 2) {
                window.dataManager.texturePack.touch0      = event.touches.item(0);
                window.dataManager.texturePack.touch1      = event.touches.item(1);
                window.dataManager.texturePack.touchCenter = event.touches.item(1);
                window.dataManager.texturePack.originalY   = window.dataManager.selectedWorld.camera.position.y;
                window.dataManager.texturePack.touchDist   = Math.abs(Math.hypot(
                    (window.dataManager.texturePack.touch1.clientX - window.dataManager.texturePack.touch0.clientX),
                    (window.dataManager.texturePack.touch1.clientY - window.dataManager.texturePack.touch0.clientY)));
            }
            event.preventDefault();
        });
        this.canvasElement.addEventListener('touchmove', function (event) {
            if (event.touches.length === 1) {
                let far         = window.dataManager.selectedWorld.camera.position.y;
                let coefficient = far / window.dataManager.texturePack.dragCoefficient;
                let touch0      = event.touches.item(0);
                let dx          = coefficient * (touch0.clientX - window.dataManager.texturePack.lastX);
                let dz          = coefficient * (touch0.clientY - window.dataManager.texturePack.lastY);

                let nx = window.dataManager.selectedWorld.camera.position.x - dx;
                let nz = window.dataManager.selectedWorld.camera.position.z - dz;

                window.dataManager.selectedWorld.camera.position.x = nx;
                window.dataManager.selectedWorld.camera.position.z = nz;
                window.dataManager.selectedWorld.camera.lookAt.x   = nx;
                window.dataManager.selectedWorld.camera.lookAt.z   = nz;

                window.dataManager.texturePack.lastX          = touch0.clientX;
                window.dataManager.texturePack.lastY          = touch0.clientY;
                window.dataManager.selectedWorld.camera.dirty = true;
            }
            // pinch gesture
            else if (event.touches.length === 2) {//todo
                let touch0       = event.touches.item(0);
                let touch1       = event.touches.item(1);
                let curTouchDist = Math.abs(Math.sqrt(
                    Math.pow((touch1.clientX - touch0.clientX), 2) +
                    Math.pow((touch1.clientY - touch0.clientY), 2)));

                let px = window.dataManager.texturePack.lastX / window.dataManager.texturePack.canvasElement.width;
                let py = window.dataManager.texturePack.lastY / window.dataManager.texturePack.canvasElement.height;

                let far               = Math.abs(window.dataManager.selectedWorld.camera.position.y);
                let verticalDistFar   = far * Math.tan(window.dataManager.texturePack.fov / 2);
                let hFov              = 2 * Math.atan(window.dataManager.texturePack.aspectRatio * Math.tan(window.dataManager.texturePack.fov / 2));
                let horizontalDistFar = far * Math.tan(hFov / 2);

                let rx = (window.dataManager.selectedWorld.camera.position.x - horizontalDistFar) + (px * (horizontalDistFar * 2));
                let ry = (window.dataManager.selectedWorld.camera.position.z - verticalDistFar) + (py * (verticalDistFar * 2));

                far               = Math.abs(window.dataManager.selectedWorld.camera.position.y + -(curTouchDist - window.dataManager.texturePack.touchDist));
                verticalDistFar   = far * Math.tan(window.dataManager.texturePack.fov / 2);
                hFov              = 2 * Math.atan(window.dataManager.texturePack.aspectRatio * Math.tan(window.dataManager.texturePack.fov / 2));
                horizontalDistFar = far * Math.tan(hFov / 2);

                let nrx = (window.dataManager.selectedWorld.camera.position.x - horizontalDistFar) + (px * (horizontalDistFar * 2));
                let nry = (window.dataManager.selectedWorld.camera.position.z - verticalDistFar) + (py * (verticalDistFar * 2));

                let deltaRx = rx - nrx;
                let deltaRy = ry - nry;

                //window.dataManager.selectedWorld.camera.position.x += deltaRx;
                //window.dataManager.selectedWorld.camera.position.z += deltaRy;

                /*window.dataManager.selectedWorld.camera.position.y +=
                    (curTouchDist - window.dataManager.texturePack.touchDist) > 0 ? -5 : 5;*/
                window.dataManager.selectedWorld.camera.position.y =
                    window.dataManager.texturePack.originalY - (curTouchDist - window.dataManager.texturePack.touchDist);
                window.dataManager.selectedWorld.camera.dirty      = true;

                //window.dataManager.texturePack.touchDist = curTouchDist;
            }
            event.preventDefault();
        });
    }

    /**
     *
     * @param {Entry} blockType
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     *
     * @return {Block}
     */
    createBlock(blockType, x, y, z) {
        return new Block(blockType, new Vector3(x, y, z), []);
    }

    /**
     *
     * @param {Array} dataArray
     * @param {Array} heightDataArray
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     *
     * @return {Chunk}
     */
    createChunk(dataArray, heightDataArray, x, y, z) {
        let newChunk        = new TwoDChunk(new Vector3(x, y, z));
        newChunk.vertexData = new Float32Array(3072);
        newChunk.colorData  = new Float32Array(6144);
        let dIndex          = 0;
        let hIndex          = 0;
        let blockX          = x << 4;
        let blockZ          = z << 4;

        let vIndex = 0;
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 16; i++) {
                // Set height data
                newChunk.heightData[i][j] = heightDataArray[hIndex++];
                // Get block info
                let blockInfo             = dataArray[dIndex++];
                let blockSplitArray       = null;
                if (blockInfo.indexOf('[') > -1) {
                    blockInfo       = blockInfo.substring(0, blockInfo.length - 1);
                    blockSplitArray = blockInfo.split('[');
                }
                let blockTypeEntry       = this._getBlockType(blockSplitArray == null ? blockInfo : blockSplitArray[0]);
                let blockTraits          = blockSplitArray == null ? [] : this._getBlockTraits(blockSplitArray[1]);
                newChunk.blockInfo[i][j] = new Entry(blockTypeEntry, blockTraits);
                // Set vertex data
                // First triangle
                newChunk.vertexData[vIndex++] = blockX + i;
                newChunk.vertexData[vIndex++] = blockZ + j;
                newChunk.vertexData[vIndex++] = blockX + i;
                newChunk.vertexData[vIndex++] = blockZ + j + 1;
                newChunk.vertexData[vIndex++] = blockX + i + 1;
                newChunk.vertexData[vIndex++] = blockZ + j;
                // Second triangle
                newChunk.vertexData[vIndex++] = blockX + i;
                newChunk.vertexData[vIndex++] = blockZ + j + 1;
                newChunk.vertexData[vIndex++] = blockX + i + 1;
                newChunk.vertexData[vIndex++] = blockZ + j + 1;
                newChunk.vertexData[vIndex++] = blockX + i + 1;
                newChunk.vertexData[vIndex++] = blockZ + j;
            }
        }

        newChunk.vertexHandler = this.glContext.createBuffer();
        newChunk.colorHandler  = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, newChunk.vertexHandler);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, newChunk.vertexData, this.glContext.STATIC_DRAW);
        return newChunk;
    }

    /**
     *
     * @param {TwoDChunk} chunk
     * @param {Array} dataArray
     * @param {Array} heightDataArray
     */
    updateChunk(chunk, dataArray, heightDataArray) {
        let dIndex = 0;
        let hIndex = 0;
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 16; i++) {
                // Set height data
                chunk.heightData[i][j] = heightDataArray[hIndex++];
                // Get block info
                let blockInfo          = dataArray[dIndex++];
                let blockSplitArray    = null;
                if (blockInfo.indexOf('[') > -1) {
                    blockInfo       = blockInfo.substring(0, blockInfo.length - 1);
                    blockSplitArray = blockInfo.split('[');
                }
                let blockTypeEntry           = this._getBlockType(blockSplitArray == null ? blockInfo : blockSplitArray[0]);
                let blockTraits              = blockSplitArray == null ? [] : this._getBlockTraits(blockSplitArray[1]);
                chunk.blockInfo[i][j].first  = blockTypeEntry;
                chunk.blockInfo[i][j].second = blockTraits;
            }
        }
    }

    _getBlockType(typeString) {
        let blockTypeArray = typeString.split(':');
        for (let entry of window.dataManager.blockTypes) {
            if (entry.first === blockTypeArray[0] && entry.second === blockTypeArray[1]) {
                return entry;
            }
        }
        let nEntry = new Entry(blockTypeArray[0], blockTypeArray[1]);
        window.dataManager.blockTypes.push(nEntry);
        return nEntry;
    }

    _getBlockTraits(traitsString) {
        let entryArray  = [];
        let traitsArray = traitsString.split(',');
        for (let traitString of traitsArray) {
            let traitDataArray = traitString.split('=');
            for (let entry of window.dataManager.blockTraits) {
                if (entry.first === traitDataArray[0] && entry.second === traitDataArray[1]) {
                    entryArray.push(entry);
                }
            }
        }
        return entryArray;
    }

    createPlayer(name, id, position) {
        return new TwoDPlayer(name, id, position, this.glContext);
    }

    /**
     * @param {Player} player
     * @param newPosition
     */
    updatePlayer(player, newPosition) {
        player.updatePlayer(this.glContext, newPosition, null);
    }

    createWorld(id, name, isDefault, spawnPoint) {
        return new TwoDWorld(id, name, isDefault, spawnPoint);
    }
    //todo add to base code
    createWorldBorder(center, diameter) {
        return new TwoDWorldBorder(center, diameter, this.glContext);
    }

    processLighting(timeInMilliseconds) {
        let startTime  = Date.now();
        let chunk      = null;
        let peekPos    = 1;
        const iterator = window.dataManager.selectedWorld.lightingQueue[Symbol.iterator]();
        while ((Date.now() - startTime) < timeInMilliseconds) {
            // Lets create an array with push and pop functions like a queue but not have a peek function sounds grate!
            chunk = iterator.next().value;
            if (chunk == null) break;

            let northNeighbor = window.dataManager.selectedWorld.getChunkOrNull(chunk.northNeighbor.x, chunk.northNeighbor.z);
            let westNeighbor  = window.dataManager.selectedWorld.getChunkOrNull(chunk.westNeighbor.x, chunk.westNeighbor.z);
            let southNeighbor = window.dataManager.selectedWorld.getChunkOrNull(chunk.southNeighbor.x, chunk.southNeighbor.z);
            let eastNeighbor  = window.dataManager.selectedWorld.getChunkOrNull(chunk.eastNeighbor.x, chunk.eastNeighbor.z);
            if (northNeighbor != null && westNeighbor != null && southNeighbor != null && eastNeighbor != null) {
                chunk.generateRender(this.glContext, northNeighbor, westNeighbor, southNeighbor, eastNeighbor);
                window.dataManager.selectedWorld.lightingQueue.delete(chunk);
            }
            peekPos++;
        }
    }

    /**
     *
     * @param {Camera} camera
     * @param {Map<int, Map<int, Chunk>>} chunkMap
     */
    renderBlocks(camera, chunkMap) {
        this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);
        if (camera.update()) {
            this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
            this.glContext.uniformMatrix4fv(this.uni_vc_view, false, camera.viewMat.toFloat32Array());
        }

        this._targetChunkRangeFor2d(camera.position, this.aspectRatio, this.fov, this.chunkRenderRange);

        this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
        this.glContext.enableVertexAttribArray(0);
        this.glContext.enableVertexAttribArray(1);
        // Render chunks
        for (let i = this.chunkRenderRange[0]; i <= this.chunkRenderRange[2]; i++) {
            for (let j = this.chunkRenderRange[1]; j <= this.chunkRenderRange[3]; j++) {
                /** @type {Map<int, TwoDChunk>} */
                let cMap = chunkMap.get(i);
                if (cMap != null) {
                    /** @type {TwoDChunk} */
                    let chunk = cMap.get(j);
                    if (chunk != null) {
                        chunk.render(this.glContext);
                    }
                }
            }
        }
        // Download chunk range plus 1
        for (let i = this.chunkRenderRange[0] - 1; i <= this.chunkRenderRange[2] + 1; i++) {
            for (let j = this.chunkRenderRange[1] - 1; j <= this.chunkRenderRange[3] + 1; j++) {
                this.queueDownload(i, j);
            }
        }

        this.glContext.disableVertexAttribArray(0);
        this.glContext.disableVertexAttribArray(1);
        this.glContext.useProgram(null);
    }

    _targetChunkRangeFor2d(position, aspectRatio, fov, range) {
        let far               = Math.abs(position.y);
        let verticalDistFar   = far * Math.tan(fov / 2);
        let hFov              = 2 * Math.atan(aspectRatio * Math.tan(fov / 2));
        let horizontalDistFar = far * Math.tan(hFov / 2);

        let cxL = Math.floor(position.x - horizontalDistFar) >> 4;
        let czL = Math.floor(position.z - verticalDistFar) >> 4;
        let cxR = Math.ceil(position.x + horizontalDistFar) >> 4;
        let czR = Math.ceil(position.z + verticalDistFar) >> 4;

        range[0] = cxL;
        range[1] = czL;
        range[2] = cxR;
        range[3] = czR;
    }

    queueDownload(x, z) {
        if (window.dataManager.selectedWorld != null) {
            if (window.dataManager.selectedWorld.worldBorder != null) {
                if (!WorldBorder.containsChunkXZ(x, z, window.dataManager.selectedWorld.worldBorder.center,
                    window.dataManager.selectedWorld.worldBorder.diameter + 32)) {///todo convert to world pos
                    return;
                }
            }
            let cMap = window.dataManager.selectedWorld.requestQueue.get(x);
            if (cMap == null) {
                cMap = new Map();
                window.dataManager.selectedWorld.requestQueue.set(x, cMap);
            }
            let chunkInfo = cMap.get(z);
            if (chunkInfo == null) {
                chunkInfo = new ChunkRequestInfo(x, z, Date.now());
                cMap.set(z, chunkInfo);
                window.dataManager.selectedWorld.downloadArray.push(chunkInfo.downloadInfo);
            } else {
                let timeNow = Date.now();
                if ((timeNow - chunkInfo.time) > window.dataManager.chunkCacheLifetime) {
                    chunkInfo.time = timeNow;
                    window.dataManager.selectedWorld.downloadArray.push(chunkInfo.downloadInfo);
                }
            }
        }
    }

    renderPlayers(camera, world) {
        this._requestPlayers(world);
        this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
        this.glContext.enableVertexAttribArray(0);
        this.glContext.enableVertexAttribArray(1);

        for(let value of world.playerMap.values()) {
            //if(value.position.x >= this.chunkRenderRange[0] && value.position.x <= this.chunkRenderRange[2] &&
            //    value.position.z >= this.chunkRenderRange[1] && value.position.z <= this.chunkRenderRange[3]) {
                value.render(this.glContext);
                //console.log('player render');
            //}
        }

        this.glContext.disableVertexAttribArray(0);
        this.glContext.disableVertexAttribArray(1);
        this.glContext.useProgram(null);
    }

    _requestPlayers(world) {
        if((Date.now() - world.requestPlayerTime) > world.requestPlayerCommandInterval) {
            world.requestPlayerTime = Date.now();
            window.dataManager.selectedServer.webSocketClient.getNative().send(JSON.stringify({
                cmd: "getPlayers",
                worldId: world.uuid
            }));
        }
    }

    renderWorldBorder(world) {
        this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
        this.glContext.enableVertexAttribArray(0);
        this.glContext.enableVertexAttribArray(1);

        world.worldBorder.render(this.glContext);

        this.glContext.disableVertexAttribArray(0);
        this.glContext.disableVertexAttribArray(1);
        this.glContext.useProgram(null);
    }
}