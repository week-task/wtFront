<template>
    <div class="report-tree">
        <q-tree
            :nodes="report"
            node-key="label" />
    </div>
</template>

<script>

    export default {
        name: 'REPORT',
        data () {
            return {
                report: [
                    {
                        label: 'REPORT TREE',
                        children: [
                            {
                                label: '2018-03-01'
                            },
                            {
                                label: '2018-02-21',
                                disabled: true
                            },
                            {
                                label: '2018-02-14',
                                disabled: true
                            }
                        ]
                    }
                ]
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
    .report-tree {
        position:absolute;
        width:400px;
        height:500px;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
    }
    .btn-login {
        margin-top: 10px;
    }

</style>
