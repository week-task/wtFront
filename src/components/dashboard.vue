<template>
    <div class="report-tree">
        <em class="team-title">{{user.teamName}}周报系统</em>
        <q-breadcrumbs separator="●" color="light" active-color="dark" class="navigator">
            <q-breadcrumbs-el label="HOME" to="/" />
            <!--<q-breadcrumbs-el label="Project" to="/project" />-->
        </q-breadcrumbs>

        <q-select
            v-model="select"
            :options="periodOptions"
            class="report-tree-select"/>

        <q-btn icon="file download" label="EXPORT" @click="exportExcel" class="btn-create" v-if="isAdmin" />
        <q-btn icon="code" label="USER" @click="redirectUser" class="btn-create" v-if="isAdmin" />
        <q-btn icon="code" label="PROJECT" @click="createProject" class="btn-create" v-if="showUser" />
        <q-btn icon="add" label="TASK" @click="createTask" class="btn-create" v-if="!historyTask" />
        <q-btn icon="mode edit" label="PASS" @click="changePasswordModal" class="btn-create" />
        <q-icon class="btn-create hide-size" name="visibility" v-if="isHide" @click.native="getReportHideData" title="隐藏未更新任务" />
        <q-icon class="btn-create hide-size active" name="visibility_off" v-if="!isHide" @click.native="getReportNormalData" title="显示全部" />

        <q-search v-model="search" class="btn-search-widget" @input="directSearch(search, 1000)" />

        <q-alert
          v-if="visibleAlert"
          color="negative"
          icon="clear"
          appear
          :actions="[{ label: '知道了', handler: () => { visibleAlert = false } }]"
          class="q-mb-sm"
        >
          {{unfinishedUsers}}
        </q-alert>
        <q-alert
          v-if="doneAlert"
          color="positive"
          icon="done all"
          appear
          :actions="[{ label: '知道了', handler: () => { doneAlert = false } }]"
          class="q-mb-sm"
        >
          {{ finishedTip }}
        </q-alert>
        <q-list separator>
            <q-collapsible v-for="(item, index) in tableData" icon="layers" :label="item.project" :key="index">
                <div>
                    <q-table
                        :data="item.data"
                        :columns="columnsLeader"
                        selection="single"
                        :selected.sync="item.selected"
                        :pagination.sync="paginationControl"
                        color="primary"
                        no-data-label="暂无数据"
                        table-class="task-table">
                        <template slot="top-selection" slot-scope="props">
                            <q-btn color="positive" flat icon="mode edit" label="编辑" @click="editTask(item.selected)"  />
                            <q-btn color="negative" flat delete icon="delete" label="删除" @click="deleteTask(item.selected)" />
                        </template>
                    </q-table>
                </div>
            </q-collapsible>
        </q-list>
        
        <q-modal v-model="createTaskModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div v-if="!isEdit" class="q-display-1 q-mb-md">创建任务</div>
            <div v-if="isEdit" class="q-display-1 q-mb-md">编辑任务</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.name.$error"
                        :error-label="$v.taskForm.name.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
                    <q-input float-label="任务名称"
                             @input="$v.taskForm.name.$touch"
                             v-model="taskForm.name" />
                    <!--<span class="form-group__message" v-if="!$v.taskForm.name.maxLength">任务长度不宜超过 {{$v.taskForm.name.$params.maxLength.max}} 字符.</span>-->
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.project_id.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="taskForm.project_id"
                            float-label="所属项目"
                            :options="projectOptions"/>
                </q-field>
                <!-- <q-field
                        v-if="isEdit"
                        class="form-field"
                        :error="$v.taskForm.user_id.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="taskForm.user_id"
                            float-label="责任人"
                            :options="usersOptions"/>
                </q-field> -->
                <q-field
                        class="form-field"
                        :error="$v.taskForm.status.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="taskForm.status"
                            float-label="状态"
                            :options="statusOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.progress.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-if="taskForm.status != 2"
                            v-model="taskForm.progress"
                            float-label="进度"
                            :options="progressOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.remark.$error"
                        :error-label="errMessage.requireInfo">
                    <q-input float-label="备注"
                             @input="$v.taskForm.remark.$touch"
                             v-model="taskForm.remark" />
                </q-field>
            </div>
            <q-btn
                    :loading="loading"
                    color="primary"
                    class="btn-save"
                    @click="saveTask">
                保存
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>

        <q-modal v-model="passwordModal" :content-css="{padding: '50px', minWidth: '500px'}">
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
    import {date} from 'quasar';
    export default {
        name: 'REPORT',
        data () {
            return {
                search: '',
                isHide: true,
                isDeploy: false,
                isEdit: false, // task是否处于编辑状态
                isAdmin: false, // 判断是否是超级管理员
                showUser: false, // 判断是否是二级管理员
                visibleAlert: false,
                doneAlert: false,
                historyTask: false,
                loading: false,
                loadingPassword: false,
                createTaskModal: false,
                passwordModal: false,
                paginationControl: {rowsPerPage: 0, page: 1},
                weekOfYear: '',
                user: {},
                unfinishedUsers: '',
                finishedTip: '所有人员均已填写周报',
                select: '2018-03-01',
                selectOptions: [
                    {label: '2018-03-01', value: '2018-03-01'},
                    {label: '2018-02-20', value: '2018-02-20'},
                    {label: '2018-02-13', value: '2018-02-13'}
                ],
                periodOptions: [],
                projectsMock: [
                    {id: 1, name: 'Portal'},
                    {id: 2, name: 'Admin'},
                    {id: 3, name: 'Mini Programs'}
                ],
                projectOptions: [],
                // usersOptions: [],
                statusOptions: [
                    {label: '开发中', value: 0},
                    {label: '已提测', value: 1},
                    {label: '已上线', value: 2}
                ],
                progressOptions: [
                    {label: '0%', value: 0},
                    {label: '10%', value: 10},
                    {label: '20%', value: 20},
                    {label: '30%', value: 30},
                    {label: '40%', value: 40},
                    {label: '50%', value: 50},
                    {label: '60%', value: 60},
                    {label: '70%', value: 70},
                    {label: '80%', value: 80},
                    {label: '90%', value: 90},
                    {label: '100%', value: 100}
                ],
                taskForm: {
                    id: '',
                    name: '',
                    user_id: '',
                    project_id: '',
                    progress: 0,
                    status: 0,
                    remark: '',
                    period: ''
                },
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
                columns: [
                    {name: '任务名称', label: '任务名称', field: 'name', align: 'left'},
                    {name: '状态', label: '状态', field: 'statusZh'},
                    {name: '进度', label: '进度', field: 'progressPercent'}
                ],
                columnsLeader: [
                    {name: '任务名称', label: '任务名称', field: 'name', align: 'left'},
                    {name: '状态', label: '状态', field: 'statusZh'},
                    {name: '进度', label: '进度', field: 'progressPercent'},
                    {name: '责任人', label: '责任人', field: 'username'}
                ],
                tableDataMock: [{
                    project: '门户',
                    selected: [],
                    data: [
                        {
                            id: 1,
                            name: 'medadwa',
                            progress: 100,
                            status: 0
                        },{
                            id: 2,
                            name: 'medadwa2',
                            progress: 60,
                            status: 1
                        },{
                            id: 3,
                            name: 'medadwasada',
                            progress: 10,
                            status: 2
                        },{
                            id: 11,
                            name: 'medadwa',
                            progress: 100,
                            status: 0
                        },{
                            id: 12,
                            name: 'medadwa2',
                            progress: 60,
                            status: 1
                        },{
                            id: 13,
                            name: 'medadwasada',
                            progress: 10,
                            status: 2
                        },{
                            id: 21,
                            name: 'medadwa',
                            progress: 100,
                            status: 0
                        },{
                            id: 22,
                            name: 'medadwa2',
                            progress: 60,
                            status: 1
                        },{
                            id: 23,
                            name: 'medadwasada',
                            progress: 10,
                            status: 2
                        }
                    ]
                },{
                    project: '开发者中心',
                    selected: [],
                    data: [
                        {
                            id: 4,
                            name: 'medadwa',
                            progress: 100,
                            status: 0
                        },{
                            id: 5,
                            name: 'medadwa2',
                            progress: 60,
                            status: 1
                        },{
                            id: 6,
                            name: 'medadwasada',
                            progress: 10,
                            status: 2
                        },
                    ]
                }],
                tableData: [{
                    project: '暂无数据',
                    selected: [],
                    data: []
                }]
            }
        },
        validations: {
            taskForm: {
                name: {required, maxLength: maxLength(30)},
                project_id: {required},
                // user_id:{required},
                progress: {required},
                status: {required},
                remark: {}
            },
            passwordForm: {
                userId: {required},
                oldPassword: {required},
                password: {required, minLength: minLength(6)},
                confirmPassword: {required, sameAsPassword: sameAs('password')}
            }
        },
        created () {
            this.initFormData();
        },
        updated () {
            
        },
        watch: {
            select: function () {
                this.weekOfYear = this.select;
                this.getReportData();
                // TODO 查询每期的未完成人员列表
                // if (this.user.role === 0) {
                //     this.checkUnfinishedUsers({team: this.user.team, period: this.weekOfYear});
                // }
            },
            search: function () {
                this.directSearch(this.search, 1000);
            }
        },
        methods: {
            initFormData () {
                const _this = this;
                _this.user = JSON.parse(localStorage.getItem('user'));
                _this.isAdmin = _this.user.role === 0;
                _this.showUser = _this.user.role !== 2;
                _this.taskForm.user_id = _this.user._id;
                _this.checkFinished();
                _this.getWeekOfYear();
                _this.renderPeriods();
//                _this.getReportData();
                _this.getProjectsList();
                // edit on 2018-05-09：所有人员均对周报状态可见
                // if (_this.user.role === 0) {
                //     _this.visibleAlert = true;
                //     _this.checkUnfinishedUsers({team: _this.user.team, period: _this.weekOfYear});
                // }
                _this.visibleAlert = true;
                _this.checkUnfinishedUsers({team: _this.user.team, period: _this.weekOfYear});
            },
            checkUnfinishedUsers (params) {
                const _this = this;
                _this.$axios.post('/weeklyreportapi/task/unfinished', params).then((res) => {
                    if (res.data.code === 0) {
                        // _this.$q.notify({
                        //     message: res.data.message,
                        //     timeout: 30000,
                        //     type: 'positive',
                        //     position: 'top'
                        // });
                        if (res.data.data.length > 0) {
                            _this.unfinishedUsers = res.data.message;
                        } else {
                            _this.doneAlert = true;
                            _this.visibleAlert = false;
                        }
                        
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            checkFinished () {
                const _this = this;
                _this.$axios.post('/weeklyreportapi/isFinished', {user_id: _this.user._id}).then((res) => {
                    if (res.data.code === 0) {
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        _this.getReportData();
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            renderPeriods () {
                const _this = this;
                for (let i = parseInt(_this.weekOfYear); i > 9; i--) {
                    _this.periodOptions.push({
                        label: (_this.isAdmin ? '' : _this.user.name + ' ') + '第'+ i + '期周报',
                        value: i
                    });
                }
                _this.select = parseInt(_this.weekOfYear);
            },
            getProjectsList () {
                const _this = this;
                _this.projectOptions = [];
                _this.$axios.post('/weeklyreportapi/getProjectListByTeam', {team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        if (data.length === 0) {
                            // 可以提示没有项目，新建项目
                            _this.$q.notify({
                                message: res.data.message,
                                timeout: 3000,
                                type: 'positive',
                                position: 'top'
                            });
                        }
                        for (let i = 0, size = data.length; i < size; i++) {
                            _this.projectOptions.push({
                                label: data[i].name,
                                value: data[i]._id
                            });
                        }
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            clickTrigger () {
                const _this = this;
                _this.$nextTick(function(){
                    // var xx = document.querySelectorAll("tr>td:nth-of-type(5)");
                    Array.from(document.querySelectorAll('tr>td:nth-of-type(5)')).map(item => {item.addEventListener('click', function(){
                        _this.search = this.innerHTML;
                    }, false)})
                });
            },
            getReportHideData () {
                const _this = this;
                let queryParams = {
                    period: _this.weekOfYear,
                    username: _this.user.name,
                    userrole: _this.user.role,
                    userid: _this.user._id,
                    team: _this.user.team,
                    keyword: _this.search
                };
                _this.$axios.post('/weeklyreportapi/getTaskListByChanged', queryParams).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            _this.tableData = res.data.data;
                        } else if (res.data.data.length === 0) {
                            _this.tableData = [{
                                project: '暂无数据',
                                selected: [],
                                data: []
                            }];
                        }
                    }
                    _this.isHide = false;
                });
            },
            getReportNormalData () {
                const _this = this;
                _this.search === '' ? _this.getReportData() : _this.directSearch();
            },
            getReportData () {
                const _this = this;
                let queryParams = {
                    period: _this.weekOfYear,
                    username: _this.user.name,
                    userrole: _this.user.role,
                    userid: _this.user._id,
                    team: _this.user.team
                };
                _this.$axios.post('/weeklyreportapi/getTaskListByPeriod', queryParams).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            _this.tableData = res.data.data;
                            _this.clickTrigger();
                        } else if (res.data.data.length === 0) {
                            _this.tableData = [{
                                project: '暂无数据',
                                selected: [],
                                data: []
                            }];
                            _this.$q.notify({
                                message: '第'+ _this.weekOfYear + '期周报暂无数据,会自动跳转到最新一期',
                                timeout: 3000,
                                type: 'positive',
                                position: 'top'
                            });
                            _this.getWeekOfYear();
                            _this.select = parseInt(_this.weekOfYear);
                        }
                    }
                    _this.isHide = true;
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            getWeekOfYear () {
                let tempWeekOfYear = date.formatDate(Date.now(), 'w');
                this.weekOfYear = date.formatDate(Date.now(), 'd') === '0' ? parseInt(tempWeekOfYear) + 1 : tempWeekOfYear;
            },
            getUserList () {
                const _this = this;
                // 获取所有属于该team下的users
                _this.$axios.post('/weeklyreportapi/getUserList', {type: 'teamUsers', team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        _this.usersOptions = [];
                        for (let i = 0, size = res.data.data.length; i < size; i++) {
                            let item = res.data.data[i];
                            _this.usersOptions.push({
                                label: item.name,
                                value: item._id
                            })
                        }
                        console.log(_this.usersOptions);
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            createTask () {
                this.createTaskModal = true;
            },
            saveTask () {
                const _this = this;
                _this.$v.taskForm.$touch();
                if (_this.$v.taskForm.$error) {
                    return;
                }
                // 如果状态是已上线,那么进度默认为100
                if (_this.taskForm.status === 2) {
                    _this.taskForm.progress = 100;
                }
                _this.loading = true;
                _this.$axios.post(_this.isEdit ? '/weeklyreportapi/task/edit' : '/weeklyreportapi/task/add', _this.taskForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.search === '' ? _this.getReportData() : _this.directSearch('', 1000);
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loading = false;
                            _this.createTaskModal = false;
                            _this.isEdit = false;
                            _this.resetForm();
                        }, 1000);
                    } else {
                        _this.loading = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            editTask (props) {
                const _this = this;
                // _this.getUserList();
                _this.taskForm.id = props[0].id;
                _this.taskForm.name = props[0].name;
                _this.taskForm.period = props[0].period;
                _this.taskForm.progress = props[0].progress;
                _this.taskForm.project_id = props[0].project._id;
                _this.taskForm.status = parseInt(props[0].status);
                _this.taskForm.user_id = _this.user._id;
                _this.taskForm.remark = props[0].remark;
                _this.createTaskModal = true;
                _this.isEdit = true;
            },
            deleteTask (props) {
                const _this = this;
                this.$q.dialog({
                    title: '确认',
                    message: '确认删除该任务吗?',
                    ok: '删除',
                    cancel: '再考虑考虑'
                }).then(() => {
                    _this.$axios.post('/weeklyreportapi/task/del', {
                        id: props[0].id,
                        user_id: _this.user._id
                    }).then((res) => {
                        if (res.data.code === 0) {
                            _this.getReportData();
                            _this.$q.notify({
                                message: '已删除,这下真没了!',
                                timeout: 3000,
                                type: 'positive',
                                position: 'top'
                            });
                        } else {
                            _this.loading = false;
                            _this.$q.dialog({
                                title: 'Error',
                                message: res.data.message
                            });
                        }
                    }).catch((error)=>{
                        _this.handleError(error);
                    });
                }).catch(() => {
                    _this.$q.notify({
                        message: '看来你是一个很谨慎的人!',
                        timeout: 3000,
                        type: 'info',
                        position: 'top'
                    });
                })
            },
            createProject () {
//                this.createProjectModal = true;
                this.$router.push('/project');
            },
            directSearch (text, delay) {
                const _this = this;
                var timer;
                timer && clearTimeout(timer);
                timer = setTimeout(function(){
                    let queryParams = {
                        period: _this.weekOfYear,
                        keyword: _this.search,
                        team: _this.user.team
                    };
                    if (queryParams.keyword === '') {
                        _this.getReportData();
                        _this.doneAlert = false;
                        _this.visibleAlert = false;
                        return;
                    }
                    _this.$axios.post('/weeklyreportapi/getTaskListByKeyword', queryParams).then((res) => {
                        if (res.data.code === 0) {
                            if (res.data.data.res.length > 0) {
                                _this.tableData = res.data.data.res;
                                _this.doneAlert = true;
                                _this.visibleAlert = false;
                                _this.finishedTip = '搜索到 ' + res.data.data.size + ' 条记录';
                                _this.clickTrigger();
                            } else if (res.data.data.res.length === 0) {
                                _this.tableData = [{
                                    project: '暂无数据',
                                    selected: [],
                                    data: []
                                }];
                                _this.doneAlert = false;
                                _this.visibleAlert = true;
                                _this.unfinishedUsers = '数据库没记录！';
                            }
                        }
                    }).catch((error) => {
                        _this.handleError(error);
                    });
                }, delay);
            },
            redirectUser () {
                this.$router.push('/user');
            },
            changePasswordModal () {
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
                    if (res.data.code === 0) {
                        _this.getProjectsList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
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
            exportExcel () {
                this.$axios.post('/weeklyreportapi/export', {period: this.weekOfYear, team:this.user.team}).then((res) => {
                    console.log('export excel ',res);
                    if (res.data.code === 0) {
                       window.open('https://www.ioteams.com/weeklyreportapi/'+res.data.data.url);
                        // window.open('http://localhost:22230/index.html#/dist/spa-mat/statics/'+res.data.data.url);
                    } 
                }).catch((err)=>{
                    this.$q.notify({
                        message: err.response.data.message,
                        timeout: 3000,
                        type: 'info',
                        position: 'top'
                    });
                });
            },
            resetForm () {
                const _this = this;
                _this.taskForm.id = '';
                _this.taskForm.name = '';
//                _this.taskForm.user_id = '';
                _this.taskForm.project_id = '';
                _this.taskForm.progress = 0;
                _this.taskForm.status = 0;
                _this.taskForm.remark = '';
                _this.taskForm.create_date = '';
                _this.taskForm.period = '';
                _this.isEdit = false;
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
                    this.loadingProject = false;
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

<style scoped lang="less">
    .report-tree {
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
    }
    .team-title {
        position: absolute;
        top: -88px;
        font-style: normal;
        font-size: 20px;
        font-weight: bold;
    }
    .navigator {
        position: absolute;
        left:-8px;
        top: -60px;
        margin: 0;
    }
    .report-tree-select {
        position: absolute;
        right: 0;
        top: -10px;
        margin: 0;
    }
    .btn-create {
        position: relative;
        top: -15px;
        // left: 15px;
        display: inline-block;
    }
    .btn-save {
        margin-top: 10px;
    }
    .form-field {
        margin: 12px 0;
    }
    .q-table-container {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
    .task-table {
        border: none;
    }
    .btn-search-widget {
        margin-bottom: .3rem
    }
    .hide-size {
        font-size: 2rem;
        margin-left: 1rem;
        cursor: pointer;
        &:hover, &.active {
            color: #027be3;
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
