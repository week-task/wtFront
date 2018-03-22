<template>
    <div class="user">
        <q-breadcrumbs separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="USER" to="/user" />
        </q-breadcrumbs>
        <p>
            USER功能完善中。。。
        </p>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    export default {
        name: 'User',
        data () {
            return {
            }
        },
        validations: {
        },
        created () {
////            this.getInitData();
//            const _this = this;
//            document.onkeyup = (e) => {
//                if (window.event.keyCode === 13) _this.login();
//            }
        },
        methods: {
        }
    }
</script>

<style lang="less">
    .user {
        position:absolute;
        width:60%;
        height:50%;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .btn-login {
        // margin-top: 10px;
    }
</style>