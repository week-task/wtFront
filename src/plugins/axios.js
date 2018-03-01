import axios from 'axios';
import qs from 'qs';

export default ({ Vue }) => {

  axios.interceptors.request.use(function (config) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if(config.method === 'post') {
      config.data = qs.stringify( {
        ...config.data
      })
    }
    return config;
  }, function (error) {
    // loadinginstace.close()
    return Promise.reject(error);
  });

  Vue.prototype.$axios = axios;
}
