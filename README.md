webgl-shader-loader
===================

Asynchronous load, compile, and link webgl shader programs

```html
<script src="webGLShaderLoader.js"></script>
```

##Load WebGL Programs From Shader URL Pairs And Images From URLs
```javascript
var shaderUrls = ['vertex1.glsl', 'frag1.glsl', 'vertex2.glsl', 'frag2.glsl'];
var imgUrls = ['texture1.jpg', 'texture2.jpg', 'texture3.jpg'];

WebGLShaderLoader.load($gl, shaderUrls, imgUrls, function (errors, gl, programs, images) {
  if (errors.length) return console.error.apply(console, errors);

  console.log(programs, images);
  gl.useProgram(programs[0]);
});
```
`$gl` can be an existing webGL context or a canvas element (in the DOM or not).

`shaderUrls` is an array of strings of URLs to shaders. Expects pairs of atleast one,
alternating vertexShaderURL, fragmentShaderURL.

`imgUrls` is an array of strings of URLs to `<img>`s. May be empty or null.

`errors` is a possibly empty array of strings.

`gl` is a webGL context, regardless of `$gl`.

`programs` is an array of WebGLPrograms, in order of the pairs, ready for use.

`images` is a possibly empty array of img elements ready to be sampled.

##Load WebGL Program From Shader String Literals
```javascript
var loader = new WebGLShaderLoader(gl);
loader.loadFromStr(vertexShaderStr, fragmentShaderStr, function (errors, program) {
  if (errors.length > 0) {
    console.error.apply(console, errors);
    return;
  }

  console.log(program);
});
```

##Load WebGL Program From XHR'd Files
```javascript
var loader = new WebGLShaderLoader(gl);
loader.loadFromXHR(vertexShaderPath, fragmentShaderPath, function (errors, program) {
  if (errors.length > 0) {
    console.error.apply(console, errors);
    return;
  }

  console.log(program);
});
```

###Notes
* Look at test.js for further usage/example
* errors is an array of strings of usage, compilation, and linkage errors, it's up to you to check these.

###License
"THE BEER-WARE LICENSE" (Revision 42):
<nick@mozilla.com> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.  Nick Desaulniers

