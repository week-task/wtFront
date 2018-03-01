<template>
    <div>
        LOGIN
        <q-input v-model="loginParams.username" float-label="username" />
        <q-input v-model="loginParams.password" type="password" float-label="password" />

        <q-btn
            :loading="loading"
            color="primary"
            @click="login">
            Login
            <q-spinner-hourglass slot="loading" size="20px" />
            <span slot="loading">Loading...</span>
        </q-btn>
    </div>
</template>

<script>

    export default {
        name: 'Login',
        data () {
            return {
                loginParams: {
                    username: '',
                    password: ''
                },
                loading: false
            }
        },
        created () {
//            this.getInitData();
        },
        methods: {
            login () {
                this.loading = true;
                // we simulate a delay here:
                setTimeout(() => {
                    this.loading = false;
                }, 3000);
            }
        }
    }
</script>

<style>
</style>
