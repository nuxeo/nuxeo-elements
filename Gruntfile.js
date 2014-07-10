module.exports = function (grunt) {

    grunt.initConfig({

        jshint: {
            options: {
                jshintrc: true,
                extract: 'auto',
                reporter: require('jshint-stylish') // 'checkstyle'
            },
            all: [
              'Gruntfile.js',
              '*.html'
            ]
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint']);
};
