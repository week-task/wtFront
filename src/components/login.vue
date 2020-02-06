<template>
    <div class="login">
        <em>
            <!-- <img
                src="~assets/logo.svg"
                style="width:30px;max-width:150px;"
            > -->
            <svg id="ttlogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50" isolation="isolate" style="width:30px;height:30px;">
                <g id="xlogo">
                    <rect x="0" y="0" fill="white" width="23" height="23">
                        <animate attributeName="fill" calcMode="discrete" values="white;#027be3;#127F78;#db2828" dur=".8s" repeatCount="indefinite" />
                    </rect>
                    <rect x="27" y="0" fill="#db2828" width="23" height="23">
                        <animate attributeName="fill" calcMode="discrete" values="#db2828;white;#027be3;#127F78" dur=".8s" repeatCount="indefinite" />
                    </rect>
                    <rect x="27" y="27" fill="#127F78" width="23" height="23">
                        <animate attributeName="fill" calcMode="discrete" values="#127F78;#db2828;white;#027be3" dur=".8s" repeatCount="indefinite" />
                    </rect>
                    <rect x="0" y="27" fill="#027be3" width="23" height="23">
                        <animate attributeName="fill" calcMode="discrete" values="#027be3;#127F78;#db2828;white" dur=".8s" repeatCount="indefinite" />
                    </rect>
                </g>
            </svg>
            TT</em>
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
        <slot name="footerTop">
            <FooterTop></FooterTop>
        </slot>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    import FooterTop from '../layouts/common/footer';
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
        components: {FooterTop},
        created () {
//            this.getInitData();
        },
        mounted () {
            const _this = this;
            _this.init();
            document.onkeyup = (e) => {
                if (location.href.indexOf('login') > 0 && window.event.keyCode === 13) _this.login();
            }
        },
        methods: {
            init () {
                document.getElementById('ttlogo').pauseAnimations();
                document.getElementById('ttlogo').addEventListener('mouseover', function(){
                    document.getElementById('ttlogo').unpauseAnimations();
                });
                document.getElementById('ttlogo').addEventListener('mouseleave', function(){
                    document.getElementById('ttlogo').pauseAnimations();
                });
            },
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
                        // console.log('authinfo => ', authInfo)
                        setTimeout(()=>{
                            _this.loading = false;
                            localStorage.setItem('user', JSON.stringify(authInfo.user));
                            localStorage.setItem('token', authInfo.token);
                            // Bearer是JWT的头部认证
                            _this.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + authInfo.token.split('z|')[0];
                            if (authInfo.user.role === -1) {
                                _this.$router.push('/admin');
                            } else {
                                _this.$router.push('/console');
                                // if (authInfo.user.pRole === 1) {
                                //     _this.$router.push('/chooseType');
                                // } else {
                                //     _this.$router.push('/');
                                // }
                            }
                        }, 1000);
                    } else {
                        // console.log(res);
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
        // position:absolute;
        // width:60%;
        // height:50%;
        // top:50%;
        // left:50%;
        // transform:translate(-50%,-50%);
        margin: 0 auto;
        width: 30%;
        position: relative;
        margin-top: 300px;
        em {
            font-size: 30px;
            font-style: normal;
            font-weight: bold;
            vertical-align: bottom;
        }
    }
    .btn-login {
        margin-top: 10px;
        width: 120px;
    }

</style>
