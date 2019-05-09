<template>
  <div class="weui-progress">
    <div class="weui-progress__bar">
      <div ref="bar" class="weui-progress__inner-bar"></div>
    </div>
  </div>
</template>

<script>
import Base from "../../node_modules/vux/src/libs/base";
export default {
  mixins: [Base],
  name: "profit-progress",
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent(val) {
      let bar = this.$refs["bar"];
      bar.style.width = val + "%";
    }
  }
};
</script>

<style lang="less">
@import "../../node_modules/vux/src/styles/weui/widget/weui_progress/weui_progress.less";

.weui-progress__bar {
  background: #6c94bb;
  border-radius: 6px;
  height: 12px;
}

.weui-progress__inner-bar {
  transition: width 0.5s linear;
  width: 0;
  background: #ffffff;
  border-radius: 6px;
}
</style>
