<template>
    <div class="parent-login">
        <div class="login">
            DASHBOARD

        </div>

    </div>
</template>

<script>

    export default {
        name: 'Dashboard',
        data () {
            return {

            }
        },
        created () {
//            this.getInitData();
        },
        methods: {

        }
    }
</script>

<style lang="less">
    .login {
        position:absolute;
        width:200px;
        height:300px;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .btn-login {
        margin-top: 10px;
    }

</style>
