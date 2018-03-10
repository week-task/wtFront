<template>
    <div class="project">
        <q-breadcrumbs separator="●" color="light" active-color="dark">
            <q-breadcrumbs-el label="HOME" to="/" />
            <q-breadcrumbs-el label="PROJECT" to="/project" />
        </q-breadcrumbs>
    </div>
</template>

<script>
    import {required, minLength} from 'vuelidate/lib/validators';
    export default {
        name: 'Login',
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
    .project {
        position:absolute;
        width:60%;
        height:50%;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .btn-login {
        margin-top: 10px;
    }

</style>
