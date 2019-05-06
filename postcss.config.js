module.exports = {
  plugins: {
    autoprefixer: {
      browsers: ["iOS >= 7", "Android >= 4.1"]
    },
    "postcss-px2rem": {
      remUnit: 37.5,
      selectorBlackList: ["html"],
      mediaQuery: true,
      propBlackList: ["border-radius", "border"] // 如果要保持font-size不转换，替换为 ['font-size']
    }
  }
};
