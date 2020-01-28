<template>
    <div class="user">
        <slot name="headerTop">
            <HeaderTop :navList="navList" :funName="funName" :teamName="user.teamName"></HeaderTop>
        </slot>
        
        <div class="report-tree-select">
            <q-select
                v-model="selectYear"
                :options="yearPeriodOptions"
                class="select-right"/>
            <q-select
                v-model="select"
                :options="periodOptions"
                class="select-right"/>
        </div>

        <q-list separator>
            <q-collapsible v-for="(item, index) in mtaskData" open icon="layers" :label="item.user && item.user.name" :key="index" :header-class="item.period ? '' : 'bg-red text-white'">
                <q-btn v-if="item.info !== '' && user.role === 0" color="negative" flat label="复制" @click="copyMtask(item)"  />
                <q-btn v-if="item.info === '' && item.user && item.user.name === user.name && select === currentSelect" color="positive" flat icon="add" label="MTASK" @click="createMtask" class="btn-create" />
                <q-btn v-if="item.info !== '' && item.user && item.user.name === user.name && select === currentSelect" color="positive" flat icon="mode edit" label="编辑" @click="editMtask(item)"  />
                
                <div v-if="item && item.info && item.info !== ''" v-for="(itemP, index) in item.info.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;margin-left:20px;">
                    {{itemP}}
                </div>

                <p v-if="!item.info" class="info-p">暂未填项目经理周报</p>
                <!-- {{item.info}} -->
            </q-collapsible>
        </q-list>

        <q-modal v-model="createMtaskModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div v-if="!isEdit" class="q-display-1 q-mb-md">CREATE</div>
            <div v-if="isEdit" class="q-display-1 q-mb-md">EDIT</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.mtaskForm.info.$error"
                        :error-label="$v.mtaskForm.info.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
                    <q-input float-label="周报细节"
                            type="textarea"
                            @input="$v.mtaskForm.info.$touch"
                            v-model="mtaskForm.info" />
                </q-field>
            </div>
            <q-btn
                    :loading="loadingMtask"
                    color="primary"
                    class="btn-save"
                    @click="saveMtask">
                保存
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>
        <slot name="footerTop">
            <FooterTop></FooterTop>
        </slot>
    </div>
</template>

<script>
    import {required, minLength, maxLength} from 'vuelidate/lib/validators';
    import {date} from 'quasar';
    import HeaderTop from '../common/header';
    import FooterTop from '../common/footer';
    export default {
        name: 'Pm',
        data () {
            return {
                navList: [{
                    label: 'HOME', toLink: '/console'
                },{
                    label: 'PROJECT MANAGER', toLink: '/pm'
                }],
                funName: '项目经理周报',
                isEdit: false,
                isAdmin: false,
                loadingMtask: false,
                createMtaskModal: false,
                select: '2019-03-22',
                currentSelect: '',
                weekOfYear: '',
                selectYear: '2020',
                paginationControl: {rowsPerPage: 0, page: 1},
                user: {},
                type: 'all',
                periodOptions: [],
                yearPeriodOptions: [
                    {label: '2019年', value: '2019'},
                    {label: '2020年', value: '2020'}
                ],
                mtaskForm: {
                    id: '',
                    user_id: '',
                    info: '',
                    team: ''
                },
                mtaskData: [],
                errMessage: {
                    requireInfo: '必填',
                    maxInfo: '文本长度 < 512'
                }
            }
        },
        validations: {
            mtaskForm: {
                info: {required, maxLength: maxLength(512)}
            }
        },
        components: {HeaderTop, FooterTop},
        created () {
////            this.getInitData();
//            const _this = this;
//            document.onkeyup = (e) => {
//                if (window.event.keyCode === 13) _this.login();
//            }
            this.init();
        },
        watch: {
            select: function () {
                this.weekOfYear = this.select;
                this.getMtaskList();
            },
            selectYear: function() {
                this.renderPeriods();
            }
        },
        methods: {
            init () {
                const _this = this;
                _this.user = JSON.parse(localStorage.getItem('user'));
                _this.isAdmin = _this.user.role === 0;
                _this.renderPeriods();
                // _this.getMtaskList();
            },
            getWeekOfYear () {
                let tempWeekOfYear = date.formatDate(Date.now(), 'w');
                this.weekOfYear = date.formatDate(Date.now(), 'd') === '0' ? parseInt(tempWeekOfYear) + 1 : tempWeekOfYear;
                // console.log('weekOfyaer', this.weekOfYear);
            },
            renderPeriods () {
                const _this = this;
                _this.periodOptions = [];
                _this.getWeekOfYear();
                
                // console.log(date.formatDate(new Date(2018, 11, 30), 'w'))
                // update the time on 2019-01-03
                // update the time on 2020-01-01 本次兼容每年的周报日志期数，因2018年
                // update the time on 2020-01-01 本次解决未来所有年份周数问题，但2018年特殊，要特殊处理，即2018年只有10-52期
                // TODO 每年应该都只有52个星期，如果哪一年有53个星期，以下的for循环会出现bug，也就是53期展示不出来的情况
                for (let i = (_this.selectYear === date.formatDate(Date.now(), 'YYYY') ? parseInt(_this.weekOfYear) : 52); i > (_this.selectYear === '2019' ? 12 : 0); i--) {
                    _this.periodOptions.push({
                        label: (_this.isAdmin ? '' : _this.user.name + ' ') + '第'+ i + '期项目经理周报',
                        value: i
                    });
                }
                _this.select = parseInt(_this.weekOfYear);
                _this.currentSelect === '' ? _this.currentSelect = parseInt(_this.weekOfYear) : '';
            },
            copyMtask (data) {
                // console.log('copy data => ', data.info);
                // this.copy(data.info);
                // console.log('window', window);
                // this.copy('合到');
                this.$copyText(data.info).then((e)=>{
                    this.$q.notify({
                        message: '复制成功',
                        timeout: 3000,
                        type: 'positive',
                        position: 'center'
                    });
                },(e)=>{
                    this.$q.notify({
                        message: '复制失败',
                        timeout: 3000,
                        type: 'negative',
                        position: 'center'
                    });
                });
            },
            getMtaskList () {
                const _this = this;
                let queryParams = {
                    year: _this.selectYear,
                    period: _this.weekOfYear,
                    userid: _this.user._id,
                    team: _this.user.team
                };
                // 获取所有该期的项目经理周报
                _this.$axios.post('/weeklyreportapi/mtask/getMtaskList', queryParams).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            // console.log('res==== ', res.data.data);
                            _this.mtaskData = res.data.data;
                            _this.getIsEdit();
                        } 
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            createMtask () {
                this.createMtaskModal = true;
                this.isEdit = false;
                // this.getParentList();
            },
            getIsEdit () {
                const _this = this;
                for (let i = 0, size = _this.mtaskData.length; i < size; i++) {
                    if (_this.mtaskData[i].user.name === _this.user.name && _this.mtaskData[i].info) {
                        _this.isEdit = true;
                    }
                }
            },
            editMtask (props) {
                const _this = this;
                _this.isEdit = true;
                _this.createMtaskModal = true;
                // _this.getParentList();
                // console.log('props ', props);
                _this.mtaskForm.id = props._id;
                _this.mtaskForm.info = props.info;
            },
            saveMtask () {
                const _this = this;
                _this.$v.mtaskForm.$touch();
                _this.mtaskForm.team = _this.user.team;                
                _this.mtaskForm.user_id = _this.user._id;
                if (_this.$v.mtaskForm.$error) {
                    return;
                }
                _this.loadingMtask = true;
                _this.$axios.post(_this.isEdit?'/weeklyreportapi/mtask/edit':'/weeklyreportapi/mtask/add', _this.mtaskForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.getMtaskList();
                        // console.log('save pm info => ', res);
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingMtask = false;
                            _this.createMtaskModal = false;
                            _this.isEdit = false;
                        }, 1000);
                    } else {
                        _this.loadingMtask = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            copy (data) {
                let target = null;
                console.log('data info =>',data);

                if (data) {
                    target = document.createElement('div');
                    target.id = 'tempTarget';
                    target.style.opacity = '0';
                    target.innerText = data;
                    document.body.appendChild(target);
                } else {
                    target = document.querySelector('.info-p');
                }

                try {
                    let range = document.createRange();
                    range.selectNode(target);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    document.execCommand('copy');
                    window.getSelection().removeAllRanges();
                    this.$q.notify({
                        message: '复制成功',
                        timeout: 3000,
                        type: 'positive',
                        position: 'center'
                    });
                } catch (e) {
                    this.$q.notify({
                        message: '复制失败',
                        timeout: 3000,
                        type: 'negative',
                        position: 'center'
                    });
                }

                if (data) {
                    // remove temp target
                    target.parentElement.removeChild(target);
                }
            },
            resetForm () {
                const _this = this;
                _this.mtaskForm.id = '';
                _this.mtaskForm.info = '';
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
                    this.loadingMtask = false;
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
    .report-tree-select {
        position: relative;
        // right: 0;
        height: 35px;
        top: -10px;
        // margin: 0;
        .select-right {
            margin-right: 10px;
            float: left;
            // display: inline-block;
            // width: 300px;
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
    }
    .q-table-container {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
    .task-table {
        border: none;
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