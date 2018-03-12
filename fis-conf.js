// 加 md5
fis.match('*.{js,css,jpg,gif,png}', {
    useHash: true
});

// 加 md5
fis.match('red_packet/js/layer/**', {
    useHash: false
});

// 启用 fis-spriter-csssprites 插件
fis.match('::package', {
    spriter: fis.plugin('csssprites')
}); 

// 对 CSS 进行图片合并
fis.match('*.css', {
    // 给匹配到的文件分配属性 `useSprite`
    useSprite: true
});

fis.match('*.js', {
    // fis-optimizer-uglify-js 插件进行压缩，已内置
    optimizer: fis.plugin('uglify-js')
});

fis.match('*.min.js', {
    //已经压缩过的js不进行压缩
    optimizer: null
})

fis.match('*.css', {
    // fis-optimizer-clean-css 插件进行压缩，已内置
    optimizer: fis.plugin('clean-css')
});

fis.match('*.png', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    optimizer: fis.plugin('png-compressor')
}); 

fis.set('project.ignore', [
    'output/**',
    'app/**',
    'global/**',
    'handler/**',
    'router/**',
    'config.json',
    'debug',
    'debug.test',
    'fileauth.txt',
    'mobile',
    'mobile_test.go',
    'mobile.go',
    'README.md',
    'fis-conf.js'
  ]);