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
    export default {
        name: 'Project',
        data () {
            return {
                createProjectModal: false,
                loadingProject: false,
                columns: [
                    {name: '项目名称', label: '项目名称', field: 'name', align: 'left'}
                ],
                tableData: [{
                    team: '大数据团队',
                    selected: [],
                    data: [
                        {id: 1, name: '大数据项目1'},
                        {id: 2, name: '大数据项目2'},
                        {id: 3, name: '大数据项目3'}
                    ]
                }],
                projectForm: {
                    name: ''
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
        },
        methods: {
            createProject () {
                this.createProjectModal = true;
            },
            editProject () {},
            deleteProject () {},
            saveProject () {},
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
