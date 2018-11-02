#version 300 es
// Fragment shaders don't have a precision by default so we need to pick one.
// Mediump is a good choice.
precision mediump float;

uniform sampler2D u_image0;
uniform sampler2D u_image1;

uniform float u_kernel[9];
uniform float u_kernelWeight;

in vec2 v_texCoord;

// We need to declare an output for the fragment shader.
out vec4 outColor;

void main() {
  vec4 color0 = texture(u_image0, v_texCoord);
  vec4 color1 = texture(u_image1, v_texCoord);
  outColor = color0 * color1;
}
