module.exports = {
  lintOnSave: true,

  // devServer
  devServer: {
    // 代理这个地址[CORS]
    proxy: {
      "/eos_api": {
        target:
          process.env.NODE_ENV === "production"
            ? "https://www.ethte.com/"
            : "https://www.ethte.com/",
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/eos_api": ""
        }
      }
    }
  },
  // webpack config
  configureWebpack: config => {
    const pluginList = [
      "vux-ui",
      "progress-bar",
      // duplicate-style => 在构建后去除重复的CSS代码
      process.env.NODE_ENV === "production" ? "duplicate-style" : "",
      {
        name: "after-less-parser",
        fn: function(source) {
          if (
            this.resourcePath
              .replace(/\\/g, "/")
              .indexOf("/vux/src/components") > -1
          ) {
            source = source.replace(/px/g, "PX");
          }
          // 自定义的全局样式大部分不需要转换
          if (this.resourcePath.replace(/\\/g, "/").indexOf("App.vue") > -1) {
            source = source.replace(/px/g, "PX").replace(/-1PX/g, "-1px");
          }
          return source;
        }
      },

      {
        name: "style-parser",
        fn: function(source) {
          if (
            this.resourcePath
              .replace(/\\/g, "/")
              .indexOf("/vux/src/components") > -1
          ) {
            source = source.replace(/px/g, "PX");
          }
          // 避免转换1PX.less文件路径
          if (source.indexOf("1PX.less") > -1) {
            source = source.replace(/1PX.less/g, "1px.less");
          }
          return source;
        }
      }
    ];
    require("vux-loader").merge(config, {
      options: {},
      // plugins: ['vux-ui']
      plugins: pluginList
    });
  },

  publicPath: "/",
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: process.env.NODE_ENV !== "production",
  parallel: undefined,

  css: {
    sourceMap: true
  }
};
