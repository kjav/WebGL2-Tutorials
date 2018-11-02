#version 300 es
// An attribute is an input to a vertex shader.
// It will receive data from a buffer.
in vec2 a_position;
in vec2 a_texCoord;

uniform mat3 u_matrix;

out vec2 v_texCoord;

// All shaders have a main function
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_texCoord = a_texCoord;
}
