#version 300 es
// Fragment shaders don't have a precision by default so we need to pick one.
// Mediump is a good choice.
precision mediump float;

uniform sampler2D u_image;

uniform float u_kernel[9];
uniform float u_kernelWeight;

in vec2 v_texCoord;

// We need to declare an output for the fragment shader.
out vec4 outColor;

void main() {
  // The size of one pixel in texture coordinate space
  vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

  vec4 colorSum =
      texture(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
      texture(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
      texture(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
      texture(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
      texture(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
      texture(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
      texture(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
      texture(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
      texture(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8];

  outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
