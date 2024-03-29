/*
 * webpack config inject
 * @Author: JohnTrump
 * @Date: 2020-01-19 10:14:37
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2020-01-19 10:43:55
 */
const ENV = process.env.NODE_ENV || "development";

module.exports = {
  publicPath: ENV === "production" ? "//static.ethte.com/meet" : "/",

  lintOnSave: true,
  // devServer
  devServer: {
    disableHostCheck: true,
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
  chainWebpack: config => {
    config.module
      .rule("yml")
      .test(/\.(yaml|yml)$/)
      .use("js-yaml-loader")
      .loader("js-yaml-loader")
      .end();
  },
  // webpack config
  configureWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = [
        "console.log"
      ];
    }

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
      },
      {
        name: "i18n",
        vuxStaticReplace: false,
        staticReplace: false,
        extractToFiles: "src/locales/components.yml",
        localeList: ["en", "zh-CN"]
      }
    ];
    require("vux-loader").merge(config, {
      options: {},
      plugins: pluginList
    });
  },
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: false, // 生产环境打包时候,关闭输出map,以提高打包速度
  parallel: undefined,

  css: {
    sourceMap: true
  }
};
