<template>
    <div class="user">
        <slot name="headerTop">
            <HeaderTop :navList="navList" :funName="funName" :teamName="user.teamName"></HeaderTop>
        </slot>

        <slot name="footerTop">
            <FooterTop></FooterTop>
        </slot>

    </div>
</template>

<script>
    import {required, minLength, maxLength} from 'vuelidate/lib/validators';
    import {date} from 'quasar';
    import HeaderTop from '../common/header';
    import FooterTop from '../common/footer';
    export default {
        name: 'Leave',
        data () {
            return {
                navList: [{
                    label: 'HOME', toLink: '/console'
                },{
                    label: 'LEAVE', toLink: '/leave'
                }],
                funName: '项目经理周报',
                
                errMessage: {
                    requireInfo: '必填',
                    maxInfo: '文本长度 < 512'
                }
            }
        },
        validations: {
            mtaskForm: {
                info: {required, maxLength: maxLength(512)}
            }
        },
        components: {HeaderTop, FooterTop},
        created () {
            this.init();
        },
        watch: {
            select: function () {
                this.weekOfYear = this.select;
                this.getMtaskList();
            },
            selectYear: function() {
                this.renderPeriods();
            }
        },
        methods: {
            init () {
                const _this = this;
                _this.user = JSON.parse(localStorage.getItem('user'));
                _this.isAdmin = _this.user.role === 0;
                _this.renderPeriods();
                // _this.getMtaskList();
            },
            
            resetForm () {
                const _this = this;
                _this.mtaskForm.id = '';
                _this.mtaskForm.info = '';
            },
            handleError (error) {
                let isExpired = error.response.data.error === 'jwt expired';
                if (error.response.status !== 500) {
                    this.$q.notify({
                        message: isExpired ? 'token已过期,重新登录' : error.response.data.error,
                        timeout: 3000,
                        type: 'negative',
                        position: 'top',
                        actions: isExpired ? [{
                            label: '登录',
                            handler: () => {
                                this.$router.push('/login');
                            }
                        }] : null
                    });

                    if (isExpired) {
                        setTimeout(()=> {
                            this.$router.push('/login');
                        }, 1000);
                    }
                } else {
                    this.loading = false;
                    this.loadingMtask = false;
                    this.$q.dialog({
                        title: error.response.status + '',
                        message: error.response.data.message
                    });
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .user {
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
    .report-tree-select {
        position: relative;
        // right: 0;
        height: 35px;
        top: -10px;
        // margin: 0;
        .select-right {
            margin-right: 10px;
            float: left;
            // display: inline-block;
            // width: 300px;
        }
    }
    .team-title {
        position: absolute;
        top: -88px;
        font-style: normal;
        font-size: 20px;
        font-weight: bold;
    }
    .form-field {
        margin: 12px 0;
    }
    .btn-create {
        position: relative;
    }
    .q-table-container {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
    .task-table {
        border: none;
    }
</style>
<style lang="less">
    // .q-table-top {
    //     position: absolute;
    //     top: -45px;
    //     right: 50px;
    //     min-height: 0;
    //     padding: 0;
    // }
</style>