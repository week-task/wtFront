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
                        :error="$v.taskForm.projectId.$error"
                        error-label="Required">
                    <q-select
                            v-model="taskForm.projectId"
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
                    name: '',
                    userId: '',
                    projectId: 1,
                    progress: 0,
                    status: 0,
                    remark: '',
                    createDate: '',
                    period: ''
                }
            }
        },
        validations: {
            taskForm: {
                name: {required},
                projectId: {required},
                progress: {required},
                status: {required},
                remark: {}
            }
        },
        created () {
            this.getInitData();
        },
        methods: {
            getInitData () {
                const _this = this;
                _this.$axios.get('/api/getProjectList').then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        for (let i = 0, size = data.length; i < size; i++) {
                            _this.projectOptions.push({
                                label: data[i].name,
                                value: data[i]._id
                            });
                        }
                        _this.taskForm.projectId = data[0]._id;
                    }
                }).catch((err) => {
                    _this.$q.dialog({
                        title: 'Error',
                        message: err.data.message
                    });
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
                _this.loading = true;
                _this.$axios.post('/api/createTask', _this.loginParams).then((res) => {
                    if (res.data.code === 0) {
                        const token = res.data.data.token;
                        setTimeout(()=>{
                            _this.loading = false;
                            localStorage.setItem('token', token);
                            // Bearer是JWT的头部认证
                            _this.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                            window.location.href = '/dashboard';
                        }, 1000);
                    } else {
                        _this.loading = false;
                        _this.$q.dialog({
                            title: 'Error',
                            message: res.data.message
                        });
                    }
                }).catch((error)=>{
                    _this.loading = false;
                    _this.$q.dialog({
                        title: error.response.status,
                        message: error.response.data
                    });
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
