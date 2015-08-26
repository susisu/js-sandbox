var gulp        = require("gulp"),
    runSequence = require("run-sequence"),
    browserSync = require("browser-sync");

gulp.task("browser-sync-up", function () {
    browserSync.init({
        "server": {
            "baseDir": "src",
            "routes": {
                "/bower_components": "bower_components",
            }
        }
    });
});

gulp.task("browser-sync-reload", function () {
    browserSync.reload();
});

gulp.task("watch", function () {
    gulp.watch("./src/**/*", ["browser-sync-reload"]);
});

gulp.task("default", function () { runSequence("browser-sync-up", "watch"); });
