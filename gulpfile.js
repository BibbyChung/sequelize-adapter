"use strict";

let gulp = require("gulp");
let shell = require("gulp-shell");
let merge = require("merge-stream");
let rimraf = require("rimraf");
let through = require('through2');

let ts = require("gulp-typescript");
let sourcemaps = require("gulp-sourcemaps");
let path = require('path');

//=================================== Method ===================================

let tsCompiler = function (
  pathArr,
  tsconfigPath,
  sourceRoot,
  targetPath,
  isUglify
) {

  let tscP = ts.createProject(tsconfigPath);

  return gulp.src(pathArr)
    .pipe(sourcemaps.init())
    .pipe(tscP())
    .js
    //.pipe(uglify())
    .pipe(sourcemaps.write("./", {
      includeContent: false,
      sourceRoot: sourceRoot,
    }))
    .pipe(gulp.dest(targetPath));

};

let tsdCompiler = function (
  pathArr,
  tsconfigPath,
  targetPath
) {

  let tscP = ts.createProject(tsconfigPath, {
    "isolatedModules": false,
  });

  return gulp.src(pathArr)
    .pipe(tscP())
    .dts
    .pipe(gulp.dest(targetPath));
};

let getCopyFilesPipe = (sourcePatten, targetPath) => {

  return gulp.src(sourcePatten)
    .pipe(gulp.dest(targetPath));

};

//=================================== Tasks ===================================

gulp.task("clean", (cb) => {

  rimraf("./dist", cb);

});

gulp.task('ts_compile_dist', () => {

  let m = merge();

  let code = tsCompiler(
    [
      "./src/**/*.ts",
    ],
    "tsconfig.json",
    "../src",
    "./dist",
    false
  );
  m.add(code);

  return m;

});

gulp.task('tsd_compile_dist', () => {

  let m = merge();

  let code = tsdCompiler(
    [
      "./src/**/*.ts",
    ],
    "./tsconfig.json",
    "./dist"
  );
  m.add(code);

  return m;

});

gulp.task("create_ts_definitions", shell.task([
  'tsc --declaration ./src/_index.ts'
  //'cucumber.js --format pretty'
]));

//----------------------------------------------------------------------

gulp.task("build",
  gulp.series("clean",
    gulp.parallel(
      "ts_compile_dist",
      "tsd_compile_dist"
    ))
);
