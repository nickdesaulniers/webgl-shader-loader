function loadImages (imgSrcs, cb) {
  var len = imgSrcs.length;
  var images = [];
  var errors = [];
  var loaded = 0;
  function amDone () { if (++loaded === len) cb(errors, images); };
  function onError (e) {
    errors.push('Failed to load ' + e.target.src);
    amDone();
  };
  for (var i = 0; i < len; ++i) {
    images[i] = new Image;
    images[i].onload = amDone;
    images[i].onerror = onError;
    images[i].src = imgSrcs[i];
  }
};

// call with:
// load(gl, ['a.vert', 'b.frag', 'c.vert', 'd.frag'], ['a.jpg', 'b.jpg'],
//      function (errors, gl, programs, imgs) { ... });
function l (gl, shaders, images, cb) {
  var programsDone = 0;
  var shadersDone = false;
  var imgsDone = false;
  var totalShaders = shaders.length;
  var errors = [];
  var programs = [];
  var _i = [];
  shaders.forEach(function (shader, i) {
    if (i % 2 === 1) return;
    var loader = new WebGLShaderLoader(gl);
    loader.loadFromXHR(shaders[i], shaders[i + 1], function (e, program, _) {
      //console.log(e, program);
      if (e.length) errors.concat(e);
      programs[i / 2] = program;
      if (++programsDone === totalShaders / 2) {
        shadersDone = true;
        console.log('shadersDone');
        //console.log(programs);
        if (imgsDone) {
          console.log('shaders last');
          cb(errors, gl, programs, _i);
        } else {
          console.log('waiting for images');
        }
      }
    });
  });
  if (!images || !images.length) imgsDone = true;;
  loadImages(images, function (e, imgs) {
    if (e.length) errors.concat(e);
    _i = imgs;
    console.log('images done');
    imgsDone = true;
    if (shadersDone) {
      console.log('images last');
      cb(errors, gl, programs, _i);
    }
  });
};

