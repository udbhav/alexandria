module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower_concat: {
      all: {
        dest: "static_test/static/js/lib.js"
      }
    },

    sass: {
      dist: {
        files: {
          "static_test/static/css/styles.css": "static_test/static/css/styles.scss"
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', [
    'bower_concat',
    'sass'
  ]);
};
