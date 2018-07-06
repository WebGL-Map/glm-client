import {Player} from "glm-client-base";

export default class TwoDPlayer extends Player {

    /**
     * Creates a new Player.
     *
     * @param {String} name the name of the player.
     * @param {String} id the id of the player.
     * @param {Vector3} position the position of the player.
     */
    constructor(name, id, position, glContext) {
        super(name, id, position);

        this.vertexData = new Float32Array([
            position.x - 5, position.z - 5,
            position.x - 5, position.z + 5,
            position.x + 5, position.z - 5,

            position.x - 5, position.z + 5,
            position.x + 5, position.z + 5,
            position.x + 5, position.z - 5,
        ]);
        this.colorData  = new Float32Array([
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,

            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
        ]);
        this.vertexHandler = glContext.createBuffer();
        this.colorHandler  = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.vertexData, glContext.DYNAMIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.bufferData(glContext.ARRAY_BUFFER, this.colorData, glContext.STATIC_DRAW);
    }

    updatePlayer(glContext, position, name = null) {
        if(name != null) {
            this.name = name;
        }
        this.vertexData[0] = position.x - 5;
        this.vertexData[1] = position.z - 5;
        this.vertexData[2] = position.x - 5;
        this.vertexData[3] = position.z + 5;
        this.vertexData[4] = position.x + 5;
        this.vertexData[5] = position.z - 5;
        this.vertexData[6] = position.x - 5;
        this.vertexData[7] = position.z + 5;
        this.vertexData[8] = position.x + 5;
        this.vertexData[9] = position.z + 5;
        this.vertexData[10] = position.x + 5;
        this.vertexData[11] = position.z - 5;
        glContext.bufferSubData(glContext.ARRAY_BUFFER, 0, this.vertexData);
    }

    /**
     * @param {WebGLRenderingContext} glContext
     */
    render(glContext) {
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexHandler);
        glContext.vertexAttribPointer(0, 2, glContext.FLOAT, false, 0, 0);

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorHandler);
        glContext.vertexAttribPointer(1, 4, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.TRIANGLES, 0, 6);
    }
}