precision mediump float;
uniform vec4 uColor;
varying vec4 vPosition;
void main () {
  gl_FragColor = uColor * normalize(dot(vPosition, vec4(0, 0, 0, 1)));
}

