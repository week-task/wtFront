<template>
    <div class="user">
        <em class="team-title">{{user.teamName}} 用户管理</em>
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="USER" to="/user" />
        </q-breadcrumbs>
        <q-btn icon="add" label="USER" @click="createUser" class="btn-create" />
        <q-list separator>
            <q-collapsible v-for="(item, index) in tableData" open icon="layers" :label="item.team" :key="index">
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
                        <template slot="top-selection" slot-scope="props" :props="props">
                            <q-btn color="positive" flat icon="mode edit" label="编辑" @click="editProject(item.selected)"  />
                            <!-- <q-btn v-if="item.selected[0].status === 1" color="info" flat icon="lock open" label="启用" @click="launchProject(item.selected)" /> -->
                            <q-btn color="negative" flat delete icon="delete" label="离职或删除" @click="deleteProject(item.selected)" />
                        </template>
                    </q-table>
                </div>
            </q-collapsible>
        </q-list>

        <q-modal v-model="createUserModal" @hide="resetForm" :content-css="{padding: '50px', minWidth: '500px'}">
            <div v-if="!isEdit" class="q-display-1 q-mb-md">创建用户</div>
            <div v-if="isEdit" class="q-display-1 q-mb-md">编辑用户</div>
            <div>
                <q-field
                        class="form-field"
                        :error="$v.userForm.name.$error"
                        :error-label="$v.userForm.name.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
                    <q-input float-label="用户名"
                             @input="$v.userForm.name.$touch"
                             v-model="userForm.name" />
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userForm.parent.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="userForm.parent"
                            float-label="小组长"
                            :options="parentOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userForm.status.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="userForm.status"
                            float-label="状态"
                            :options="statusOptions"/>
                </q-field>
                <q-field
                        class="form-field"
                        :error="$v.userForm.role.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-model="userForm.role"
                            float-label="角色"
                            :options="roleOptions"/>
                </q-field>
            </div>
            <q-btn
                    :loading="loadingUser"
                    color="primary"
                    class="btn-save"
                    @click="saveTask">
                保存
                <q-spinner-hourglass slot="loading" size="20px" />
                <span slot="loading">Loading...</span>
            </q-btn>
        </q-modal>

    </div>
</template>

<script>
    import {required, minLength, maxLength} from 'vuelidate/lib/validators';
    export default {
        name: 'User',
        data () {
            return {
                loadingUser: false,
                createUserModal: false,
                paginationControl: {rowsPerPage: 0, page: 1},
                user: {},
                columns: [
                    {name: '用户', label: '用户', field: 'name', align: 'left'},
                    {name: '状态', label: '状态', field: 'statusZh', align: 'center'},
                ],
                userForm: {
                    id: '',
                    name: '',
                    role: 2,
                    status: 0,
                    parent: '',
                    team: ''
                },
                parentOptions: [
                    {label: '骆林佳', value: '1111'},
                    {label: '李茂', value: '2222'},
                    {label: '林国池', value: '3333'}
                ],
                statusOptions: [
                    {label: '在职', value: 0},
                    {label: '离职', value: 1}
                ],
                roleOptions: [
                    {label: '小组长', value: 1},
                    {label: '组员', value: 2}
                ],
                tableData: [{
                    team: '李茂',
                    selected: [],
                    data: [
                        {id: 1, name: '霍金芳', statusZh: '在职'},
                        {id: 2, name: '朱华兵', statusZh: '在职'},
                        {id: 3, name: '陈波', statusZh: '在职'}
                    ]
                }, {
                    team: '骆林佳',
                    selected: [],
                    data: [
                        {id: 1, name: '巧巧', statusZh: '在职'},
                        {id: 2, name: '高宇', statusZh: '在职'},
                        {id: 3, name: '周杨', statusZh: '在职'}
                    ]
                }],
                errMessage: {
                    requireInfo: '必填',
                    maxInfo: '名字不可以超过5个字符'
                }
            }
        },
        validations: {
            userForm: {
                name: {required, maxLength: maxLength(5)},
                parent: {required},
                role: {required},
                status: {required},
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
            },
            createUser () {
                this.createUserModal = true;
            },
            saveUser () {
                const _this = this;
                _this.$v.userForm.$touch();
                _this.userForm.team = _this.user.team;                
                if (_this.$v.userForm.$error) {
                    return;
                }
                _this.loadingUser = true;
                _this.$axios.post(_this.isEdit?'/weeklyreportapi/user/edit':'/weeklyreportapi/user/add', _this.userForm).then((res) => {
                    if (res.data.code === 0) {
                        _this.getProjectList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingUser = false;
                            _this.createProjectModal = false;
                            _this.userForm.name = '';
                        }, 1000);
                    } else {
                        _this.loadingUser = false;
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
        position:absolute;
        width:60%;
        height:50%;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
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