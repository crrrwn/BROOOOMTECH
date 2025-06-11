<template>
  <div id="app">
    <router-view />
    <NotificationContainer />
  </div>
</template>

<script>
import NotificationContainer from '@/components/common/NotificationContainer.vue'

export default {
  name: 'App',
  components: {
    NotificationContainer
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
