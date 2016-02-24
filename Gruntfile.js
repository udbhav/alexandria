module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: {
          "src/static/css/styles.css": "src/static/css/styles.scss"
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', [
    'sass'
  ]);
};
