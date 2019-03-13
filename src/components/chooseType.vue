<template>
    <!-- <div class="project">
        <em class="team-title"></em>
        <q-breadcrumbs class="bread" separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="PROJECT" to="/project" />
        </q-breadcrumbs>
    </div> -->
    <div class="choose-type">
        <em>Make a choice</em>
        <!-- <q-card v-for="(item, index) in teamList" inline class="q-ma-sm" :key="index" >
            <q-card-title>
                {{item.name}}
                <span slot="subtitle">负责人：{{item.leader.name}}</span>
            </q-card-title>
            <q-card-actions>
                <q-btn flat color="dark" @click="editTeam(item)">编辑</q-btn>
                <q-btn flat color="light" @click="delTeam(item)">删除</q-btn>
            </q-card-actions>
        </q-card> -->
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    export default {
        name: 'Project',
        data () {
            return {
            }
        },
        validations: {},
        created () {},
        methods: {}
    }
</script>

<style scoped lang="less">
    .project {
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
    .team-title {
        position: absolute;
        top: -88px;
        font-style: normal;
        font-size: 20px;
        font-weight: bold;
    }
    .btn-create {
        /*margin-top: 10px;*/
        position: relative;
        top: -15px;
        // left: 15px;
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
