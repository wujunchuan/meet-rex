<template>
  <div class="cancel touchable" @click="handleClick">
    {{ $t("cancel") }}
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      /* 返回上级 */
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="less" scoped>
.cancel {
  margin-top: -15px;
  text-align: center;
  font-size: 18px;
  width: 100%;
  height: 44px;
  line-height: 44px;
  font-size: 17px;
  color: #4a4a4a;
}
</style>
