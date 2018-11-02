#version 300 es
// An attribute is an input to a vertex shader.
// It will receive data from a buffer.
in vec2 a_position;
in vec4 a_color;

uniform mat3 u_matrix;

out vec4 v_color;

// All shaders have a main function
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_color = a_color;
}
