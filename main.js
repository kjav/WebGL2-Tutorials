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
