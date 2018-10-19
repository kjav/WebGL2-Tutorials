const canvas = document.getElementById("fundamentals_canvas");

const gl = canvas.getContext("webgl2");

fetch("fundamentals/vs.glsl")
  .then(response => response.text())
  .then(vertexShader => {
    fetch("fundamentals/fs.glsl")
    .then(response => response.text())
    .then(fragmentShader => {
      main(vertexShader, fragmentShader);
    })
  });

function main(vertexShaderSource, fragmentShaderSource) {

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
  10, 20,
  80, 20,
  10, 30,
  10, 30,
  80, 20,
  80, 30
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

const colorUniformLocation = gl.getUniformLocation(program, "u_color");

const vao = gl.createVertexArray()
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2; // 2 components per iteration
const type = gl.FLOAT; // The data are 32 bit floats
const normalize = false; // Don't normalize the data
const stride = 0; // 0 = move size * sizeof(type) to get the next position
const offset = 0; // Start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation, size, type, normalize, stride, offset);

resize(gl.canvas);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Tell it to use our program (pair of shaders)
gl.useProgram(program);

gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

// Bind the attribute/buffer set we want
gl.bindVertexArray(vao);

const draw_primitiveType = gl.TRIANGLES;
const draw_offset = 0;
const count = 6;
gl.drawArrays(draw_primitiveType, draw_offset, count);

}
