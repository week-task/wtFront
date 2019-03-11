<template>
    <div>
        <em class="team-title">{{user.teamName}} 周报系统</em>
        <q-breadcrumbs separator="●" color="light" active-color="dark" class="navigator">
            <q-breadcrumbs-el label="HOME" to="/" />
            <!--<q-breadcrumbs-el label="Project" to="/project" />-->
        </q-breadcrumbs>
    </div>
    
</template>

<script>
    
    export default {
        name: 'Header',
        data () {
            return {
                
            }
        },
        created () {

        },
        mounted () {
            
        },
        methods: {
           
        }
    }
</script>

<style lang="less">
    

</style>
