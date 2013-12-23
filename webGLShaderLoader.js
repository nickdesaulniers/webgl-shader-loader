var WebGLShaderLoader = (function () {
  var vertexShaderType = WebGLRenderingContext.prototype.VERTEX_SHADER;
  var fragmentShaderType = WebGLRenderingContext.prototype.FRAGMENT_SHADER;

  function WebGLShaderLoader (gl) {
    this.gl = gl;
    this.vertexShader = this.fragmentShader = null;
    this.errors = [];
  };

  // todo: console.error -> this.errors.push(""); cb(errors, null);
  WebGLShaderLoader.prototype = {
    loadFromStr: function (vertexShaderStr, fragmentShaderStr, cb) {
      if (typeof vertexShaderStr !== "string" ||
          typeof fragmentShaderStr !== "string" ||
          typeof cb !== "function") {
        console.error("Usage: loaderInstance.loadFromStr('', '', function (errors, program));");
      } else if (vertexShaderStr.length === 0 ||
                 fragmentShaderStr.length === 0) {
        console.error("empty shader string");
      } else {
        this.vertexShader = this.compile(vertexShaderType, vertexShaderStr);
        this.fragmentShader = this.compile(fragmentShaderType, fragmentShaderStr);

        cb(this.errors, this.link());
      }
    },
    loadFromXHR: function (vertexShaderPath, fragmentShaderPath, cb) {
      if (typeof vertexShaderPath !== "string" ||
          typeof fragmentShaderPath !== "string" ||
          typeof cb !== "function") {
        console.error("Usage: loaderInstance.loadFromXHR('', '', function (errors, program));");
        return;
      }

      if (vertexShaderPath.length === 0 || fragmentShaderPath.length === 0) {
        console.error("empty shader path");
      }

      var numShadersLoaded = 0;
      var self = this;
      var onload = function (shader, shaderType) {
        return function (shaderStr) {
          self[shader] = self.compile(shaderType, shaderStr);

          if (++numShadersLoaded > 1) {
            cb(self.errors, self.link());
          }
        };
      };
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
        // todo:
        // check for non 200
        cb(xhr.response);
      };
      xhr.send();
    },
  };

  return WebGLShaderLoader;
})();

