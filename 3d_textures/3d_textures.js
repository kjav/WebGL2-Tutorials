"use strict";

(() => {
const NAME = "3d_textures";
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
const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

setRectangle(gl, -150, -100, 300, 200);

const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);

setCubeGeometry();

gl.vertexAttribPointer(
  positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

var texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
setTexcoords(gl);

// Turn on the attribute
gl.enableVertexAttribArray(texcoordAttributeLocation);

gl.vertexAttribPointer(
  texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Set up colour attribute
gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

const primitiveType = gl.TRIANGLES;
var x = 20;
var y = 15;
var rotation = 0;
var scaleX = 1;
var scaleY = 1;
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
  var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m4.translate(matrix, x, y);
  matrix = m4.rotate(matrix, rotation);
  matrix = m4.scale(matrix, scaleX, scaleY);
  gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

  gl.drawArrays(primitiveType, 0, 6);
}

gl.canvas.onmousemove = (e) => {
  var canvas_position = e.target.getBoundingClientRect();
  x = e.clientX - canvas_position.left;
  y = e.clientY - canvas_position.top;
  drawScene();
}

gl.canvas.addEventListener("keydown", (e) => {
  console.log(e.keyCode);
  if (e.keyCode == 82) {
    rotation -= 0.02;
  } else if (e.keyCode == 66) {
    scaleX += 0.04;
    scaleY += 0.04;
  } else if (e.keyCode == 83) {
    scaleX -= 0.04;
    scaleY -= 0.04;
  }
  drawScene();
}, false);

drawScene();

}
})()
