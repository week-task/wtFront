<template>
    <div class="project">
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="PROJECT" to="/project" />
        </q-breadcrumbs>
        <q-btn icon="add" label="PROJECT" @click="createProject" class="btn-create" />
        <q-collapsible v-for="(item, index) in tableData" popup icon="layers" :label="item.team" :key="index">
            <div>
                <q-table
                        :data="item.data"
                        :columns="columns"
                        selection="single"
                        :selected.sync="item.selected"
                        :pagination.sync="paginationControl"
                        color="primary"
                        no-data-label="暂无数据"
                        table-class="task-table">
                    <template slot="top-selection" slot-scope="props">
                        <q-btn color="positive" flat icon="mode edit" label="编辑" @click="editProject(item.selected)"  />
                        <q-btn color="negative" flat delete icon="delete" label="禁用或删除" @click="deleteProject(item.selected)" />
                    </template>
                </q-table>
            </div>
        </q-collapsible>

        <q-modal v-model="createProjectModal" :content-css="{padding: '50px', minWidth: '500px'}">
            <div v-if="!isEdit" class="q-display-1 q-mb-md">创建项目</div>
            <div v-if="isEdit" class="q-display-1 q-mb-md">编辑项目</div>
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
    export default {
        name: 'Project',
        data () {
            return {
                isEdit: false,
                isSuper: false, //判断是否为超级管理员
                isAdmin: false, //判断是否是管理员
                showUser: false,
                createProjectModal: false,
                loadingProject: false,
                paginationControl: {rowsPerPage: 0, page: 1},
                user: {},
                columns: [
                    {name: '项目名称', label: '项目名称', field: 'name', align: 'left'},
                    {name: '状态', label: '状态', field: 'statusZh', align: 'center'},
                ],
                tableDataMock: [{
                    team: '大数据团队',
                    selected: [],
                    data: [
                        {id: 1, name: '大数据项目1'},
                        {id: 2, name: '大数据项目2'},
                        {id: 3, name: '大数据项目3'}
                    ]
                }],
                tableData: [{
                    project: '暂无数据',
                    selected: [],
                    data: []
                }],
                projectForm: {
                    name: '',
                    team: ''
                }
            }
        },
        validations: {
            projectForm: {
                name: {required}
            }
        },
        created () {
////            this.getInitData();
//            const _this = this;
//            document.onkeyup = (e) => {
//                if (window.event.keyCode === 13) _this.login();
//            }
            this.init();
        },
        methods: {
            init () {
                const _this = this;
                _this.user = JSON.parse(localStorage.getItem('user'));
                _this.isAdmin = _this.user.role === 0;
                _this.showUser = _this.user.role !== 2;
                _this.getProjectList();
            },
            getProjectList () {
                const _this = this;
                _this.projectOptions = [];
                _this.$axios.post('/weeklyreportapi/getProjectList', {team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        _this.tableData = data;
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            createProject () {
                this.createProjectModal = true;
            },
            editProject (props) {
                console.log('props => ', props);
                const _this = this;
                _this.projectForm.id = props[0].id;
                _this.projectForm.name = props[0].name
                _this.isEdit = true;
                _this.createProjectModal = true;
            },
            deleteProject (props) {
                // _this.projectForm.id = props[0].id;
                const _this = this;
                this.$q.dialog({
                    title: '确认',
                    message: '确认删除该项目吗?',
                    ok: '删除',
                    cancel: '再考虑考虑'
                }).then(() => {
                    _this.$axios.post('/weeklyreportapi/project/delete', {
                        id: props[0].id
                    }).then((res) => {
                        if (res.data.code === 0) {
                            _this.getProjectList();
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
            saveProject () {
                const _this = this;
                _this.$v.projectForm.$touch();
                _this.projectForm.team = _this.user.team;                
                if (_this.$v.projectForm.$error) {
                    return;
                }
                _this.loadingProject = true;
                _this.$axios.post(_this.isEdit?'/weeklyreportapi/project/edit':'/weeklyreportapi/project/add', _this.projectForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.getProjectList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
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
    .project {
        position:absolute;
        width:60%;
        height:50%;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        .bread {
            position: relative;
            left: 15px;
            top: -25px;
        }
    }
    .btn-create {
        /*margin-top: 10px;*/
        position: relative;
        top: -15px;
        left: 15px;
    }

    .q-table-container {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }

    .form-field {
        margin: 12px 0;
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
