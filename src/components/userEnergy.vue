<template>
    <div class="user">
        <slot name="headerTop">
            <HeaderTop :navList="navList" :funName="funName" :teamName="user.teamName"></HeaderTop>
        </slot>

        <q-btn icon="group" label="ALL" @click="checkSelfGroup(false)" class="btn-group" title="所有成员" />
        <q-btn icon="person" label="GROUP" @click="checkSelfGroup(true)" class="btn-group" title="只关注本组成员" />

        <ul class="example-energy">
            <li>
                <q-progress class="" :percentage="100" color="negative" stripe animate height="40px" />
                Busy
            </li>
            <li>
                <q-progress class="" :percentage="100" color="warning" stripe animate height="40px" />
                Normal
            </li>
            <li>
                <q-progress class="" :percentage="100" color="positive" stripe animate height="40px" />
                Free
            </li>
            <li class="free-rate">
                总体闲置率：<span>{{freeRate}}%</span>
            </li>
        </ul>

        <q-list separator>
            <ul v-show="showCallbackData" class="user-energy-list">
                <li v-for="item in userList" v-bind:key="item._id">
                    <span>{{item.name}}</span>
                    <div class="progress-status" :style="{width: user.role === 2 ? '80%': ''}">
                        <q-progress
                            class="" 
                            :percentage="100 - item.energy"
                            :color="item.color"
                            stripe
                            animate
                            height="40px"
                        />
                        <div class="updated-time">{{item.updated_at}}</div>
                        <q-tooltip anchor="top left" self="bottom left" :offset="[10, 10]" class="show-energy-desc" style="min-width: 300px;margin-left:20px;">
                            <strong>描述：剩余能量<span style="color:yellow;">{{item.energy}}</span></strong>
                            <p v-if="item.energy_desc !== ''" v-for="(itemP, index) in item.energy_desc.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                {{itemP}}
                            </p>
                            <p v-if="item.energy_desc === ''" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
                                暂无
                            </p>
                        </q-tooltip>
                    </div>
                    
                    <q-icon class="update-energy" name="adjust" v-if="item.parent === user._id || user.role === 0" @click.native="updateEnergy(item)" title="更新能量值" />
                    
                </li>
            </ul>
            <q-inner-loading :visible="visible">
                <q-spinner-hourglass size="50px" color="primary" />
            </q-inner-loading>
        </q-list>

        <q-modal no-esc-dismiss v-model="editUserEnergyModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">更新『{{userEnergyForm.name}}』能量值</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.userEnergyForm.energy.$error"
                        :error-label="$v.userEnergyForm.energy.between ? errMessage.requireInfo : errMessage.betweenInfo">
                    <q-input float-label="用户已使用能量值"
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
    import HeaderTop from '../layouts/common/header'
    export default {
        name: 'User',
        data () {
            return {
                navList: [{
                    label: 'HOME', toLink: '/console'
                },{
                    label: 'USER ENERGY', toLink: '/userEnergy'
                }],
                funName: '团队成员能量',
                editUserEnergyModal: false,
                loadingUserEnergy: false,
                showCallbackData: false,
                visible: false,
                progressModel: 30,
                queue: '',
                isShowGroup: false,
                freeRate: 0,
                colorCard:{

                },
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
        components: {HeaderTop},
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
                _this.visible = true;
                _this.showCallbackData = false;
                // 获取所有属于该team下的users
                _this.$axios.post('/weeklyreportapi/getUserList', {
                    type: 'usersEnergy', 
                    team: _this.user.team,
                    queue: _this.queue,
                    parentId: _this.isShowGroup ? _this.user.parent_id : ''
                }).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            _this.userList = res.data.data;
                            _this.countFreeRate(res.data.data);
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
            updateEnergy (item) {
                this.userEnergyForm.id = item._id;
                this.userEnergyForm.energy = 100 - item.energy;
                this.userEnergyForm.name = item.name;
                this.userEnergyForm.energyDesc = item.energy_desc;
                this.editUserEnergyModal = true;
            },
            checkSelfGroup (isShowSelfGroup) {
                this.isShowGroup = isShowSelfGroup;
                this.getUserList();
            },
            countFreeRate (userList) {
                const _this = this;
                const allEnergy = userList.length;
                let freeEnergy = 0;

                for(let i = 0, size = userList.length; i < size; i++) {
                    let item = userList[i];
                    freeEnergy += parseInt(item.energy);
                }

                _this.freeRate = (freeEnergy / allEnergy).toFixed(2);
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
                        // console.log('energy res ', res);
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
    .btn-group {
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
    .example-energy {
        list-style-type: none;
        margin: 10px 0;
        padding: 0;
        li {
            display: inline-block;
            width: 80px;
            margin-right: 10px;
            &.free-rate {
                width: 450px;
                height: 50px;
                vertical-align: bottom;
            }
        }
    }
    .user-energy-list {
        li {
            list-style-type: none;
            margin-bottom: 8px;
            position: relative;
            span {
                font-size: 18px;
                display: inline-block;
                line-height: 40px;
                margin-right: 10px;
                width: 100px;
            }
            .progress-status{
                height: 40px;
                display: inline-block;
                width: 70%;
                vertical-align: middle;
                position: relative;
                .show-energy-desc strong span{
                    color: #db2828;
                }
                .updated-time {
                    position: absolute;
                    top: 12px;
                    right: 20px;
                    color: #333;
                    opacity: .8;
                }
            }
            
            .update-energy {
                font-size: 2rem;
                margin-left: 1rem;
                cursor: pointer;
                color: #21ba45;
                transition:all ease-in .2s;
                &:hover, &.active {
                    color: #db2828;
                }
            }
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