#version 300 es
// Fragment shaders don't have a precision by default so we need to pick one.
// Mediump is a good choice.
precision mediump float;

in vec4 v_color;

// We need to declare an output for the fragment shader.
out vec4 outColor;

void main() {
  outColor = v_color;
}
