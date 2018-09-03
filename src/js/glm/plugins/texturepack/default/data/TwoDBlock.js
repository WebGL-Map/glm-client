import {Block} from "glm-client-base";

/**
 * A two dimensional block which can be rendered.
 *
 * @author Tyler Bucher
 */
export default class TwoDBlock extends Block {

    /**
     * @param {WebGLRenderingContext} glContext the OpenGL rendering context.
     * @param {Vector3} position the position of the block.
     * @constructor
     */
    constructor(glContext, position) {
        super(null, position, null);

        this.vertexData = new Float32Array(18);
        // First Triangle
        // point 1
        this.vertexData[0] = this.position.x + 0.0;
        this.vertexData[1] = this.position.y + 0.0;
        this.vertexData[2] = this.position.z + 0.0;
        // point 2
        this.vertexData[3] = this.position.x + 0.0;
        this.vertexData[4] = this.position.y + 0.0;
        this.vertexData[5] = this.position.z + 1.0;
        // point 3
        this.vertexData[6] = this.position.x + 1.0;
        this.vertexData[7] = this.position.y + 0.0;
        this.vertexData[8] = this.position.z + 0.0;
        // Second Triangle
        // point 1
        this.vertexData[9]  = this.position.x + 0.0;
        this.vertexData[10] = this.position.y + 0.0;
        this.vertexData[11] = this.position.z + 1.0;
        // point 2
        this.vertexData[12] = this.position.x + 1.0;
        this.vertexData[13] = this.position.y + 0.0;
        this.vertexData[14] = this.position.z + 1.0;
        // point 3
        this.vertexData[15] = this.position.x + 1.0;
        this.vertexData[16] = this.position.y + 0.0;
        this.vertexData[17] = this.position.z + 0.0;
        // Setup gl handler
        this.vertexHandler  = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.vertexData, glContext.STATIC_DRAW);
    }

    /**
     * @param {WebGLRenderingContext} glContext the OpenGL rendering context.
     * @param {WebGLBuffer} instancedPositionHandler the instanced position handler.
     * @param {WebGLBuffer} instancedColorHandler the instanced color handler.
     * @param {Number} instanceCount how many blocks to render.
     */
    render(glContext, instancedPositionHandler, instancedColorHandler, instanceCount) {
        glContext.enableVertexAttribArray(0);
        glContext.enableVertexAttribArray(1);
        glContext.enableVertexAttribArray(2);
        // Bind vertices
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, 0, 0);
        // Bind position offset instanced data
        glContext.bindBuffer(glContext.ARRAY_BUFFER, instancedPositionHandler);
        glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, 0, 0);
        window.dataManager.texturePack.angleExt.vertexAttribDivisorANGLE(1, 1);
        // color offset instanced data
        glContext.bindBuffer(glContext.ARRAY_BUFFER, instancedColorHandler);
        glContext.vertexAttribPointer(2, 3, glContext.FLOAT, false, 0, 0);
        window.dataManager.texturePack.angleExt.vertexAttribDivisorANGLE(2, 1);
        // Instance render blocks
        window.dataManager.texturePack.angleExt.drawArraysInstancedANGLE(glContext.TRIANGLES, 0, 6, instanceCount);
        // Disable attributes
        glContext.disableVertexAttribArray(0);
        glContext.disableVertexAttribArray(1);
        glContext.disableVertexAttribArray(2);
    }
}