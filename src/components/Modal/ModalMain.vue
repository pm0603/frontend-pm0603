
<template>
    <div class="modal">
            <div class="modal-background" @click="closeModal"></div>
            <div class="modal-content-md" @click.stop>
                <!-- 로딩 -->
                <div v-show="loading" class="login load">
                    <i class="fa fa-ticket fa-4x loading" aria-hidden="true"></i>
                </div>
                <a role="button" href class="modal-close-btn" aria-label="content" @click.prevent="closeModal">
                    <span class="pe-7s-close" aria-hidden="true"></span>
                </a>
                <div class="modal-header">
                    <h2>로그인</h2>
                    <p v-if="!result_fail">{{main_message}}</p>
                    <p class="result-fail" v-else>{{alert_message}}</p>
                </div>
                <form enctype="multipart/form-data" method="POST" @submit.prevent="doLogin" ref="loginForm">
                <div class="modal-body">
                    <div class="social-login">
                        <p><button type="button" @click.prevent="facebookLogin" >페이스북으로 로그인하기</button></p>
                    </div>
                    <div class="basic-login">
                        <p>
                            <label for="email">email</label>
                            <input  type="text" name="email" placeholder="email" required v-model:email = "email">
                        </p>
                        <p>
                            <label for="password">password</label>
                            <input type="password" name="password" placeholder="password"
                            required v-model:password = "password">
                        </p>
                    </div>
                    <div class="login-detail">
                        <p>
                            이메일로 회원가입하시겠어요?
                            <a href v-on:click.prevent="showSignUpModal">회원가입 하기</a>
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" @click.stop.prevent="doLogin"
                                          @keyup.enter="doLogin">login</button>
                </div>
                </form>
                <a role="button" href class="modal-close-btn" aria-label="content" @click.prevent="closeModal">
                    <span class="pe-7s-close" aria-hidden="true"></span>
                </a>
            </div>
    </div>
</template>
<script>
    import FacebookLogin from './facebookLogin.js';
    export default{
        data(){
            return{
                email           : '',
                password        : '',

                main_message    : '',
                alert_message   : '',
                result_fail     : false,

                user_name       : '',
                user_profile    : '',
                loading         : false
            }
        },
        methods: {
            closeModal(event){
                event.stopPropagation();
                this.$store.commit('setModalStatus',false);
            },
            showSignUpModal(){
                this.$store.commit('setModalStage', 2);
            },
            // 로그인하기
            doLogin(){
                this.loading = true;

                var _this = this;
                let loginData = new FormData(this.$refs.loginForm);

                axios.post('/user/login/', loginData)
                     .then(function(response) {
                        let data = response.data;

                        if( !data.username ){
                            data.username = "회원";
                            data.email    = _this.email;
                        }
                        if( response.status === 200 ){
                            // set user id
                            _this.$store.commit('setUserToken', data.token);

                            window.localStorage.setItem( 'token', data.token );
                            window.localStorage.setItem( 'name',  data.username);
                            window.localStorage.setItem( 'email', data.email);

                            _this.$store.commit('setUserInfo', { 'name': data.username, 'email': data.email });
                            _this.$store.commit('setModalStatus',     false );
                            _this.$store.commit('setUserLoginStatus', true );
                            _this.$store.commit('setMainTitle', data.username );

                            _this.loading = false;

                            _this.$router.push('/');

                        }else if( response.status === 400 ){

                            _this.loading       = false;
                            _this.result_fail   = true;
                            _this.alert_message = '이메일 또는 비밀번호가 올바르지 않습니다.';


                        } else {
                            _this.result_fail   = true;
                            _this.loading       = false;
                            _this.alert_message = '네트워크 에러';
                        }
                    }).catch(function (error) {
                        _this.loading = false;
                        _this.result_fail   = true;
                        _this.alert_message = '다시 로그인을 시도해주세요.';
                    });
            },

            facebookLogin(){

                var _this = this;
                this.loading = true;

                FB.login(function(response){

                    let data = response.authResponse;

                    FB.getLoginStatus(function(response) {
                        if (response.status === 'connected') {
                            FB.api('/me?fields=id,name,email,picture.width(100).height(100).as(picture_small)', function(response) {

                                if ( response !== null ){

                                    let profile  = response.picture_small.data.url;
                                    let userName = response.name;
                                    let email    = response.email;

                                    _this.$store.commit('setUserProfile',  profile);
                                    _this.$store.commit('setUserInfo',  { name   : userName,
                                                                          email  : email,
                                                                          profile: profile });

                                    localStorage.setItem('name', userName);
                                    localStorage.setItem('email', email);
                                    localStorage.setItem('profile', profile);

                                    var userToken = new FormData();
                                    userToken.append('access_token', data.accessToken);

                                    // save token in DB
                                    axios.post('/user/fblogin/', userToken)
                                         .then(function(responseData) {

                                            let db_token = responseData.data;

                                            localStorage.setItem('token',db_token.token);

                                            _this.$store.commit('setModalStatus', false);
                                            _this.$store.commit('setUserLoginStatus', true);
                                            _this.$store.commit('setMainTitle', username );

                                            _this.loading = false;

                                            _this.$router.push({ path: '/'});

                                    }).catch(function(error) {
                                        _this.loading = false;
                                        _this.alert_message = "NetWork Error";

                                    });

                                } else {
                                    _this.$store.commit('setUserLoginStatus', true);
                                    _this.$store.commit('setModalStatus', false);
                                    _this.loading = false;
                                    this.$router.push('/');
                                }
                            });

                        } else if( response.status === 'not_authorized' ){
                            _this.loading = false;
                        }
                    });
                },{scope: 'public_profile,email'});
            }
        }
    }
</script>
