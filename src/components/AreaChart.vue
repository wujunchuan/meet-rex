/* * @Description: AreaChart, 面积图 * @Author: John Trump * @Created:
2018-04-11 11:13 */
<template>
  <chart :options="chartOptions" ref="chart" auto-resize></chart>
</template>

<script>
import echarts from "echarts/lib/echarts";
var base = +new Date(2008, 8, 8);
var oneDay = 24 * 3600 * 1000;
var date = [];

var data = [Math.random() * 300];

for (var i = 1; i < 2000; i++) {
  var now = new Date((base += oneDay));
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"));
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}

/** 亮色主题 */
const lightThemeOptions = {};

const commonOptions = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      animation: false
    }
  },
  grid: {
    x: 50,
    y: 30,
    x2: 15,
    y2: 50
  },
  xAxis: {
    type: "time",
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: "value",
    name: "EOS/REX",
    scale: true,
    splitLine: {
      show: true,
      lineStyle: {
        type: "dotted"
      }
    },
    axisLabel: {
      formatter: function(value, index) {
        return ".." + value.toFixed(10).slice(5);
      },
      margin: 2
    }
  },
  series: [
    {
      type: "line",
      showSymbol: false,
      hoverAnimation: false,
      data: data
    }
  ]
};

export default {
  name: "AreaChart",
  created() {
    // 监听窗口大小变化
    this.chartOptions = this.$_.merge(commonOptions, lightThemeOptions);
  },
  methods: {},
  data: function() {
    return {
      // 图表配置
      chartOptions: null
    };
  },
  watch: {}
};
</script>

<style lang="less" scoped></style>
