<template>
    <div class="report-tree">
        <q-select
            v-model="select"
            :options="selectOptions"
            class="report-tree-select"/>

        <q-btn label="CREATE TASK" @click="createTask" class="btn-create" />
        <q-collapsible v-for="(item, index) in projects" popup icon="layers" :label="item.name" :key="index">
            <div>
                Content
            </div>
        </q-collapsible>

        <q-modal v-model="createTaskModal" :content-css="{padding: '50px', minWidth: '30%'}">
            <!--<div class="q-display-1 q-mb-md">Create Task</div>-->
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
                SAVE
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    export default {
        name: 'REPORT',
        data () {
            return {
                isDeploy: false,
                loading: false,
                createTaskModal: false,
                select: '2018-03-01',
                selectOptions: [
                    {label: '2018-03-01', value: '2018-03-01'},
                    {label: '2018-02-20', value: '2018-02-20'},
                    {label: '2018-02-13', value: '2018-02-13'}
                ],
                projects: [
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
                    create_date: '',
                    period: ''
                }
            }
        },
        validations: {
            taskForm: {
                name: {required},
                project_id: {required},
                progress: {required},
                status: {required},
                remark: {}
            }
        },
        created () {
            this.initFormData();
        },
        methods: {
            initFormData () {
                const _this = this;
                _this.taskForm.user_id = JSON.parse(localStorage.getItem('user'))._id;
                _this.$axios.get('/api/getProjectList').then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        for (let i = 0, size = data.length; i < size; i++) {
                            _this.projectOptions.push({
                                label: data[i].name,
                                value: data[i]._id
                            });
                        }
//                        _this.taskForm.project_id = data[0]._id;
                    }
                }).catch((error) => {
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

                _this.$axios.post('/api/task/add', _this.taskForm).then((res) => {
                    if (res.data.code === 0) {
                        setTimeout(()=>{
                            _this.loading = false;
                            _this.createTaskModal = false;
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
            checkProgress () {
                const _this = this;
                if (_this.taskForm.status = 2) {
                    _this.isDeploy = true;
                    _this.taskForm.progress = 100;
                } else {
                    _this.isDeploy = false;
                    _this.taskForm.progress = 0;
                }
            },
            resetForm () {
                const _this = this;
                _this.taskForm.id = '';
                _this.taskForm.name = '';
                _this.taskForm.user_id = '';
                _this.taskForm.project_id = '';
                _this.taskForm.progress = 0;
                _this.taskForm.status = 0;
                _this.taskForm.remark = '';
                _this.taskForm.create_date = '';
                _this.taskForm.period = '';
            },
            handleError (error) {
                let isExpired = error.response.data.error === 'jwt expired';
                this.$q.dialog({
                    title: error.response.status,
                    message: isExpired ? 'token已过期,重新登录' : error.response.data.error
                }).then(() => {
                    if (isExpired) {
                        window.location.href = '/login';
                    }
                });
            }
        }
    }
</script>

<style lang="less">
    .report-tree {
        position:absolute;
        width:400px;
        height:500px;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .report-tree-select {
        width: 120px;
        margin: 0 0 10px 15px;
    }
    .btn-create {
        float: right;
        position: absolute;
        top: -5px;
        right: 15px;
    }
    .btn-save {
        margin-top: 10px;
    }

    .form-field {
        margin: 12px 0;
    }
</style>
