<template>
    <div class="report-tree">
        <q-select
            v-model="select"
            :options="periodOptions"
            class="report-tree-select"/>

        <q-btn icon="file download" label="EXPORT" @click="exportExcel" class="btn-create" v-if="isAdmin" />
        <q-btn icon="add" label="PROJECT" @click="createProject" class="btn-create" v-if="showUser" />
        <q-btn icon="add" label="TASK" @click="createTask" class="btn-create" />
        <q-collapsible v-for="(item, index) in tableData" popup icon="layers" :label="item.project" :key="index">
            <div>
                <q-table
                    :data="item.data"
                    :columns="showUser ? columnsLeader : columns"
                    selection="single"
                    :selected.sync="item.selected"
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

        <q-modal v-model="createTaskModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div v-if="!isEdit" class="q-display-1 q-mb-md">创建任务</div>
            <div v-if="isEdit" class="q-display-1 q-mb-md">编辑任务</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.name.$error"
                        error-label="Required">
                    <q-input float-label="任务名称"
                             @input="$v.taskForm.name.$touch"
                             v-model="taskForm.name" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.project_id.$error"
                        error-label="Required">
                    <q-select
                            v-model="taskForm.project_id"
                            float-label="所属项目"
                            :options="projectOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.status.$error"
                        error-label="Required">
                    <q-select
                            v-model="taskForm.status"
                            float-label="状态"
                            :options="statusOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.progress.$error"
                        error-label="Required">
                    <q-select
                            v-if="taskForm.status != 2"
                            v-model="taskForm.progress"
                            float-label="进度"
                            :options="progressOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.taskForm.remark.$error"
                        error-label="Required">
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

        <q-modal v-model="createProjectModal" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">创建项目</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.projectForm.name.$error"
                        error-label="Required">
                    <q-input float-label="项目名称"
                             @input="$v.projectForm.name.$touch"
                             v-model="projectForm.name" />
                </q-field>
                <q-btn
                        :loading="loadingProject"
                        color="primary"
                        class="btn-save"
                        @click="saveProject">
                    保存
                    <q-spinner-hourglass slot="loading" size="20px" />
                    <span slot="loading">Loading...</span>
                </q-btn>
            </div>
        </q-modal>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    import {date} from 'quasar';
    export default {
        name: 'REPORT',
        data () {
            return {
                isDeploy: false,
                isEdit: false, // task是否处于编辑状态
                isAdmin: false, // 判断是否是超级管理员
                showUser: false, // 判断是否是二级管理员
                loading: false,
                loadingProject: false,
                createTaskModal: false,
                createProjectModal: false,
                weekOfYear: '',
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
                projectForm: {
                    name: ''
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
                name: {required},
                project_id: {required},
                progress: {required},
                status: {required},
                remark: {}
            },
            projectForm: {
                name: {required}
            }
        },
        created () {
            this.initFormData();
        },
        watch: {
            select: function () {
                this.weekOfYear = this.select;
                this.getReportData();
            }
        },
        methods: {
            initFormData () {
                const _this = this;
                const user = JSON.parse(localStorage.getItem('user'));
                _this.isAdmin = user.role === 0;
                _this.showUser = user.role !== 2;
                _this.taskForm.user_id = user._id;
                _this.getWeekOfYear();
                _this.renderPeriods();
                _this.getReportData();
                _this.getProjectsList();
            },
            renderPeriods () {
                for (let i = parseInt(this.weekOfYear); i > 8; i--) {
                    this.periodOptions.push({
                        label: (this.isAdmin ? '' : JSON.parse(localStorage.getItem('user')).name + ' ') + '第'+ i + '期周报',
                        value: i
                    });
                }
                this.select = parseInt(this.weekOfYear);
            },
            getProjectsList () {
                const _this = this;
                _this.projectOptions = [];
                _this.$axios.get('/api/getProjectList').then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
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
            getReportData () {
                const _this = this;
                const user = JSON.parse(localStorage.getItem('user'));
//                const timexx = Date.now();
//                console.log('week of year: ', date.formatDate(timexx, 'w'));
                let queryParams = {
                    period: _this.weekOfYear,
                    username: user.name,
                    userrole: user.role,
                    userid: user._id
                };
                _this.$axios.post('/api/getTaskListByPeriod', queryParams).then((res) => {
                    if (res.data.code === 0) {
                        console.log('report data: => ', res.data);
                        if (res.data.data.length > 0) {
                            _this.tableData = res.data.data;
                        } else if (res.data.data.length === 0) {
                            _this.$q.dialog({
                                title: '提示',
                                message: '第'+ _this.weekOfYear + '期周报暂无数据'
                            });
                            _this.getWeekOfYear();
                            _this.select = parseInt(_this.weekOfYear);
                        }
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            getWeekOfYear () {
                let tempWeekOfYear = date.formatDate(Date.now(), 'w');
                this.weekOfYear = date.formatDate(Date.now(), 'd') === 0 ? tempWeekOfYear + 1 : tempWeekOfYear;
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

                _this.$axios.post(_this.isEdit ? '/api/task/edit' : '/api/task/add', _this.taskForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.getReportData();
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
                _this.taskForm.id = props[0].id;
                _this.taskForm.name = props[0].name;
                _this.taskForm.period = props[0].period;
                _this.taskForm.progress = props[0].progress;
                _this.taskForm.project_id = props[0].project._id;
                _this.taskForm.status = parseInt(props[0].status);
                _this.taskForm.user_id = JSON.parse(localStorage.getItem('user'))._id;
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
                    _this.$axios.post('/api/task/del', {
                        id: props[0].id,
                        user_id: JSON.parse(localStorage.getItem('user'))._id
                    }).then((res) => {
                        if (res.data.code === 0) {
                            _this.getReportData();
                            _this.$q.notify({
                                message: '已删除,这下真没了!',
                                timeout: 2000,
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
                        timeout: 2000,
                        type: 'info',
                        position: 'top'
                    });
                })
            },
            createProject () {
                this.createProjectModal = true;
            },
            saveProject () {
                const _this = this;
                _this.$v.projectForm.$touch();
                if (_this.$v.projectForm.$error) {
                    return;
                }
                _this.loadingProject = true;
                _this.$axios.post('/api/project/add', _this.projectForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.getProjectsList();
                        setTimeout(()=>{
                            _this.loadingProject = false;
                            _this.createProjectModal = false;
                            _this.projectForm.name = '';
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
            exportExcel () {},
//            checkProgress () {
//                const _this = this;
//                if (_this.taskForm.status = 2) {
//                    _this.isDeploy = true;
//                    _this.taskForm.progress = 100;
//                } else {
//                    _this.isDeploy = false;
//                    _this.taskForm.progress = 0;
//                }
//            },
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
                    this.$q.dialog({
                        title: error.response.status + '',
                        message: isExpired ? 'token已过期,重新登录' : error.response.data.error
                    }).then(() => {
                        if (isExpired) {
                            window.location.href = '/login';
                        }
                    });
                } else {
                    this.loading = false;
                    this.loadingProject = false;
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
    .report-tree {
        position:absolute;
        width:600px;
        height:auto;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .report-tree-select {
        /*width: 160px;*/
        position: absolute;
        right: 15px;
        top: -10px;
        margin: 0;
    }
    .btn-create {
        position: relative;
        top: -15px;
        left: 15px;
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
    .q-table-top {
        position: absolute;
        top: -45px;
        right: 50px;
        min-height: 0;
        padding: 0;
    }
</style>
