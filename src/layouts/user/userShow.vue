<template>
    <div class="user-show">
        <em class="team-title">{{user.teamName}} 成员秀</em>
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/console" />
            <q-breadcrumbs-el label="USER SHOW" to="/userShow" />
        </q-breadcrumbs>
        <!-- <q-btn icon="group" label="ALL" @click="checkSelfGroup(false)" class="btn-group" title="所有成员" />
        <q-btn icon="person" label="GROUP" @click="checkSelfGroup(true)" class="btn-group" title="只关注本组成员" /> -->
        
        <div v-if="hasFinishedInfo">
            <q-table
                :data="tableData"
                :columns="columns"
                :filter="filter"
                :pagination.sync="paginationControl"
                >
                <template slot="top-left" slot-scope="props">
                    <q-search
                        color="primary"
                        v-model="filter"
                        class="col-6"
                        style="width:500px;"
                        />
                </template>
                <q-tr slot="body" slot-scope="props" :props="props">
                    <q-td key="name" :props="props" width="25%">
                        {{ props.row.name }}
                    </q-td>
                    <q-td key="tel" :props="props" width="25%">
                        {{ props.row.tel }}
                    </q-td>
                    <q-td key="email" :props="props" width="25%">
                        {{ props.row.email }}
                    </q-td>
                    <q-td key="op" :props="props" width="25%">
                        <q-btn flat color="primary" icon="visibility" @click="renderDialog(props.row)">VIEW</q-btn>
                        <q-btn v-if="props.row.id === user._id || user.role === 0" flat color="primary" icon="visibility" @click="openDialog(props.row, false)">EDIT</q-btn>
                    </q-td>
                </q-tr>
            </q-table>
        </div>
        
        <q-modal no-esc-dismiss no-backdrop-dismiss v-model="editUserShowModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">请完善『{{userShowForm.name}}』秀</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.userShowForm.motto.$error"
                        :error-label="$v.userShowForm.motto.maxLength ? errMessage.requireInfo : errMessage.maxInfoMotto">
                    <q-input float-label="座右铭"
                             @input="$v.userShowForm.motto.$touch"
                             v-model="userShowForm.motto" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userShowForm.tel.$error"
                        :error-label="$v.userShowForm.tel.telCheck ? errMessage.requireInfo : errMessage.telCheck">
                    <q-input float-label="手机"
                             @input="$v.userShowForm.tel.$touch"
                             v-model="userShowForm.tel" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userShowForm.email.$error"
                        :error-label="$v.userShowForm.email.emailCheck ? errMessage.requireInfo : errMessage.emailCheck">
                    <q-input float-label="邮箱"
                             @input="$v.userShowForm.email.$touch"
                             v-model="userShowForm.email" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userShowForm.intro.$error"
                        :error-label="$v.userShowForm.intro.maxLength ? errMessage.requireInfo : errMessage.maxInfoIntro">
                    <q-input float-label="自我介绍"
                            type="textarea"
                             @input="$v.userShowForm.intro.$touch"
                             v-model="userShowForm.intro" />
                </q-field>
            </div>
            <q-btn
                    :loading="loadingUserShow"
                    color="primary"
                    class="btn-save"
                    @click="saveUserShow">
                保存
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>

        <q-modal v-model="maximizedModal" maximized>
            <div style="padding: 12%;">
                <div class="q-display-1 q-mb-md">
                    {{userShowDisplay.name}} 
                    <q-btn v-if="userShowDisplay.role != 0" icon="whatshot" flat :color="userShowDisplay.color" disable>
                    {{userShowDisplay.energy}}  {{userShowDisplay.work_status}}
                        <q-tooltip anchor="top left" self="bottom left" :offset="[10, 10]" class="show-energy-desc" style="min-width: 300px;margin-left:20px;">
                            <strong>描述：剩余能量<span style="color:yellow;">{{userShowDisplay.energy}}</span></strong>
                            <p v-if="userShowDisplay.energy_desc !== ''" v-for="(itemP, index) in userShowDisplay.energy_desc.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                {{itemP}}
                            </p>
                            <p v-if="userShowDisplay.energy_desc === ''" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                暂无
                            </p>
                        </q-tooltip>
                    </q-btn>
                </div>
                <p style="color: #999;">{{userShowDisplay.motto}}</p>
                <p><q-btn icon="call" flat class="" size="xl" color="tertiary">手机：{{userShowDisplay.tel}}</q-btn><q-btn icon="email" flat class="" size="xl" color="tertiary">邮箱：{{userShowDisplay.email}}</q-btn></p>
                <!-- <p style="font-size: 20px;">{{userShowDisplay.intro}}</p> -->
                <p v-if="userShowDisplay.intro !== ''" v-for="(itemP2, index) in userShowDisplay.intro.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px; font-size: 20px; line-height: 38px;">
                    {{itemP2}}
                </p>
                <p v-if="userShowDisplay.intro === ''">该用户很懒，还没更新资料！</p>
                <q-icon name="cancel" class="modal-close" @click.native="maximizedModal = false" />
            </div>
        </q-modal>


    </div>
</template>

<script>
    import {required, minLength, maxLength, between} from 'vuelidate/lib/validators';
    import telCheck from '../../plugins/customValidators/telCheck';
    import emailCheck from '../../plugins/customValidators/emailCheck';
    export default {
        name: 'User',
        data () {
            return {
                hasFinishedInfo: false,
                editUserShowModal: false,
                maximizedModal: false,
                loadingUserShow: false,
                showCallbackData: false,
                filter: '',
                user: {},
                visible: false,
                tableData: [],
                paginationControl: {rowsPerPage: 0, page: 1},
                columns: [{
                    name: 'name',
                    label: '大名',
                    align: 'left',
                    sortable: true,
                    field: 'name'
                },{
                    name: 'tel',
                    label: '手机',
                    align: 'left',
                    sortable: true,
                    field: 'tel'
                },{
                    name: 'email',
                    label: '邮箱',
                    align: 'left',
                    sortable: true,
                    field: 'email'
                }, {
                    name: 'op',
                    label: '操作',
                    align: 'left',
                    field: 'op'
                }],
                userShowForm: {
                    id: '',
                    name: '',
                    motto: '',
                    tel: '',
                    email: '',
                    intro: '',
                    // avatar: '' // 用户头像下个版本开发
                },
                userShowDisplay: {
                    name: '',
                    motto: '',
                    tel: '',
                    email: '',
                    intro: '',
                    energy: 100,
                    energy_desc: '',
                    color: '',
                    work_status: '',
                    role: 0
                },
                userList: [],
                errMessage: {
                    requireInfo: '必填',
                    betweenInfo: '数值范围 0~100',
                    maxInfoMotto: '文本长度 < 200',
                    maxInfoEmail: '文本长度 < 50',
                    maxInfoIntro: '文本长度 < 2000',
                    telCheck: '你确定是手机号？',
                    emailCheck: '你确定是邮箱？',
                }
            }
        },
        validations: {
            userShowForm: {
                // motto: {required, between: between(0,100)},
                motto: { maxLength: maxLength(200)},
                tel: {required, telCheck},
                email: {required, emailCheck},
                intro: {required, maxLength: maxLength(2000)}
            }
        },
        created () {
            this.init();
        },
        computed: {
            showEnergy () {
                return true;
            }
        },
        methods: {
            init () {
                const _this = this;
                _this.user = JSON.parse(localStorage.getItem('user'));
                _this.getUserInfoAndSetInfo();
                _this.getUserInfoList();
            },
            getUserInfoAndSetInfo () {
                const _this = this;
                _this.$axios.post('/weeklyreportapi/user/getUserInfo', {
                    id: _this.user._id
                }).then((res) => {
                    if (res.data.code === 0) {
                        // console.log('getUserInfoAndSetInfo => ', res);
                        // 判断用户是否填写motto intro tel email
                        if (res.data.data.intro == '' || res.data.data.tel == '' || res.data.data.email == '') {
                            _this.openDialog(res.data.data, true)
                        } else {
                            _this.hasFinishedInfo = true;
                        }
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            getUserInfoList () {
                const _this = this;
                _this.visible = true;
                _this.showCallbackData = false;
                // 获取所有属于该team下的users
                _this.$axios.post('/weeklyreportapi/getUserList', {
                    type: 'userShow', 
                    team: _this.user.team
                }).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            // _this.tableData = _this.rendertableData(res.data.data);
                            _this.tableData = res.data.data;
                            _this.visible = false;
                            _this.showCallbackData = true;
                            // console.log('userEnergy users => ', res.data.data);
                        } else if (res.data.data.length === 0) {
                            _this.userList = [];
                        }
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            renderTableData (data) {
                var reData = [];
                for (var i = 0, size = data.length; i < size; i++) {
                    var item = data[i];
                    reData.push({
                        avatar: 'statics/types/boy-avatar.png',
                        label: `${item.name}`,
                        children: [{
                            icon: 'call',
                            label: `手机：${item.tel}`
                        }, {
                            icon: 'email',
                            label: `邮箱：${item.email}`
                        }, {
                            label: '自我介绍',
                            body: 'info',
                            info: `${item.info}`
                        }]
                    });
                }
                return [{
                    label: this.user.teamName,
                    header: 'root',
                    children: reData
                }];
            },
            renderDialog (prop) {
                const _this = this;
                _this.userShowDisplay.name = prop.name;
                _this.userShowDisplay.tel = prop.tel;
                _this.userShowDisplay.email = prop.email;
                _this.userShowDisplay.motto = prop.motto;
                _this.userShowDisplay.intro = prop.intro;
                _this.userShowDisplay.energy = prop.energy;
                _this.userShowDisplay.energy_desc = prop.energy_desc;
                _this.userShowDisplay.color = prop.color;
                _this.userShowDisplay.work_status = prop.status;
                _this.userShowDisplay.role = prop.role;

                _this.maximizedModal = true;
            },
            openDialog (prop, isStart) {
                console.log('prop => ', prop);
                this.userShowForm.id = isStart ? prop._id : prop.id;
                this.userShowForm.name = prop.name;
                this.userShowForm.motto = prop.motto;
                this.userShowForm.tel = prop.tel;
                this.userShowForm.email = prop.email;
                this.userShowForm.intro = prop.intro;
                this.editUserShowModal = true;
            },
            checkSelfGroup (isShowSelfGroup) {
                this.isShowGroup = isShowSelfGroup;
                this.getUserInfoList();
            },
            saveUserShow () {
                const _this = this;
                _this.$v.userShowForm.$touch();
                // _this.userShowForm.team = _this.user.team;                
                if (_this.$v.userShowForm.$error) {
                    return;
                }
                _this.loadingUserShow = true;
                _this.$axios.post('/weeklyreportapi/user/updateUserInfo', _this.userShowForm).then((res) => {
                    if (res.data.code === 0) {
                        // console.log('energy res ', res);
                        _this.hasFinishedInfo = true;
                        _this.getUserInfoList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingUserShow = false;
                            _this.editUserShowModal = false;
                        }, 1000);
                    } else {
                        _this.loadingUserShow = false;
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
                    this.$q.dialog({
                        title: error.response.status + '',
                        message: error.response.data.message
                    });
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .user-show {
        // position:absolute;
        // width:60%;
        // height:50%;
        // top:50%;
        // left:50%;
        // transform:translate(-50%,-50%);
        margin: 0 auto;
        width: 76%;
        position: relative;
        margin-top: 300px;
        .bread {
            position: absolute;
            left:-8px;
            top: -60px;
            margin: 0;
        }
    }
    .team-title {
        position: absolute;
        top: -88px;
        font-style: normal;
        font-size: 20px;
        font-weight: bold;
    }
    .form-field {
        margin: 12px 0;
    }
    .btn-group {
        position: relative;
        top: -15px;
    }
    .modal-close {
        cursor: pointer;
        position: absolute;
        font-size: 55px;
        right: 40px;
        top: 40px;
        color: #333;
        transition: all .2s ease-in-out;
        &:hover {
            color: red;
        }
    }

   
</style>
<style lang="less">
    // .q-table-top {
    //     position: absolute;
    //     top: -45px;
    //     right: 50px;
    //     min-height: 0;
    //     padding: 0;
    // }
</style>