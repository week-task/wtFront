<template>
    <div class="login">
        WEEKLY REPORT
        <q-input v-model="loginParams.username" float-label="username" />
        <q-input v-model="loginParams.password" type="password" float-label="password" />

        <q-btn
                :loading="loading"
                color="primary"
                class="btn-login"
                @click="login">
            Login
            <q-spinner-hourglass slot="loading" size="20px" />
            <span slot="loading">Loading...</span>
        </q-btn>
    </div>
</template>

<script>

    export default {
        name: 'Login',
        data () {
            return {
                loginParams: {
                    username: '',
                    password: ''
                },
                loading: false
            }
        },
        created () {
//            this.getInitData();
            const _this = this;
            document.onkeyup = (e) => {
                if (window.event.keyCode === 13) _this.login();
            }
        },
        methods: {
            login () {
                const _this = this;
                _this.loading = true;
                _this.$axios.post('/api/login', _this.loginParams).then((res) => {
                    console.log('post res: => ', res.data);
                    if (res.data.code === 0) {
                        setTimeout(()=>{
                            _this.loading = false;
                            window.location.href = '/dashboard';
                        }, 1000);
                    } else {
                        _this.loading = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                });

            }
        }
    }
</script>

<style lang="less">
    .login {
        position:absolute;
        width:200px;
        height:300px;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .btn-login {
        margin-top: 10px;
    }

</style>
