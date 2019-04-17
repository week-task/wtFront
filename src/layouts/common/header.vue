<template>
    <div>
        <em class="team-title">
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
            <span class="team-name">{{teamName}} {{funName}}</span>
        </em>

        <div class="user-info">
            <div class="avatar" @click="toggleUserInfo">
                <img :src="userInfoAvatar" alt="">
            </div>
            <ul v-ripple v-if="showUserInfo">
                <li class="" @click="setAvatar">头像</li>
                <li @click="setPassword">密码</li>
                <li @click="logout">退出</li>
            </ul>
        </div>

        <q-breadcrumbs v-if="navList.length > 0" separator="●" color="light" active-color="dark" class="navigator">
            <q-breadcrumbs-el v-for="(item, index) in navList" :label="item.label" :to="item.toLink" :key="index" />
        </q-breadcrumbs>

        <q-modal no-esc-dismiss v-model="avatarUpload" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <q-uploader 
                float-label="更新头像，建议尺寸400*400或者宽高比为1"
                ref="uploader"
                extensions=".jpg" 
                :headers="{'Authorization': 'Bearer ' + token}"
                :url="uploadUrl" 
                @finish="setAvatarInfo()"
                auto-expand 
                :additional-fields="additionalFields" />
        </q-modal>

        <q-modal no-esc-dismiss v-model="passwordModal" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">修改密码</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.passwordForm.oldPassword.$error"
                        :error-label="errMessage.requireInfo">
                    <q-input float-label="旧密码"
                            type="password"
                             @input="$v.passwordForm.oldPassword.$touch"
                             v-model="passwordForm.oldPassword" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.passwordForm.password.$error"
                        :error-label="$v.passwordForm.password.minLength ? errMessage.requireInfo : errMessage.minInfo">
                    <q-input float-label="新密码"
                            type="password"
                             @input="$v.passwordForm.password.$touch"
                             v-model="passwordForm.password" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.passwordForm.confirmPassword.$error"
                        :error-label="$v.passwordForm.confirmPassword.sameAsPassword ? errMessage.requireInfo : errMessage.sameAsInfo">
                    <q-input float-label="确认密码"
                            type="password"
                             @input="$v.passwordForm.confirmPassword.$touch"
                             v-model="passwordForm.confirmPassword" />
                </q-field>
                <q-btn
                        :loading="loadingPassword"
                        color="primary"
                        class="btn-save"
                        @click="changePassword">
                    保存
                    <q-spinner-hourglass slot="loading" size="20px" />
                    <span slot="loading">Loading...</span>
                </q-btn>
            </div>
        </q-modal>
    </div>
    
</template>

<script>
    import {required, minLength, maxLength, sameAs} from 'vuelidate/lib/validators';
    export default {
        name: 'Header',
        props: {
            navList: {
                type: Array,
                default() {
                    return [];
                }
            },
            funName: {
                type: String,
                default() {
                    return '';
                }
            },
            teamName: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        data () {
            return {
                showUserInfo: false,
                user: {},
                token: window.localStorage.getItem('token'),
                avatarUpload: false,
                uploadUrl: '/weeklyreportapi/upload',
                additionalFields:[{token: window.localStorage.getItem('token')}],
                userInfoAvatar: '',
                passwordModal: false,
                loadingPassword: false,
                passwordForm: {
                    userId: '',
                    password: ''
                },
                errMessage: {
                    requireInfo: '必填',
                    maxInfo: '任务名称不宜超过30个字符',
                    minInfo: '密码最少6位',
                    sameAsInfo: '输入的两次密码不一致'
                },
            }
        },
        validations: {
            passwordForm: {
                userId: {required},
                oldPassword: {required},
                password: {required, minLength: minLength(6)},
                confirmPassword: {required, sameAsPassword: sameAs('password')}
            }
        },
        created () {
            // this.additionalFields
        },
        mounted () {
            this.init();
        },
        methods: {
            init() {
                const _this = this;
                _this.bindLogoEvent();
                _this.user = JSON.parse(localStorage.getItem('user'));
                // _this.userInfoAvatar = !_this.user.avatar ? 'statics/types/boy-avatar.jpg' : 'http://www.getfile.com' + _this.user.avatar; // 开发环境
                _this.userInfoAvatar = !_this.user.avatar ? 'statics/types/boy-avatar.jpg' : '//upfiles.heclouds.com' + _this.user.avatar; //线上环境
            },
            bindLogoEvent () {
                document.getElementById('ttlogo').pauseAnimations();
                document.getElementById('ttlogo').addEventListener('mouseover', function(){
                    document.getElementById('ttlogo').unpauseAnimations();
                });
                document.getElementById('ttlogo').addEventListener('mouseleave', function(){
                    document.getElementById('ttlogo').pauseAnimations();
                });
            },
            setPassword () {
                this.passwordModal = true;
            },
            changePassword () {
                const _this = this;
                _this.passwordForm.userId = _this.user._id;
                _this.$v.passwordForm.$touch();
                if (_this.$v.passwordForm.$error) {
                    return;
                }
                _this.loadingPassword = true;
                _this.$axios.post('/weeklyreportapi/user/editpassword', _this.passwordForm).then((res) => {
                    // console.log('res    ', res);
                    if (res.data.code === 0) {
                        // _this.getProjectsList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        _this.showUserInfo = false;
                        setTimeout(()=>{
                            _this.loadingPassword = false;
                            _this.passwordModal = false;
                            _this.passwordForm.password = '';
                        }, 1000);
                    } else {
                        _this.loadingPassword = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            resetForm () {
                // this.userShowForm.energyDesc = ''
            },
            setAvatar() {
                // console.log('avatar settings');
                const _this = this;
                _this.avatarUpload = true;
                _this.showUserInfo = false;
            },
            setAvatarInfo () {
                const _this = this;
                _this.$axios.post('/weeklyreportapi/user/getUserInfo', {
                    id: _this.user._id
                }).then((res) => {
                    if (res.data.code === 0) {
                        // console.log(res.data);
                        let userDetail = res.data.data;
                        localStorage.setItem('user', JSON.stringify({
                            _id: userDetail._id,
                            parent_id: userDetail.parent,
                            name: userDetail.name,
                            role: userDetail.role,
                            team: userDetail.team,
                            teamName: _this.user.teamName,
                            pRole: userDetail.p_role,
                            avatar:userDetail.avatar
                        }));
                        // _this.userInfoAvatar = 'http://www.getfile.com' + userDetail.avatar;   // 开发环境
                        _this.userInfoAvatar = '//upfiles.heclouds.com' + userDetail.avatar;   // 线上环境
                        
                        _this.avatarUpload = false;
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            toggleUserInfo () {
                const _this = this;
                if (_this.showUserInfo) {
                    _this.showUserInfo = false;
                } else {
                    _this.showUserInfo = true;
                }
            },
            logout () {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                this.$router.push('/login');
            },
            handleError (error) {
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
                    this.loadingUser = false;
                    this.loadingPassword = false;
                    this.$q.dialog({
                        title: error.response.status + '',
                        message: error.response.data.message
                    });
                }
            }
        }
    }
</script>

<style lang="less">
    .team-title {
        position: absolute;
        top: -100px;
        font-style: normal;
        font-size: 20px;
        font-weight: bold;
    }
    .navigator {
        position: absolute;
        left: 38px;
        top: -65px;
        margin: 0;
    }
    .team-name {
        position: relative;
        top: -10px;
        margin-left: 10px;
        border-bottom: 3px solid #999;
    }
    .user-info{
        .avatar {
            position: absolute;
            top: -62px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            overflow: hidden;
            cursor: pointer;
            img {
                width: 40px;
            }
        }
        ul {
            background-color: white;
            list-style: none;
            padding: 0;
            width: 100px;
            position: absolute;
            z-index: 6;
            margin: 0;
            margin-top: -10px;
            margin-left: -30px;
            line-height: 30px;
            text-align: center;
            border: 0px solid #333;
            box-shadow: 0px 0 40px rgba(0,0,0,.3);
            transition: all ease-in-out .2s;
            &:hover {
                // box-shadow: 0px 0 40px rgba(0,0,0,.6);
            }
            li {
                cursor: pointer;
                padding: 8px 16px;
                min-height: 40px;
                transition: all ease-in-out .2s;
                background-color: rgba(255,255,255,1);
                color: #333;
                &:hover {
                    background-color: rgba(0,0,0,.2);
                    // color: #fff;
                }
            }
        }
    } 
    .btn-save {
        margin-top: 10px;
    }

</style>
