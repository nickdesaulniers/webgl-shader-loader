;(function (global) {
  function getQualifiersPartial (parameter, storage) {
    var getActive = "getActive" + storage;
    var getLocation = "get" + storage + "Location";
    return function (gl, program) {
      var len = gl.getProgramParameter(program, parameter);
      var qualifiers = {};
      var qualifier = null;
      for (var i = 0; i < len; ++i) {
        qualifier = gl[getActive](program, i).name;
        qualifiers[qualifier] = gl[getLocation](program, qualifier);
      }
      return qualifiers;
    };
  };

  // num is number of components per attribute.  ex. vec3 -> 3, mat4 -> 4
  function initBuffer (gl, data, num, attribute) {
    var buffer = gl.createBuffer();
    if (!buffer) return !!console.error("Failed to create " + attribute + " buffer.");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, num, gl.FLOAT, false, 0, 0);
    return !gl.enableVertexAttribArray(attribute);
  };

  var webGLProto = WebGLRenderingContext.prototype;
  global.getAttributes = getQualifiersPartial(webGLProto.ACTIVE_ATTRIBUTES, "Attrib");
  global.getUniforms = getQualifiersPartial(webGLProto.ACTIVE_UNIFORMS, "Uniform");
  global.initBuffer = initBuffer;
})(this);

