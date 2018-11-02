"use strict";

(() => {
const NAME = "image_processing";
const PATH = NAME + "/";

fetch(PATH + "vs.glsl")
  .then(response => response.text())
  .then(vertexShader => {
    fetch(PATH + "fs.glsl")
    .then(response => response.text())
    .then(fragmentShader => {
      var image = new Image();
      image.src = PATH + "texture.png";
      image.onload = function() {
        main(vertexShader, fragmentShader, image);
      };
    })
  });

function main(vertexShaderSource, fragmentShaderSource, image) {
const canvas = document.getElementById(NAME + "_canvas");
const gl = canvas.getContext("webgl2");

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

setRectangle(gl, 0, 0, image.width, image.height);

const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");
const imageUniformLocation = gl.getUniformLocation(program, "u_image");

const edgeDetect2Kernel = [
  -1, -1, -1,
  -1, 8, -1,
  -1, -1, -1
];
const edgeDetect2Weight = 1;

const kernelUniformLocation = gl.getUniformLocation(program, "u_kernel[0]");
const kernelWeightUniformLocation = gl.getUniformLocation(program, "u_kernelWeight");

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

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0.0, 0.0,
  1.0, 0.0,
  0.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  1.0, 1.0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texCoordAttributeLocation);
gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const texture = gl.createTexture();

// Specify which texture unit the proceeding operations refer to
gl.activeTexture(gl.TEXTURE0 + 0);

// Bind the texture
gl.bindTexture(gl.TEXTURE_2D, texture);

// Set some parameters of the texture
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

const mipLevel = 0; // The largest mipmap
const internalFormat = gl.RGBA;
const srcFormat = gl.RGBA;
const srcType = gl.UNSIGNED_BYTE;
gl.texImage2D(gl.TEXTURE_2D,
  mipLevel,
  internalFormat,
  srcFormat,
  srcType,
  image);

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

  // Tell the shader which texture unit to use
  gl.uniform1i(imageUniformLocation, 0);

  // Set the kernel of the shader
  gl.uniform1fv(kernelUniformLocation, edgeDetect2Kernel);
  gl.uniform1f(kernelWeightUniformLocation, edgeDetect2Weight);

  // Set the view matrix
  var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m3.translate(matrix, x, y);
  matrix = m3.rotate(matrix, rotation);
  matrix = m3.scale(matrix, scaleX, scaleY);
  gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

  gl.drawArrays(primitiveType, 0, 6);
}

gl.canvas.onmousemove = (e) => {
  var canvas_position = e.target.getBoundingClientRect();
  x = e.clientX - canvas_position.left;
  y = e.clientY - canvas_position.top;
  drawScene();
}

gl.canvas.addEventListener("keydown", (e) => {
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
