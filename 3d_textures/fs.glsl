#version 300 es
// Fragment shaders don't have a precision by default so we need to pick one.
// Mediump is a good choice.
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

// We need to declare an output for the fragment shader.
out vec4 outColor;

void main() {
  outColor = texture(u_teture, v_texcoord);
}
