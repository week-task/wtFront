<template>
    <div class="user">
        <em class="team-title">{{user.teamName}} 团队成员能量</em>
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="USER ENERGY" to="/userEnergy" />
        </q-breadcrumbs>
        <!-- <q-btn icon="add" label="USER" @click="createUser" class="btn-create" /> -->
        <q-list separator>
            <ul class="user-energy-list">
                <li v-for="item in userList" v-bind:key="item._id">
                    <span>{{item.name}}</span>
                    <div class="progress-status" :style="{width: user.role !== 1 ? '80%': ''}">
                        <q-progress
                            class="" 
                            :percentage="100 - item.energy"
                            stripe
                            animate
                            height="45px"
                        />
                        <q-tooltip anchor="top left" self="bottom left" :offset="[10, 10]" class="show-energy-desc" style="min-width: 300px;margin-left:20px;">
                            <strong>描述</strong>
                            <p v-if="item.energy_desc !== ''" v-for="(itemP, index) in item.energy_desc.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                {{itemP}}
                            </p>
                            <p v-if="item.energy_desc === ''" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                暂无
                            </p>
                        </q-tooltip>
                    </div>
                    
                    <q-icon class="update-energy" name="mode edit" v-if="item.parent === user._id" @click.native="updateEnergy(item)" title="更新能量值" />
                    
                </li>
            </ul>
        </q-list>

        <q-modal no-esc-dismiss v-model="editUserEnergyModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">更新『{{userEnergyForm.name}}』能量值</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.userEnergyForm.energy.$error"
                        :error-label="$v.userEnergyForm.energy.between ? errMessage.requireInfo : errMessage.betweenInfo">
                    <q-input float-label="用户能量值"
                             @input="$v.userEnergyForm.energy.$touch"
                             v-model="userEnergyForm.energy" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userEnergyForm.energyDesc.$error"
                        :error-label="$v.userEnergyForm.energy.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
                    <q-input float-label="能量使用描述"
                            type="textarea"
                             @input="$v.userEnergyForm.energyDesc.$touch"
                             v-model="userEnergyForm.energyDesc" />
                </q-field>
            </div>
            <q-btn
                    :loading="loadingUserEnergy"
                    color="primary"
                    class="btn-save"
                    @click="saveUserEnergy">
                保存
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>

    </div>
</template>

<script>
    import {required, minLength, maxLength, between} from 'vuelidate/lib/validators';
    export default {
        name: 'User',
        data () {
            return {
                editUserEnergyModal: false,
                loadingUserEnergy: false,
                progressModel: 30,
                userEnergyForm: {
                    id: '',
                    name: '',
                    energy: 0,
                    energyDesc: ''
                },
                userList: [],
                errMessage: {
                    requireInfo: '必填',
                    betweenInfo: '数值范围 0~100',
                    maxInfo: '文本长度 < 512'
                }
            }
        },
        validations: {
            userEnergyForm: {
                energy: {required, between: between(0,100)},
                energyDesc: {required, maxLength: maxLength(512)}
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
                _this.getUserList();
            },
            getUserList () {
                const _this = this;
                // 获取所有属于该team下的users
                _this.$axios.post('/weeklyreportapi/getUserList', {type: 'usersEnergy', team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            _this.userList = res.data.data;
                            console.log('userEnergy users => ', res.data.data);
                        } else if (res.data.data.length === 0) {
                            _this.userList = [{
                                user: '暂无数据',
                                selected: [],
                                data: []
                            }];
                        }
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            updateEnergy (item) {
                this.userEnergyForm.id = item._id;
                this.userEnergyForm.energy = item.energy;
                this.userEnergyForm.name = item.name;
                this.userEnergyForm.energyDesc = item.energy_desc;
                this.editUserEnergyModal = true;
            },
            saveUserEnergy () {
                const _this = this;
                _this.$v.userEnergyForm.$touch();
                // _this.userEnergyForm.team = _this.user.team;                
                if (_this.$v.userEnergyForm.$error) {
                    return;
                }
                _this.loadingUserEnergy = true;
                _this.$axios.post('/weeklyreportapi/user/updateEnergy', _this.userEnergyForm).then((res) => {
                    if (res.data.code === 0) {
                        console.log('energy res ', res);
                        _this.getUserList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingUserEnergy = false;
                            _this.editUserEnergyModal = false;
                        }, 1000);
                    } else {
                        _this.loadingUserEnergy = false;
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
                this.userEnergyForm.energyDesc = ''
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
    .user {
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
    .btn-create {
        position: relative;
        top: -15px;
    }
    .q-table-container {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
    .task-table {
        border: none;
    }
    .user-energy-list {
        li {
            list-style-type: none;
            margin-bottom: 8px;
            span {
                font-size: 20px;
                display: inline-block;
                line-height: 45px;
                margin-right: 10px;
                width: 100px;
            }
            .progress-status{
                height: 45px;
                display: inline-block;
                width: 70%;
                vertical-align: middle;
                .show-energy-desc {
                    width: 200px!important;
                }
            }
            .update-energy {
                font-size: 2rem;
                margin-left: 1rem;
                cursor: pointer;
                &:hover, &.active {
                    color: #027be3;
                }
            }
        }
    }
</style>
<style lang="less">
    .q-table-top {
        position: absolute;
        top: -45px;
        right: 50px;
        min-height: 0;
        padding: 0;
    }
</style>