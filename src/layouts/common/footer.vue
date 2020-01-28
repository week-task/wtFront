<template>
    <div class="footer">
        Copyright©2012-{{currentDate}} 骆林佳所有&nbsp;<a target="_blank" href="http://beian.miit.gov.cn">渝ICP备20000169号</a>
    </div>
    
</template>

<script>
    import {date} from 'quasar';
    export default {
        name: 'Footer',
        data () {
            return {
                currentDate: date.formatDate(Date.now(), 'YYYY')
            }
        },
        validations: {
            
        },
        created () {
            // this.additionalFields
        },
        mounted () {
            
        },
        methods: {
            
        }
    }
</script>

<style lang="less">
    .footer {
        color: #bdbdbd;
        margin-top: 8px;
        margin-bottom: 20px;
        font-size: 12px;
        a {
            color: #bdbdbd;
            text-decoration-line: none;
            &:hover {
                color: #333;
            }
        }
    }

</style>
