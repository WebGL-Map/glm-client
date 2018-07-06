import {WorldBorder} from 'glm-client-base';

export default class TwoDWorldBorder extends WorldBorder {

    /**
     * @param {Vector3} center the center position of the border.
     * @param {number} diameter how long and wide the border is.
     * @param {WebGLRenderingContext} glContext
     */
    constructor(center, diameter, glContext) {//todo set line width
        super(center, diameter);
        let r = diameter / 2;
        this.vertexData = new Float32Array([
            center.x - r, center.z - r,
            center.x + r, center.z - r,
            center.x + r, center.z + r,
            center.x - r, center.z + r,
        ]);
        this.colorData  = new Float32Array([
            1, 0, 0, 0.75,
            1, 0, 0, 0.75,
            1, 0, 0, 0.75,
            1, 0, 0, 0.75,
        ]);
        this.vertexHandler = glContext.createBuffer();
        this.colorHandler  = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.vertexData, glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.colorData, glContext.STATIC_DRAW);
    }

    /**
     * @param {WebGLRenderingContext} glContext
     */
    render(glContext) {
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.vertexAttribPointer(0, 2, glContext.FLOAT, false, 0, 0);

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.vertexAttribPointer(1, 4, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINE_LOOP, 0, 4);
    }
}