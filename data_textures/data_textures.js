"use strict";

(() => {
const NAME = "data_textures";
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
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object
  var vao = gl.createVertexArray();
  
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setCubeGeometry(gl);
  gl.vertexAttribPointer(
      positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setFullTexcoords(gl);

  gl.enableVertexAttribArray(texcoordAttributeLocation);

  gl.vertexAttribPointer(
      texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // fill texture with 3x2 pixels
  const level = 0;
  const internalFormat = gl.R8;
  const width = 5;
  const height = 4;
  const border = 0;
  const format = gl.RED;
  const type = gl.UNSIGNED_BYTE;
  const data = new Uint8Array([
    128,  64, 128, 50, 12,
      0, 192,   0,  0, 99,
    128,   0,  50, 80, 50,
      0, 192,   0,  0, 99,
  ]);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                format, type, data);

  // set the filtering so we don't need mips and it's not filtered
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Variables to hold the translation,
  var fieldOfViewRadians = Math.PI / 3;
  var modelXRotationRadians = 0;
  var modelYRotationRadians = 0;

  // Get the starting time.
  var start = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - start;
    // Remember the current time for the next frame.
    start = time;

    resize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.CULL_FACE);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    var cameraPosition = [0, 0, 2];
    var up = [0, 1, 0];
    var target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6 * 6;
    gl.drawArrays(primitiveType, offset, count);

    // Call drawScene again next frame
    requestAnimationFrame(drawScene);
  }
}
})()
