"use strict";

(() => {
const NAME = "image_processing_continued";
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

const imageUniformLocation = gl.getUniformLocation(program, "u_image");
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const flipYLocation = gl.getUniformLocation(program, "u_flipY");

const edgeDetect2Kernel = [
  -1, -1, -1,
  -1, 8, -1,
  -1, -1, -1
];
const edgeDetect2Weight = 1;

const gaussianKernel = [
  0.045, 0.122, 0.045,
  0.122, 0.332, 0.122,
  0.045, 0.122, 0.045
];
const gaussianWeight = 1;

const normalKernel = [
  1, 1, 1,
  1, 1, 1,
  1, 1, 1
];
const normalKernelWeight = 9;

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

var textures = [];
var framebuffers = [];
for (var ii = 0; ii < 2; ++ii) {
  var texture = createAndSetupTexture(gl);
  textures.push(texture);

  // make the texture the same size as the image
  var mipLevel = 0;               // the largest mip
  var internalFormat = gl.RGBA;   // format we want in the texture
  var border = 0;                 // must be 0
  var srcFormat = gl.RGBA;        // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  var data = null;                // no data = create a blank texture
  gl.texImage2D(
    gl.TEXTURE_2D, mipLevel, internalFormat, image.width, image.height, border,
    srcFormat, srcType, data);

  // Create a framebuffer
  var fbo = gl.createFramebuffer();
  framebuffers.push(fbo);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  // Attach a texture to it.
  var attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel);
}
// Create a texture and put the image in it.
var originalImageTexture = createAndSetupTexture(gl);

// Upload the image into the texture.
var mipLevel = 0;               // the largest mip
var internalFormat = gl.RGBA;   // format we want in the texture
var srcFormat = gl.RGBA;        // format of data we are supplying
var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
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

  // Start with the original image
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

  var count = 0;

  gl.uniform1f(flipYLocation, 1);

  setFramebuffer(gl, framebuffers[count % 2], image.width, image.height, resolutionUniformLocation);
  drawWithKernel(gl, gaussianKernel, kernelUniformLocation, gaussianWeight, kernelWeightUniformLocation);
  gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

  count += 1;

  setFramebuffer(gl, framebuffers[count % 2], image.width, image.height, resolutionUniformLocation);
  drawWithKernel(gl, edgeDetect2Kernel, kernelUniformLocation, edgeDetect2Weight, kernelWeightUniformLocation);
  gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

  count += 1;

  gl.uniform1f(flipYLocation, -1);
  setFramebuffer(gl, null, gl.canvas.width, gl.canvas.height, resolutionUniformLocation);

  drawWithKernel(gl, normalKernel, kernelUniformLocation, normalKernelWeight, kernelWeightUniformLocation);
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
