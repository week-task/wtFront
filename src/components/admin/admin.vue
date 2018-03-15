<template>
    <div class="project">
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="ADMIN" to="/project" />
        </q-breadcrumbs>
        <q-btn icon="add" label="TEAM" @click="createTeam" class="btn-create" />
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
                        <q-btn color="negative" flat delete icon="delete" label="删除" @click="deleteProject(item.selected)" />
                    </template>
                </q-table>
            </div>
        </q-collapsible>

        <q-modal v-model="createTeamModal" :content-css="{padding: '50px', minWidth: '500px'}">
            <div class="q-display-1 q-mb-md">创建团队</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.teamForm.name.$error"
                        error-label="Required">
                    <q-input float-label="团队名称"
                             @input="$v.teamForm.name.$touch"
                             v-model="teamForm.name" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.teamForm.userName.$error"
                        error-label="Required">
                    <q-input float-label="团队负责人"
                             @input="$v.teamForm.userName.$touch"
                             v-model="teamForm.userName" />
                </q-field>
                <q-btn
                        :loading="loadingTeam"
                        color="primary"
                        class="btn-save"
                        @click="saveTeam">
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
                loading: false,
                isSuper: false, //判断是否为超级管理员
                isAdmin: false, //判断是否是管理员
                showUser: false,
                createTeamModal: false,
                loadingTeam: false,
                paginationControl: {rowsPerPage: 0, page: 1},
                user: {},
                columns: [
                    {name: '项目名称', label: '项目名称', field: 'name', align: 'left'}
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
                teamForm: {
                    name: '',
                    userName: ''
                }
            }
        },
        validations: {
            teamForm: {
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
                _this.getTeamList();
            },
            getTeamList () {
                const _this = this;
                _this.$axios.get('/weeklyreportapi/getTeamList').then((res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        _this.tableData = data;
                    }
                }).catch((error) => {
                    _this.handleError(error);
                });
            },
            createTeam () {
                this.createTeamModal = true;
            },
            editProject () {},
            deleteProject () {},
            saveTeam () {
                const _this = this;
                _this.$v.teamForm.$touch();
                _this.teamForm.team = _this.user.team;                
                if (_this.$v.teamForm.$error) {
                    return;
                }
                _this.loadingTeam = true;
                _this.$axios.post('/weeklyreportapi/team/add', _this.teamForm).then((res) => {
                    if (res.data.code === 0) {
                        // _this.getProjectsList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingTeam = false;
                            _this.createTeamModal = false;
                            _this.teamForm.name = '';
                            _this.teamForm.userName = '';
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
                    this.loadingTeam = false;
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
