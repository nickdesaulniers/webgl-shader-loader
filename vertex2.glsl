uniform mat4 uMVP;
attribute vec4 aPosition;
varying vec4 vPosition;
void main () {
  gl_Position = uMVP * aPosition;
  vPosition = aPosition;
}

