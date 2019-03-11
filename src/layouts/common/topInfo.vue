<template>
    <div>
        <q-alert
            v-if="visibleTopInfoAlert"
            color="positive"
            icon="access_alarm"
            appear
            :actions="[
                { label: '知道了', handler: () => { visibleTopInfoAlert = false } }, 
                { label: '不再提示', handler: () => { this.notShow() } }
            ]"
            class="q-mb-sm top-info"
        >
          {{topInfo}}
        </q-alert>
    </div>
    
</template>

<script>
    
    export default {
        name: 'topinfo',
        props: {
            topInfo: {
                default: '',
                type: String
            }
        },
        data () {
            return {
                visibleTopInfoAlert: true,
            }
        },
        created () {
            this.init();
        },
        mounted () {
            
        },
        methods: {
            init () {
                this.visibleTopInfoAlert = localStorage.getItem('notshow') === '1' ? false : true;
            },
            notShow () {
                window.localStorage.setItem('notshow', '1');
                this.visibleTopInfoAlert = false;
            },
        }
    }
</script>

<style lang="less">
    

</style>
