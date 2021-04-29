<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { getToken } from '@/libs/util'
import { getUserInfo } from '@/api/user'
export default {
  name: 'App',

  mounted () {
    const token = getToken()
    if (token) {
      // 用户已登录，加载 userprofile
      getUserInfo().then(res => {
        this.$store.commit('setUserProfile', res.data)
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    }
  }
}
</script>

<style lang="less">
.size{
  width: 100%;
  height: 100%;
}
html,body{
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  .size;
}
.ivu-btn-text:focus {
  -webkit-box-shadow: 0 0 0 0px rgba(45, 140, 240, 0.2);
  box-shadow: 0 0 0 0px rgba(45, 140, 240, 0.2)
}
.demo-spin-icon-load{
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from { transform: rotate(0deg);}
  50%  { transform: rotate(180deg);}
  to   { transform: rotate(360deg);}
}
.demo-spin-col1{
  height: 100px;
  position: relative;
  background-color: #b4b3b3;
}
.demo-spin-col{
  height: 100px;
  position: relative;
}
</style>
