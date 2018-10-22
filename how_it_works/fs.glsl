#version 300 es
// Fragment shaders don't have a precision by default so we need to pick one.
// Mediump is a good choice.
precision mediump float;

uniform vec4 u_color;

// We need to declare an output for the fragment shader.
out vec4 outColor;

void main() {
  outColor = u_color;
}
