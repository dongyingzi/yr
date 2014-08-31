module.exports = function(grunt) {
  // 配置Grunt各种模块的参数
  //时间格式化 定义时间戳
  Date.prototype.Format = function(fmt) {
    var o = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  };
  grunt.initConfig({ //定义pkg
    pkg: grunt.file.readJSON('package.json'),
    //md 转换成html过程中添加到html中 用于代码高亮。
    mdtop: '<link rel="stylesheet" href="http://x.jd.com/file/test/prettify.css">' +
      '<script type="text/javascript" src="http://x.jd.com/file/test/jquery-1.8.3.js"></script>' +
      '<script>' +
      '$("pre").addClass("prettyprint linenums");' +
      '$.getScript("http://x.jd.com/file/test/prettify.js",function(){' +
      'prettyPrint();' +
      '});' +
      '</script>',
    //清除文件
    clean: {
      dist: ['dist']
    },
    usebanner: {
      options: {
        position: 'bottom',
        banner: '<%= mdtop %>'
      },
      files: {
        src: 'dist/doc/*.html'
      }
    },
    //js 检查
    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      src: {
        src: 'js/*.js'
      },
      test: {
        options: {
          jshintrc: 'js/tests/unit/.jshintrc'
        },
        src: 'js/tests/unit/*.js'
      }
    },
    //js 拼装
    concat: {
      options: {
        stripBanners: false
      },
      jdjs: {
        src: [
          'js/*.js'
        ],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    //image 压缩
    imagemin: {
      jd: {
        files: [{
          expand: true,
          cwd: 'images',
          src: ['*.{png,jpg,gif}'],
          dest: 'dist/images/'
        }]
      }
    },
    //use includes:
    includes: {
      files: {
        cwd: 'html',
        src: ['*.html'],
        dest: 'dist/html/',
        options: {
          flatten: true
        }
      }
    },
    //js 压缩
    uglify: {
      options: {
        preserveComments: 'some'
      },
      jdjs: {
        src: '<%= concat.jdjs.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      },
      jstime: {
        src: '<%= concat.jdjs.dest %>',
        dest: 'dist/js/<%= pkg.name %>' + new Date().Format("yyyyMMddhhmmss") + '.min.js'
      },
    },
    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
        },
        files: {
          'dist/css/<%= pkg.name2 %>.css': 'less/main.less',
          'dist/css/index.css': 'less/index.less',
          'dist/css/person.css': 'less/person.less'
        }
      }
    },
    //css 压缩
    cssmin: {
      options: {
            compatibility: 'ie7'//输出时候不会过滤* 或者_
        },
      task: {
        files: {
          'dist/css/<%= pkg.name2 %>.min.css': 'dist/css/<%= pkg.name2 %>.css',
          'dist/css/index.min.css': 'dist/css/index.css',
          'dist/css/person.min.css': 'dist/css/person.css'
        }
      }
    },
    //markdown to html
    markdown: {
      all: {
        files: [{
          expand: true,
          src: 'doc/*.md',
          dest: 'dist/',
          ext: '.html'
        }]
      }
    },
    //实时监听
    connect: {
      options: {
        useAvailablePort: true,
        port: 8000,
        hostname: 't.jd.com', //可配置为本机某个 需要配置host：127.0.0.1 t.jd.com
        livereload: 35727 //声明给 watch 监听的端口
      },
      livereload: {
        options: {
          open: true, //自动打开网页 http://
          base: [
            ''
            //'pages' //要打开的文件目录
          ]
        }
      }
    },
    //文件中替换字符串
    replace: {
      html: {
        src: ['dist/*.html'],
        overwrite: true, // overwrite matched source files
        replacements: [{
          from: /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}/g,
          to: ""
        }]
      }
    },
    //实施监听
    watch: {
      options: {
        livereload: '<%=connect.options.livereload%>' //监听前面声明的端口 35729
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
      grunt: {
        files: 'GruntFile.js',
        task: ['grunt w --force']
      },
      image: {
        files: 'images/*.*',
        task: ['imagemin']
      },
      inc: {
        files: 'inc/*.html',
        tasks: ['includes']
      },
      concat: {
        files: 'js/*.js',
        tasks: ['concat']
      },
      includes: {
        files: 'html/*.html',
        tasks: ['includes']
      },
      md: {
        files: 'doc/*.md',
        tasks: ['markdown', 'usebanner']
      },
      less: {
        files: 'less/*.less',
        tasks: ['less']
      }
    }
  });
  //引入grunt所需要的插件包
  require('load-grunt-tasks')(grunt);
  // 每行registerTask定义一个任务
  grunt.registerTask('rw', [  'less', 'includes', 'imagemin','connect', 'markdown', 'usebanner', 'watch']); //更新文件并实时监听
  grunt.registerTask('default', [ 'less', 'includes', 'connect', 'markdown', 'usebanner', 'imagemin', 'watch']); //默认
  grunt.registerTask('w', ['connect', 'watch']); //监听
  grunt.registerTask('dist', [  'uglify', 'less', 'cssmin', 'includes']); //打包
  grunt.registerTask('dist-js', [ 'uglify']); //打包js
  grunt.registerTask('dist-css', ['less', 'cssmin']); //打包css
  grunt.registerTask('md', ['markdown', 'usebanner', 'connect', 'watch:md']); //markdown 实施监听
};
//--force, --verbose