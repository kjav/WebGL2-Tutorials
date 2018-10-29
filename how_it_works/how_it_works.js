"use strict";

(() => {
const NAME = "how_it_works";
const PATH = NAME + "/";

fetch(PATH + "vs.glsl")
  .then(response => response.text())
  .then(vertexShader => {
    fetch(PATH + "fs.glsl")
    .then(response => response.text())
    .then(fragmentShader => {
      main(vertexShader, fragmentShader);
    })
  });

function main(vertexShaderSource, fragmentShaderSource) {

const canvas = document.getElementById(NAME + "_canvas");
const gl = canvas.getContext("webgl2");

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2; // 2 components per iteration
const type = gl.FLOAT; // The data are 32 bit floats
const normalize = false; // Don't normalize the data
const stride = 0; // 0 = move size * sizeof(type) to get the next position
const offset = 0; // Start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation, size, type, normalize, stride, offset);


setGeometry(gl, 0, -100, 150, 125, -175, 100);

const primitiveType = gl.TRIANGLES;
var x = 20;
var y = 15;
function drawScene() {
  resize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want
  gl.bindVertexArray(vao);

  // Set the view matrix
  var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m3.translate(matrix, x, y);
  matrix = m3.rotate(matrix, 0);
  matrix = m3.scale(matrix, 1, 1);
  gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

  gl.drawArrays(primitiveType, 0, 3);
}
drawScene();

}
})()
