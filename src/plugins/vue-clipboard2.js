// import something here
import VueClipboard from 'vue-clipboard2';

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
	Vue.use(VueClipboard);
}
