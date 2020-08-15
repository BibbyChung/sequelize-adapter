const gulp = require('gulp');
const spawn = require('child_process').spawn;

//= ================================== Global Variable ===================================


//= ================================== Method ===================================


const cmd = (str) => async (cb) => {
  const arr = str.split(' ');
  const c0 = arr.shift();

  console.log('exec => ', str);
  await new Promise((resolve, reject) => {
    const ssp = spawn(c0, arr, { stdio: 'inherit' });
    ssp.on('close', (code) => {
      resolve(code);
    });

    ssp.on('error', function (err) {
      reject(err);
    });
  });

  cb();
};


//= ================================== Tasks ===================================

exports.build = gulp.parallel(
  cmd('mocha'),
  cmd('tsc -p ./tsconfig.json'),
  cmd('tsc -p ./tsconfig.esm5.json'),
);
