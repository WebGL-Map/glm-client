import {Block, ChunkRequestInfo, Entry, Player, Program, Shader, TexturePack, WorldBorder} from "glm-client-base";
import {Matrix4, Vector3} from "math.gl";
import Colors from "./Colors";
import TwoDWorld from "./data/TwoDWorld";
import TwoDWorldBorder from "./data/TwoDWorldBorder";
import TwoDBlock from "./data/TwoDBlock";

/**
 * The texture pack class for this plugin.
 *
 * @author Tyler Bucher
 */
export default class DefaultTexturePack extends TexturePack {

    /**
     * Creates a new TexturePack.
     *
     * @param {HTMLElement} canvasElement
     * @param {Object} colorObj
     */
    constructor(canvasElement, colorObj) {
        super();
        /** @type {HTMLElement} */
        this.canvasElement = canvasElement;
        /** @type {WebGLRenderingContext} */
        this.glContext = null;
        /** @type {Array<Number>} */
        this.chunkRenderRange = [4];
        /** @type {Array<Number>} */
        this.blockRenderRange = [4];
        /** @type {Colors} */
        this.colorObject = new Colors(colorObj);
        /** @type {ANGLE_instanced_arrays} */
        this.angleExt = null;
        /** @type {TwoDBlock|null} */
        this.instancedBlock = null;
        /** @type {Float32Array|null} */
        this.instancedPositionData = null;
        /** @type {Float32Array|null} */
        this.instancedColorData = null;
        /** @type {WebGLBuffer|null} */
        this.instancedPositionHandler = null;
        /** @type {WebGLBuffer|null} */
        this.instancedColorHandler = null;
    }

    /**
     * Initializes this texture pack.
     */
    init() {
        // Get OpenGL rendering contexts
        /** @type {WebGLRenderingContext} */
        this.glContext = this.canvasElement.getContext("experimental-webgl");
        this.angleExt = this.glContext.getExtension("ANGLE_instanced_arrays");
        // Setup OpenGL view port information
        this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);
        this.glContext.enable(this.glContext.BLEND);
        this.glContext.blendFunc(this.glContext.SRC_ALPHA, this.glContext.ONE_MINUS_SRC_ALPHA);
        this.glContext.depthFunc(this.glContext.LESS);
        this.glContext.clearColor(0.0, 0.0, 0.0, 1.0);
        // Instanced shaders
        this.vertex_shader_vci_source   =
            "precision highp float;\n" +
            "attribute vec3 position;\n" +
            "attribute vec3 iposition;\n" +
            "attribute vec3 icolor;\n" +
            "\n" +
            "uniform mat4 model;\n" +
            "uniform mat4 view;\n" +
            "uniform mat4 projection;\n" +
            "\n" +
            "varying vec4 oColor;\n" +
            "\n" +
            "void main() {\n" +
            "    oColor = vec4(icolor, 1);\n" +
            "    mat4 mvp = projection * view * model;\n" +
            "    gl_Position = mvp * vec4(position.x + iposition.x, position.y + iposition.y, position.z + iposition.z, 1.0);\n" +
            "}";
        this.fragment_shader_vci_source =
            "precision mediump float;\n" +
            "varying vec4 oColor;\n" +
            "\n" +
            "void main() {\n" +
            "    gl_FragColor = oColor;\n" +
            "}";
        this.vertex_shader_vc_source    =
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
        this.fragment_shader_vc_source  =
            "precision mediump float;\n" +
            "varying vec4 oColor;\n" +
            "\n" +
            "void main() {\n" +
            "    gl_FragColor = oColor;\n" +
            "}";
        // Create shader objects
        this.vertex_shader_vci          = new Shader(this.glContext, this.glContext.VERTEX_SHADER, this.vertex_shader_vci_source);
        this.fragment_shader_vci        = new Shader(this.glContext, this.glContext.FRAGMENT_SHADER, this.fragment_shader_vci_source);
        this.vertex_shader_vc           = new Shader(this.glContext, this.glContext.VERTEX_SHADER, this.vertex_shader_vc_source);
        this.fragment_shader_vc         = new Shader(this.glContext, this.glContext.FRAGMENT_SHADER, this.fragment_shader_vc_source);
        // Verify shaders
        if (!this.vertex_shader_vci.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.vertex_shader_vci.nativeShader));
        }
        if (!this.fragment_shader_vci.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.fragment_shader_vci.nativeShader));
        }
        if (!this.vertex_shader_vc.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.vertex_shader_vc.nativeShader));
        }
        if (!this.fragment_shader_vc.verify(this.glContext)) {
            console.log(this.glContext.getShaderInfoLog(this.fragment_shader_vc.nativeShader));
        }
        // Attach shaders
        this.shaderProgram_vci = new Program(this.glContext);
        this.shaderProgram_vci.attachShader(this.glContext, this.vertex_shader_vci);
        this.shaderProgram_vci.attachShader(this.glContext, this.fragment_shader_vci);
        this.shaderProgram_vc = new Program(this.glContext);
        this.shaderProgram_vc.attachShader(this.glContext, this.vertex_shader_vc);
        this.shaderProgram_vc.attachShader(this.glContext, this.fragment_shader_vc);
        // Bind attribute locations
        this.glContext.bindAttribLocation(this.shaderProgram_vci.nativeProgram, 0, "position");
        this.glContext.bindAttribLocation(this.shaderProgram_vci.nativeProgram, 1, "iposition");
        this.glContext.bindAttribLocation(this.shaderProgram_vci.nativeProgram, 2, "icolor");
        this.glContext.bindAttribLocation(this.shaderProgram_vc.nativeProgram, 0, "position");
        this.glContext.bindAttribLocation(this.shaderProgram_vc.nativeProgram, 1, "color");
        // Link and validate
        this.shaderProgram_vci.link(this.glContext);
        this.shaderProgram_vci.validate(this.glContext);
        this.shaderProgram_vc.link(this.glContext);
        this.shaderProgram_vc.validate(this.glContext);
        // Verify shader
        if (!this.shaderProgram_vci.verify(this.glContext)) {
            console.log("Shader program error.");
        }
        if (!this.shaderProgram_vc.verify(this.glContext)) {
            console.log("Shader program error.");
        }
        // Perspective math setup
        this.modelMatrix      = new Matrix4();
        this.hFovDegree       = 45;
        this.fov              = (this.hFovDegree * Math.PI) / 180.0;
        this.aspectRatio      = this.canvasElement.width / this.canvasElement.height;
        this.near             = 0.1;
        this.far              = 8192.0;
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.perspective({fov: this.fov, aspect: this.aspectRatio, near: this.near, far: this.far});
        this.dragCoefficient = (this.canvasElement.height / 2) / Math.tan(this.fov / 2);
        // Setup shader uniforms
        this.glContext.useProgram(this.shaderProgram_vci.nativeProgram);
        this.uni_vc_modeli = this.glContext.getUniformLocation(this.shaderProgram_vci.nativeProgram, "model");
        this.glContext.uniformMatrix4fv(this.uni_vc_modeli, false, this.modelMatrix.toFloat32Array());
        this.uni_vc_viewi = this.glContext.getUniformLocation(this.shaderProgram_vci.nativeProgram, "view");
        this.glContext.uniformMatrix4fv(this.uni_vc_viewi, false, this.modelMatrix.toFloat32Array());
        this.uni_vc_projectioni = this.glContext.getUniformLocation(this.shaderProgram_vci.nativeProgram, "projection");
        this.glContext.uniformMatrix4fv(this.uni_vc_projectioni, false, this.projectionMatrix.toFloat32Array());
        this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
        this.uni_vc_model = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "model");
        this.glContext.uniformMatrix4fv(this.uni_vc_model, false, this.modelMatrix.toFloat32Array());
        this.uni_vc_view = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "view");
        this.glContext.uniformMatrix4fv(this.uni_vc_view, false, this.modelMatrix.toFloat32Array());
        this.uni_vc_projection = this.glContext.getUniformLocation(this.shaderProgram_vc.nativeProgram, "projection");
        this.glContext.uniformMatrix4fv(this.uni_vc_projection, false, this.projectionMatrix.toFloat32Array());
        this.glContext.useProgram(null);
        // Initialize instanced block
        this.instancedBlock           = new TwoDBlock(this.glContext, new Vector3(0.0, 0.0, 0.0));
        this.instancedPositionData    = new Float32Array([-1, 0, -1, 0, 0, -1, -1, 0, -1, 0, 0, -1]);
        this.instancedPositionHandler = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedPositionHandler);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, this.instancedPositionData, this.glContext.DYNAMIC_DRAW);
        this.instancedColorData    = new Float32Array([1, 0, 0, 0.75, 0, 0, 1, 0, 0, 0.75, 0, 0]);
        this.instancedColorHandler = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedColorHandler);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, this.instancedColorData, this.glContext.DYNAMIC_DRAW);
        // Hook canvas events
        this._hookEvents();
    }

    /**
     * Hook canvas events.
     * @private
     */
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
                window.dataManager.texturePack.shaderProgram_vci.nativeProgram);
            window.dataManager.texturePack.glContext.uniformMatrix4fv(
                window.dataManager.texturePack.uni_vc_projectioni,
                false,
                window.dataManager.texturePack.projectionMatrix.toFloat32Array()
            );
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
            window.dataManager.selectedWorld.camera.position.y += event.wheelDeltaY > 0 ? -15 : 15;
            if (window.dataManager.selectedWorld.camera.position.y < 1) {
                window.dataManager.selectedWorld.camera.position.y = 1;
            } else if (window.dataManager.selectedWorld.camera.position.y > 1024) {
                window.dataManager.selectedWorld.camera.position.y = 1024;
            } else {

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
                window.dataManager.selectedWorld.camera.position.z += deltaRy;
            }
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
     * Creates a unique block from the texture pack.
     *
     * @param {String} blockType the type of block to create.
     * @param {Number} x the x position.
     * @param {Number} y the y position.
     * @param {Number} z the z position.
     *
     * @return {Block|null} the newly created block or null.
     */
    createBlock(blockType, x, y, z) {
        // update block don't create a new one because we use instanced rendering
        window.dataManager.selectedWorld.setAndCompute(x, y, z, this.colorObject.colorIndexMap.get(blockType));
    }

    /**
     * Creates a new chunk from the texture pack.
     *
     * @param {Array} dataArray the list of block data to create blocks from.
     * @param {Array} heightDataArray the list of block height positions.
     * @param {Number} x the x position.
     * @param {Number} y the y position.
     * @param {Number} z the z position.
     *
     * @return {Chunk|null} the newly created chunk or null.
     */
    createChunk(dataArray, heightDataArray, x, y, z) {
        let dIndex = 0;
        let hIndex = 0;
        let blockX = x << 4;
        let blockZ = z << 4;
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 16; i++) {
                // Get block info
                let blockInfo = dataArray[dIndex++];
                this.createBlock(blockInfo.indexOf('[') > -1 ? blockInfo.substring(0, blockInfo.indexOf('[')) : blockInfo,
                    blockX + i, heightDataArray[hIndex++], blockZ + j);
            }
        }
    }

    /**
     * Creates a new world.
     *
     * @param {String} id the uuid of the world.
     * @param {String} name the name of the world.
     * @param {boolean} isDefault states if this world is default.
     * @param {Vector3} spawnPoint the spawn point of the world.
     *
     * @return {World|null} the newly crated world or null.
     */
    createWorld(id, name, isDefault, spawnPoint) {
        return new TwoDWorld(id, name, isDefault, spawnPoint);
    }

    /**
     * Creates a new world border
     *
     * @param {Vector3} center the center position of the border.
     * @param {Number} diameter the diameter of the border.
     *
     * @return {WorldBorder|null} the newly created world border or null.
     */
    createWorldBorder(center, diameter) {
        return new TwoDWorldBorder(center, diameter, this.glContext);
    }

    /**
     * Attempts to render a set of chunks.
     *
     * @param {Camera} camera the camera to use for render testing.
     * @param {Map<int, Map<int, Chunk>>} chunkMap the map of chunks to render.
     */
    renderBlocks(camera, chunkMap) {
        this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);
        if (camera.update()) {
            let fArray = camera.viewMat.toFloat32Array();
            this.glContext.useProgram(this.shaderProgram_vci.nativeProgram);
            this.glContext.uniformMatrix4fv(this.uni_vc_viewi, false, fArray);
            this.glContext.useProgram(this.shaderProgram_vc.nativeProgram);
            this.glContext.uniformMatrix4fv(this.uni_vc_view, false, fArray);
            // Update buffer size if needed
            this._targetBlockRangeFor2d(camera.position, this.aspectRatio, this.fov, this.blockRenderRange);
            let nSize = Math.abs(this.blockRenderRange[0] - (this.blockRenderRange[2] + 1)) *
                Math.abs(this.blockRenderRange[1] - (this.blockRenderRange[3] + 1));
            if (this.instancedPositionData.length !== nSize * 3) {
                this.instancedPositionData = new Float32Array(nSize * 3);
                this.instancedColorData    = new Float32Array(nSize * 3);
                this._updateBuffers();
            } else {
                this._updateBuffersSubPosition();
            }
        }
        this._updateBuffersSubColor();
        // Download chunk range plus 1
        this._targetChunkRangeFor2d(camera.position, this.aspectRatio, this.fov, this.chunkRenderRange);
        for (let i = this.chunkRenderRange[0] - 1; i <= this.chunkRenderRange[2] + 1; i++) {
            for (let j = this.chunkRenderRange[1] - 1; j <= this.chunkRenderRange[3] + 1; j++) {
                this.queueDownload(i, j);
            }
        }

        this.glContext.useProgram(this.shaderProgram_vci.nativeProgram);
        this.instancedBlock.render(this.glContext, this.instancedPositionHandler, this.instancedColorHandler,
            this.instancedPositionData.length / 3);
        this.glContext.useProgram(null);
    }

    /**
     * Updates instanced buffers.
     * @private
     */
    _updateBuffers() {
        let index  = 0;
        let cIndex = 0;
        for (let i = this.blockRenderRange[0]; i <= this.blockRenderRange[2]; i++) {
            for (let j = this.blockRenderRange[1]; j <= this.blockRenderRange[3]; j++) {
                this.instancedPositionData[index++] = i;
                this.instancedPositionData[index++] = 0;
                this.instancedPositionData[index++] = j;
                this.instancedColorData[cIndex++]   = 0.0;
                this.instancedColorData[cIndex++]   = 0.0;
                this.instancedColorData[cIndex++]   = 0.0;
            }
        }
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedPositionHandler);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, this.instancedPositionData, this.glContext.DYNAMIC_DRAW);
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedColorHandler);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, this.instancedColorData, this.glContext.DYNAMIC_DRAW);
    }

    /**
     * Update the position instance buffer.
     * @private
     */
    _updateBuffersSubPosition() {
        let index = 0;
        //let obj = {r: 1, g: 1, b:1};
        for (let i = this.blockRenderRange[0]; i <= this.blockRenderRange[2]; i++) {
            for (let j = this.blockRenderRange[1]; j <= this.blockRenderRange[3]; j++) {
                this.instancedPositionData[index++] = i;
                this.instancedPositionData[index++] = 0;
                this.instancedPositionData[index++] = j;
            }
        }
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedPositionHandler);
        this.glContext.bufferSubData(this.glContext.ARRAY_BUFFER, 0, this.instancedPositionData);
    }

    /**
     * Update the color instance buffer.
     * @private
     */
    _updateBuffersSubColor() {
        let cIndex = 0;
        let ccol   = null;
        let iint   = 0;
        for (let i = this.blockRenderRange[0]; i <= this.blockRenderRange[2]; i++) {
            for (let j = this.blockRenderRange[1]; j <= this.blockRenderRange[3]; j++) {
                ccol = window.dataManager.selectedWorld.getBlockType(i, 0, j);
                if (ccol === undefined) {
                    this.instancedColorData[cIndex++] = 0.0;
                    this.instancedColorData[cIndex++] = 0.0;
                    this.instancedColorData[cIndex++] = 0.0;
                } else {
                    iint                              = window.dataManager.texturePack.colorObject.fastColorArray[ccol];
                    this.instancedColorData[cIndex++] = ((iint >> 16) & 0xFF) / 255.0;
                    this.instancedColorData[cIndex++] = ((iint >> 8) & 0xFF) / 255.0;
                    this.instancedColorData[cIndex++] = (iint & 0xFF) / 255.0;
                }
            }
        }
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.instancedColorHandler);
        this.glContext.bufferSubData(this.glContext.ARRAY_BUFFER, 0, this.instancedColorData);
    }

    /**
     * Gets the block range for the camera position.
     *
     * @param {Vector3} position the position of the camera.
     * @param {Number} aspectRatio the aspect ratio of the camera.
     * @param {Number} fov the fov of the camera.
     * @param {Array<Number>} range the update buffer.
     * @private
     */
    _targetBlockRangeFor2d(position, aspectRatio, fov, range) {
        let far               = Math.abs(position.y);
        let verticalDistFar   = far * Math.tan(fov / 2);
        let hFov              = 2 * Math.atan(aspectRatio * Math.tan(fov / 2));
        let horizontalDistFar = far * Math.tan(hFov / 2);

        range[0] = Math.floor(Math.floor(position.x) - horizontalDistFar);
        range[1] = Math.floor(Math.floor(position.z) - verticalDistFar);
        range[2] = Math.ceil(Math.ceil(position.x) + horizontalDistFar);
        range[3] = Math.ceil(Math.ceil(position.z) + verticalDistFar);
    }

    /**
     * Gets the chunk range for the camera position.
     *
     * @param {Vector3} position the position of the camera.
     * @param {Number} aspectRatio the aspect ratio of the camera.
     * @param {Number} fov the fov of the camera.
     * @param {Array<Number>} range the update buffer.
     * @private
     */
    _targetChunkRangeFor2d(position, aspectRatio, fov, range) {
        this._targetBlockRangeFor2d(position, aspectRatio, fov, range);

        range[0] = range[0] >> 4;
        range[1] = range[1] >> 4;
        range[2] = range[2] >> 4;
        range[3] = range[3] >> 4;
    }

    /**
     * Add chunks to the download queue if needed.
     *
     * @param {Number} x the x position of the chunk.
     * @param {Number} z the z position of the chunk.
     */
    queueDownload(x, z) {
        if (window.dataManager.selectedWorld != null) {
            if (window.dataManager.selectedWorld.worldBorder != null) {
                if (!WorldBorder.containsChunkXZ(x, z, window.dataManager.selectedWorld.worldBorder.center,
                    window.dataManager.selectedWorld.worldBorder.diameter)) {///todo convert to world pos  + 32
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

    /**
     * Attempts to render the players within the cameras view for the provided world.
     *
     * @param {Camera} camera the camera of the provided world.
     * @param {World} world the world to render players from.
     */
    renderPlayers(camera, world) {
        // Implement method so errors are not thrown
    }

    /**
     * Attempts to render the world border for the provided world.
     *
     * @param {World} world the world to render a world border for.
     */
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