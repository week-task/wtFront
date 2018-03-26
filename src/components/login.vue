<template>
    <div class="login">
        <em>周报系统</em>
        <q-field
                :error="$v.loginParams.username.$error"
                error-label="必填">
            <q-input float-label="大名"
                     @input="$v.loginParams.username.$touch"
                     v-model="loginParams.username" />
        </q-field>

        <q-field
                :error="$v.loginParams.password.$error"
                error-label="必填">
            <q-input float-label="密码"
                     type="password"
                     @input="$v.loginParams.password.$touch"
                     v-model="loginParams.password" />
        </q-field>

        <!--<q-input v-model="loginParams.password"-->
                 <!--@input="$v.loginParams.password.$touch"-->
                 <!--:error="$v.loginParams.password.$error"-->
                 <!--type="password" float-label="password"/>-->
        <!--<span class="form-group__message" v-if="!$v.loginParams.username.required">Field is required</span>-->

        <q-btn
                :loading="loading"
                color="primary"
                class="btn-login"
                @click="login">
            进入
            <q-spinner-hourglass slot="loading" size="20px" />
            <span slot="loading">进入中...</span>
        </q-btn>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
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
        validations: {
            loginParams: {
                username: {required},
                password: {required}
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
                _this.$v.loginParams.$touch();

                if (_this.$v.loginParams.$error) {
//                    _this.$q.dialog({
//                        title: 'Error',
//                        message: 'Please review fields again.'
//                    });
                    return;
                }

                _this.loading = true;

                _this.$axios.post('/weeklyreportapi/login', _this.loginParams).then((res) => {
                    if (res.data.code === 0) {
                        const authInfo = res.data.data;
                        setTimeout(()=>{
                            _this.loading = false;
                            localStorage.setItem('user', JSON.stringify(authInfo.user));
                            localStorage.setItem('token', authInfo.token);
                            // Bearer是JWT的头部认证
                            _this.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + authInfo.token;
                            if (authInfo.user.role === -1) {
                                _this.$router.push('/admin');
                            } else {
                                _this.$router.push('/');
                            }
                        }, 1000);
                    } else {
                        console.log(res);
                        _this.loading = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                }).catch((error)=>{
                    _this.loading = false;
                    _this.$q.dialog({
                        title: error.response.status + '',
                        message: error.response.data.message
                    });
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
        em {
            font-size: 20px;
            font-style: normal;
            font-weight: bold;
        }
    }
    .btn-login {
        margin-top: 10px;
    }

</style>
