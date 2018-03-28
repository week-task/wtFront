<template>
    <div class="user">
        <em class="team-title">{{user.teamName}} 用户管理</em>
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="USER" to="/user" />
        </q-breadcrumbs>
        <q-btn icon="add" label="USER" @click="createUser" class="btn-create" />
        <q-list separator>
            <q-collapsible v-for="(item, index) in tableData" open icon="forum" :label="item.user" :key="index">
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
                            <q-btn color="positive" flat icon="mode edit" label="编辑" @click="editUser(item.selected)"  />
                            <q-btn color="info" flat icon="lock open" label="重置密码" @click="resetPass(item.selected)" />
                            <q-btn color="negative" flat delete icon="delete" label="离职或删除" @click="deleteUser(item.selected)" />
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
                <q-field
                        class="form-field"
                        :error="$v.userForm.parent.$error"
                        :error-label="errMessage.requireInfo">
                    <q-select
                            v-if="userForm.role === 2"
                            v-model="userForm.parent"
                            float-label="小组长"
                            :options="parentOptions"/>
                </q-field>
            </div>
            <q-btn
                    :loading="loadingUser"
                    color="primary"
                    class="btn-save"
                    @click="saveUser">
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
                isEdit: false,
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
                parentOptions: [],
                statusOptions: [
                    {label: '在职', value: 0},
                    {label: '离职', value: 1}
                ],
                roleOptions: [
                    {label: '小组长', value: 1},
                    {label: '组员', value: 2}
                ],
                tableDataMock: [{
                    user: '李茂',
                    selected: [],
                    data: [
                        {id: 1, name: '霍金芳', statusZh: '在职'},
                        {id: 2, name: '朱华兵', statusZh: '在职'},
                        {id: 3, name: '陈波', statusZh: '在职'}
                    ]
                }, {
                    user: '骆林佳',
                    selected: [],
                    data: [
                        {id: 1, name: '巧巧', statusZh: '在职'},
                        {id: 2, name: '高宇', statusZh: '在职'},
                        {id: 3, name: '周杨', statusZh: '在职'}
                    ]
                }],
                tableData: [{
                    project: '暂无数据',
                    selected: [],
                    data: []
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
                parent: {},
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
                _this.getUserList();
            },
            getParentList () {
                const _this = this;
                // 获取role=1的小组长角色
                _this.$axios.post('/weeklyreportapi/getUserList', {type: 'options', team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        _this.parentOptions = [];
                        for (let i = 0, size = res.data.data.length; i < size; i++) {
                            let item = res.data.data[i];
                            _this.parentOptions.push({
                                label: item.name,
                                value: item._id
                            })
                        }
                    } 
                }).catch((error)=>{
                    _this.handleError(error);
                });
            },
            getUserList () {
                const _this = this;
                // 获取所有属于该team下的users
                _this.$axios.post('/weeklyreportapi/getUserList', {type: 'all', team: _this.user.team}).then((res) => {
                    if (res.data.code === 0) {
                        if (res.data.data.length > 0) {
                            _this.tableData = res.data.data;
                            console.log(res.data.data);
                        } else if (res.data.data.length === 0) {
                            _this.tableData = [{
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
            createUser () {
                this.createUserModal = true;
                this.getParentList();
            },
            editUser (props) {
                const _this = this;
                _this.isEdit = true;
                _this.createUserModal = true;
                _this.getParentList();
                // console.log('props ', props);
                _this.userForm.id = props[0].id;
                _this.userForm.name = props[0].name;
                _this.userForm.role = props[0].role;
                _this.userForm.status = props[0].status;
                _this.userForm.parent = props[0].parent;
                _this.userForm.team = props[0].team;
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
                        _this.getUserList();
                        _this.$q.notify({
                            message: res.data.message,
                            timeout: 3000,
                            type: 'positive',
                            position: 'top'
                        });
                        setTimeout(()=>{
                            _this.loadingUser = false;
                            _this.createUserModal = false;
                            _this.isEdit = false;
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
            deleteUser (props) {
                const _this = this;
                _this.$q.dialog({
                    title: '确认',
                    message: '确认删除该用户吗?',
                    ok: '删除',
                    cancel: '再考虑考虑'
                }).then(() => {
                    _this.$axios.post('/weeklyreportapi/user/delete', {
                        id: props[0].id
                    }).then((res) => {
                        if (res.data.code === 0) {
                            _this.getUserList();
                            _this.$q.notify({
                                message: '已删除,这下真没了!',
                                timeout: 3000,
                                type: 'positive',
                                position: 'top'
                            });
                        }
                    }).catch((error)=>{
                        _this.handleError(error);
                        _this.getUserList();
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
            resetPass (props) {
                const _this = this;
                _this.$q.dialog({
                    title: '确认',
                    message: '确认重置该用户密码吗?',
                    ok: '重置',
                    cancel: '再考虑考虑'
                }).then(() => {
                    _this.$axios.post('/weeklyreportapi/user/resetpass', {
                        id: props[0].id
                    }).then((res) => {
                        if (res.data.code === 0) {
                            _this.$q.notify({
                                message: res.data.message,
                                timeout: 3000,
                                type: 'positive',
                                position: 'top'
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
                });
            },
            resetForm () {
                const _this = this;
                _this.userForm.id = '';
                _this.userForm.name = '';
                _this.userForm.role = 2;
                _this.userForm.status = 0;
                _this.userForm.parent = '';
                _this.userForm.team = '';
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