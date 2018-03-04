<template>
    <div class="show-tip-base">

    </div>
</template>
<script>
    export default {
        data() {
            return {}
        },
        methods: {
            initDialog (error) {
                this.$q.dialog({
                    title: error.response.status,
                    message: error.response ? (error.response ? error.response.data : error.response) : error
                });
            }
        }
    }
</script>
<style lang="less">

</style>