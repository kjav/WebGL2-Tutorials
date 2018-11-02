// Test WebGL2 support
const test_gl = document.getElementById("test_canvas").getContext("webgl2");
if (!test_gl) {
  alert("WebGL2 not available!");
  throw new Error("WebGL2 not available!");
}

// Function to create a shader
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log("Error in shader, type: ", type);
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// Function to create program (linked shaders)
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// Helper function to resize canvas to displayed size
function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
     
  // Check if the canvas is not the same size.
  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {
     
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

// Returns a random integer between 0 and (range - 1)
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW);
}

function setGeometry(gl, x1, y1, x2, y2, x3, y3) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x1, y1,
      x2, y2,
      x3, y3
    ]),
    gl.STATIC_DRAW
  );
}

function setColors(gl) {
  // Fill the array with random colors.

  var r = Math.random

  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [ r(), r(), r(), 1,
          r(), r(), r(), 1,
          r(), r(), r(), 1,
          r(), r(), r(), 1,
          r(), r(), r(), 1,
          r(), r(), r(), 1]),
      gl.STATIC_DRAW);
}

function createAndSetupTexture(gl) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  // Set up texture so we can render any size image and so we are
  // working with pixels.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
  return texture;
}

function setFramebuffer(gl, fbo, width, height, resolutionLocation) {
  // make this the framebuffer we are rendering to.
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  // Tell the shader the resolution of the framebuffer.
  gl.uniform2f(resolutionLocation, width, height);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, width, height);
}

function drawWithKernel(gl, kernel, kernelLocation, kernelWeight, kernelWeightLocation) {
  // set the kernel and it's weight
  gl.uniform1fv(kernelLocation, kernel);
  gl.uniform1f(kernelWeightLocation, kernelWeight);

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}
