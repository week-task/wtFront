<template>
  <div>
    this is test page! the relevant data: {{showData}}
  </div>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.desktop,
      showData: ''
    }
  },
  created () {
    this.getInitData();
  },
  methods: {
    openURL,
    getInitData () {
      const _this = this;
      var loginInfo = {
        username: 'luolinjia',
        password: '111'
      };

      this.$axios.get('/api/user/getUserList').then((response) => {
        console.log('res:=> ', response.data);
      });

      this.$axios.post('/api/login', loginInfo).then((response) => {
        console.log('post res: => ', response.data);
        _this.showData = response.data.message;
      });
      this.$axios({
        method: 'POST',
        url: '/api/login',
        data: loginInfo
      }).then((response) => {
        console.log('post res: => ', response.data);
      });


//      this.$req.get('http://127.0.0.1:1234/api/user/getUserList', null, function (res) {
//        console.log('res: => ', res);
//      }, function (error) {
//        console.log('err: => ', error); //失败返回
//      }, '获取中...');
//
//
//      this.$req.post('http://127.0.0.1:1234/api/login', loginInfo, function (res) {
//        console.log('res: => ', res);
//      }, function (error) {
//        console.log('err: => ', error); //失败返回
//      }, '获取中...');
    }
  }
}
</script>

<style>
</style>
