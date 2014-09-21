var WebGLShaderLoader = (function () {
  var vertexShaderType = WebGLRenderingContext.prototype.VERTEX_SHADER;
  var fragmentShaderType = WebGLRenderingContext.prototype.FRAGMENT_SHADER;

  function WebGLShaderLoader (gl) {
    this.errors = [];
    this.vertexShader = this.fragmentShader = null;
    this.gl = getContext(gl);
    if (!this.gl) this.errors.push("webgl unsupported");
  };

  WebGLShaderLoader.prototype = {
    loadFromStr: function (vertexShaderStr, fragmentShaderStr, cb) {
      if (typeof vertexShaderStr !== "string" ||
          typeof fragmentShaderStr !== "string" ||
          typeof cb !== "function") {
        this.errors.push("Usage: loaderInstance.loadFromStr('', '', function (errors, program));");
        cb(this.errors, null, this.gl);
      } else if (vertexShaderStr.length === 0 ||
                 fragmentShaderStr.length === 0) {
        this.errors.push("empty shader string");
        cb(this.errors, null, this.gl);
      } else {
        this.vertexShader = this.compile(vertexShaderType, vertexShaderStr);
        this.fragmentShader = this.compile(fragmentShaderType, fragmentShaderStr);

        cb(this.errors, this.link(), this.gl);
      }
    },
    loadFromXHR: function (vertexShaderPath, fragmentShaderPath, cb) {
      if (typeof vertexShaderPath !== "string" ||
          typeof fragmentShaderPath !== "string" ||
          typeof cb !== "function") {
        this.errors.push("Usage: loaderInstance.loadFromXHR('', '', function (errors, program));");
        cb(this.errors, null, this.gl);
        return;
      }

      if (vertexShaderPath.length === 0 || fragmentShaderPath.length === 0) {
        this.errors.push("empty shader path");
        cb(this.errors, null, this.gl);
        return;
      }

      var numShadersLoaded = 0;
      var onload = function (shader, shaderType) {
        return function (twoHundredResponse, shaderStr) {
          if (!twoHundredResponse) {
            this.errors.push("xhr non 200 response code");
            cb(this.errors, null, this.gl);
            return;
          }

          this[shader] = this.compile(shaderType, shaderStr);

          if (++numShadersLoaded > 1) {
            cb(this.errors, this.link(), this.gl);
          }
        }.bind(this);
      }.bind(this);
      this.fetch(vertexShaderPath, onload("vertexShader", vertexShaderType));
      this.fetch(fragmentShaderPath, onload("fragmentShader", fragmentShaderType));
    },
    compile: function (type, shaderStr) {
      var shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, shaderStr);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        this.errors.push(this.gl.getShaderInfoLog(shader));
      }

      return shader;
    },
    link: function () {
      var program = this.gl.createProgram();
      this.gl.attachShader(program, this.vertexShader);
      this.gl.attachShader(program, this.fragmentShader);
      this.gl.linkProgram(program);

      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        this.errors.push(this.gl.getProgramInfoLog(program));
      }

      return program;
    },
    fetch: function (path, cb) {
      var xhr = new XMLHttpRequest;
      xhr.open("GET", path);
      xhr.onload = function () {
        cb(xhr.status === 200, xhr.response);
      };
      xhr.send();
    },
  };

  function getContext (glOrCanvas) {
    if (glOrCanvas instanceof HTMLCanvasElement) {
      return glOrCanvas.getContext('webgl') || glOrCanvas.getContext('experimental-webgl');
    } else {
      return glOrCanvas;
    }
  };

  function loadImages (imgSrcs, cb) {
    var len = imgSrcs.length;
    var images = [];
    var errors = [];
    var loaded = 0;
    function onLoad () { if (++loaded === len) cb(errors, images); };
    function onError (e) {
      errors.push("Failed to load " + e.target.src);
      onLoad();
    };
    for (var i = 0; i < len; ++i) {
      images[i] = new Image;
      images[i].onload = onLoad;
      images[i].onerror = onError;
      images[i].src = imgSrcs[i];
    }
  };

  function getQualifiersPartial(parameter, storage) {
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

  var webGLProto = WebGLRenderingContext.prototype;
  var getAttributes = getQualifiersPartial(webGLProto.ACTIVE_ATTRIBUTES, "Attrib");
  var getUniforms = getQualifiersPartial(webGLProto.ACTIVE_UNIFORMS, "Uniform");

  WebGLShaderLoader.prototype.getAttributes = getAttributes;
  WebGLShaderLoader.prototype.getUniforms = getUniforms;

  // call with:
  // load(gl, ['a.vert', 'b.frag', 'c.vert', 'd.frag'], ['a.jpg', 'b.jpg'],
  //      function (errors, gl, programs, imgs) { ... });
  WebGLShaderLoader.load = function (_gl, shaderUrls, imgUrls, cb) {
    imgUrls = imgUrls || [];
    var programsDone = 0;
    var shadersComplete = false;
    var imgsComplete = !imgUrls.length;
    var totalShaders = shaderUrls.length;
    var errors = [];
    var programs = [];
    var images = [];

    var gl = getContext(_gl);
    if (!gl) errors.push("webgl unsupported");

    if (!imgsComplete) {
      loadImages(imgUrls, function (e, imgs) {
        if (e.length) errors.concat(e);
        images = imgs;
        imgsComplete = true;
        if (shadersComplete) cb(errors, gl, programs, images);
      });
    }

    shaderUrls.forEach(function (shaderUrl, i) {
      if (i % 2 === 1) return;
      var loader = new WebGLShaderLoader(gl);
      loader.loadFromXHR(shaderUrls[i], shaderUrls[i + 1], function (e, program, _) {
        if (e.length) errors.concat(e);
        programs[i / 2] = {
          attributes: getAttributes(gl, program),
          program: program,
          uniforms: getUniforms(gl, program),
        };
        if (++programsDone === totalShaders / 2) {
          shadersComplete = true;
          if (imgsComplete) cb(errors, gl, programs, images);
        }
      });
    });
  };

  return WebGLShaderLoader;
})();

