

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {

	const handleError = (error) => {
		let isExpired = error.response.data.error === 'jwt expired';
		if (error.response.status !== 500) {
			this.$q.notify({
				message: isExpired ? 'token已过期,重新登录' : error.response.data.error,
				timeout: 3000,
				type: 'negative',
				position: 'top',
				actions: isExpired ? [{
					label: '登录',
					handler: () => {
						this.$router.push('/login');
					}
				}] : null
			});

			if (isExpired) {
				setTimeout(()=> {
					this.$router.push('/login');
				}, 1000);
			}
		} else {
			this.loading = false;
			this.loadingProject = false;
			this.loadingPassword = false;
			this.$q.dialog({
				title: error.response.status + '',
				message: error.response.data.message
			});
		}
	}

	Vue.prototype.$handleError = handleError;
}
