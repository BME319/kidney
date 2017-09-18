angular.module('zy.controllers', ['ionic', 'kidney.services'])
// 登录-zy,zxf
.controller('SignInCtrl', ['$ionicLoading', 'User', '$scope', '$timeout', '$state', 'Storage', 'loginFactory', '$ionicHistory', '$sce', 'Doctor', 'Patient', '$rootScope', 'notify', '$interval', 'socket', 'Mywechat', 'mySocket', function ($ionicLoading, User, $scope, $timeout, $state, Storage, loginFactory, $ionicHistory, $sce, Doctor, Patient, $rootScope, notify, $interval, socket, Mywechat, mySocket) {
  $scope.barwidth = 'width:0%'
  // $scope.navigation_login = $sce.trustAsResourceUrl('http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx')
  if (Storage.get('USERNAME') != null && Storage.get('USERNAME') != undefined) {
    $scope.logOn = {username: Storage.get('USERNAME'), password: ''}
  } else {
    $scope.logOn = {username: '', password: ''}
  }

  if (Storage.get('doctorunionid') != undefined && Storage.get('bindingsucc') == 'yes') {
    User.logIn({username: Storage.get('doctorunionid'), password: '112233', role: 'doctor'}).then(function (data) {
      if (data.results.mesg == 'login success!') {
        Storage.set('isSignIn', true)
        Storage.set('UID', data.results.userId)// 后续页面必要uid
        Storage.set('bindingsucc', 'yes')
        Storage.set('TOKEN', data.results.token)
        Storage.set('refreshToken', data.results.refreshToken)
        Storage.set('reviewStatus', data.results.reviewStatus)
        Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
          thisDoctor = response.results
          mySocket.newUser(response.results.userId)
            // $interval(function newuser(){
            //     socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId, client:'app'});
            //     return newuser;
            // }(),10000);
        }, function (err) {
          thisDoctor = null
        })
        $ionicHistory.clearCache()
        $ionicHistory.clearHistory()
        $state.go('tab.workplace')
      }
    })
  } else if (Storage.get('USERNAME') != null && Storage.get('USERNAME') != undefined && Storage.get('password') != null && Storage.get('password') != undefined) {
    /**
     * [输入账号密码写定角色登录]
     * @Author   ZY
     * @DateTime 2017-07-04
     * @param    username(账号：现为手机号):string; password: string; role: string
     * @return   data.results.mesg(反馈登录状态信息)
     */
    User.logIn({username: Storage.get('USERNAME'), password: Storage.get('password'), role: 'doctor'}).then(function (data) {
      if (data.results.mesg == 'login success!') {
        $ionicHistory.clearCache()
        $ionicHistory.clearHistory()
        Storage.set('isSignIn', true)
        Storage.set('UID', data.results.userId)// 后续页面必要uid
        // Storage.set('bindingsucc','yes')
        Storage.set('TOKEN', data.results.token)
        Storage.set('refreshToken', data.results.refreshToken)
        Storage.set('reviewStatus', data.results.reviewStatus)
        Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
          thisDoctor = response.results
          mySocket.newUser(response.results.userId)
        }, function (err) {
          thisDoctor = null
        })
        Storage.set('USERNAME', Storage.get('USERNAME'))
        // alert(Storage.get('UID')+Storage.get('USERNAME'))
        /**
         * [登录成功跳转到首页]
         * @Author   ZY
         * @DateTime 2017-07-04
         * @return   跳转到首页
         */
        $timeout(function () { $state.go('tab.workplace') }, 500)
      }
    })
  }

  /**
   * [点击登录进行一系列登录成功失败判断]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @param    logOn(登录时的输入信息):object
   * @return   登录判断
   */
  $scope.signIn = function (logOn) {
    $scope.logStatus = ''
    if ((logOn.username != '') && (logOn.password != '')) {
      var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            // 手机正则表达式验证
      if (!phoneReg.test(logOn.username)) {
        $scope.logStatus = '手机号验证失败！'
      } else {
        var logPromise = User.logIn({username: logOn.username, password: logOn.password, role: 'doctor'})
        /**
         * [输入账号密码写定角色登录]
         * @Author   ZY
         * @DateTime 2017-07-04
         * @param    username(账号：现为手机号):string; password: string; role: string
         * @return   data.results(results为1是登录失败)；data.results.mesg(mesg为'login success!'是登录成功)
         */
        logPromise.then(function (data) {
          if (data.results == 1) {
            if (data.mesg == "Alluser doesn't Exist!") {
              $scope.logStatus = '账号不存在！'
            } else if (data.mesg == "Alluser password isn't correct!") {
              $scope.logStatus = '账号或密码错误！'
            }
          } else if (data.results.mesg == 'login success!') {
            Storage.set('password', logOn.password)
            Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
              thisDoctor = response.results
              mySocket.newUser(response.results.userId)
            }, function (err) {
              thisDoctor = null
            })
            $scope.logStatus = '登录成功！'
            $ionicHistory.clearCache()
            $ionicHistory.clearHistory()
            Storage.set('USERNAME', $scope.logOn.username)
            Storage.set('TOKEN', data.results.token)
            Storage.set('refreshToken', data.results.refreshToken)
            Storage.set('reviewStatus', data.results.reviewStatus)
            Storage.set('isSignIn', true)
            Storage.set('UID', data.results.userId)
            /**
             * [获取签署协议状态]
             * @Author   ZY
             * @DateTime 2017-07-04
             * @param    userId:string
             * @return   res.results.agreement(agreement是0表示已签署跳转到首页;否则是未签署跳转到签署协议页)
             */
            User.getAgree({userId: data.results.userId}).then(function (res) {
              if (res.results.agreement == '0') {
                $timeout(function () { $state.go('tab.workplace') }, 500)
              } else {
                $timeout(function () { $state.go('agreement', {last: 'signin'}) }, 500)
              }
            }, function (err) {
              console.log(err)
            })
          }
        }, function (err) {
          if (err.results == null && err.status == 0) {
            $scope.logStatus = '网络错误！'
            return
          }
          if (err.status == 404) {
            $scope.logStatus = '连接服务器失败！'
          }
        })
      }
    } else {
      $scope.logStatus = '请输入完整信息！'
    }
  }
  var ionicLoadingshow = function () {
    $ionicLoading.show({
      template: '登录中...'
    })
  }
  var ionicLoadinghide = function () {
    $ionicLoading.hide()
  }
  /**
   * [点击注册跳转到手机验证]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @return   设置由注册跳转的话validMode为0
   */
  $scope.toRegister = function () {
    console.log($state)
    Storage.set('validMode', 0)// 注册
    $state.go('phonevalid')
  }
  /**
   * [点击忘记密码跳转到手机验证]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @return   设置由忘记密码跳转的话validMode为1
   */
  $scope.toReset = function () {
    Storage.set('validMode', 1)// 修改密码
    $state.go('phonevalid')
  }

    // if(Storage.get('doctorunionid')!=undefined&&Storage.get('bindingsucc')=='yes'){
    //     User.logIn({username:Storage.get('doctorunionid'),password:"112233",role:"doctor"}).then(function(data){
    //       if(data.results.mesg=="login success!"){
    //         Storage.set('isSignIn',"Yes");
    //         Storage.set('UID',data.results.userId);//后续页面必要uid
    //         Storage.set('bindingsucc','yes')
    //         Doctor.getDoctorInfo({userId:data.results.userId})
    //         .then(function(response){
    //             thisDoctor = response.results;
    //             $interval(function newuser(){
    //                 socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId });
    //                 return newuser;
    //             }(),10000);

    //         },function(err){
    //             thisDoctor=null;
    //         });
    //         $state.go('tab.home')
    //       }
    //     })
    // }
    // 0531
  $scope.wxsignIn = function () {
    /* Wechat.isInstalled(function (installed) {
        alert("Wechat installed: " + (installed ? "Yes" : "No"));
    }, function (reason) {
        alert("Failed: " + reason);
    }); */
    // 先判断localstorage是否有unionid
    // if(Storage.get('doctorunionid')!=undefined&&Storage.get('bindingsucc')=='yes'){
    //     User.logIn({username:Storage.get('doctorunionid'),password:"112233",role:"doctor"}).then(function(data){
    //       if(data.results.mesg=="login success!"){
    //         Storage.set('isSignIn',"Yes");
    //         Storage.set('UID',ret.UserId);//后续页面必要uid
    //         Storage.set('bindingsucc','yes')
    //         User.getUserIDbyOpenId({"openId":Storage.get('doctorunionid')}).then(function(ret){
    //             Storage.set('USERNAME',ret.phoneNo)
    //             $timeout(function(){$state.go('tab.home');},500);
    //         })
    //         Doctor.getDoctorInfo({userId:data.results.userId})
    //         .then(function(response){
    //             thisDoctor = response.results;
    //             $interval(function newuser(){
    //                 socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId });
    //                 return newuser;
    //             }(),10000);

    //         },function(err){
    //             thisDoctor=null;
    //         });
    //       }
    //     })
    // }
    // if(1==2){
    var wxscope = 'snsapi_userinfo',
      wxstate = '_' + (+new Date())
    Wechat.auth(wxscope, wxstate, function (response) {
      // you may use response.code to get the access token.
      // alert(JSON.stringify(response));
      // alert(response.code)
      Mywechat.getUserInfo({role: 'appDoctor', code: response.code, state: ''}).then(function (persondata) {
        // alert(JSON.stringify(persondata))
        // alert(persondata.headimgurl)
        Storage.set('wechatheadimgurl', persondata.results.headimgurl)
        $scope.unionid = persondata.results.unionid
        Storage.set('messageOpenId', persondata.results.openid)
        // alert($scope.unionid)
        User.getUserId({username: $scope.unionid}).then(function (ret) {
          // alert(JSON.stringify(ret))
          // 用户已经存在id 说明公众号注册过
          if (ret.results == 0 && ret.roles.indexOf('doctor') != -1) { // 直接登录
            // 将用户的微信头像存在用户表中，如果用户没有头像存，有则不修改
            if (Storage.get('wechatheadimgurl')) {
              // alert("image"+ret.AlluserId+Storage.get('wechatheadimgurl'));
              Patient.replacePhoto({patientId: ret.AlluserId, wechatPhotoUrl: Storage.get('wechatheadimgurl')}).then(function (data) {
                // alert(JSON.stringify(data))
                Storage.rm('wechatheadimgurl')
              }, function (err) {
                // alert('imageerror'+JSON.stringify(err))
                console.log(err)
              })
            }
            ionicLoadingshow()
            // alert(1)
            User.logIn({username: $scope.unionid, password: '112233', role: 'doctor'}).then(function (data) {
              // alert(JSON.stringify(data))

              if (data.results.mesg == 'login success!') {
                // alert(2)
                Storage.set('isSignIn', 'Yes')
                Storage.set('UID', data.results.userId)// 后续页面必要uid
                Storage.set('TOKEN', data.results.token)
                Storage.set('refreshToken', data.results.refreshToken)
                Storage.set('reviewStatus', data.results.reviewStatus)
                Storage.set('doctorunionid', $scope.unionid)// 自动登录使用
                Storage.set('bindingsucc', 'yes')
                Storage.set('USERNAME', ret.phoneNo)
                $timeout(function () {
                  ionicLoadinghide()
                  $state.go('tab.workplace')
                }, 500)
                Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
                  thisDoctor = response.results
                  mySocket.newUser(response.results.userId)
                }, function (err) {
                  thisDoctor = null
                })
              }
            })
          } else {
            // alert(3)
            Storage.set('doctorunionid', $scope.unionid)// 自动登录使用
            $state.go('phonevalid', {last: 'wechatsignin'})
          }
        })
        // {
        //   "openid":"OPENID",
        //   "nickname":"NICKNAME",
        //   "sex":1,
        //   "province":"PROVINCE",
        //   "city":"CITY",
        //   "country":"COUNTRY",
        //   "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
        //   "privilege":[
        //   "PRIVILEGE1",
        //   "PRIVILEGE2"
        //   ],
        //   "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
        //   }
      })
        // // 将code传个后台服务器 获取unionid
        // Mywechat.gettokenbycode({role:"appDoctor",code:response.code}).then(function(res){
        //     // alert(JSON.stringify(res));
        //   // {
        //   // "access_token":"ACCESS_TOKEN",
        //   // "expires_in":7200,
        //   // "refresh_token":"REFRESH_TOKEN",
        //   // "openid":"OPENID",
        //   // "scope":"SCOPE",
        //   // "unionid":"o6_bmasdasdsad6_2sgVt7hMZOPfL"
        //   // }
        //   $scope.unionid=res.result.unionid;
        //   // alert($scope.unionid)
        //   //判断这个unionid是否已经绑定用户了 有直接登录

        // },function(err){
        //   alert(JSON.stringify(err));
        // })
    }, function (reason) {
      alert('Failed: ' + reason)
    })
  }
}])

// 手机号码验证-zy,zxf

.controller('phonevalidCtrl', ['$scope', '$state', '$interval', '$stateParams', 'Storage', 'User', 'Patient', 'Doctor', 'mySocket', '$timeout', '$ionicLoading', function ($scope, $state, $interval, $stateParams, Storage, User, Patient, Doctor, mySocket, $timeout, $ionicLoading) {
  $scope.barwidth = 'width:0%'
  $scope.Verify = {Phone: '', Code: ''}
  $scope.veritext = '获取验证码'
  $scope.isable = false
  $scope.hasimport = false
  var validMode = Storage.get('validMode')// 0->set;1->reset
  // 60s后重新获取验证码
  var unablebutton = function () {
     // 验证码BUTTON效果
    $scope.isable = true
        // console.log($scope.isable)
    $scope.veritext = '60S再次发送'
    var time = 59
    var timer
    timer = $interval(function () {
      if (time == 0) {
        $interval.cancel(timer)
        timer = undefined
        $scope.veritext = '获取验证码'
        $scope.isable = false
      } else {
        $scope.veritext = time + 'S再次发送'
        time--
      }
    }, 1000)
  }

  /**
   * [点击获取验证码]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @param    Verify(手机验证时用户的输入):object
   * @return   验证码发送情况
   */
  $scope.getcode = function (Verify) {
    $scope.logStatus = ''

    if (Verify.Phone == '') {
      $scope.logStatus = '手机号码不能为空！'
      return
    }
    var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
    // 手机正则表达式验证
    if (!phoneReg.test(Verify.Phone)) {
      $scope.logStatus = '请输入正确的手机号码！'
    } else// 通过基本验证-正确的手机号
    {
      console.log(Verify.Phone)
      Storage.set('RegisterNO', $scope.Verify.Phone)
      Storage.set('USERNAME', $scope.Verify.Phone)
      // 验证手机号是否注册，没有注册的手机号不允许重置密码
      /**
       * [获取用户id]
       * @Author   ZY
       * @DateTime 2017-07-04
       * @param    username(手机号):string
       * @return   succ.mesg(根据返回信息判断该用户是否已存在)
       */
      User.getUserId({
        username: Verify.Phone
      }).then(function (succ) {
        console.log(succ)
        if ($stateParams.last == 'wechatsignin') {
          if (succ.mesg == "Alluser doesn't Exist!") {
            /**
             * [发送验证码]
             * @Author   ZY
             * @DateTime 2017-07-04
             * @param    mobile: string; smsType(2是医生端): number
             * @return   data.mesg(验证码发送情况)
             */
            User.sendSMS({
              mobile: Verify.Phone,
              smsType: 2
            }).then(function (data) {
              unablebutton()
              if (data.mesg.substr(0, 8) == '您的邀请码已发送') {
                $scope.logStatus = '您的验证码已发送，重新获取请稍后'
              } else if (data.results == 1) {
                $scope.logStatus = '验证码发送失败，请稍后再试'
              } else {
                $scope.logStatus = '验证码发送成功！'
              }
            }, function (err) {
              $scope.logStatus = '验证码发送失败！'
            })
          } else {
            Storage.set('UID', succ.AlluserId)
            if (succ.roles.indexOf('doctor') != -1) {
              // $scope.logStatus = '您已经注册，请输入正确的验证码完成绑定'
              $scope.haveExist = true
            }
            User.sendSMS({
              mobile: Verify.Phone,
              smsType: 2
            }).then(function (data) {
              unablebutton()
              if (data.mesg.substr(0, 8) == '您的邀请码已发送') {
                $scope.logStatus = '您的验证码已发送，重新获取请稍后'
              } else if (data.results == 1) {
                $scope.logStatus = '验证码发送失败，请稍后再试'
              } else {
                $scope.logStatus = '验证码发送成功！'
              }
            }, function (err) {
              $scope.logStatus = '验证码发送失败！'
            })
          }
        } else if (validMode == 0) {
          if (succ.mesg == "Alluser doesn't Exist!") {
            User.sendSMS({
              mobile: Verify.Phone,
              smsType: 2
            }).then(function (data) {
              unablebutton()
              if (data.mesg.substr(0, 8) == '您的邀请码已发送') {
                $scope.logStatus = '您的验证码已发送，重新获取请稍后'
              } else if (data.results == 1) {
                $scope.logStatus = '验证码发送失败，请稍后再试'
              } else {
                $scope.logStatus = '验证码发送成功！'
              }
            }, function (err) {
              $scope.logStatus = '验证码发送失败！'
            })
          } else {
            if (succ.roles.indexOf('doctor') != -1) {
              $scope.logStatus = '您已经注册过了'
            } else {
              User.sendSMS({
                mobile: Verify.Phone,
                smsType: 2
              }).then(function (data) {
                unablebutton()
                if (data.mesg.substr(0, 8) == '您的邀请码已发送') {
                  $scope.logStatus = '您的验证码已发送，重新获取请稍后'
                } else if (data.results == 1) {
                  $scope.logStatus = '验证码发送失败，请稍后再试'
                } else {
                  $scope.logStatus = '验证码发送成功！'
                }
              }, function (err) {
                $scope.logStatus = '验证码发送失败！'
              })
            }
          }
        } else if (validMode == 1 && succ.mesg == "Alluser doesn't Exist!") {
          $scope.logStatus = '您还没有注册呢！'
        } else {
          User.sendSMS({
            mobile: Verify.Phone,
            smsType: 2
          }).then(function (data) {
            unablebutton()
            if (data.mesg.substr(0, 8) == '您的邀请码已发送') {
              $scope.logStatus = '您的验证码已发送，重新获取请稍后'
            } else if (data.results == 1) {
              $scope.logStatus = '验证码发送失败，请稍后再试'
            } else {
              $scope.logStatus = '验证码发送成功！'
            }
          }, function (err) {
            $scope.logStatus = '验证码发送失败！'
          })
        }
      }, function (err) {
        console.log(err)
        $scope.logStatus = '网络错误！'
      })
    }
  }

  /**
   * [判断验证码和手机号是否正确]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @param    Verify(手机验证时用户的输入): object
   * @return   手机号和验证码正确跳转到下一步
   */
  $scope.gotoReset = function (Verify) {
    $scope.logStatus = ''
    if (Verify.Phone != '' && Verify.Code != '') {
      var tempVerify = 123
      // 结果分为三种：(手机号验证失败)1验证成功；2验证码错误；3连接超时，验证失败
      var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      // 手机正则表达式验证
      if (phoneReg.test(Verify.Phone)) {
        // 测试用
        // if(Verify.Code==123456){
        //     $scope.logStatus = "验证成功";
        //     Storage.set('phoneNumber',Verify.Phone);
        //     if(validMode == 0){
        //         $timeout(function(){$state.go('agreement',{last:'register'});},500);
        //     }else{
        //        $timeout(function(){$state.go('setpassword')});
        //     }

        // }else{$scope.logStatus = "验证码错误";}

        /**
         * [验证手机号和验证码]
         * @Author   ZY
         * @DateTime 2017-07-04
         * @param    mobile: string; smsType(2是医生端): number; smsCode(验证码)
         * @return   succ.results(0是验证成功)
         */
        User.verifySMS({
          mobile: Verify.Phone,
          smsType: 2,
          smsCode: Verify.Code
        }).then(function (succ) {
          console.log(succ)
          // 验证成功
          if (succ.results == 0) {
            $scope.logStatus = '验证成功！'
            Storage.set('phoneNumber', Verify.Phone)
            if ($stateParams.last == 'wechatsignin') {
              // alert(Storage.get('phoneNumber') + '已同意 未绑定 ')
              if ($scope.haveExist) { // 已经存在该用户，可能是app注册未绑定微信用户或者导入老用户
                // alert(JSON.stringify(succ) + '验证成功 未绑定或老用户')
                User.getAgree({userId: Storage.get('UID')}).then(function (data) {
                  if (data.results != null && data.results.agreement == '0') {   // 已通过协议为已注册用户
                    // alert(JSON.stringify(data) + '已同意 未绑定 ')
                    // 将用户的微信头像存在用户表中，如果用户没有头像存，有则不修改
                    Patient.replacePhoto({patientId: Storage.get('UID'), wechatPhotoUrl: Storage.get('wechatheadimgurl')}).then(function (suc) {
                      // alert(JSON.stringify(suc))
                      Storage.rm('wechatheadimgurl')
                    }, function (err) {
                      // alert('imageerror'+JSON.stringify(err))
                      console.log(err)
                    })
                    User.setMessageOpenId({type: 3, openId: Storage.get('messageOpenId'), userId: Storage.get('UID')}).then(function (succ) { // type1医生，2患者
                      // console.log(succ)
                    }, function (err) {
                      console.log(err)
                    })
                    User.setOpenId({phoneNo: Storage.get('phoneNumber'), openId: Storage.get('doctorunionid')}).then(function (succ) {
                      Storage.set('bindingsucc', 'yes')
                      // alert(JSON.stringify(succ) + '绑定好')
                      // $ionicLoading.show({
                      //   template: '登录中...'
                      // })
                      // alert('unionid：' + $scope.unionid)
                      // alert(Storage.get('doctorunionid'))
                      User.logIn({username: Storage.get('doctorunionid'), password: '112233', role: 'doctor'}).then(function (data) {
                        // alert(JSON.stringify(data))
                        if (data.results.mesg == 'login success!') {
                          // alert(JSON.stringify(data) + '登录去首页')
                          Storage.set('isSignIn', 'Yes')
                          Storage.set('UID', data.results.userId)// 后续页面必要uid
                          Storage.set('TOKEN', data.results.token)
                          Storage.set('refreshToken', data.results.refreshToken)
                          Storage.set('reviewStatus', data.results.reviewStatus)
                          // Storage.set('doctorunionid', Storage.get('doctorunionid'))// 自动登录使用
                          Storage.set('bindingsucc', 'yes')
                          Storage.set('USERNAME', Verify.Phone)
                          $timeout(function () {
                            // $ionicLoading.hide()
                            $state.go('tab.workplace')
                          }, 500)
                          Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
                            thisDoctor = response.results
                            mySocket.newUser(response.results.userId)
                          }, function (err) {
                            thisDoctor = null
                          })
                        }
                      })
                    })

                    // alert(1)
                  } else { // 导入用户
                    // alert(JSON.stringify(data) + '未同意 导入用户 ')
                    $timeout(function () { $state.go('agreement', {last: 'wechatimport'}) }, 500)
                  }
                }, function (err) {
                  console.log(err)
                })
              } else {
                // alert(JSON.stringify(succ) + '不存在 微信注册')
                $timeout(function () { $state.go('agreement', {last: 'wechatsignin'}) }, 500)
              }
            } else if (validMode == 0) {
              // 由注册跳转的手机验证下一步是签署协议
              $timeout(function () { $state.go('agreement', {last: 'register'}) }, 500)
            } else {
              // 由忘记密码跳转的手机验证下一步是设置密码
              $timeout(function () { $state.go('setpassword') })
            }
          } else {
            $scope.logStatus = '请输入正确的验证码！'
          }
        }, function (err) {
          console.log(err)
          $scope.logStatus = '网络错误！'
        })
      } else { $scope.logStatus = '手机号验证失败！' }
    } else { $scope.logStatus = '请输入完整信息！' }
  }
}])

// 签署协议（0为签署）-zy
.controller('AgreeCtrl', ['User', 'Patient', 'Doctor', 'mySocket', '$stateParams', '$scope', '$timeout', '$state', 'Storage', '$ionicHistory', '$http', 'Data', '$ionicPopup', 'Camera', 'CONFIG', function (User, Patient, Doctor, mySocket, $stateParams, $scope, $timeout, $state, Storage, $ionicHistory, $http, Data, $ionicPopup, Camera, CONFIG) {
  /**
   * [签署协议]
   * @Author   ZY
   * @DateTime 2017-07-04
   */
  $scope.YesIdo = function () {
    console.log('yesido')
    if ($stateParams.last == 'wechatimport') {
      /**
       * [更新协议签署状态为签署]
       * @Author   ZY
       * @DateTime 2017-07-04
       * @param    userId: string; agreement(0为签署): string
       * @return   同意签署协议
       */
      User.updateAgree({userId: Storage.get('UID'), agreement: '0'}).then(function (data) {
        if (data.results != null) {
          User.setMessageOpenId({type: 3, openId: Storage.get('messageOpenId'), userId: Storage.get('UID')}).then(function (succ) { // type1doctorWechat，2patientWechat，3doctorApp，4patientApp
            // console.log(succ)
          }, function (err) {
            console.log(err)
          })
          User.setOpenId({phoneNo: Storage.get('phoneNumber'), openId: Storage.get('doctorunionid')}).then(function (response) {
            Storage.set('bindingsucc', 'yes')
          })
          // 将用户的微信头像存在用户表中，如果用户没有头像存，有则不修改
          Patient.replacePhoto({'patientId': Storage.get('UID'), 'wechatPhotoUrl': Storage.get('wechatheadimgurl')}).then(function (data) {
            // alert(JSON.stringify(data))
            Storage.rm('wechatheadimgurl')
          }, function (err) {
            // alert('imageerror'+JSON.stringify(err))
            console.log(err)
          })
          // // var photo_upload_display = function(imgURI){
          // // 给照片的名字加上时间戳
          //     var temp_photoaddress = Storage.get("UID") + "_" +  "doctor.photoUrl.jpg";
          //     // console.log(temp_photoaddress)
          //     Camera.uploadPicture(Storage.get('wechatheadimgurl'), temp_photoaddress)
          //     .then(function(res){
          //         var data=angular.fromJson(res)
          //         //res.path_resized
          //         //图片路径
          //         $scope.doctor.photoUrl=CONFIG.mediaUrl+String(data.path_resized)+'?'+new Date().getTime();
          //         // console.log($scope.doctor.photoUrl)
          //         // $state.reload("tab.mine")
          //         // Storage.set('doctor.photoUrlpath',$scope.doctor.photoUrl);
          //         Doctor.editDoctorDetail({userId:Storage.get("UID"),photoUrl:$scope.doctor.photoUrl}).then(function(r){
          //             console.log(r);
          //         })
          //     },function(err){
          //         console.log(err);
          //         reject(err);
          //     })
          // // };

          // alert(JSON.stringify(data) + '导入用户 同意协议')

          $ionicPopup.show({
            title: '微信账号绑定手机账号成功，您的初始密码是123456，您以后也可以用手机号码登录！',
            buttons: [
              {
                text: '確定',
                type: 'button-positive',
                onTap: function (e) {
                  User.logIn({username: Storage.get('doctorunionid'), password: '112233', role: 'doctor'}).then(function (data) {
                    // alert(JSON.stringify(data) + '直接登录')

                    if (data.results.mesg == 'login success!') {
                      // alert(2)
                      Storage.set('isSignIn', 'Yes')
                      Storage.set('UID', data.results.userId)// 后续页面必要uid
                      Storage.set('TOKEN', data.results.token)
                      Storage.set('refreshToken', data.results.refreshToken)
                      Storage.set('reviewStatus', data.results.reviewStatus)
                      // Storage.set('doctorunionid', Storage.get('doctorunionid'))// 自动登录使用
                      Storage.set('bindingsucc', 'yes')
                      Storage.set('USERNAME', ret.phoneNo)
                      $timeout(function () { $state.go('tab.workplace') }, 500)
                      Doctor.getDoctorInfo({userId: data.results.userId}).then(function (response) {
                        thisDoctor = response.results
                        mySocket.newUser(response.results.userId)
                      }, function (err) {
                        thisDoctor = null
                      })
                    }
                  })
                }
              }
            ]
          })
        } else {
          console.log('用户不存在!')
        }
      }, function (err) {
        console.log(err)
      })
    } else if ($stateParams.last == 'wechatsignin') {
      // alert('微信注册 同意协议')
      $timeout(function () { $state.go('userdetail', {last: 'wechatsignin'}) }, 500)
    } else if ($stateParams.last == 'signin') {
      // 由登录时跳转到签署协议，针对老注册用户，同意协议后跳转到首页
      User.updateAgree({userId: Storage.get('UID'), agreement: '0'}).then(function (data) {
        if (data.results != null) {
          $timeout(function () { $state.go('tab.workplace') }, 500)
        } else {
          console.log('用户不存在!')
        }
      }, function (err) {
        console.log(err)
      })
    } else if ($stateParams.last == 'register') {
      // 由注册跳转到的签署协议，同意协议后跳转到设置密码
      $timeout(function () { $state.go('setpassword', 0) }, 500)
    }
  }
    // var a=document.getElementById("agreement");
    // console.log(document.body.clientHeight);
    // console.log(window.screen.height);
    // a.style.height=window.screen.height*0.65+"px";
}])

// 设置密码-zy
.controller('setPasswordCtrl', ['$scope', '$state', '$rootScope', '$timeout', 'Storage', 'User', '$stateParams', function ($scope, $state, $rootScope, $timeout, Storage, User, $stateParams) {
  $scope.barwidth = 'width:0%'
  var validMode = Storage.get('validMode')// 0->set;1->reset
  var phoneNumber = Storage.get('RegisterNO')
  $scope.headerText = '设置密码'
  $scope.buttonText = ''
  $scope.logStatus = ''

  if (validMode == 0) { $scope.buttonText = '下一步' } else { $scope.buttonText = '完成' }
  /**
   * [设置密码验证]
   * @Author   ZY
   * @DateTime 2017-07-04
   * @param    password(新旧密码): object
   * @return   设置密码成功
   */
  $scope.setPassword = function (password) {
    if (password.newPass != '' && password.confirm != '') {
      if (password.newPass == password.confirm) {
        if (password.newPass.length < 6) {
          // 此处要验证密码格式，//先简单的
          $scope.logStatus = '密码长度至少6位'
        } else {
          // 注册时跳转到的设置密码页，存下密码跳转到个人信息页
          if (validMode == 0) {
            Storage.set('password', password.newPass)
            $state.go('userdetail')
          } else {
            /**
             * [修改密码]
             * @Author   ZY
             * @DateTime 2017-07-04
             * @param    phoneNo: string; password: string
             * @return   修改密码成功
             */
            User.changePassword({
              phoneNo: phoneNumber,
              password: password.newPass
            }).then(function (succ) {
              Storage.set('password', password.newPass)
              console.log(succ)
              $state.go('signin')
            }, function (err) {
              console.log(err)
            })
          }
        }
      } else {
        $scope.logStatus = '两次输入的密码不一致'
      }
    } else {
      $scope.logStatus = '输入不正确!'
    }
  }
}])

// 注册时填写医生个人信息-zy,mzb
.controller('userdetailCtrl', ['CONFIG', 'Dict', 'Doctor', 'Patient', '$scope', '$state', '$ionicHistory', '$timeout', 'Storage', '$ionicPopup', '$ionicLoading', '$ionicPopover', '$ionicScrollDelegate', 'User', '$http', 'Camera', '$ionicModal', '$stateParams', function (CONFIG, Dict, Doctor, Patient, $scope, $state, $ionicHistory, $timeout, Storage, $ionicPopup, $ionicLoading, $ionicPopover, $ionicScrollDelegate, User, $http, Camera, $ionicModal, $stateParams) {
  $scope.barwidth = 'width:0%'
  var phoneNumber = Storage.get('RegisterNO')
  var password = Storage.get('password')
  if (Storage.get('password') == undefined || Storage.get('password') == '' || Storage.get('password') == null) {
    password = '123456'
    Storage.set('password', '123456')
  }
  $scope.Titles =
  [
        {Name: '主任医师', Type: 1},
        {Name: '副主任医师', Type: 2},
        {Name: '主治医师', Type: 3},
        {Name: '住院医师', Type: 4},
        {Name: '主任护师', Type: 5},
        {Name: '副主任护师', Type: 6},
        {Name: '主管护师', Type: 7},
        {Name: '护师', Type: 8},
        {Name: '护士', Type: 9}
  ]
  $scope.doctor = {
    userId: '',
    name: '',
    workUnit: '',
    department: '',
    title: '',
    IDNo: '',
    major: '',
    description: ''
  }

  // ------------省市医院读字典表---------------------
  // 获取所有省
  Dict.getDistrict({level: '1', province: '', city: '', district: ''}).then(function (data) {
    $scope.Provinces = data.results
    // $scope.Province.province = "";
    console.log($scope.Provinces)
  }, function (err) {
    console.log(err)
  })

  // 根据所选省获取所有市
  $scope.getCity = function (pro) {
    console.log(pro)
    if (pro != null) {
      Dict.getDistrict({level: '2', province: pro, city: '', district: ''}).then(function (data) {
        $scope.Cities = data.results
        console.log($scope.Cities)
      }, function (err) {
        console.log(err)
      })
    } else {
      $scope.Cities = {}
      $scope.Hospitals = {}
    }
  }

  // 根据所有市获取所有医院
  $scope.getHospital = function (city) {
    console.log(city)
    if (city != null) {
      // var locationCode = district.province + district.city + district.district
      // console.log(locationCode)
      Dict.getHospital({city: city}).then(function (data) {
        $scope.Hospitals = data.results
        console.log($scope.Hospitals)
      }, function (err) {
        console.log(err)
      })
    } else {
      $scope.Hospitals = {}
    }
  }

  // 将所选的医院对应的省、市、医院信息赋给当下医生的信息
  $scope.test = function (docinfo) {
    console.log(docinfo)
    $scope.doctor.province = docinfo.province
    $scope.doctor.city = docinfo.city
    $scope.doctor.workUnit = docinfo.hospitalName
  }
  // ------------省市医院读字典表---------------------

  /**
   * [保存个人信息]
   * @Author   ZY
   * @DateTime 2017-07-04
   */
  $scope.infoSetup = function () {
    if ($scope.doctor.name && $scope.doctor.province && $scope.doctor.city && $scope.doctor.workUnit && $scope.doctor.department && $scope.doctor.title && $scope.doctor.IDNo) {
      // 如果必填信息已填
      var IDreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/  // 身份证号判断
      if ($scope.doctor.IDNo != '' && IDreg.test($scope.doctor.IDNo) == false) {
                // console.log("身份证");
        $ionicLoading.show({
          template: '请输入正确的身份证号',
          duration: 1000
        })
      } else {
        $scope.doctor.title = $scope.doctor.title.Name
        /**
         * [注册]
         * @Author   ZY
         * @DateTime 2017-07-04
         * @param    phoneNo:string; password: string; role(医生端是doctor): string
         * @return   成功注册
         */
        User.register({
          phoneNo: phoneNumber,
          password: password,
          role: 'doctor'
        }).then(function (succ) {
          console.log(phoneNumber)
          console.log(password)
          console.log(succ)
          Storage.set('UID', succ.userNo)
          // 签署协议置位0，同意协议
          User.updateAgree({userId: Storage.get('UID'), agreement: '0'}).then(function (data) {
            console.log(data)
          }, function (err) {
            console.log(err)
          })

          // 填写个人信息
          $scope.doctor.userId = Storage.get('UID')
          $scope.doctor.photoUrl = Storage.get('wechatheadimgurl')
          /**
           * [注册个人信息保存]
           * @Author   ZY
           * @DateTime 2017-07-04
           * @param    $scope.doctor(注册时填入的一系列信息): object
           * @return   个人信息成功保存
           */
          Doctor.postDocBasic($scope.doctor).then(function (data) {
            console.log(data)
            console.log($scope.doctor)
            // $scope.doctor = data.newResults;
          }, function (err) {
            console.log(err)
          })

          // 注册论坛
          // $http({
          //   method: 'POST',
          //   url: 'http://proxy.haihonghospitalmanagement.com/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
          //   params: {
          //     'regsubmit': 'yes',
          //     'formhash': '',
          //     'username': $scope.doctor.name + phoneNumber.slice(7),
          //     'password': $scope.doctor.name + phoneNumber.slice(7),
          //     'password2': $scope.doctor.name + phoneNumber.slice(7),
          //     'email': phoneNumber + '@bme319.com'
          //   },  // pass in data as strings
          //   headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          //     'Accept': 'application/xml, text/xml, */*'
          //   }  // set the headers so angular passing info as form data (not request payload)
          // }).success(function (data) {
          //   // console.log(data);
          // })

          // zxf
          if ($stateParams.last == 'wechatsignin') {
            // 将用户的微信头像存在用户表中，如果用户没有头像存，有则不修改
            Patient.replacePhoto({'patientId': Storage.get('UID'), 'wechatPhotoUrl': Storage.get('wechatheadimgurl')}).then(function (data) {
              // alert(JSON.stringify(data))
              Storage.rm('wechatheadimgurl')
            }, function (err) {
              // alert('imageerror'+JSON.stringify(err))
              console.log(err)
            })
            User.setMessageOpenId({type: 3, openId: Storage.get('messageOpenId'), userId: Storage.get('UID')}).then(function (succ) {
              // console.log(succ)
            }, function (err) {
              console.log(err)
            })
            User.setOpenId({phoneNo: Storage.get('phoneNumber'), openId: Storage.get('doctorunionid')}).then(function (response) {
              Storage.set('bindingsucc', 'yes')
              $state.go('uploadcertificate', {last: 'wechatsignin'})
            })
          } else {
            $state.go('uploadcertificate')
          }
          Storage.set('lt', 'bme319')
        }, function (err) {
          console.log(err)
        })
      }
    } else {
      $ionicLoading.show({
        template: '信息填写不完整,请完善必填信息(红色*)',
        duration: 1000
      })
    }
  }

    // $scope.$on('$ionicView.leave', function() {
    //     $scope.modal.remove();
    // })
}])

// 上传资质证书-zxf
.controller('uploadcertificateCtrl', ['$interval', 'CONFIG', 'Dict', 'Doctor', '$scope', '$state', '$ionicHistory', '$timeout', 'Storage', '$ionicPopup', '$ionicLoading', '$ionicPopover', '$ionicScrollDelegate', 'User', '$http', 'Camera', '$ionicModal', '$stateParams', 'socket', 'mySocket', function ($interval, CONFIG, Dict, Doctor, $scope, $state, $ionicHistory, $timeout, Storage, $ionicPopup, $ionicLoading, $ionicPopover, $ionicScrollDelegate, User, $http, Camera, $ionicModal, $stateParams, socket, mySocket) {
  $scope.doctor = {}
  User.logIn({username: Storage.get('phoneNumber'), password: Storage.get('password'), role: 'doctor'}).then(function (data) {
    console.log(data)
    if (data.results.mesg == 'login success!') {
      $scope.doctor.userId = data.results.userId
      Storage.set('TOKEN', data.results.token)
      Storage.set('refreshToken', data.results.refreshToken)
      Storage.set('reviewStatus', data.results.reviewStatus)
    }
  }, function (err) {
    console.log(err)
  })

  $scope.uploadcetify = function () {
    if ($scope.doctor.userId && $scope.doctor.certificatePhotoUrl && $scope.doctor.practisingPhotoUrl) {
      Doctor.editDoctorDetail($scope.doctor).then(function (data) {
        if ($stateParams.last == 'wechatsignin') {
          $ionicPopup.show({
            title: '感谢您注册肾事联盟，您的微信账号绑定手机号申请已经提交，申请通过后您也可以用手机号登录，初始密码是123456，请耐心等待审核结果',
            buttons: [
              {
                text: '確定',
                type: 'button-positive',
                onTap: function (e) {
                  // alert(Storage.get('UID'))
                  Doctor.getDoctorInfo({userId: $scope.doctor.userId}).then(function (response) {
                    thisDoctor = response.results
                    mySocket.newUser(response.results.userId)
                  }, function (err) {
                    thisDoctor = null
                  })
                  $state.go('signin')
                }
              }
            ]
          })
        } else {
          $ionicPopup.show({
            title: '感谢您注册肾事联盟，您的注册申请已经提交，请耐心等待审核结果',
            buttons: [
              {
                text: '確定',
                type: 'button-positive',
                onTap: function (e) {
                  $state.go('signin')
                }
              }
            ]
          })
        }
                  // console.log(data)
      }, function (err) {
        console.log(err)
      })
    } else {
      $ionicLoading.show({
        template: '信息填写不完整,请完善必填信息(红色*)',
        duration: 1000
      })
    }
        // $scope.ProvinceObject = $scope.doctor.province;
        // console.log("123"+$scope.ProvinceObject);
  }
  // 0516 zxf
  $scope.flag = 0// 判断是给谁传图片 默认是资格证书
  // 点击显示大图
  $scope.zoomMin = 1
  $scope.imageUrl = ''
  $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal
        // $scope.modal.show();
    $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
  })

  $scope.onClickCamera = function ($event, index) {
    $scope.openPopover($event)
    $scope.flag = index
  }
  // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function (imgURI) {
    var temp_photoaddress
    if ($scope.flag == 0) {
      temp_photoaddress = Storage.get('UID') + '_' + new Date().getTime() + 'certificate.jpg'
    } else {
      temp_photoaddress = Storage.get('UID') + '_' + new Date().getTime() + 'practising.jpg'
    }
    Camera.uploadPicture(imgURI, temp_photoaddress).then(function (res) {
      var data = angular.fromJson(res)
      // 图片路径
      if ($scope.flag == 0) {
        $scope.doctor.certificatePhotoUrl = CONFIG.mediaUrl + String(data.path_resized)
      } else {
        $scope.doctor.practisingPhotoUrl = CONFIG.mediaUrl + String(data.path_resized)
      }
    }, function (err) {
      console.log(err)
      reject(err)
    })
  }
  /// /-----------------------上传头像---------------------
  // ionicPopover functions 弹出框的预定义
  $ionicPopover.fromTemplateUrl('partials/pop/cameraPopover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }
  $scope.closePopover = function () {
    $scope.popover.hide()
  }
    // Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove()
  })
    // Execute action on hide popover
  $scope.$on('popover.hidden', function () {
    // Execute action
  })
    // Execute action on remove popover
  $scope.$on('popover.removed', function () {
    // Execute action
  })

    // 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function () {
        // console.log("选个照片");
    $scope.choosePhotos()
    $scope.closePopover()
  }
  $scope.choosePhotos = function () {
    Camera.getPictureFromPhotos('gallery', true).then(function (data) {
          // data里存的是图像的地址
          // console.log(data);
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
          // console.err(err);
      var imgURI
    })// 从相册获取照片结束
  } // function结束

    // 照相机的点击事件----------------------------------
  $scope.getPhoto = function () {
        // console.log("要拍照了！");
    $scope.takePicture()
    $scope.closePopover()
  }

  $scope.takePicture = function () {
    Camera.getPicture('cam', true).then(function (data) {
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
            // console.err(err);
      var imgURI
    })// 照相结束
  } // function结束

  $scope.showoriginal = function (resizedpath) {
        // $scope.openModal();
        // console.log(resizedpath)
    var originalfilepath = CONFIG.imgLargeUrl + resizedpath.slice(resizedpath.lastIndexOf('/') + 1).substr(7)
        // console.log(originalfilepath)
        // $scope.doctorimgurl=originalfilepath;

    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = originalfilepath
    $scope.modal.show()
  }
  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
        // $scope.modal.remove()
  }
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }
}])

// 首页-mzb,zy
.controller('homeCtrl', ['Communication', '$scope', '$state', '$interval', '$rootScope', 'Storage', '$http', '$sce', '$timeout', 'Doctor', 'New', function (Communication, $scope, $state, $interval, $rootScope, Storage, $http, $sce, $timeout, Doctor, New) {
  $scope.barwidth = 'width:0%'
  $scope.sliderStyle = {'margin-top': '44px', 'height': '170px'}
  if (ionic.Platform.isIOS()) {
    $scope.sliderStyle = {'margin-top': '64px', 'height': '170px'}
  }
  var windowHeight = $(window).height()
  console.log(Storage.get('USERNAME'))
  $scope.hasUnreadMessages = false
    // var RefreshUnread;
    // var GetUnread = function(){
    //     New.getNewsByReadOrNot({userId:Storage.get('UID'),readOrNot:0}).then(//
    //         function(data){
    //             // console.log(data.results.length)
    //             if(data.results.length){
    //                 $scope.hasUnreadMessages = true;
    //                 // console.log($scope.hasUnreadMessages);

    //             }else{
    //                 $scope.hasUnreadMessages = false;
    //                 // console.log($scope.hasUnreadMessages);
    //             }

    //             // console.log($scope.hasUnreadMessages);
    //         },function(err){
    //                 console.log(err);
    //         });
    // }
    // GetUnread();
    // RefreshUnread = $interval(GetUnread,5000);
  $scope.isfullScreen = false
  $scope.fullScreen = function () {
    // console.log("full")
    if ($scope.isfullScreen) {
      $scope.isfullScreen = false
      $scope.isWriting = {'margin-top': '170px'}
    } else {
      $scope.isfullScreen = true
      $scope.isWriting = {'margin-top': '0px', 'z-index': '20'}
    }
  }
  $scope.isWriting = {'margin-top': '170px'}
  if (!sessionStorage.addKBEvent) {
        // console.log("true")
    $(window).resize(function () {          // 当浏览器大小变化时
      if ($(window).height() < windowHeight) { keyboardShowHandler() } else { keyboardHideHandler() }
    })
    sessionStorage.addKBEvent = true
  }
  function keyboardShowHandler (e) {
    $scope.$apply(function () {
      $scope.isWriting = {'margin-top': '-40px', 'z-index': '20'}
    })
  }
  function keyboardHideHandler (e) {
    $scope.$apply(function () {
      if ($scope.isfullScreen) {
        $scope.isWriting = {'margin-top': '0px', 'z-index': '20'}
      } else {
        $scope.isWriting = {'margin-top': '100px'}
      }
    })
  }
  $scope.forumPermission = false
  $scope.goToPersonalInfo = function () {
    console.log('go to pers Info')
  }
  Doctor.getDoctorInfo({
    userId: Storage.get('UID')
  }).then(function (data) {
    console.log(data)
    if (data.hasOwnProperty('results') && data.results.hasOwnProperty('name') && data.results.name != '') { $scope.forumPermission = true }
    // $scope.navigation_login = $sce.trustAsResourceUrl('http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=$loginhash&mobile=2&username=' + data.results.name + Storage.get('USERNAME').slice(7) + '&password=' + data.results.name + Storage.get('USERNAME').slice(7))
    $scope.navigation = $sce.trustAsResourceUrl('http://proxy.haihonghospitalmanagement.com/')
  }, function (err) {
    console.log(err)
  }
    )
  $scope.options = {
    loop: false,
    effect: 'fade',
    speed: 500
  }
  $scope.testregis = function () {
    // $http({
    //     method  : 'POST',
    //     url     : 'http://121.43.107.106/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
    //     params    :{
    //         'regsubmit':'yes',
    //         'formhash':'',
    //         'D2T9s9':'test9',
    //         'O9Wi2H':"123456",
    //         'hWhtcM':'123456',
    //         'qSMA7S':'qw@qq.com'
    //     },  // pass in data as strings
    //     headers : {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Accept':'application/xml, text/xml, */*'
    //     }  // set the headers so angular passing info as form data (not request payload)
    // }).success(function(data) {
    //         // console.log(data);
    // });
  }
  var forumReg = function (phone, role) {
        // console.log(phone.userName+phone.phoneNo.slice(7))
    var un = phone.userName + phone.phoneNo.slice(7)
    var url = 'http://121.43.107.106'
    if (role == 'patient') { url += ':6699/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1' } else if (role == 'doctor') { url += '/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1' }
    $http({
      method: 'POST',
      url: url,
      params: {
        'regsubmit': 'yes',
        'formhash': 'xxxxxx',
        'username': un,
        'password': un,
        'password2': un,
        'email': phone.phoneNo + '@bme319.com'
      },  // pass in data as strings
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, text/xml, */*'
      }  // set the headers so angular passing info as form data (not request payload)
    }).success(function (s) {
      console.log(s)
    })
  }
  $scope.importDocs = function () {
    $http({
      method: 'GET',
      url: 'http://121.196.221.44:4050/user/getPhoneNoByRole?role=patient'
    })
        .success(function (data) {
          console.log(data)
          var users = data.results
          for (var i = 0; i < users.length; i++) {
            forumReg(users[i], 'patient')
          }
        })
    $http({
      method: 'GET',
      url: 'http://121.196.221.44:4050/user/getPhoneNoByRole?role=doctor'
    })
        .success(function (data) {
          console.log(data)
          var users = data.results
          for (var i = 0; i < users.length; i++) {
            forumReg(users[i], 'doctor')
          }
        })
  }

  /**
   * [查看是否有未读消息]
   * @Author   ZY
   * @DateTime 2017-07-04
   */
  var GetUnread = function () {
    // console.log(new Date());
    /**
     * [获取未读消息]
     * @Author   ZY
     * @DateTime 2017-07-04
     * @param    userId: string; readOrNot(0为未读): number;  userRole: string
     * @return   data.results.length(有未读消息首页信箱标注小红点)
     */
    New.getNewsByReadOrNot({userId: Storage.get('UID'), readOrNot: 0, userRole: 'doctor'}).then(function (data) {
      // console.log(data);
      if (data.results.length) {
        $scope.hasUnreadMessages = true
        // console.log($scope.HasUnreadMessages);
      } else {
        $scope.hasUnreadMessages = false
      }
    }, function (err) {
      console.log(err)
    })
  }

  // 进入页面执行查询是否有未读消息
  $scope.$on('$ionicView.enter', function () {
    console.log('enter')
    RefreshUnread = $interval(GetUnread, 2000)
  })

  // 离开页面destroy查询
  $scope.$on('$ionicView.leave', function () {
    console.log('destroy')
    if (RefreshUnread) {
      $interval.cancel(RefreshUnread)
    }
  })

    // $scope.testRestful=function()
    // {
    //     Communication.removeMember({
    //              teamId:'teampost2',
    //              membersuserId:'id2'
    //          })
    //     .then(function(data){
    //         console.log(data)
    //     },function(err){
    //         console.log(err);
    //     })
    // }
}])

// 咨询-zy
.controller('consultCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'QRScan', 'Counsel', function ($scope, $state, $interval, $rootScope, Storage, QRScan, Counsel) {
  $scope.barwidth = 'width:0%'
  // 变量a 等待患者数量 变量b 已完成咨询患者数量
  $scope.GoBack = function () {
    $state.go('tab.workplace')
  }
  $scope.doctor = {a: 0, b: 0}
  var now = new Date()
  var year = now.getYear()
  var month = now.getMonth() + 1
  var day = now.getDate()
  var date1 = month + '月' + day + '日'
    // var date1=new Date().format("MM月dd日");
  $scope.riqi = date1

  /**
   * [分别获取已完成和进行中咨询]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string; status(0是已完成，1是进行中): number
   * @return   data.results.length(取数量)
   */
  var load = function () {
    // 获取已完成
    Counsel.getCounsels({
      userId: Storage.get('UID'),
      status: 0
    }).then(function (data) {
      // console.log(data)
      Storage.set('consulted', angular.toJson(data.results))
      // console.log(angular.fromJson(Storage.get("consulted",data.results)))
      $scope.doctor.b = data.results.length
    }, function (err) {
      console.log(err)
    })
    // 获取进行中
    Counsel.getCounsels({
      userId: Storage.get('UID'),
      status: 1
    }).then(function (data) {
                // console.log(data)
      Storage.set('consulting', angular.toJson(data.results))
                // console.log(angular.fromJson(Storage.get("consulting",data.results)))
      $scope.doctor.a = data.results.length
    }, function (err) {
      console.log(err)
    })
  }
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
  $scope.$on('$ionicView.enter', function () {
    load()
  })
}])

// "咨询”进行中-mzb,zy
.controller('doingCtrl', ['$scope', '$state', '$ionicLoading', '$interval', '$rootScope', 'Storage', '$ionicPopover', 'Counsel', '$ionicHistory', 'New', function ($scope, $state, $ionicLoading, $interval, $rootScope, Storage, $ionicPopover, Counsel, $ionicHistory, New) {
  /**
   * [获取进行中咨询]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string; status(0是已完成，1是进行中): number
   * @return   data.results(所有进行中患者咨询详情)
   */
  var load = function () {
    Counsel.getCounsels({userId: Storage.get('UID'), status: 1 }).then(function (data) {
      $scope.allpatients = data.results
      New.addNestNews('11', Storage.get('UID'), $scope.allpatients, 'userId', 'patientId').then(function (pats) {
        $scope.patients = pats
      })
      // $scope.patients=data.results;
    })
  }

  // 进入加载
  $scope.$on('$ionicView.beforeEnter', function () {
    load()
  })
  // 下拉刷新
  $scope.doRefresh = function () {
    load()
        // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
    // $scope.allpatients=angular.fromJson(Storage.get("consulting"));
    // $scope.patients=$scope.allpatients;
    // console.log($scope.allpatients)
    // ----------------开始搜索患者------------------
  $scope.search = {
    name: ''
  }
  // 根据姓名在进行中搜索
  $scope.goSearch = function () {
    Counsel.getCounsels({
      userId: Storage.get('UID'),
      status: 1,
      name: $scope.search.name
    }).then(function (data) {
      $scope.patients = data.results
      if (data.results.length == 0) {
        // console.log("aaa")
        $ionicLoading.show({ template: '没有搜索到患者', duration: 1000 })
      }
    }, function (err) {
      console.log(err)
    })
  }

  // $scope.clearSearch = function() {
  //     $scope.search.name = '';
  //     $scope.patients = $scope.allpatients;
  // }
  // ----------------结束搜索患者------------------
  $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }
  $scope.filters = {
    item1: true,
    item2: true
  }
  $scope.filterShow = function () {
    angular.forEach($scope.patients, function (value, key) {
      value.show = true
      if (!$scope.filters.item1) {
        if (value.type == 1) { value.show = false }
      }
      if (!$scope.filters.item2) {
        if (value.type == 2 || value.type == 3) { value.show = false }
      }
    })
    // console.log($scope.patients)
  }

  $scope.goCounsel = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    })
    $state.go('tab.consult')
  }

  /**
   * [根据点击位置判断进入到哪里]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    ele.target.id(点击位置；ele.target.id == 'doingdetail'指头像): string
   * @return   跳转到不同页面
   */
  $scope.itemClick = function (ele, userId, counselId) {
    if (ele.target.id == 'doingdetail') {
      // console.log(userId)
      Storage.set('getpatientId', userId)
      $state.go('tab.patientDetail')
    } else {
      // Storage.set('getpatientId',userId);
      // [type]:0=已结束;1=进行中;2=医生
      $state.go('tab.detail', {type: '1', chatId: userId, counselId: counselId})
    }
  }
}])

// "咨询”已完成-mzb,zy
.controller('didCtrl', ['$scope', '$state', 'Counsel', '$ionicLoading', '$interval', '$rootScope', 'Storage', '$ionicPopover', '$ionicHistory', 'New', function ($scope, $state, Counsel, $ionicLoading, $interval, $rootScope, Storage, $ionicPopover, $ionicHistory, New) {
  /**
   * [获取已完成咨询]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string; status(0是已完成，1是进行中): number
   * @return   data.results(所有已完成患者咨询详情)
   */
  var load = function () {
    Counsel.getCounsels({userId: Storage.get('UID'), status: 0 }).then(function (data) {
      $scope.allpatients = data.results
      New.addNestNews('11', Storage.get('UID'), $scope.allpatients, 'userId', 'patientId').then(function (pats) {
        $scope.patients = pats
      })
      // $scope.patients=data.results;
    })
  }
  $scope.$on('$ionicView.beforeEnter', function () {
    load()
  })
  // 下拉刷新
  $scope.doRefresh = function () {
    load()
    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
    // $scope.allpatients=angular.fromJson(Storage.get("consulted"));
    // $scope.patients=$scope.allpatients;
    // ----------------开始搜索患者------------------
  $scope.search = {
    name: ''
  }
  // 根据姓名在已完成中搜索
  $scope.goSearch = function () {
    Counsel.getCounsels({
      userId: Storage.get('UID'),
      status: 0,
      name: $scope.search.name
    }).then(function (data) {
      $scope.patients = data.results
      if (data.results.length == 0) {
                // console.log("aaa")
        $ionicLoading.show({ template: '没有搜索到患者', duration: 1000 })
      }
    }, function (err) {
      console.log(err)
    })
  }

    // $scope.clearSearch = function() {
    //     $scope.search.name = '';
    //     $scope.patients = $scope.allpatients;
    // }
    // ----------------结束搜索患者------------------
  $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
        // $scope.testt=12345
  }
  $scope.goCounsel = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    })
    $state.go('tab.consult')
  }
  $scope.filters = {
    item1: true,
    item2: true
  }
  $scope.filterShow = function () {
    angular.forEach($scope.patients, function (value, key) {
      value.show = true
      if (!$scope.filters.item1) {
        if (value.type == 1) { value.show = false }
      }
      if (!$scope.filters.item2) {
        if (value.type == 2 || value.type == 3) { value.show = false }
      }
    })
        // console.log($scope.patients)
  }

  /**
   * [根据点击位置判断进入到哪里]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    ele.target.id(点击位置；ele.target.id == 'diddetail'指头像): string
   * @return   跳转到不同页面
   */
  $scope.itemClick = function (ele, userId, counselId) {
    if (ele.target.id == 'diddetail') {
      console.log(userId)
      Storage.set('getpatientId', userId)
      $state.go('tab.patientDetail')
    } else {
      // Storage.set('getpatientId',userId);
      // [type]:0=已结束;1=进行中;2=医生
      $state.go('tab.detail', {type: '0', chatId: userId, counselId: counselId})
    }
  }
    // $scope.isChecked1=true;
}])

// 我的预约 页面
.controller('myreserveCtrl', ['$scope', 'Doctor2', 'services', function ($scope, Doctor2, services) {
  // 获取该医生所有待审核患者列表
  Doctor2.getReviewList({
  }).then(function (data) {
        // console.log(data)
    $scope.reviewNum = data.numberToReview
  }, function (err) {
    console.log(err)
  })

  // 获取未核销面诊患者 0未核销 1已核销
  services.myPDpatients({
    status: 0
  }).then(function (data) {
        // console.log(data)
    $scope.PDNum = data.results.length
  }, function (err) {
    console.log(err)
  })
}])
// "患者”页-zy
.controller('patientCtrl', ['Counsel', 'Doctor', '$scope', '$state', '$ionicLoading', '$interval', '$rootScope', 'Storage', '$ionicPopover', 'Doctor2', 'services', function (Counsel, Doctor, $scope, $state, $ionicLoading, $interval, $rootScope, Storage, $ionicPopover, Doctor2, services) {
  $scope.barwidth = 'width:0%'
  $scope.GoBack = function () {
    $state.go('tab.workplace')
  }
  var patients = []
  $scope.params = {
    isPatients: true,
    updateTime: 0
  }

  var load = function () {
    // Counsel.getCounsels({
    //   userId: Storage.get('UID'),
    //   status: 1
    // }).then(function (data) {
    //   $scope.consultNum = data.results.length
    // }, function (err) {
    //   console.log(err)
    // })

    // Counsel.getCounsels({
    //   userId: Storage.get('UID'),
    //   status: 0
    // }).then(function (data) {
    //   $scope.didconsultNum = data.results.length
    // }, function (err) {
    //   console.log(err)
    // })

  // // 获取该医生所有待审核患者列表
  //   Doctor2.getReviewList({
  //     // token: Storage.get('TOKEN')
  //     // userId: Storage.get('UID')
  //   }).then(function (data) {
  //       // console.log(data)
  //     $scope.reviewNum = data.numberToReview
  //   }, function (err) {
  //     console.log(err)
  //   })

  // // 获取未核销面诊患者 0未核销 1已核销
  //   services.myPDpatients({
  //     // token: Storage.get('TOKEN')
  //     status: 0
  //   }).then(function (data) {
  //       // console.log(data)
  //     $scope.PDNum = data.results.length
  //   }, function (err) {
  //     console.log(err)
  //   })
  /**
   * [获取该医生所有患者列表]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(患者列表信息)
   */
    Doctor2.getPatientList({
      // userId: Storage.get('UID')
    }).then(function (data) {
      // console.log(data)
      if (data.results != '') {
        $scope.allpatients = data.results
        $scope.patients = $scope.allpatients
        // $scope.allpatientsInCharge = data.results.patientsInCharge
        // $scope.allpatients = data.results.patients
        // $scope.patients = $scope.allpatients
        // $scope.patientsInCharge = $scope.allpatientsInCharge
        // $scope.patients[1].patientId.VIP=0;
        // $scope.patients.push(
        //     {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
        //     {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
        //     {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
        //     {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
        //     {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
        //     {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
        // console.log($scope.patients)
      } else {
        $scope.patients = ''
        // $scope.patientsInCharge = ''
      }
      angular.forEach($scope.patients,
                    function (value, key) {
                      $scope.patients[key].show = true
                    }
                )
      // angular.forEach($scope.patientsInCharge,
      //               function (value, key) {
      //                 $scope.patientsInCharge[key].show = true
      //               }
      //           )
    }, function (err) {
      console.log(err)
    })

  /**
   * [获取该医生今日新增所有患者列表]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(今日新增患者列表信息)
   */
    Doctor2.getPatientList({
      // userId: Storage.get('UID')
      typeR: 'today'
    }).then(function (data) {
      // console.log(data)
      $scope.allTodays = data.results
      $scope.Todays = $scope.allTodays
      // $scope.Todays.push(
      //         {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
      //         {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
      //         {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
      //         {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
      //         {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
      //         {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
      // console.log($scope.Todays)
      angular.forEach($scope.Todays,
                    function (value, key) {
                      $scope.Todays[key].show = true
                    }
                )
      // angular.forEach($scope.TodaysInCharge,
      //               function (value, key) {
      //                 $scope.TodaysInCharge[key].show = true
      //               }
      //           )
    }, function (err) {
      console.log(err)
    })
  }
    // ----------------开始搜索患者------------------
  $scope.search = {
    name: '',
    vip: '',
    gender: '',
    distype: '',
    value: '',
    typeR: ''
  }

  // 根据姓名在患者列表中搜索
  $scope.goSearch = function () {
    var searchInfo = {
      typeVIP: $scope.search.vip,
      typeG: $scope.search.gender,
      typeD: $scope.search.distype,
      typeS: $scope.search.value,
      name: $scope.search.name,
      typeR: $scope.search.typeR
    }
    Doctor2.getPatientList(searchInfo).then(function (data) {
            // $scope.params.isPatients=true;
            // $scope.patientsInCharge = data.results.patientsInCharge
      console.log(data.results)
      if ($scope.params.isPatients == true) {
        $scope.patients = data.results
        angular.forEach($scope.patients,
                function (value, key) {
                  $scope.patients[key].show = true
                }
                )
      } else {
        $scope.Todays = data.results
        angular.forEach($scope.Todays,
                function (value, key) {
                  $scope.Todays[key].show = true
                }
                )
      }
              // angular.forEach($scope.patientsInCharge,
              //           function (value, key) {
              //             $scope.patientsInCharge[key].show = true
              //           }
              // )
              // console.log($scope.patients[0].patientId.name)
      if (data.results.length == 0) {
        console.log('aaa')
        $ionicLoading.show({
          template: '没有搜索到患者',
          duration: 1000
        })
      }
    }, function (err) {
      console.log(err)
    })
  }

  $scope.clearSearch = function () {
    $scope.search = {}
    $scope.patients = $scope.allpatients
    // $scope.patientsInCharge = $scope.allpatientsInCharge
  }
    // ----------------结束搜索患者------------------
  $scope.doRefresh = function () {
    load()
    $scope.search = {}
    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
  $scope.$on('$ionicView.enter', function () {
    load()
  })

  // 点亮全部患者标签 显示全部患者
  $scope.ShowPatients = function () {
    $scope.params.isPatients = true
    $scope.search.typeR = ''
    $scope.search.name = ''
    $scope.search.vip = ''
    $scope.search.distype = ''
    $scope.search.gender = ''
    $scope.search.value = ''
    $scope.patients = $scope.allpatients
    $scope.Todays = $scope.allTodays
  }
  // 点亮今日新增标签 显示今日新增患者
  $scope.ShowTodays = function () {
    $scope.params.isPatients = false
    $scope.search.typeR = 'today'
    $scope.search.name = ''
    $scope.search.vip = ''
    $scope.search.distype = ''
    $scope.search.gender = ''
    $scope.search.value = ''
    $scope.Todays = $scope.allTodays
    $scope.patients = $scope.allpatients
  }
  /**
   * [进入对应患者的患者详情]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    id(点击特定患者的userId): string
   * @return   {[type]}
   */
  $scope.getPatientDetail = function (id) {
    console.log(id)
    Storage.set('getpatientId', id)
    $state.go('tab.patientDetail')
  }

  $ionicPopover.fromTemplateUrl('partials/others/sort_popover.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }

  $scope.filter = {
    propertyName: '-patientId.VIP',
    choose: {
      isChecked1: true,
      isChecked2: true,
      isChecked3: true,
      isChecked4: true,
      isChecked5: true,
      isChecked6: true,
      isChecked7: true,
      isChecked8: true,
      isChecked9: false
    }
  }
  var filterReset = angular.copy($scope.filter)
  $scope.resetFilter = function () {
        // console.log("reset")
    $scope.filter = angular.copy(filterReset)
    $scope.filterShow()
  }
  $scope.filterShow = function () {
    angular.forEach($scope.patients,
            function (value, key) {
              $scope.patients[key].show = true
              if (!$scope.filter.choose.isChecked1) {
                if (value.patientId.class == 'class_1') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked2) {
                if (value.patientId.class == 'class_5') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked3) {
                if (value.patientId.class == 'class_6') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked4) {
                if (value.patientId.class == 'class_2') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked5) {
                if (value.patientId.class == 'class_3') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked6) {
                if (value.patientId.class == 'class_4') { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked7) {
                if (value.patientId.gender == 1) { $scope.patients[key].show = false }
              }
              if (!$scope.filter.choose.isChecked8) {
                if (value.patientId.gender == 2) { $scope.patients[key].show = false }
              }
              if ($scope.filter.choose.isChecked9) {
                if (value.patientId.VIP == 0) { $scope.patients[key].show = false }
              }
            }
        )
    // angular.forEach($scope.patientsInCharge,
    //         function (value, key) {
    //           $scope.patientsInCharge[key].show = true
    //           if (!$scope.filter.choose.isChecked1) {
    //             if (value.patientId.class == 'class_1') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked2) {
    //             if (value.patientId.class == 'class_5') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked3) {
    //             if (value.patientId.class == 'class_6') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked4) {
    //             if (value.patientId.class == 'class_2') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked5) {
    //             if (value.patientId.class == 'class_3') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked6) {
    //             if (value.patientId.class == 'class_4') { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked7) {
    //             if (value.patientId.gender == 1) { $scope.patientsInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked8) {
    //             if (value.patientId.gender == 2) { $scope.patientsInCharge[key].show = false }
    //           }
    //           if ($scope.filter.choose.isChecked9) {
    //             if (value.patientId.VIP == 0) { $scope.patientsInCharge[key].show = false }
    //           }
    //         }
    //     )
    angular.forEach($scope.Todays,
            function (value, key) {
              $scope.Todays[key].show = true
              if (!$scope.filter.choose.isChecked1) {
                if (value.patientId.class == 'class_1') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked2) {
                if (value.patientId.class == 'class_5') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked3) {
                if (value.patientId.class == 'class_6') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked4) {
                if (value.patientId.class == 'class_2') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked5) {
                if (value.patientId.class == 'class_3') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked6) {
                if (value.patientId.class == 'class_4') { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked7) {
                if (value.patientId.gender == 1) { $scope.Todays[key].show = false }
              }
              if (!$scope.filter.choose.isChecked8) {
                if (value.patientId.gender == 0) { $scope.Todays[key].show = false }
              }
              if ($scope.filter.choose.isChecked9) {
                if (value.patientId.VIP == 0) { $scope.Todays[key].show = false }
              }
            }
        )
    // angular.forEach($scope.TodaysInCharge,
    //         function (value, key) {
    //           $scope.TodaysInCharge[key].show = true
    //           if (!$scope.filter.choose.isChecked1) {
    //             if (value.patientId.class == 'class_1') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked2) {
    //             if (value.patientId.class == 'class_5') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked3) {
    //             if (value.patientId.class == 'class_6') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked4) {
    //             if (value.patientId.class == 'class_2') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked5) {
    //             if (value.patientId.class == 'class_3') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked6) {
    //             if (value.patientId.class == 'class_4') { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked7) {
    //             if (value.patientId.gender == 1) { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if (!$scope.filter.choose.isChecked8) {
    //             if (value.patientId.gender == 0) { $scope.TodaysInCharge[key].show = false }
    //           }
    //           if ($scope.filter.choose.isChecked9) {
    //             if (value.patientId.VIP == 0) { $scope.TodaysInCharge[key].show = false }
    //           }
    //         }
    //     )
  }
}])

// "患者”详情子页-zy
.controller('patientDetailCtrl', ['New', 'Insurance', 'Storage', 'Doctor', '$scope', '$ionicPopup', '$ionicLoading', '$ionicHistory', '$state', 'Patient2', 'Doctor2', function (New, Insurance, Storage, Doctor, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, Patient2, Doctor2) {
  $scope.hideTabs = true
  // var patient = DoctorsInfo.searchdoc($stateParams.doctorId);
  // $scope.doctor = doc;
  // $scope.goback=function(){
  //     $ionicHistory.goBack();
  // }
  //
  $scope.barStyle = {'margin-top': '40px'}
  if (ionic.Platform.isIOS()) {
    $scope.barStyle = {'margin-top': '60px'}
  }
  // 判断从哪个页面进入患者详情页，存入$scope.backview.stateId，返回时对应返回
  $scope.backview = $ionicHistory.viewHistory().backView
  $scope.backstateId = null
  if ($scope.backview != null) {
    $scope.backstateId = $scope.backview.stateId
    // console.log($scope.backstateId)
    if ($scope.backstateId == 'tab.doing') {
      Storage.set('backId', $scope.backstateId)
    } else if ($scope.backstateId == 'tab.did') {
      Storage.set('backId', $scope.backstateId)
    } else if ($scope.backstateId == 'tab.patient') {
      Storage.set('backId', $scope.backstateId)
    }
  }
  console.log(Storage.get('backId'))
  $scope.goback = function () {
    var backId = Storage.get('backId')
    console.log(backId)
    if (backId == 'tab.doing') {
      $state.go('tab.doing')
    } else if (backId == 'tab.did') {
      $state.go('tab.did')
    } else if (backId == 'tab.group-chat') {
      var p = JSON.parse(Storage.get('groupChatParams'))
      $state.go('tab.group-chat', p)
    } else if (backId == 'tab.detail') {
      var q = JSON.parse(Storage.get('singleChatParams'))
      $state.go('tab.detail', q)
    } else {
      $state.go('tab.patient')
    }
  }

  $scope.charge = false
  $scope.follow = false

  $scope.gototestrecord = function () {
    console.log(Storage.get('getpatientId'))
    $state.go('tab.TestRecord', {PatinetId: Storage.get('getpatientId')})
  }
  // console.log(Storage.get('getpatientId'))

  /**
   * [获取患者详情]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId(患者userId): string
   * @return   data.results(患者详情信息)
   */
  Patient2.getPatientDetail({
    userId: Storage.get('getpatientId')
         // 'U201705090001'
  }).then(function (data) {
    // console.log(data)
    Storage.set('latestDiagnose', '')
    console.log(data.results.diagnosisInfo)
    // console.log(data.results.diagnosisInfo.length)
    if (data.results.diagnosisInfo.length > 0) {
      Storage.set('latestDiagnose', angular.toJson(data.results.diagnosisInfo[data.results.diagnosisInfo.length - 1]))
                // console.log(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1])
    } else if (data.results.diagnosisInfo.length == 0) {
      var lD = {
        content: '',
        hypertension: data.results.hypertension,
        name: data.results.class,
        operationTime: data.results.operationTime,
        progress: data.results.class_info ? data.results.class_info[0] : '',
        time: ''
      }
      Storage.set('latestDiagnose', angular.toJson(lD))
    }
    $scope.patient = data.results
    Storage.set('dprelation', data.dprelation)
    if (Storage.get('dprelation') == 'charge') {
      $scope.charge = true
    }
    if (Storage.get('dprelation') == 'follow') {
      $scope.follow = true
    }
    console.log(Storage.get('dprelation'))
    // $scope.charge = data.dprelation == 'charge' ? 'true' : 'false'
    // console.log(data.recentDiagnosis)
    // 显示最新的一条诊断信息
    if (data.recentDiagnosis != null) {
      $scope.RecentDiagnosis = data.recentDiagnosis[0]
      if ($scope.RecentDiagnosis != null) {
        if ($scope.RecentDiagnosis.name == 'class_4') {
          $scope.RecentDiagnosis.time = null
          $scope.RecentDiagnosis.progress = null
        } else if ($scope.RecentDiagnosis.name == 'class_2' || $scope.RecentDiagnosis.name == 'class_3') {
          $scope.RecentDiagnosis.time = null
        } else if ($scope.RecentDiagnosis.name == 'class_5' || $scope.RecentDiagnosis.name == 'class_6' || $scope.RecentDiagnosis.name == 'class_1') {
          $scope.RecentDiagnosis.progress = null
        }
      }
    }
    // console.log($scope.RecentDiagnosis)
  }, function (err) {
    console.log(err)
  })

  /**
   * [推送保险]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    doctorId: string; patientId: string
   * @return   data.results.count(推送次数)
   */
  Insurance.getInsMsg({
    doctorId: Storage.get('UID'),
    patientId: Storage.get('getpatientId')
  }).then(function (data) {
    // console.log(data.results)
    $scope.Ins = data.results || {count: 0}
  }, function (err) {
    console.log(err)
  })

  /**
   * [点击推送蒙层显示，避免点击没反应多次点击]
   * @Author   ZY
   * @DateTime 2017-07-05
   */
  $scope.SendInsMsg = function () {
    $ionicLoading.show({
      template: '推送成功',
      duration: 1000
    })
    /**
     * [发送保险消息]
     * @Author   ZY
     * @DateTime 2017-07-05
     * @param    doctorId: string; patientId: string; insuranceId: string; description: string
     * @return   发送成功，显示的推送次数加1
     */
    Insurance.updateInsuranceMsg({
      doctorId: Storage.get('UID'),
      patientId: Storage.get('getpatientId'),
      insuranceId: 'ins01',
      description: '医生给您发送了一条保险消息'
    }).then(function (data) {
      // console.log(data)
      $scope.Ins.count = $scope.Ins.count + 1
      console.log(data)
      Storage.set('MessId', data.newResults.message.messageId)
      /**
       * [插入保险消息]
       * @Author   ZY
       * @DateTime 2017-07-05
       * @param    sendBy: string; userId: string; type(5是保险): number; readOrNot(0是未读): string; description: string; messageId: string
       * @return   {[type]}
       */
      New.insertNews({
        sendBy: Storage.get('UID'),
        userId: Storage.get('getpatientId'),
        type: 5,
        userRole: 'patient',
        readOrNot: '0',
        description: '医生给您发送了一条保险消息',
        messageId: Storage.get('MessId')
      }).then(function (data) {
        console.log(data)
      }, function (err) {
        console.log(err)
      })
    }, function (err) {
      console.log(err)
    })
  }

  // 推荐入组
  $scope.sendtoGroup = function () {
    var cm = $ionicPopup.show({
      title: '确定推荐入组？',
      cssClass: 'popupWithKeyboard',
      buttons: [
        {
          text: '確定',
          type: 'button-positive',
          onTap: function (event) {
            Doctor2.sendgroupPatient({patientId: Storage.get('getpatientId')}).then(function (succ) {
              // console.log(succ)
            }, function (err) {
              console.log(err)
            })
          }
        },
        {
          text: '取消',
          type: 'button-assert',
          onTap: function () {
            // console.log("cancle")
          }
        }
      ]
    })
  }

  $scope.goPatientReport = function () {
    $state.go('tab.Report')
  }

  $scope.goToDiagnose = function () {
    $state.go('tab.DoctorDiagnose')
  }
}])

// "交流”页
.controller('communicationCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', function ($scope, $state, $interval, $rootScope, Storage) {
  $scope.barwidth = 'width:0%'
}])

// "我”页-zy,mzb,zxf
.controller('meCtrl', ['$ionicActionSheet', 'CONFIG', 'Camera', 'Doctor', '$scope', '$state', '$interval', '$rootScope', 'Storage', '$ionicPopover', '$http', '$ionicPopup', 'User', function ($ionicActionSheet, CONFIG, Camera, Doctor, $scope, $state, $interval, $rootScope, Storage, $ionicPopover, $http, $ionicPopup, User) {
  $scope.barwidth = 'width:0%'
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.doRefresh();
    // });
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(医生详细信息)
   */
  // console.log(Storage.get('TOKEN'))

  var myPopup = function () {
    $ionicPopup.show({
      title: '您暂未通过审核，您可前往“我的资料”修改个人信息，其他操作没有权限，请耐心等待！',
      buttons: [
        {
          text: '確定',
          type: 'button-positive',
          onTap: function (e) {
            // $state.go('signin')
          }
        }
      ]
    })
  }

  $scope.goSchedual = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.schedual')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goFee = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.myfee')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goFeedback = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.feedback')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goAdvice = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.advice')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goNocounsel = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.nocounsel')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }

  // 获取用户角色
  $scope.master = false
  User.getUserId({
    username: Storage.get('UID')
  }).then(function (data) {
    // console.log(data)
    if (data.results == 0 && data.roles.indexOf('master') != -1) {
      $scope.master = true
    }
  }, function (err) {
    console.log(err)
  })
  // 获取医生信息
  Doctor.getDoctorInfo({
    // token: Storage.get('TOKEN')
  }).then(function (data) {
    // alert(Storage.get('UID')+JSON.stringify(data))
    // console.log(data)
    $scope.doctor = data.results
    // console.log($scope.doctor)
    if ($scope.doctor.photoUrl == '' || $scope.doctor.photoUrl == null || $scope.doctor.photoUrl == undefined) {
      $scope.doctor.photoUrl = 'img/doctor.png'
      // if(Storage.get('wechatheadimgurl')!=undefined||Storage.get('wechatheadimgurl')!=""||Storage.get('wechatheadimgurl')!=null){
      //     $scope.doctor.photoUrl=Storage.get('wechatheadimgurl')
      // }
    }
  }, function (err) {
    console.log(err)
  })

  // $scope.loadData();
  $scope.params = {
    // groupId:$state.params.groupId
    userId: Storage.get('UID')
  }

  // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function ($event) {
    $ionicActionSheet.show({
      buttons: [
       { text: '拍照' },
       { text: '从相册选择' }
      ],
      cancelOnStateChange: true,
     // titleText: '上传头像',
      buttonClicked: function (index) {
        if (index === 0) {
          $scope.onClickCameraPhotos()
        } else {
          $scope.choosePhotos()
        }
       // return true;
      }
    })
    // $scope.openPopover($event)
  }
  $scope.reload = function () {
    var t = $scope.doctor.photoUrl
    $scope.doctor.photoUrl = ''
    $scope.$apply(function () {
      $scope.doctor.photoUrl = t
    })
  }

  // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function (imgURI) {
    // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get('UID') + '_' + 'doctor.photoUrl.jpg'
    console.log(temp_photoaddress)
    Camera.uploadPicture(imgURI, temp_photoaddress).then(function (res) {
      var data = angular.fromJson(res)
      // res.path_resized
      // 图片路径
      $scope.doctor.photoUrl = CONFIG.mediaUrl + String(data.path_resized) + '?' + new Date().getTime()
      console.log($scope.doctor.photoUrl)
      // $state.reload("tab.mine")
      // Storage.set('doctor.photoUrlpath',$scope.doctor.photoUrl);
      Doctor.editDoctorDetail({userId: Storage.get('UID'), photoUrl: $scope.doctor.photoUrl}).then(function (r) {
        console.log(r)
      })
    }, function (err) {
      console.log(err)
      reject(err)
    })
  }
  // -----------------------上传头像---------------------
  // ionicPopover functions 弹出框的预定义
  // --------------------------------------------
  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('partials/pop/cameraPopover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }
  $scope.closePopover = function () {
    $scope.popover.hide()
  }
    // Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove()
  })
    // Execute action on hide popover
  $scope.$on('popover.hidden', function () {
        // Execute action
  })
    // Execute action on remove popover
  $scope.$on('popover.removed', function () {
        // Execute action
  })

    // 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function () {
        // console.log("选个照片");
    $scope.choosePhotos()
    $scope.closePopover()
  }
  $scope.choosePhotos = function () {
    Camera.getPictureFromPhotos('gallery').then(function (data) {
            // data里存的是图像的地址
            // console.log(data);
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
            // console.err(err);
      var imgURI
    })// 从相册获取照片结束
  } // function结束

    // 照相机的点击事件----------------------------------
  $scope.getPhoto = function () {
        // console.log("要拍照了！");
    $scope.takePicture()
    $scope.closePopover()
  }
  $scope.isShow = true
  $scope.takePicture = function () {
    Camera.getPicture('cam').then(function (data) {
      console.log(data)
      photo_upload_display(data)
    }, function (err) {
            // console.err(err);
      var imgURI
    })// 照相结束
  } // function结束
}])

// "我”二维码页-zy
.controller('QRcodeCtrl', ['Doctor', '$scope', '$state', '$interval', '$rootScope', 'Storage', 'Mywechat', function (Doctor, $scope, $state, $interval, $rootScope, Storage, Mywechat) {
  // $scope.hideTabs = true;
  // $scope.userid=Storage.get('userid');
  // $scope.doctor=meFactory.GetDoctorInfo($scope.userid);

  //  $scope.qrscan= function(){
  //   QRScan.getCode({
  //   userId:'doc01'
  // })
  //   .then(function(data){
  //     console.log(data);
  //   },function(err){
  //     console.log(err);
  //   })
  // };

  // $scope.params = {
  //     // groupId:$state.params.groupId
  //     userId:Storage.get('UID')
  // }
  if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
    $state.go('tab.workplace')
  }
  $scope.doctor = ''
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(医生详细信息,此处主要是二维码信息)
   */
  Doctor.getDoctorInfo({
    userId: Storage.get('UID')
  }).then(function (data) {
    // console.log(data)
    $scope.doctor = data.results
    // if (angular.isDefined($scope.doctor.docTDCticket) != true) {
    if ($scope.doctor.docTDCticket == null) {
      var params = {
        'role': 'patient',
        // 'userId': Storage.get('UID'),
        'postdata': {
          'action_name': 'QR_LIMIT_STR_SCENE',
          'action_info': {
            'scene': {
              'scene_str': Storage.get('UID')
            }
          }
        }
      }
      Mywechat.createTDCticket(params).then(function (data) {
        $scope.ticket = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + data.results.TDCticket
      }, function (err) {
        console.log(err)
      })
    } else {
      $scope.ticket = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + $scope.doctor.docTDCticket
    }
  }, function (err) {
    console.log(err)
  })
}])

// 我的个人资料页-zy，zxf
.controller('myinfoCtrl', ['CONFIG', 'Dict', 'Camera', 'Doctor', '$scope', 'Storage', '$ionicPopover', '$ionicModal', '$ionicScrollDelegate', function (CONFIG, Dict, Camera, Doctor, $scope, Storage, $ionicPopover, $ionicModal, $ionicScrollDelegate) {
  $scope.hideTabs = true
  $scope.updateDiv = false
  $scope.myDiv = true
  $scope.ProvinceObject = {}
  $scope.CityObject = {}
  $scope.HosObject = {}
  $scope.Titles =
  [
    {Name: '主任医师', Type: 1},
    {Name: '副主任医师', Type: 2},
    {Name: '主治医师', Type: 3},
    {Name: '住院医师', Type: 4},
    {Name: '主任护师', Type: 5},
    {Name: '副主任护师', Type: 6},
    {Name: '主管护师', Type: 7},
    {Name: '护师', Type: 8},
    {Name: '护士', Type: 9}
  ]
  // console.log(Storage.get('UID'))
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(医生详细信息)
   */
  Doctor.getDoctorInfo({
    // token: Storage.get('TOKEN')
  }).then(function (data) {
    // console.log(data)
    $scope.doctor = data.results
  }, function (err) {
    console.log(err)
  })

  /**
   * [编辑医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    $scope.doctor(医生详细信息): object
   * @return   保存成功
   */
  $scope.editinfo = function () {
    // $scope.ProvinceObject = $scope.doctor.province;
    // console.log("123"+$scope.ProvinceObject);
    $scope.doctor.title = $scope.doctor.title.Name
    Doctor.editDoctorDetail($scope.doctor).then(function (data) {
      console.log(data)
    }, function (err) {
      console.log(err)
    })
    $scope.myDiv = !$scope.myDiv
    $scope.updateDiv = !$scope.updateDiv
  }

  // 点击编辑按钮切换显示页面
  $scope.toggle = function () {
    $scope.myDiv = !$scope.myDiv
    $scope.updateDiv = !$scope.updateDiv
    // $scope.ProvinceObject = $scope.doctor.province;
    // console.log($scope.ProvinceObject);
    // 搜索
    var searchObj = function (code, array) {
      if (array && array.length) {
        for (var i = 0; i < array.length; i++) {
          if (array[i].name == code || array[i].hospitalName == code || array[i].Name == code) return array[i]
        };
      }
      return '未填写'
    }
    // 读职称
    if ($scope.doctor.title != null) {
      console.log($scope.doctor.title)
      console.log($scope.Titles)
      $scope.doctor.title = searchObj($scope.doctor.title, $scope.Titles)
    }
    // -------------点击编辑省市医院读字典表--------------
    if ($scope.doctor.province != null) {
            // console.log($scope.doctor.province)
            // console.log($scope.Provinces)
      $scope.ProvinceObject = searchObj($scope.doctor.province, $scope.Provinces)
    }
    if ($scope.doctor.city != null) {
      // console.log($scope.ProvinceObject.province)
      Dict.getDistrict({level: '2', province: $scope.ProvinceObject.province, city: '', district: ''}).then(function (data) {
        $scope.Cities = data.results
        // console.log($scope.Cities);
        $scope.CityObject = searchObj($scope.doctor.city, $scope.Cities)
        console.log($scope.CityObject)
        console.log($scope.CityObject.name)
        if ($scope.doctor.workUnit != null) {
          // console.log($scope.Hospitals)
          console.log($scope.doctor.workUnit)
          console.log($scope.CityObject)
          console.log($scope.CityObject.name)
          Dict.getHospital({city: $scope.CityObject.name}).then(function (data) {
            $scope.Hospitals = data.results
            // console.log($scope.Hospitals);
            $scope.HosObject = searchObj($scope.doctor.workUnit, $scope.Hospitals)
          }, function (err) {
            console.log(err)
          })
        }
      }, function (err) {
        console.log(err)
      })
    }
    // -------------点击编辑省市医院读字典表--------------
  }

  // --------------省市医院读字典表---------------------
  Dict.getDistrict({level: '1', province: '', city: '', district: ''}).then(function (data) {
    $scope.Provinces = data.results
    // $scope.Province.province = "";
    // console.log($scope.Provinces)
  }, function (err) {
    console.log(err)
  })

  $scope.getCity = function (pro) {
    console.log(pro)
    if (pro != null) {
      Dict.getDistrict({level: '2', province: pro, city: '', district: ''}).then(function (data) {
        $scope.Cities = data.results
        console.log($scope.Cities)
      }, function (err) {
        console.log(err)
      })
    } else {
      $scope.Cities = {}
      $scope.Hospitals = {}
    }
  }

  $scope.getHospital = function (city) {
    console.log(city)
    if (city != null) {
      // var locationCode = district.province + district.city + district.district
      // console.log(locationCode)
      Dict.getHospital({city: city}).then(function (data) {
        $scope.Hospitals = data.results
        console.log($scope.Hospitals)
      }, function (err) {
        console.log(err)
      })
    } else {
      $scope.Hospitals = {}
    }
  }

  $scope.trans = function (docinfo) {
    console.log(docinfo)
    if (docinfo != null) {
      $scope.doctor.province = docinfo.province
      $scope.doctor.city = docinfo.city
      $scope.doctor.workUnit = docinfo.hospitalName
    }
  }

  // 执照照片
  $scope.zoomMin = 1
  $scope.imageUrl = ''
  $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal
        // $scope.modal.show();
    $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
  })
  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
        // $scope.modal.remove()
  }
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }
  // 0516 zxf
  $scope.flag = 0// 判断是给谁传图片 默认是资格证书
  // 点击显示大图
  $scope.doctorimgurl = ''
  // $ionicModal.fromTemplateUrl('partials/others/doctorimag.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  // }).then(function(modal) {
  //     console.log(2222)
  //     $scope.modal = modal;
  // });

  $scope.onClickCamera = function ($event, index) {
    $scope.openPopover($event)
    $scope.flag = index
  }
  // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function (imgURI) {
    var temp_photoaddress
    if ($scope.flag == 0) {
      temp_photoaddress = Storage.get('UID') + '_' + new Date().getTime() + 'certificate.jpg'
    } else {
      temp_photoaddress = Storage.get('UID') + '_' + new Date().getTime() + 'practising.jpg'
    }
    Camera.uploadPicture(imgURI, temp_photoaddress).then(function (res) {
      var data = angular.fromJson(res)
            // 图片路径
      if ($scope.flag == 0) {
        $scope.doctor.certificatePhotoUrl = CONFIG.mediaUrl + String(data.path_resized)
      } else {
        $scope.doctor.practisingPhotoUrl = CONFIG.mediaUrl + String(data.path_resized)
      }
    }, function (err) {
      console.log(err)
      reject(err)
    })
  }
  // -----------------------上传头像---------------------
  // ionicPopover functions 弹出框的预定义
  $ionicPopover.fromTemplateUrl('partials/pop/cameraPopover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }
  $scope.closePopover = function () {
    $scope.popover.hide()
  }
    // Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove()
  })
    // Execute action on hide popover
  $scope.$on('popover.hidden', function () {
    // Execute action
  })
    // Execute action on remove popover
  $scope.$on('popover.removed', function () {
    // Execute action
  })

    // 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function () {
        // console.log("选个照片");
    $scope.choosePhotos()
    $scope.closePopover()
  }
  $scope.choosePhotos = function () {
    Camera.getPictureFromPhotos('gallery', true).then(function (data) {
          // data里存的是图像的地址
          // console.log(data);
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
          // console.err(err);
      var imgURI
    })// 从相册获取照片结束
  } // function结束

  // 照相机的点击事件----------------------------------
  $scope.getPhoto = function () {
        // console.log("要拍照了！");
    $scope.takePicture()
    $scope.closePopover()
  }
  $scope.isShow = true
  $scope.takePicture = function () {
    Camera.getPicture('cam', true).then(function (data) {
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
      // console.err(err);
      var imgURI
    })// 照相结束
  } // function结束

  // $scope.openModal = function() {
  //   $scope.modal.show();
  // };
  // $scope.closeModal = function() {
  //   $scope.modal.hide();
  // };
  // //Cleanup the modal when we're done with it!
  // $scope.$on('$destroy', function() {
  //   $scope.modal.remove();
  // });
  // // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('modal.removed', function() {
  //   // Execute action
  // });

  // //点击图片返回
  // $scope.imggoback = function(){
  //     $scope.modal.hide();
  // };
  $scope.showoriginal = function (resizedpath) {
    // $scope.openModal();
    // console.log(resizedpath)
    var originalfilepath = CONFIG.imgLargeUrl + resizedpath.slice(resizedpath.lastIndexOf('/') + 1).substr(7)
    // console.log(originalfilepath)
    // $scope.doctorimgurl=originalfilepath;

    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = originalfilepath
    $scope.modal.show()
  }
    // $scope.deleteimg=function(index){
    //     //somearray.removeByValue("tue");
    //     console.log($scope.health.imgurl)
    //     $scope.health.imgurl.splice(index, 1)
    //     // Storage.set('tempimgrul',angular.toJson($scope.images));
    // }
    // ------------省市医院读字典表--------------------
}])

// "我”个人收费页-zy.zxf,mzb
.controller('myfeeCtrl', ['Account', 'Doctor', '$scope', '$ionicPopup', '$state', 'Storage', 'User', function (Account, Doctor, $scope, $ionicPopup, $state, Storage, User) {
  $scope.hideTabs = true
  // $scope.alipay = ''
  // $scope.alipayIcon = 'img/alipay.png'
  // $scope.wechat = ''
  // $scope.wechatIcon = 'img/wechat.png'
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(医生详细信息,此处取收费方面的信息)
   */
  var load = function () {
    Doctor.getDoctorInfo({
      userId: Storage.get('UID')
    }).then(function (data) {
      // console.log(data)
      $scope.doctor = data.results
      // console.log($scope.doctor)
    }, function (err) {
      console.log(err)
    })

  /**
   * [获取医生账户信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results[0].money
   */
    Account.getAccountInfo({
      userId: Storage.get('UID')
    }).then(function (data) {
      // console.log(data)
      // console.log(data.results[0].money)
      $scope.account = {money: data.results.length == 0 ? 0 : data.results[0].money}
      // if (data.results.length!=0)
      // {
      //     $scope.account=data.results
      // }
      // else
      // {
      //     $scope.account={money:0}
      // }
    }, function (err) {
      console.log(err)
    })

    // 获取用户的支付宝账号
    // Doctor.getAliPayAccount({
    //   userId: Storage.get('UID')
    // }).then(function (data) {
    //   // console.log(data)
    //   if (data.hasOwnProperty('results') && data.results != '') {
    //     $scope.alipay = data.results
    //     $scope.alipayIcon = 'img/alipay_2.jpg'
    //   }
    // }, function (err) {
    //   console.log(err)
    // })
    // 获取用户的微信unionId
    // User.getUserId({username: Storage.get('UID')}).then(function (data) {
    //   // console.log(data);
    //   // console.log(Storage.get('UID'))
    //   if (data.hasOwnProperty('openId')) {
    //     $scope.wechat = 'ok'
    //     $scope.wechatIcon = 'img/wechat_2.png'
    //   }
    // }, function (err) {
    //   console.log(err)
    // })
  }
  $scope.$on('$ionicView.enter', function () {
    load()
  })
  $scope.doRefresh = function () {
    load()
    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }

  /**
   * [编辑收费标准保存]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    $scope.doctor.charge2: number; $scope.doctor.charge1: number
   * @return   收费定制保存
   */
  // $scope.savefee = function () {
  //   if ($scope.doctor.charge2 <= $scope.doctor.charge1) {
  //     $scope.SaveStatus = '问诊收费应高于咨询收费，请重新设置'
  //     return
  //   }
  //   if ($scope.doctor.charge2 == 0 || $scope.doctor.charge1 == 0) {
  //     $scope.SaveStatus = '收费不能设为0，请重新设置'
  //     return
  //   }
  //   Doctor.editDoctorDetail($scope.doctor).then(function (data) {
  //   // console.log(data)
  //   // $scope.doctor=data.result;
  //   }, function (err) {
  //     console.log(err)
  //   })
  //   $state.go('tab.me')
  // }
  // 查看资金流水
  $scope.getBill = function () {
    // console.log("bill");
    $state.go('tab.bill')
  }

  $scope.goAccountManage = function () {
    $state.go('tab.accountManage')
  }

  // $scope.bindAliPay = function () {
  //   // console.log("bind alipay");
  //   $scope.ap = {a: $scope.alipay}
  //   var cm = $ionicPopup.show({
  //     title: '修改支付宝账号',
  //     cssClass: 'popupWithKeyboard',
  //     template: '<input type=text ng-model="ap.a">',
  //     scope: $scope,
  //     buttons: [
  //       {
  //         text: '確定',
  //         type: 'button-positive',
  //         onTap: function (event) {
  //           var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
  //           var emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  //                       // 手机正则表达式验证
  //           if (!phoneReg.test($scope.ap.a) && !emailReg.test($scope.ap.a)) {
  //             $ionicPopup.alert({
  //               cssClass: 'popupWithKeyboard',
  //               title: '支付宝账号为邮箱或者手机号',
  //               okText: '确定'
  //             })
  //             return
  //           }
  //           $scope.alipay = $scope.ap.a
  //           Doctor.editAliPayAccount({userId: Storage.get('UID'), aliPayAccount: $scope.ap.a}).then(function (succ) {
  //                           // console.log(succ)
  //             $scope.alipay = $scope.ap.a
  //             $scope.alipayIcon = 'img/alipay_2.jpg'
  //           }, function (err) {
  //             console.log(err)
  //           })
  //                       // console.log($scope.alipay);
  //         }
  //       },
  //       {
  //         text: '取消',
  //         type: 'button-assert',
  //         onTap: function () {
  //                       // console.log("cancle")
  //         }
  //       }
  //     ]
  //   })
  // }
}])

// 我的账户管理
.controller('accountManageCtrl', ['Doctor', 'Storage', 'User', '$scope', '$state', '$ionicPopup', function (Doctor, Storage, User, $scope, $state, $ionicPopup) {
  $scope.alipay = ''
  $scope.alipayIcon = 'img/alipay.png'
  $scope.wechat = ''
  $scope.wechatIcon = 'img/wechat.png'
      // 获取用户的支付宝账号
  Doctor.getAliPayAccount({
    userId: Storage.get('UID')
  }).then(function (data) {
      // console.log(data)
    if (data.hasOwnProperty('results') && data.results != '') {
      $scope.alipay = data.results
      $scope.alipayIcon = 'img/alipay_2.jpg'
    }
  }, function (err) {
    console.log(err)
  })
    // 获取用户的微信unionId
  User.getUserId({username: Storage.get('UID')}).then(function (data) {
      // console.log(data);
      // console.log(Storage.get('UID'))
    if (data.hasOwnProperty('openId')) {
      $scope.wechat = 'ok'
      $scope.wechatIcon = 'img/wechat_2.png'
    }
  }, function (err) {
    console.log(err)
  })
  $scope.bindAliPay = function () {
    // console.log("bind alipay");
    $scope.ap = {a: $scope.alipay}
    var cm = $ionicPopup.show({
      title: '修改支付宝账号',
      cssClass: 'popupWithKeyboard',
      template: '<input type=text ng-model="ap.a">',
      scope: $scope,
      buttons: [
        {
          text: '確定',
          type: 'button-positive',
          onTap: function (event) {
            var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            var emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
                        // 手机正则表达式验证
            if (!phoneReg.test($scope.ap.a) && !emailReg.test($scope.ap.a)) {
              $ionicPopup.alert({
                cssClass: 'popupWithKeyboard',
                title: '支付宝账号为邮箱或者手机号',
                okText: '确定'
              })
              return
            }
            $scope.alipay = $scope.ap.a
            Doctor.editAliPayAccount({userId: Storage.get('UID'), aliPayAccount: $scope.ap.a}).then(function (succ) {
                            // console.log(succ)
              $scope.alipay = $scope.ap.a
              $scope.alipayIcon = 'img/alipay_2.jpg'
            }, function (err) {
              console.log(err)
            })
                        // console.log($scope.alipay);
          }
        },
        {
          text: '取消',
          type: 'button-assert',
          onTap: function () {
                        // console.log("cancle")
          }
        }
      ]
    })
  }
}])

// "我”的评价-zy
.controller('feedbackCtrl', ['Patient', 'Doctor', '$scope', '$ionicPopup', '$state', 'Storage', function (Patient, Doctor, $scope, $ionicPopup, $state, Storage) {
  $scope.hideTabs = true
  var commentlength = ''
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.comments(评价信息); data.results(医生信息，此处取评分信息)
   */
  var load = function () {
    Doctor.getDoctorInfo({
      userId: Storage.get('UID')
    }).then(function (data) {
      // console.log(data)
      $scope.feedbacks = data.comments
      $scope.doctor = data.results
      // console.log($scope.feedbacks.length)
      // commentlength=data.comments.length;
      //   for (var i=0; i<commentlength; i++){
      //       commentlist[i]=$scope.feedbacks[i].pateintId.userId;
    }, function (err) {
      console.log(err)
    })

    // for (var i=0; i<commentlength; i++){
    //     Patient.getPatientDetail({
    //     userId:$scope.feedbacks[i].pateintId.userId
    // })
    //     .then(
    //         function(data)
    //         {
    //         // console.log(data)
    //             $scope.feedbacks[i].photoUrl=data.results.photoUrl;
    //         },
    //         function(err)
    //         {
    //             console.log(err)
    //         }
    //     );
    // }
  }
  $scope.$on('$ionicView.enter', function () {
    load()
  })

  $scope.doRefresh = function () {
    load()
        // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
  // 查看评价详情
  $scope.gocommentdetail = function (score, content) {
    console.log(score + content)
    $state.go('tab.commentdetail', {rating: score, content: content})
  }
}])

// "我”的评价详情-zxf
.controller('SetCommentCtrl', ['$scope', '$state', '$stateParams', '$ionicHistory', 'Storage', function ($scope, $state, $stateParams, $ionicHistory, Storage) {
  $scope.comment = {score: $stateParams.rating, commentContent: $stateParams.content}
  // console.log($stateParams.rating+$stateParams.content)
  $scope.editable = true

  // 评论星星初始化
  $scope.ratingsObject = {
    iconOn: 'ion-ios-star',
    iconOff: 'ion-ios-star-outline',
    iconOnColor: '#FFD700', // rgb(200, 200, 100)
    iconOffColor: 'rgb(200, 100, 100)',
    rating: $scope.comment.score / 2,
    minRating: 1,
    readOnly: true
        // callback: function(rating) {
        //   $scope.ratingsCallback(rating);
        // }
  }
      // $stateParams.counselId
       // 获取历史评论
      // if($stateParams.counselId!=undefined&&$stateParams.counselId!=""&&$stateParams.counselId!=null){
      //   console.log($stateParams.counselId)
      //   Comment.getCommentsByC({counselId:$stateParams.counselId}).then(function(data){
      //     if(data.results.length!=0){
      //       // //初始化
      //       $scope.comment.score=data.results[0].totalScore/2
      //       $scope.comment.commentContent=data.results[0].content
      //        //评论星星初始化
      //        $scope.$broadcast('changeratingstar',$scope.comment.score,true);
      //        $scope.editable=true;
      //     }
      //   }, function(err){
      //     console.log(err)
      //   })
      // }

  $scope.Goback = function () {
    $ionicHistory.goBack()
  }
}])

// "我”设置页-mzb,zy
.controller('setCtrl', ['$scope', '$ionicPopup', '$state', '$timeout', '$stateParams', 'Storage', '$sce', 'socket', 'mySocket', function ($scope, $ionicPopup, $state, $timeout, $stateParams, Storage, $sce, socket, mySocket) {
  $scope.hideTabs = true
  /**
   * [退出登录]
   * @Author   ZY
   * @DateTime 2017-07-05
   */
  $scope.logout = function () {
    socket.emit('disconnect')
    // Storage.set('IsSignIn','NO');
    $state.logStatus = '用户已注销'
    // 清除登陆信息
    Storage.rm('password')
    // Storage.rm('UID');
    Storage.rm('doctorunionid')
    Storage.rm('IsSignIn')
    // Storage.rm('USERNAME');
    Storage.rm('PASSWORD')
    Storage.rm('userid')
    console.log($state)
    mySocket.cancelAll()
    socket.emit('disconnect')
    socket.disconnect()
    // $scope.navigation_login = $sce.trustAsResourceUrl('http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx')
    $timeout(function () { $state.go('signin') }, 500)
  }
}])

// "我”设置内容修改密码页-mzb,zy
.controller('set-contentCtrl', ['$timeout', '$scope', '$ionicPopup', '$state', '$stateParams', 'Storage', 'User', function ($timeout, $scope, $ionicPopup, $state, $stateParams, Storage, User) {
  $scope.hideTabs = true
  $scope.type = $stateParams.type
  /**
   * [重置密码]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    oldPW: string; newPW: string; confirmPW: string
   * @return   修改成功
   */
  $scope.resetPassword = function (oldPW, newPW, confirmPW) {
    // console.log("resetpw")
    // console.log(oldPW)
    // console.log(newPW)
    // console.log(confirmPW)
    if (oldPW == undefined) {
      $scope.changePasswordStatus = '请输入旧密码'
      return
    }
    if (oldPW == newPW) {
      $scope.changePasswordStatus = '不能重置为之前的密码'
      return
    }
    if (newPW == undefined || newPW.length < 6) {
      $scope.changePasswordStatus = '新密码不能为空且必须大于6位'
      return
    }
    if (newPW != confirmPW) {
      $scope.changePasswordStatus = '两次输入不一致'
      return
    }
    // 执行密码修改
    User.logIn({username: Storage.get('USERNAME'), password: oldPW, role: 'doctor'}).then(function (succ) {
      // console.log(Storage.get('USERNAME'))
      if (succ.results.mesg == 'login success!') {
        User.changePassword({phoneNo: Storage.get('USERNAME'), password: newPW}).then(function (succ) {
          // console.log(succ)
          var phoneNo = Storage.get('USERNAME')
          // Storage.clear();
          Storage.set('USERNAME', phoneNo)
          $scope.changePasswordStatus = '修改成功！'
          // $state.go('signin');
          $timeout(function () { $state.go('tab.set') }, 500)
        }, function (err) {
          console.log(err)
        })
      } else {
        $scope.changePasswordStatus = '旧密码不正确'
      }
    }, function (err) {
      console.log(err)
    })
  }
}])

// “我”设置内容查看协议页-zy
.controller('viewAgreeCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', function ($scope, $state, Storage, $ionicHistory) {

}])

// "我”排班页-mzb
.controller('schedualCtrl', ['$scope', 'ionicDatePicker', '$ionicPopup', 'Doctor', 'Storage', '$interval', function ($scope, ionicDatePicker, $ionicPopup, Doctor, Storage, $interval) {
  $scope.dateC = new Date()
  var getSchedual = function () {
    Doctor.getSchedules({userId: Storage.get('UID')}).then(function (data) {
            // console.log(data)
      angular.forEach(data.results.schedules, function (value, key) {
                // console.log(value)
        var index = value.day - '0'
        if (value.time == 1) { index += 7 }
        $scope.workStatus[index].status = 1
        $scope.workStatus[index].style = {'background-color': 'red'}
      })
    }, function (err) {
      console.log(err)
    })
    Doctor.getSuspendTime({userId: Storage.get('UID')}).then(function (data) {
      console.log(data.results.suspendTime)
      if (data.results.suspendTime.length == 0) {
        $scope.stausText = '接诊中...'
        $scope.stausButtontText = '设置停诊'
      } else {
        var date = new Date()
        var dateNow = '' + date.getFullYear();
        (date.getMonth() + 1) < 10 ? dateNow += '0' + (date.getMonth() + 1) : dateNow += (date.getMonth() + 1)
        date.getDate() < 10 ? dateNow += '0' + date.getDate() : dateNow += date.getDate()
        console.log(dateNow)

        $scope.begin = data.results.suspendTime[0].start
        $scope.end = data.results.suspendTime[0].end

        date = new Date($scope.begin)
        var dateB = '' + date.getFullYear();
        (date.getMonth() + 1) < 10 ? dateB += '0' + (date.getMonth() + 1) : dateB += (date.getMonth() + 1)
        date.getDate() < 10 ? dateB += '0' + date.getDate() : dateB += date.getDate()
        date = new Date($scope.end)
        var dateE = '' + date.getFullYear();
        (date.getMonth() + 1) < 10 ? dateE += '0' + (date.getMonth() + 1) : dateE += (date.getMonth() + 1)
        date.getDate() < 10 ? dateE += '0' + date.getDate() : dateE += date.getDate()

        if (dateNow >= dateB && dateNow <= dateE) {
          $scope.stausText = '停诊中...'
        } else {
          $scope.stausText = '接诊中...'
        }
        $scope.stausButtontText = '取消停诊'
      }
    }, function (err) {
      console.log(err)
    })
  }
  $scope.workStatus = [
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}},
    {status: 0, style: {'background-color': 'white'}}
  ]
  $scope.stausButtontText = '停诊'
  $scope.stausText = '接诊中...'
  $scope.showSchedual = true
  getSchedual()
  $interval(function () {
    var getD = new Date()
    if (getD.getDate() != $scope.dateC.getDate()) {
      $scope.dateC = new Date()
      getSchedual()
    }
  }, 1000)
  var ipObj1 = {
    callback: function (val) {  // Mandatory
            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      if ($scope.flag == 1) {
        $scope.begin = val
        if ($scope.end == undefined || $scope.begin > new Date($scope.end)) { $scope.end = $scope.begin }
      } else {
        $scope.end = val
        if ($scope.begin != undefined && $scope.begin > new Date($scope.end)) { $scope.begin = $scope.end }
      }
    },
    titleLabel: '',
    inputDate: new Date(),
    mondayFirst: true,
    closeOnSelect: false,
    templateType: 'popup',
    setLabel: '确定',
    todayLabel: '今天',
    closeLabel: '取消',
    showTodayButton: true,
    dateFormat: 'yyyy MMMM dd',
    weeksList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    monthsList: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    from: new Date()
  }

  $scope.openDatePicker = function (params) {
    ipObj1.titleLabel = params == 1 ? '停诊开始日期' : '停诊结束日期'
    if (params == 1) {
      if ($scope.begin != undefined) { ipObj1.inputDate = new Date($scope.begin) }
    } else {
      if ($scope.end != undefined) { ipObj1.inputDate = new Date($scope.end) }
    }
    ionicDatePicker.openDatePicker(ipObj1)
    $scope.flag = params// 标识选定时间用于开始时间还是结束时间
  }

  $scope.showSch = function () {
    if ($scope.stausButtontText == '设置停诊') {
      $scope.showSchedual = false
    } else {
      var param = {
        userId: Storage.get('UID'),
        start: $scope.begin,
        end: $scope.end
      }
      // console.log(param)
      Doctor.deleteSuspendTime(param).then(function (data) {
        console.log(data)
        $scope.stausButtontText = '设置停诊'
        $scope.stausText = '接诊中...'
      }, function (err) {
        console.log(err)
      })
    }
  }
  $scope.stopWork = function (cancel) {
    if (cancel) {
      $scope.showSchedual = true
      return
    }
    if ($scope.begin != undefined && $scope.end != undefined) {
      var param = {
        userId: Storage.get('UID'),
        start: $scope.begin,
        end: $scope.end
      }
      // console.log(param)
      Doctor.insertSuspendTime(param).then(function (data) {
        $scope.showSchedual = true
        getSchedual()
      }, function (err) {
        console.log(err)
      })
    }
  }
  $scope.changeWorkStatus = function (index) {
    // console.log("changeWorkStatus"+index)
    var text = ''
    if ($scope.workStatus[index].status == 0) {
      text = '此时间段将更改为工作状态！'
    } else {
      text = '此时间段将更改为空闲状态！'
    }
    var confirmPopup = $ionicPopup.confirm({
      title: '修改工作状态',
      template: text,
      cancelText: '取消',
      okText: '确定'
    })

    confirmPopup.then(function (res) {
      if (res) {
        // console.log('You are sure');
        var param = {
          userId: Storage.get('UID'),
          day: index.toString(),
          time: '0'
        }
        if (index > 6) {
          param.time = '1'
          param.day = (index - 7).toString()
        }
        // console.log(param)
        if ($scope.workStatus[index].status == 0) {
          Doctor.insertSchedule(param).then(function (data) {
            // console.log(data)
            $scope.workStatus[index].status = 1
            $scope.workStatus[index].style = {'background-color': 'red'}
          }, function (err) {
            console.log(err)
          })
        } else {
          Doctor.deleteSchedule(param).then(function (data) {
                        // console.log(data)
            $scope.workStatus[index].status = 0
            $scope.workStatus[index].style = {'background-color': 'white'}
          }, function (err) {
            console.log(err)
          })
        }
      } else {
      // console.log('You are not sure');
      }
    })
  }
}])

// 意见反馈-zy
.controller('adviceCtrl', ['$scope', '$state', '$ionicLoading', 'Advice', 'Storage', '$timeout', function ($scope, $state, $ionicLoading, Advice, Storage, $timeout) {
  /**
   * [发送意见反馈]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string; role: string; topic: string; content: string
   * @return   提交成功返回我的页面
   */
  $scope.deliverAdvice = function (advice) {
    Advice.postAdvice({userId: Storage.get('UID'), role: 'doctor', topic: advice.topic, content: advice.content}).then(function (data) {
      // console.log(data)
      if (data.result == '新建成功') {
        $ionicLoading.show({
          template: '提交成功',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
        })
        $timeout(function () { $state.go('tab.me') }, 900)
      }
    }, function (err) {
      $ionicLoading.show({
        template: '提交失败',
        noBackdrop: false,
        duration: 1000,
        hideOnStateChange: true
      })
    })
  }
}])

// 关于页面-zy
.controller('aboutCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', function ($scope, $state, Storage, $ionicHistory) {

}])

// 我的服务
.controller('myserviceCtrl', ['$scope', '$state', 'Storage', '$ionicPopup', '$ionicHistory', '$ionicLoading', 'services', function ($scope, $state, Storage, $ionicPopup, $ionicHistory, $ionicLoading, services) {
  $scope.doctorinfo = {
    status1: '',
    status2: '',
    status3: '',
    status4: '',
    status5: '',
    charge1: 0,
    charge2: 0,
    charge3: 0,
    charge4: 0,
    charge5: 0}
  $scope.inp = {num: [0, 0, 0, 0, 0]}
  var getStatus = function () {
    services.getStatus({
      // token: Storage.get('TOKEN'),
      userId: Storage.get('UID')}).then(function (data) {
        console.log(data)
        $scope.doctorinfo.charge1 = parseFloat(data.results.charge1)
        $scope.doctorinfo.charge2 = parseFloat(data.results.charge2)
        $scope.doctorinfo.charge3 = parseFloat(data.results.charge3)
        $scope.doctorinfo.charge4 = parseFloat(data.results.charge4)
        $scope.doctorinfo.charge5 = parseFloat(data.results.charge5)
        $scope.inp.num[0] = parseFloat(data.results.charge1)
        $scope.inp.num[1] = parseFloat(data.results.charge2)
        $scope.inp.num[2] = parseFloat(data.results.charge3)
        $scope.inp.num[3] = parseFloat(data.results.charge4)
        $scope.inp.num[4] = parseFloat(data.results.charge5)
        if (data.results.counselStatus1) {
          $scope.doctorinfo.status1 = true
        }
        if (data.results.counselStatus2) {
          $scope.doctorinfo.status2 = true
        }
        if (data.results.counselStatus3) {
          $scope.doctorinfo.status3 = true
        }
        if (data.results.counselStatus4) {
          $scope.doctorinfo.status4 = true
        }
        if (data.results.counselStatus5) {
          $scope.doctorinfo.status5 = true
        }
      // $scope.doctorinfo.status5 = data.results.counselStatus5;
      // $scope.doctorinfo.charge5 = data.results.charge5
      // angular.forEach(data.results.schedules, function (value, key) {
                // console.log(value)
      }, function (err) {
        console.log(err)
      })
  }
  $scope.$on('$ionicView.enter', function () {
    getStatus()
  })

  $scope.consultChange = function () {
    services.setStatus({
      // token: Storage.get('TOKEN'),
      serviceType: 'service1'}).then(function (data) {
      }, function (err) {
        console.log(err)
      })
    console.log('status1', $scope.doctorinfo.status1)
    if ($scope.doctorinfo.status1) {
      $ionicPopup.show({
        template: '请输入咨询收费<input type="text" ng-model="inp.num[0]">',
        title: '设置收费',
        scope: $scope,
        buttons: [
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
              if (!$scope.doctorinfo.status1) {
              } else if (!chargeReg.test($scope.inp.num[0])) {
                $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
                services.setStatus({serviceType: 'service1'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status1 = false
              } else if ($scope.doctorinfo.status2 && parseFloat($scope.doctorinfo.charge2) <= parseFloat($scope.inp.num[0])) {
                $ionicLoading.show({ template: '问诊收费应高于咨询收费，请重新设置！', duration: 2000 })
                services.setStatus({serviceType: 'service1'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status1 = false
              } else if ($scope.doctorinfo.status3 && parseFloat($scope.doctorinfo.charge3) <= parseFloat($scope.inp.num[0])) {
                $ionicLoading.show({ template: '加急咨询收费应高于咨询收费，请重新设置！', duration: 2000 })
                services.setStatus({serviceType: 'service1'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status1 = false
              } else {
                var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                  serviceType: 'service1',
                  charge: $scope.inp.num[0]
                }
                services.setCharge(param).then(function (data) {
                  getStatus()
                }, function (err) {
                  console.log(err)
                })
                $ionicLoading.show({ template: '保存成功！', duration: 1000 })
              }
            }
          }
        ]
      })
    }
  }

  $scope.inquiryChange = function () {
    services.setStatus({
      // token: Storage.get('TOKEN'),
      serviceType: 'service2'}).then(function (data) {
      }, function (err) {
        console.log(err)
      })
    console.log('status2', $scope.doctorinfo.status2)
    if ($scope.doctorinfo.status2) {
      $ionicPopup.show({
        template: '请输入问诊收费<input type="text" ng-model="inp.num[1]">',
        title: '设置收费',
        scope: $scope,
        buttons: [
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
              if (!$scope.doctorinfo.status2) {
              } else if (!chargeReg.test($scope.inp.num[1])) {
                $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
                services.setStatus({serviceType: 'service2'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status2 = false
              } else if ($scope.doctorinfo.status1 && parseFloat($scope.doctorinfo.charge1) >= parseFloat($scope.inp.num[1])) {
                $ionicLoading.show({ template: '问诊收费应高于咨询收费，请重新设置！', duration: 2000 })
                services.setStatus({serviceType: 'service2'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status2 = false
              } else {
                var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                  serviceType: 'service2',
                  charge: $scope.inp.num[1]
                }
                services.setCharge(param).then(function (data) {
                  getStatus()
                }, function (err) {
                  console.log(err)
                })
                $ionicLoading.show({ template: '保存成功！', duration: 1000 })
              }
            }
          }
        ]
      })
    }
  }

  $scope.fastconsultChange = function () {
    services.setStatus({
      // token: Storage.get('TOKEN'),
      serviceType: 'service3'}).then(function (data) {
      }, function (err) {
        console.log(err)
      })
    console.log('status3', $scope.doctorinfo.status3)
    if ($scope.doctorinfo.status3) {
      $ionicPopup.show({
        template: '请输入加急咨询收费<input type="text" ng-model="inp.num[2]">',
        title: '设置收费',
        scope: $scope,
        buttons: [
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
              if (!$scope.doctorinfo.status3) {
              } else if (!chargeReg.test($scope.inp.num[2])) {
                $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
                services.setStatus({serviceType: 'service3'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status3 = false
              } else if ($scope.doctorinfo.status1 && parseFloat($scope.doctorinfo.charge1) >= parseFloat($scope.inp.num[2])) {
                $ionicLoading.show({ template: '加急咨询收费应高于咨询收费，请重新设置！', duration: 2000 })
                services.setStatus({serviceType: 'service3'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status3 = false
              } else {
                var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                  serviceType: 'service3',
                  charge: $scope.inp.num[2]
                }
                services.setCharge(param).then(function (data) {
                  getStatus()
                }, function (err) {
                  console.log(err)
                })
                $ionicLoading.show({ template: '保存成功！', duration: 1000 })
              }
            }
          }
        ]
      })
    }
  }

  $scope.maindoctorChange = function () {
    services.setStatus({
      // token: Storage.get('TOKEN'),
      serviceType: 'service4'}).then(function (data) {
      }, function (err) {
        console.log(err)
      })
    console.log('status4', $scope.doctorinfo.status4)
    if ($scope.doctorinfo.status4) {
      $ionicPopup.show({
        template: '请输入主管医生收费<input type="text" ng-model="inp.num[3]">',
        title: '设置收费',
        scope: $scope,
        buttons: [
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
              if (!$scope.doctorinfo.status4) {
              } else if (!chargeReg.test($scope.inp.num[3])) {
                $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
                services.setStatus({serviceType: 'service4'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status4 = false
              } else {
                var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                  serviceType: 'service4',
                  charge: $scope.inp.num[3]
                }
                services.setCharge(param).then(function (data) {
                  getStatus()
                }, function (err) {
                  console.log(err)
                })
                $ionicLoading.show({ template: '保存成功！', duration: 1000 })
              }
            }
          }
        ]
      })
    }
  }

  $scope.fsdiagnoseChange = function () {
    services.setStatus({serviceType: 'service5'}).then(function (data) {
    }, function (err) {
      console.log(err)
    })
    console.log('status5', $scope.doctorinfo.status5)
    if (!$scope.doctorinfo.status5) {
      services.getStatus({
      // token: Storage.get('TOKEN'),
      userId: Storage.get('UID')}).then(function (data) {
        console.log(data)
        angular.forEach(data.results.serviceSchedules, function (value, key) {
          console.log('value', value)
          if (!value.total == 0) {
            var para = {
              // userId: Storage.get('UID'),
              // token: Storage.get('TOKEN'),
              day: value.day,
              time: value.time
            }
            services.deleteSchedules(para).then(function (data) {
            }, function (err) {
              console.log(err)
            })
          }
        })
      }, function (err) {
        console.log(err)
      })
    } else {
      $ionicPopup.show({
        template: '请输入面诊服务收费<input type="text" ng-model="inp.num[4]">',
        title: '设置收费',
        scope: $scope,
        buttons: [
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
              if (!$scope.doctorinfo.status5) {
              } else if (!chargeReg.test($scope.inp.num[4])) {
                $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
                services.setStatus({serviceType: 'service5'}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                $scope.doctorinfo.status5 = false
              } else {
                var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                  serviceType: 'service5',
                  charge: $scope.inp.num[4]
                }
                services.setCharge(param).then(function (data) {
                  getStatus()
                }, function (err) {
                  console.log(err)
                })
                $ionicLoading.show({ template: '保存成功！', duration: 1000 })
              }
            }
          }
        ]
      })
    }
  }

  $scope.charge1Save = function () {
    $ionicPopup.show({
      template: '请输入咨询收费<input type="text" ng-model="inp.num[0]">',
      title: '设置收费',
      scope: $scope,
      buttons: [
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function (e) {
            var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
            if (!$scope.doctorinfo.status1) {
            } else if (!chargeReg.test($scope.inp.num[0])) {
              $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
              services.setStatus({serviceType: 'service1'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status1 = false
            } else if ($scope.doctorinfo.status2 && parseFloat($scope.doctorinfo.charge2) <= parseFloat($scope.inp.num[0])) {
              $ionicLoading.show({ template: '问诊收费应高于咨询收费，请重新设置！', duration: 2000 })
              services.setStatus({serviceType: 'service1'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status1 = false
            } else if ($scope.doctorinfo.status3 && parseFloat($scope.doctorinfo.charge3) <= parseFloat($scope.inp.num[0])) {
              $ionicLoading.show({ template: '加急咨询收费应高于咨询收费，请重新设置！', duration: 2000 })
              services.setStatus({serviceType: 'service1'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status1 = false
            } else {
              var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                serviceType: 'service1',
                charge: $scope.inp.num[0]
              }
              services.setCharge(param).then(function (data) {
                getStatus()
              }, function (err) {
                console.log(err)
              })
              $ionicLoading.show({ template: '保存成功！', duration: 1000 })
            }
          }
        }
      ]
    })
  }

  $scope.charge2Save = function () {
    $ionicPopup.show({
      template: '请输入问诊收费<input type="text" ng-model="inp.num[1]">',
      title: '设置收费',
      scope: $scope,
      buttons: [
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function (e) {
            var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
            if (!$scope.doctorinfo.status2) {
            } else if (!chargeReg.test($scope.inp.num[1])) {
              $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
              services.setStatus({serviceType: 'service2'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status2 = false
            } else if ($scope.doctorinfo.status1 && parseFloat($scope.doctorinfo.charge1) >= parseFloat($scope.inp.num[1])) {
              $ionicLoading.show({ template: '问诊收费应高于咨询收费，请重新设置！', duration: 2000 })
              services.setStatus({serviceType: 'service2'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status2 = false
            } else {
              var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                serviceType: 'service2',
                charge: $scope.inp.num[1]
              }
              services.setCharge(param).then(function (data) {
                getStatus()
              }, function (err) {
                console.log(err)
              })
              $ionicLoading.show({ template: '保存成功！', duration: 1000 })
            }
          }
        }
      ]
    })
  }

  $scope.charge3Save = function () {
    $ionicPopup.show({
      template: '请输入加急咨询收费<input type="text" ng-model="inp.num[2]">',
      title: '设置收费',
      scope: $scope,
      buttons: [
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function (e) {
            var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
            if (!$scope.doctorinfo.status3) {
            } else if (!chargeReg.test($scope.inp.num[2])) {
              $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
              services.setStatus({serviceType: 'service3'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status3 = false
            } else if ($scope.doctorinfo.status1 && parseFloat($scope.doctorinfo.charge1) >= parseFloat($scope.inp.num[2])) {
              $ionicLoading.show({ template: '加急咨询收费应高于咨询收费，请重新设置！', duration: 2000 })
              services.setStatus({serviceType: 'service3'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status3 = false
            } else {
              var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                serviceType: 'service3',
                charge: $scope.inp.num[2]
              }
              services.setCharge(param).then(function (data) {
                getStatus()
              }, function (err) {
                console.log(err)
              })
              $ionicLoading.show({ template: '保存成功！', duration: 1000 })
            }
          }
        }
      ]
    })
  }

  $scope.charge4Save = function () {
    $ionicPopup.show({
      template: '请输入主管医生收费<input type="text" ng-model="inp.num[3]">',
      title: '设置收费',
      scope: $scope,
      buttons: [
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function (e) {
            var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
            if (!$scope.doctorinfo.status4) {
            } else if (!chargeReg.test($scope.inp.num[3])) {
              $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
              services.setStatus({serviceType: 'service4'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status4 = false
            } else {
              var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                serviceType: 'service4',
                charge: $scope.inp.num[3]
              }
              services.setCharge(param).then(function (data) {
                getStatus()
              }, function (err) {
                console.log(err)
              })
              $ionicLoading.show({ template: '保存成功！', duration: 1000 })
            }
          }
        }
      ]
    })
  }

  $scope.charge5Save = function () {
    $ionicPopup.show({
      template: '请输入面诊服务收费<input type="text" ng-model="inp.num[4]">',
      title: '设置收费',
      scope: $scope,
      buttons: [
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function (e) {
            var chargeReg = /^\d+(\.\d+)?$/
                // 收费正则表达式验证
            if (!$scope.doctorinfo.status5) {
            } else if (!chargeReg.test($scope.inp.num[4])) {
              $ionicLoading.show({ template: '请输入非负数字！', duration: 2000 })
              services.setStatus({serviceType: 'service5'}).then(function (data) {
              }, function (err) {
                console.log(err)
              })
              $scope.doctorinfo.status5 = false
            } else {
              var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
                serviceType: 'service5',
                charge: $scope.inp.num[4]
              }
              services.setCharge(param).then(function (data) {
                getStatus()
              }, function (err) {
                console.log(err)
              })
              $ionicLoading.show({ template: '保存成功！', duration: 1000 })
            }
          }
        }
      ]
    })
  }

  $scope.illustration1 = function () {
    var alertPopup = $ionicPopup.alert({
      title: '咨询',
      template: '咨询'
    })
  }

  $scope.illustration2 = function () {
    var alertPopup = $ionicPopup.alert({
      title: '问诊',
      template: '问诊'
    })
  }

  $scope.illustration3 = function () {
    var alertPopup = $ionicPopup.alert({
      title: '加急咨询',
      template: '加急咨询'
    })
  }

  $scope.illustration4 = function () {
    var alertPopup = $ionicPopup.alert({
      title: '主管医生',
      template: '主管医生'
    })
  }

  $scope.illustration5 = function () {
    var alertPopup = $ionicPopup.alert({
      title: '面诊服务',
      template: '面诊服务'
    })
  }
}])

// 是否转发页面
.controller('forwardingCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', 'services', function ($scope, $state, Storage, $ionicHistory, services) {
  $scope.forwardinginfo = {autoRelay: '' }

  $scope.initial = {
    item: ''
  }

  var getStatus = function () {
    services.getStatus({
      // token: Storage.get('TOKEN'),
      userId: Storage.get('UID')}).then(function (data) {
        console.log(data)
        if (data.results.autoRelay) {
          $scope.forwardinginfo.autoRelay = true
          $scope.teams = data.teams
          $scope.initial.item = data.results.relayTarget[0].teamId
          console.log($scope.teams)
        }
      }, function (err) {
        console.log(err)
      })
  }
  $scope.$on('$ionicView.enter', function () {
    getStatus()
  })

  $scope.forwardingChange = function () {
    services.setStatus({
      // token: Storage.get('TOKEN'),
      serviceType: 'service6'}).then(function (data) {
        console.log(data.currentStatus)
        console.log(data.currentStatus.autoRelay)
        console.log(data)
        console.log('autoRelay', $scope.forwardinginfo.autoRelay)
        if (data.currentStatus.autoRelay) {
          $scope.forwardinginfo.autoRelay = true
          $scope.teams = data.teams
          console.log($scope.teams)
        }
      }, function (err) {
        console.log(err)
      })
  }

  $scope.pickgroup = function (teamId) {
    console.log(teamId)
    // $scope.saveChoose = function (){
    services.relayTarget({
      // token: Storage.get('TOKEN'),
      relayTarget: [{teamId}]}).then(function (data) {
        console.log(data)
      }, function (err) {
        console.log(err)
      })
  }
  // }
}])

// 面诊服务页面
.controller('faceconsultCtrl', ['$scope', '$state', 'ionicDatePicker', '$ionicHistory', '$ionicPopup', '$ionicLoading', 'Doctor', 'services', 'Storage', '$interval', function ($scope, $state, ionicDatePicker, $ionicHistory, $ionicPopup, $ionicLoading, Doctor, services, Storage, $interval) {
  $scope.dateC = new Date()
  var getStatus = function () {
    services.getStatus({
      // token: Storage.get('TOKEN'),
      userId: Storage.get('UID')}).then(function (data) {
        console.log(data)
        $scope.doctorinfo.charge5 = parseFloat(data.results.charge5)
        if (data.results.counselStatus5) {
          $scope.doctorinfo.status5 = true
        }
      // $scope.doctorinfo.status5 = data.results.counselStatus5;
      // $scope.doctorinfo.charge5 = data.results.charge5
      // angular.forEach(data.results.schedules, function (value, key) {
                // console.log(value)
      }, function (err) {
        console.log(err)
      })
  }
  $scope.$on('$ionicView.enter', function () {
    getStatus()
  })
  var getSchedules = function () {
    services.getSchedules({
      // token: Storage.get('TOKEN')
    }).then(function (data) {
      // $scope.workStatus = [
      //   {status: 0, number: 0, day: 'Mon', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Tue', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Wed', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Thu', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Fri', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Sat', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Sun', time: 'Morning', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Mon', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Tue', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Wed', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Thu', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Fri', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Sat', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
      //   {status: 0, number: 0, day: 'Sun', time: 'Afternoon', place: '', style: {'background-color': 'white'}}
      // ]
      console.log('data', data)
      angular.forEach(data.results.schedules, function (value, key) {
        // console.log('value', value)
        var index
        if (value.day == 'Mon') {
          index = 0
        } else if (value.day == 'Tue') {
          index = 1
        } else if (value.day == 'Wed') {
          index = 2
        } else if (value.day == 'Thu') {
          index = 3
        } else if (value.day == 'Fri') {
          index = 4
        } else if (value.day == 'Sat') {
          index = 5
        } else if (value.day == 'Sun') {
          index = 6
        }
        if (value.time == 'Afternoon') { index += 7 }
        $scope.workStatus[index].status = 1
        $scope.workStatus[index].style = {'background-color': 'red'}
        // $scope.workStatus[index].number = value.total
        // $scope.workStatus[index].day = value.day.toString()
        // $scope.workStatus[index].time = value.time.toString()
        $scope.workStatus[index].place = value.place
      })
      angular.forEach(data.results.serviceSchedules, function (value, key) {
        if (!value.total == 0) {
          var index2
          if (value.day == 'Mon') {
            index2 = 0
          } else if (value.day == 'Tue') {
            index2 = 1
          } else if (value.day == 'Wed') {
            index2 = 2
          } else if (value.day == 'Thu') {
            index2 = 3
          } else if (value.day == 'Fri') {
            index2 = 4
          } else if (value.day == 'Sat') {
            index2 = 5
          } else if (value.day == 'Sun') {
            index2 = 6
          }
          if (value.time == 'Afternoon') { index2 += 7 }
          $scope.workStatus[index2].number = value.total
        }
      })
    }, function (err) {
      console.log(err)
    })
    console.log($scope.workStatus)
    services.getStatus({
      // token: Storage.get('TOKEN'),
      userId: Storage.get('UID')}).then(function (data) {
        console.log(data.results.serviceSuspendTime)
        if (data.results.serviceSuspendTime.length == 0) {
          $scope.stausText = '接诊中...'
          $scope.stausButtontText = '设置停诊'
          $scope.suspend = false
        } else {
          var date = new Date()
          var dateNow = '' + date.getFullYear();
          (date.getMonth() + 1) < 10 ? dateNow += '0' + (date.getMonth() + 1) : dateNow += (date.getMonth() + 1)
          date.getDate() < 10 ? dateNow += '0' + date.getDate() : dateNow += date.getDate()
          console.log(dateNow)

          $scope.begin = data.results.serviceSuspendTime[data.results.serviceSuspendTime.length - 1].start
          $scope.end = data.results.serviceSuspendTime[data.results.serviceSuspendTime.length - 1].end

          date = new Date($scope.begin)
          var dateB = '' + date.getFullYear();
          (date.getMonth() + 1) < 10 ? dateB += '0' + (date.getMonth() + 1) : dateB += (date.getMonth() + 1)
          date.getDate() < 10 ? dateB += '0' + date.getDate() : dateB += date.getDate()
          date = new Date($scope.end)
          var dateE = '' + date.getFullYear();
          (date.getMonth() + 1) < 10 ? dateE += '0' + (date.getMonth() + 1) : dateE += (date.getMonth() + 1)
          date.getDate() < 10 ? dateE += '0' + date.getDate() : dateE += date.getDate()

          if (dateNow >= dateB && dateNow <= dateE) {
            $scope.stausText = '停诊中...'
            $scope.suspend = true
          } else {
            $scope.stausText = '接诊中...'
            $scope.suspend = true
          }
          $scope.stausButtontText = '取消停诊'
        }
      }, function (err) {
        console.log(err)
      })
  }
  $scope.workStatus = [
    {status: 0, number: 0, day: 'Mon', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Tue', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Wed', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Thu', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Fri', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Sat', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Sun', time: 'Morning', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Mon', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Tue', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Wed', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Thu', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Fri', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Sat', time: 'Afternoon', place: '', style: {'background-color': 'white'}},
    {status: 0, number: 0, day: 'Sun', time: 'Afternoon', place: '', style: {'background-color': 'white'}}
  ]
  $scope.stausButtontText = '停诊'
  $scope.stausText = '接诊中...'
  $scope.showSchedual = true
  $scope.inp = {num: '', pla: ''}
  $scope.suspendFlag = false
  $scope.suspend = false
  // $scope.fsdiagnose={checked:true, charge:''}
  $scope.doctorinfo = {status5: '', charge5: 0}
  $scope.$on('$ionicView.enter', function () {
    getSchedules()
  })

  $interval(function () {
    var getD = new Date()
    if (getD.getDate() != $scope.dateC.getDate()) {
      $scope.dateC = new Date()
      getSchedual()
    }
  }, 1000)
  var ipObj1 = {
    callback: function (val) {  // Mandatory
            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      if ($scope.flag == 1) {
        $scope.begin = val
        if ($scope.end == undefined || $scope.begin > new Date($scope.end)) { $scope.end = $scope.begin }
      } else {
        $scope.end = val
        if ($scope.begin != undefined && $scope.begin > new Date($scope.end)) { $scope.begin = $scope.end }
      }
    },
    titleLabel: '',
    inputDate: new Date(),
    mondayFirst: true,
    closeOnSelect: false,
    templateType: 'popup',
    setLabel: '确定',
    todayLabel: '今天',
    closeLabel: '取消',
    showTodayButton: true,
    dateFormat: 'yyyy MMMM dd',
    weeksList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    monthsList: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    from: new Date()
  }

  $scope.openDatePicker = function (params) {
    ipObj1.titleLabel = params == 1 ? '停诊开始日期' : '停诊结束日期'
    if (params == 1) {
      if ($scope.begin != undefined) { ipObj1.inputDate = new Date($scope.begin) }
    } else {
      if ($scope.end != undefined) { ipObj1.inputDate = new Date($scope.end) }
    }
    ionicDatePicker.openDatePicker(ipObj1)
    $scope.flag = params// 标识选定时间用于开始时间还是结束时间
  }

  $scope.showSch = function () {
    if ($scope.stausButtontText == '设置停诊') {
      $scope.showSchedual = false
    } else {
      var param = {
        // token: Storage.get('TOKEN'),
        start: $scope.begin,
        end: $scope.end
      }
      console.log(param)
      services.deleteSuspend(param).then(function (data) {
        console.log(data)
        $scope.stausButtontText = '设置停诊'
        $scope.stausText = '接诊中...'
        $scope.suspend = false
      }, function (err) {
        console.log(err)
      })
    }
  }
  $scope.stopWork = function (cancel) {
    if (cancel) {
      $scope.showSchedual = true
      return
    }
    if ($scope.begin != undefined && $scope.end != undefined) {
      var param = {
        // token: Storage.get('TOKEN'),
        start: $scope.begin,
        end: $scope.end
      }
      // console.log(param)
      services.setSuspend(param).then(function (data) {
        $scope.showSchedual = true
        getSchedules()
        $scope.suspend = true
      }, function (err) {
        console.log(err)
      })
      angular.forEach($scope.workStatus, function (value, key) {
        console.log('value', value)
        var setDay = 0
        var index
        if (value.day == 'Mon') {
          index = 0
          setDay = 1
        } else if (value.day == 'Tue') {
          index = 1
          setDay = 2
        } else if (value.day == 'Wed') {
          index = 2
          setDay = 3
        } else if (value.day == 'Thu') {
          index = 3
          setDay = 4
        } else if (value.day == 'Fri') {
          index = 4
          setDay = 5
        } else if (value.day == 'Sat') {
          index = 5
          setDay = 6
        } else if (value.day == 'Sun') {
          index = 6
          setDay = 7
        }
        if (value.time == 'Afternoon') { index += 7 }
        var nowDate = new Date()
        var nowDay = nowDate.getDay()
        if (nowDay < 1) { nowDay += 7 }
        if (nowDay > setDay) { setDay += 7 }
        var workStatusDate = new Date()
        workStatusDate.setDate(workStatusDate.getDate() - nowDay + setDay)
        if (new Date($scope.begin) <= workStatusDate && workStatusDate <= new Date($scope.end)) {
          var para = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
            day: value.day,
            time: value.time
          }
          services.deleteSchedules(para).then(function (data) {
            $scope.workStatus[index].number = 0
          }, function (err) {
            console.log(err)
          })
        }
      })
    }
  }

  // $scope.fsdiagnoseChange = function () {
  //   services.setStatus({serviceType: 'service5'}).then(function (data) {
  //   }, function (err) {
  //     console.log(err)
  //   })
  //   console.log('status5', $scope.doctorinfo.status5)
  //   if (!$scope.doctorinfo.status5) {
  //     angular.forEach($scope.workStatus, function (value, key) {
  //       console.log('value', value)
  //       // if (!value.number == 0) {
  //       var para = {
  //                   // userId: Storage.get('UID'),
  //           // token: Storage.get('TOKEN'),
  //         day: value.day,
  //         time: value.time
  //       }
  //       services.deleteSchedules(para).then(function (data) {
  //         var index
  //         if (value.day == 'Mon') {
  //           index = 0
  //         } else if (value.day == 'Tue') {
  //           index = 1
  //         } else if (value.day == 'Wed') {
  //           index = 2
  //         } else if (value.day == 'Thu') {
  //           index = 3
  //         } else if (value.day == 'Fri') {
  //           index = 4
  //         } else if (value.day == 'Sat') {
  //           index = 5
  //         } else if (value.day == 'Sun') {
  //           index = 6
  //         }
  //         if (value.time == 'Afternoon') { index += 7 }
  //           // console.log('index', index)
  //         $scope.workStatus[index].number = 0
  //       }, function (err) {
  //         console.log(err)
  //       })
  //       // }
  //     })
  //   } else {
  //     $ionicLoading.show({
  //       template: '请重新填写加号',
  //       duration: 1000
  //     })
  //     // services.getStatus({userId: Storage.get('UID')}).then(function (data) {
  //     // // console.log(data);
  //     //   $scope.doctorinfo.charge5 = parseFloat(data.results.charge5)
  //     // }, function (err) {
  //     //   console.log(err)
  //     // })
  //     // services.getSchedules({
  //     // // token: Storage.get('TOKEN')
  //     // }).then(function (data) {
  //     //   angular.forEach(data.results.schedules, function (value, key) {
  //     //     console.log('value', value)
  //     //     var index
  //     //     if (value.day == 'Mon') {
  //     //       index = 0
  //     //     } else if (value.day == 'Tue') {
  //     //       index = 1
  //     //     } else if (value.day == 'Wed') {
  //     //       index = 2
  //     //     } else if (value.day == 'Thu') {
  //     //       index = 3
  //     //     } else if (value.day == 'Fri') {
  //     //       index = 4
  //     //     } else if (value.day == 'Sat') {
  //     //       index = 5
  //     //     } else if (value.day == 'Sun') {
  //     //       index = 6
  //     //     }
  //     //     if (value.time == 'Afternoon') { index += 7 }
  //     //     Doctor.deleteSchedule({day: value.day, time: value.time}).then(function (data) {
  //     //       $scope.workStatus[index].status = 0
  //     //       $scope.workStatus[index].style = {'background-color': 'white'}
  //     //       $scope.workStatus[index].place = ''
  //     //     }, function (err) {
  //     //       console.log(err)
  //     //     })
  //     //   })
  //     // })
  //   }
  // }

  $scope.charge5Save = function () {
    var chargeReg = /^\d+(\.\d+)?$/
      // 收费正则表达式验证
    if (!chargeReg.test($scope.doctorinfo.charge5)) {
      $ionicLoading.show({ template: '请输入非负数字！', duration: 1000 })
    } else {
      var param = {
                    // userId: Storage.get('UID'),
                    // token: Storage.get('TOKEN'),
        serviceType: 'service5',
        charge: $scope.doctorinfo.charge5
      }
      services.setCharge(param).then(function (data) {
      }, function (err) {
        console.log(err)
      })
      $ionicLoading.show({ template: '保存成功！', duration: 1000 })
    }
  }

  $scope.changeWorkStatus = function (index) {
    // console.log("changeWorkStatus"+index)
    var setDay = 0
    var text = ''
    var param = {
              // userId: Storage.get('UID'),
              // token: Storage.get('TOKEN'),
      day: '',
      time: 'Morning',
      total: 0,
      place: ''
    }
    if (index == 0) {
      param.day = 'Mon'
      setDay = 1
    } else if (index == 1) {
      param.day = 'Tue'
      setDay = 2
    } else if (index == 2) {
      param.day = 'Wed'
      setDay = 3
    } else if (index == 3) {
      param.day = 'Thu'
      setDay = 4
    } else if (index == 4) {
      param.day = 'Fri'
      setDay = 5
    } else if (index == 5) {
      param.day = 'Sat'
      setDay = 6
    } else if (index == 6) {
      param.day = 'Sun'
      setDay = 7
    }
    if (index > 6) {
      param.time = 'Afternoon'
      var index2 = index - 7
      if (index2 == 0) {
        param.day = 'Mon'
        setDay = 1
      } else if (index2 == 1) {
        param.day = 'Tue'
        setDay = 2
      } else if (index2 == 2) {
        param.day = 'Wed'
        setDay = 3
      } else if (index2 == 3) {
        param.day = 'Thu'
        setDay = 4
      } else if (index2 == 4) {
        param.day = 'Fri'
        setDay = 5
      } else if (index2 == 5) {
        param.day = 'Sat'
        setDay = 6
      } else if (index2 == 6) {
        param.day = 'Sun'
        setDay = 7
      }
    }
    var nowDate = new Date()
    var nowDay = nowDate.getDay()
    if (nowDay < 1) { nowDay += 7 }
    if (nowDay > setDay) { setDay += 7 }
    var workStatusDate = new Date()
    workStatusDate.setDate(workStatusDate.getDate() - nowDay + setDay)
    console.log('setDate', workStatusDate)
    console.log('begin', new Date($scope.begin))
    console.log('end', new Date($scope.end))
    if ($scope.suspend && new Date($scope.begin) <= workStatusDate && workStatusDate <= new Date($scope.end)) {
      $scope.suspendFlag = true
    } else {
      $scope.suspendFlag = false
    }
    console.log('suspendFlag', $scope.suspendFlag)
    if ($scope.workStatus[index].status == 0 && $scope.doctorinfo.status5) {
      text = '请输入加号人数<input type="text" ng-model="inp.num">出诊医院<input type="text" ng-model="inp.pla">'

      $ionicPopup.show({
        template: text,
        title: '修改工作状态',
        scope: $scope,
        buttons: [

          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var numReg = /^\d+$/
            // 收费正则表达式验证
              if ($scope.suspendFlag) {
                $ionicLoading.show({ template: '当前停诊中', duration: 1000 })
              } else if (!numReg.test($scope.inp.num)) {
                $ionicLoading.show({ template: '请输入非负整数！', duration: 1000 })
              } else if ($scope.inp.pla == '') {
                $ionicLoading.show({ template: '出诊医院不能为空！', duration: 1000 })
              } else {
                Doctor.deleteSchedule({day: param.day, time: param.time}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                param.total = parseInt($scope.inp.num)
                param.place = $scope.inp.pla
                Doctor.insertSchedule({day: param.day, time: param.time, place: param.place}).then(function (data) {
                  $scope.workStatus[index].status = 1
                  $scope.workStatus[index].style = {'background-color': 'red'}
                  $scope.workStatus[index].place = $scope.inp.pla
                }, function (err) {
                  console.log(err)
                })
                if (!param.total == 0) {
                // console.log('param',param)
                  services.setSchedules(param).then(function (data) {
                      // console.log(data)
                    $scope.workStatus[index].number = $scope.inp.num
                  }, function (err) {
                    console.log(err)
                  })
                } else {
                  services.deleteSchedules({day: param.day, time: param.time}).then(function (data) {
                      // console.log(data)
                    console.log('param', param)
                    $scope.workStatus[index].number = 0
                  }, function (err) {
                    console.log(err)
                  })
                }
              }
            }
          },
          { text: '取消' }
        ]
      })
    } else if ($scope.workStatus[index].status == 0) {
      text = '出诊医院<input type="text" ng-model="inp.pla">'

      $ionicPopup.show({
        template: text,
        title: '修改工作状态',
        scope: $scope,
        buttons: [

          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              if ($scope.suspendFlag) {
                $ionicLoading.show({ template: '当前停诊中', duration: 1000 })
              } else if ($scope.inp.pla == '') {
                $ionicLoading.show({ template: '出诊医院不能为空！', duration: 1000 })
              } else {
                Doctor.deleteSchedule({day: param.day, time: param.time}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                param.place = $scope.inp.pla
                Doctor.insertSchedule({day: param.day, time: param.time, place: param.place}).then(function (data) {
                  $scope.workStatus[index].status = 1
                  $scope.workStatus[index].style = {'background-color': 'red'}
                  $scope.workStatus[index].place = $scope.inp.pla
                }, function (err) {
                  console.log(err)
                })
              }
            }
          },
          { text: '取消' }
        ]
      })
    } else if ($scope.workStatus[index].status == 1 && $scope.doctorinfo.status5) {
      text = '请输入加号人数<input type="text" ng-model="inp.num">出诊医院<input type="text" ng-model="inp.pla"> 点击取消修改工作状态'

      $ionicPopup.show({
        template: text,
        title: '重新设置面诊信息',
        scope: $scope,
        buttons: [

          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              var numReg = /^\d+$/
            // 收费正则表达式验证
              if ($scope.suspendFlag) {
                $ionicLoading.show({ template: '当前停诊中', duration: 1000 })
              } else if (!numReg.test($scope.inp.num)) {
                $ionicLoading.show({ template: '请输入非负整数！', duration: 1000 })
              } else if ($scope.inp.pla == '') {
                $ionicLoading.show({ template: '出诊医院不能为空！', duration: 1000 })
              } else {
                Doctor.deleteSchedule({day: param.day, time: param.time}).then(function (data) {
                }, function (err) {
                  console.log(err)
                })
                param.total = parseInt($scope.inp.num)
                param.place = $scope.inp.pla
                Doctor.insertSchedule({day: param.day, time: param.time, place: param.place}).then(function (data) {
                  // $scope.workStatus[index].status = 1
                  // $scope.workStatus[index].style = {'background-color': 'red'}
                  $scope.workStatus[index].place = $scope.inp.pla
                }, function (err) {
                  console.log(err)
                })
                if (!param.total == 0) {
                // console.log('param',param)
                  services.setSchedules(param).then(function (data) {
                      // console.log(data)
                    $scope.workStatus[index].number = $scope.inp.num
                  }, function (err) {
                    console.log(err)
                  })
                } else {
                  services.deleteSchedules({day: param.day, time: param.time}).then(function (data) {
                      // console.log(data)
                    console.log('param', param)
                    $scope.workStatus[index].number = 0
                  }, function (err) {
                    console.log(err)
                  })
                }
              }
            }
          },
          { text: '取消',
            type: 'button-default',
            onTap: function (e) {
              $ionicPopup.show({
                template: '此时间段将更改为空闲状态！',
                title: '修改工作状态',
                scope: $scope,
                buttons: [
                  {
                    text: '<b>确定</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                      Doctor.deleteSchedule({day: param.day, time: param.time}).then(function (data) {
                        $scope.workStatus[index].status = 0
                        $scope.workStatus[index].style = {'background-color': 'white'}
                        $scope.workStatus[index].place = ''
                      }, function (err) {
                        console.log(err)
                      })

                      services.deleteSchedules({day: param.day, time: param.time}).then(function (data) {
                        $scope.workStatus[index].number = 0
                      }, function (err) {
                        console.log(err)
                      })
                    }
                  },
                    { text: '取消' }
                ]
              })
            }
          }
        ]
      })
    } else {
      text = '此时间段将更改为空闲状态！'

      $ionicPopup.show({
        template: text,
        title: '修改工作状态',
        scope: $scope,
        buttons: [

          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function (e) {
              Doctor.deleteSchedule({day: param.day, time: param.time}).then(function (data) {
                $scope.workStatus[index].status = 0
                $scope.workStatus[index].style = {'background-color': 'white'}
                $scope.workStatus[index].place = ''
              }, function (err) {
                console.log(err)
              })

              services.deleteSchedules({day: param.day, time: param.time}).then(function (data) {
                $scope.workStatus[index].number = 0
              }, function (err) {
                console.log(err)
              })
            }
          },
          { text: '取消' }
        ]
      })
    }
  }
}])

// 账户详情-zxf,zy
.controller('billCtrl', ['$scope', 'Storage', '$http', '$ionicScrollDelegate', 'Order', function ($scope, Storage, $http, $ionicScrollDelegate, Order) {
  var doc = {
    // doctorId: Storage.get('UID'),
    skip: 0,
    limit: 10
  }
  $scope.doc = {
    bills: [],
    hasMore: false
  }
  $scope.doRefresh = function () {
    doc.skip = 0
    $scope.doc.hasMore = false
    Order.order(doc).then(function (data) {
      $scope.doc.bills = data.results
      doc.skip += data.results.length
      data.results.length == doc.limit ? $scope.doc.hasMore = true : $scope.doc.hasMore = false
      $scope.$broadcast('scroll.refreshComplete')
    }, function (err) {
      console.log(err)
      $scope.$broadcast('scroll.refreshComplete')
    })
  }
  $scope.doRefresh()
  $scope.loadMore = function () {
    Order.order(doc).then(function (data) {
      $scope.doc.bills = $scope.doc.bills.concat(data.results)
      doc.skip += data.results.length
      data.results.length == doc.limit ? $scope.doc.hasMore = true : $scope.doc.hasMore = false
      $scope.$broadcast('scroll.infiniteScrollComplete')
    }, function (err) {
      console.log(err)
      $scope.$broadcast('scroll.infiniteScrollComplete')
    })
  }
  $scope.scroll2Top = function () {
    $ionicScrollDelegate.scrollTop(true)
  }
}])

// 主管医生审核申请---rzx
.controller('reviewCtrl', ['New', 'Message', '$ionicPopup', '$ionicHistory', 'Doctor2', '$scope', '$state', '$ionicLoading', '$interval', '$rootScope', 'Storage', '$ionicPopover', function (New, Message, $ionicPopup, $ionicHistory, Doctor2, $scope, $state, $ionicLoading, $interval, $rootScope, Storage, $ionicPopover) {
  $scope.Goback = function () {
    $ionicHistory.goBack()
  }

  $scope.passApplication = function (id) {
    console.log(id)
    Storage.set('getpatientId', id)

    Doctor2.saveReviewInfo({
      // token: Storage.get('TOKEN'),
      reviewResult: 'consent',
      patientId: Storage.get('getpatientId')
    }).then(function (data) {
      console.log(data)
      load()
    }, function (err) {
      console.log(err)
    })

    Message.insertMessages({
      userId: Storage.get('getpatientId'),
      sendBy: Storage.get('UID'),
      title: '审核完成',
      type: '7',
      description: '医生通过了您的申请,成为您的主管医生！'
    }).then(function (data) {
      console.log(data)
      MessId = data.newResults.message.messageId
      New.insertNews({
        sendBy: Storage.get('UID'),
        userId: Storage.get('getpatientId'),
        type: 7,
        readOrNot: '0',
        description: '医生通过了您的申请！',
        messageId: MessId,
        userRole: 'patient'
      }).then(function (data) {
        console.log(data)
      }, function (err) {
        console.log(err)
      })
    }), function (err) {
      console.log(err)
    }

    $ionicLoading.show({
      template: '审核完成',
      duration: 1000
    })
  }

  $scope.rejectApplication = function (id) {
    Storage.set('getpatientId', id)
    $scope.data = {}
    var myPopup = $ionicPopup.show({
      template: '<textarea style="height:120px;" ng-model="data.reason"></textarea>',
      title: '请输入拒绝理由',
      scope: $scope,
      buttons: [
      { text: '取消' },
        { text: '确定',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.data.reason) {
          // 必须输入拒绝理由
              e.preventDefault()
              $ionicLoading.show({
                template: '请输入拒绝理由',
                duration: 1000
              })
            } else {
              return $scope.data.reason
              $state.go('tab.review')
            }
          }
        }]
    })

    myPopup.then(function (reason) {
      console.log(reason)
      if (reason != null) {
        Doctor2.saveReviewInfo({
          // token: Storage.get('TOKEN'),
          reviewResult: 'reject',
          rejectReason: reason,
          patientId: Storage.get('getpatientId')
        }).then(function (data) {
          console.log(data)
          load()
        })

        Message.insertMessages({
          userId: Storage.get('getpatientId'),
          sendBy: Storage.get('UID'),
          title: '审核完成',
          type: '7',
          description: '医生拒绝了您的申请，理由是：' + reason
        }).then(function (data) {
          console.log(data.result)
          MessId = data.newResults.message.messageId
          New.insertNews({
            sendBy: Storage.get('UID'),
            userId: Storage.get('getpatientId'),
            type: 7,
            readOrNot: '0',
            description: '医生拒绝了您的申请，理由是：' + reason,
            messageId: MessId,
            userRole: 'patient'
          }).then(function (data) {
            console.log(data)
          }, function (err) {
            console.log(err)
          })
        }), function (err) {
          console.log(err)
        }

        $ionicLoading.show({
          template: '审核完成',
          duration: 1000
        })
      } else {
        $state.go('tab.review')
      }
    }, function (err) {
      console.log(err)
    })
  }

  var load = function () {
  // 获取该医生所有待审核患者列表
    Doctor2.getReviewList({
      // token: Storage.get('TOKEN')
      // userId: Storage.get('UID')
    }).then(function (data) {
      if (data.numberToReview !== 0) {
        console.log(data)
        $scope.patients = data.results
        $scope.TotalNum = data.numberToReview
      } else {
        $scope.show = true
        $scope.patients = ''
        $scope.TotalNum = data.numberToReview
      }
    }, function (err) {
      console.log(err)
    })
  }

  // 进入加载
  $scope.$on('$ionicView.beforeEnter', function () {
    load()
  })
  // 下拉刷新
  $scope.doRefresh = function () {
    load()
        // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
}])

// 医生核销面诊-zy
.controller('faceCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'services', '$ionicPopup', '$ionicLoading', function ($scope, $state, $interval, $rootScope, Storage, services, $ionicPopup, $ionicLoading) {
  $scope.params = {
    Confirming: true,
    updateTime: 0
  }
  var load = function () {
    services.myPDpatients({
      // token: Storage.get('TOKEN')
      status: 0 // 0未核销
    }).then(function (data) {
      // console.log(data)
      $scope.confirmFace = data.results
      $scope.confirmNum = data.results.length
    }, function (err) {
      console.log(err)
    })

    services.myPDpatients({
      // token: Storage.get('TOKEN')
      status: 1 // 1已核销
    }).then(function (data) {
      // console.log(data)
      $scope.history = data.results
      $scope.historyNum = data.results.length
    }, function (err) {
      console.log(err)
    })
  }

  // 点亮全部患者标签 显示全部患者
  $scope.ShowConfirming = function () {
    $scope.params.Confirming = true
  }
  // 点亮今日新增标签 显示今日新增患者
  $scope.ShowHistory = function () {
    $scope.params.Confirming = false
  }
  // 进入加载
  $scope.$on('$ionicView.beforeEnter', function () {
    load()
  })
  // 下拉刷新
  $scope.doRefresh = function () {
    load()
    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }

  // 核销
  $scope.confirm = function (diagId) {
    // console.log(diagId)
    $scope.face = {}
    var myPopup = $ionicPopup.show({
      template: '<textarea style="height:25px;" ng-model="face.code"></textarea>',
      title: '请输入核销验证码:',
      scope: $scope,
      buttons: [
      { text: '取消' },
        { text: '确定',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.face.code) {
          // 必须输入验证码
              e.preventDefault()
            } else {
              return $scope.face.code
            }
          }
        }]
    })

    myPopup.then(function (code) {
      // console.log(code)
      if (code != null) {
        services.PDConfirmation({
          // token: Storage.get('TOKEN')
          diagId: diagId,
          code: code
        }).then(function (data) {
          // console.log(data)
          $ionicLoading.show({
            template: '核销成功',
            duration: 1000
          })
          load()
        }, function (err) {
          // console.log(err)
          if (err.data == 'Wrong Code') {
            $ionicLoading.show({
              template: '验证码错误，核销失败',
              duration: 1000
            })
          }
        })
      }
    })
  }
}])

// 未咨询报表推送列表-zy
.controller('nocounselCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'Message', function ($scope, $state, $interval, $rootScope, Storage, Message) {
  var load = function () {
    Message.getMessages({
      type: 14 // 14是为及时咨询报告消息
    }).then(function (data) {
      $scope.noCounsels = data.results
    }, function (err) {
      console.log(err)
    })
  }

  // 进入加载
  $scope.$on('$ionicView.beforeEnter', function () {
    load()
  })
  // 下拉刷新
  $scope.doRefresh = function () {
    load()
    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }

  // 查看详情
  $scope.getDetail = function (noCounsel) {
    Storage.set('noCounselurl', noCounsel.url)
    Storage.set('noCounselMes', noCounsel.messageId)
    $state.go('tab.nocodetail')
  }
}])

// 未咨询报表推送详情-zy
.controller('nocodetailCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'Message', '$http', function ($scope, $state, $interval, $rootScope, Storage, Message, $http) {
  var noCounselurl = Storage.get('noCounselurl')
  // console.log(noCounselurl)
  Message.editStatus({
    type: 14, // 14是为及时咨询报告消息
    messageId: Storage.get('noCounselMes'),
    readOrNot: 1
  }).then(function (data) {
    console.log(data)
  }, function (err) {
    console.log(err)
  })

  $http({
    method: 'GET',
    url: noCounselurl
  }).success(function (data) {
    // console.log(data)
    $scope.details = data.results
  })
}])

// 群发消息-zy
.controller('GroupMessageCtrl', ['$scope', '$state', '$interval', '$rootScope', '$ionicHistory', '$ionicLoading', 'Storage', 'MassCommunication', 'Doctor', 'CONFIG', function ($scope, $state, $interval, $rootScope, $ionicHistory, $ionicLoading, Storage, MassCommunication, Doctor, CONFIG) {
  $scope.Goback = function () {
    $ionicHistory.goBack()
  }
  // 获取医生的信息
  var thisDoctor = ''
  var photoUrl = ''
  var doctorInfo = function () {
    Doctor.getDoctorInfo({userId: Storage.get('UID')}).then(function (response) {
      thisDoctor = response.results
      photoUrl = response.results.photoUrl
      console.log(thisDoctor)
      console.log(photoUrl)
    }, function (err) {
      console.log(err)
    })
  }
  var MsgJson = ''
  $scope.sendMassMsg = function () {
    var msgText = document.getElementById('123').value
    var msgGroupChi = document.getElementById('MyPatient').value
    var msgGroup = ''
    if (msgGroupChi == '我的主管患者') {
      msgGroup = 'INCHARGE'
    } else if (msgGroupChi == '我的全部患者') {
      msgGroup = 'ALL'
    } else {
      msgGroup = 'FOLLOW'
    }

    MsgJson = {
      'token': Storage.get('TOKEN'),
      'target': msgGroup,
      'content': msgText
    }
    console.log(MsgJson)

    var MassToPatient = function (msg) {
      MassCommunication.massToPatient(msg).then(function (data) {
        console.log(data)
        $ionicLoading.show({ template: '发送成功！', duration: 1000 })
      }, function (err) {
        console.error(err)
        $ionicLoading.show({ template: '发送失败！', duration: 1000 })
      })
    }
    MassToPatient(MsgJson)
  }
}])

// 论坛
.controller('forumCtrl', ['$interval', '$scope', '$state', '$sce', '$http', 'Storage', 'Forum', '$stateParams', '$ionicPopup', '$ionicPopover', '$ionicLoading', '$ionicScrollDelegate', function ($interval, $scope, $state, $sce, $http, Storage, Forum, $stateParams, $ionicPopup, $ionicPopover, $ionicLoading, $ionicScrollDelegate) {
  $scope.params = {
    allposts: true,
    myposts: false,
    mycollection: false,
    updateTime: 0
  }

  var allposts = []
  $scope.posts = []
  $scope.moredata = true
  var pagecontrol = {skip: 0, limit: 10}

  var myposts = []
  $scope.posts1 = []
  $scope.moredata1 = true
  var pagecontrol1 = {skip: 0, limit: 10}

  var mycollection = []
  $scope.posts2 = []
  $scope.moredata2 = true
  var pagecontrol2 = {skip: 0, limit: 10}

  $scope.initial = {
    item: ''
  }

  $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll')

// 点亮全部帖子标签 显示全部帖子
  $scope.Showallposts = function () {
    $scope.params.allposts = true
    $scope.params.myposts = false
    $scope.params.mycollection = false
    $scope.scrollHandle.scrollTop(false)
  }
  // 点亮我的帖子标签 显示我的帖子
  $scope.Showmyposts = function () {
    $scope.params.allposts = false
    $scope.params.myposts = true
    $scope.params.mycollection = false
    $scope.scrollHandle.scrollTop(false)
  }
  // 点亮我的收藏标签 显示我的收藏
  $scope.Showmycollection = function () {
    $scope.params.allposts = false
    $scope.params.myposts = false
    $scope.params.mycollection = true
    $scope.scrollHandle.scrollTop(false)
  }
/**
   * [获取该患者三种帖子列表]
   * @Author   WZX
   * @DateTime 2017-08-03
   */
  $scope.loadMore = function () {
    Forum.allposts({token: Storage.get('TOKEN'), skip: pagecontrol.skip, limit: pagecontrol.limit}).then(function (data) {
      console.log(data)
      $scope.$broadcast('scroll.infiniteScrollComplete')
      allposts = allposts.concat(data.data.results)
      $scope.posts = allposts
      if (allposts.length == 0) {
        console.log('aaa')
        $ionicLoading.show({
          template: '没有帖子', duration: 1000
        })
      }
      var skiploc = data.data.nexturl.indexOf('skip')
      pagecontrol.skip = data.data.nexturl.substring(skiploc + 5)
      if (data.data.results.length < pagecontrol.limit) { $scope.moredata = false } else { $scope.moredata = true };
    }, function (err) {
      console.log(err)
    })
  }

  $scope.loadMore1 = function () {
    Forum.myposts({token: Storage.get('TOKEN'), skip: pagecontrol1.skip, limit: pagecontrol1.limit}).then(function (data) {
      console.log(data)
      $scope.$broadcast('scroll.infiniteScrollComplete')
      myposts = myposts.concat(data.data.results)
      $scope.posts1 = myposts
      if (myposts.length == 0) {
        console.log('aaa')
        $ionicLoading.show({
          template: '没有帖子', duration: 1000
        })
      }
      var skiploc = data.data.nexturl.indexOf('skip')
      pagecontrol1.skip = data.data.nexturl.substring(skiploc + 5)
      if (data.data.results.length < pagecontrol1.limit) { $scope.moredata1 = false } else { $scope.moredata1 = true };
    }, function (err) {
      console.log(err)
    })
  }

  $scope.loadMore2 = function () {
    console.log()
    Forum.mycollection({token: Storage.get('TOKEN'), skip: pagecontrol2.skip, limit: pagecontrol2.limit}).then(function (data) {
      console.log(data)
      $scope.$broadcast('scroll.infiniteScrollComplete')
      mycollection = mycollection.concat(data.data.results)
      $scope.posts2 = mycollection
      if (mycollection.length == 0) {
        console.log('aaa')
        $ionicLoading.show({
          template: '没有帖子', duration: 1000
        })
      }
      var skiploc = data.data.nexturl.indexOf('skip')
      pagecontrol2.skip = data.data.nexturl.substring(skiploc + 5)
      if (data.data.results.length < pagecontrol2.limit) { $scope.moredata2 = false } else { $scope.moredata2 = true };
    }, function (err) {
      console.log(err)
    })
  }

   $scope.refresher1 = function () {
    pagecontrol = {skip: 0, limit: 10},
    allposts = []
    $scope.loadMore()
    // RefreshDiagnosisInfo()
    $scope.$broadcast('scroll.refreshComplete')
  }

  $scope.refresher2 = function () {
    pagecontrol1 = {skip: 0, limit: 10},
    myposts = []
    $scope.loadMore1()
    // RefreshDiagnosisInfo()
    $scope.$broadcast('scroll.refreshComplete')
  }

  $scope.refresher3 = function () {
    pagecontrol2 = {skip: 0, limit: 10},
    mycollection = []
    $scope.loadMore2()
    // RefreshDiagnosisInfo()
    $scope.$broadcast('scroll.refreshComplete')
  }

  $scope.myStyle = [
    {'color': 'gray'},
    {'color': 'DodgerBlue'}
  ]

  $scope.changefavoritestatus = function (tip) {
    console.log(tip)
    var param = {
      token: Storage.get('TOKEN'),
      postId: tip.postId
    }

    if (tip.favoritesstatus == 0) {
      Forum.favorite(param).then(function (data) {
            // console.log(data)
        tip.favoritesstatus = 1
        $ionicLoading.show({
          template: '收藏成功', duration: 1000
        })
      }, function (err) {
        console.log(err)
      })
    } else {
      Forum.deletefavorite(param).then(function (data) {
                        // console.log(data)
        tip.favoritesstatus = 0
        pagecontrol2 = {skip: 0, limit: 10},
        mycollection = []
        $scope.loadMore2()
        $ionicLoading.show({
          template: '取消收藏', duration: 1000
        })
      }, function (err) {
        console.log(err)
      })
    }
  }

  $scope.deletemyposts = function (tip) {
    var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '帖子删除后将无法恢复，确认删除？',
      cancelText: '取消',
      okText: '删除'
    })
    confirmPopup.then(function (res) {
      if (res) {
        Forum.deletepost({token: Storage.get('TOKEN'), postId: tip}).then(function (data) {
          console.log(data)
          pagecontrol1 = {skip: 0, limit: 10},
          myposts = []
          $scope.loadMore1()
          pagecontrol = {skip: 0, limit: 10},
          allposts = []
          console.log(allposts)
          $scope.loadMore()
          $ionicLoading.show({
            template: '删除成功', duration: 1000
          })
        }, function (err) {
          console.log(err)
        })
      }
    })
  }
// ----------------页面跳转------------------
  $scope.GoToPost = function () {
    $state.go('post')
  }
  $scope.GoToComment = function (rep) {
    $state.go('comment')
    Storage.set('POSTID', rep)
  }
  $scope.gotopostsdetail = function (tip) {
    $state.go('postsdetail')
    Storage.set('POSTID', tip)
  }
// ----------------开始搜索患者------------------
  $scope.search = {
    title: ''
  }

  // 根据帖子主题在列表中搜索
  $scope.goSearch = function () {
    if ($scope.search.title == '') {
      pagecontrol = {skip: 0, limit: 10},
      allposts = []
      $scope.loadMore()
    } else {
      $scope.moredata = false
      console.log(123)
      Forum.allposts({
        token: Storage.get('TOKEN'),
        title: $scope.search.title,
        limit: 1000,
        skip: 0
      }).then(function (data) {
        console.log(data.data)
        $scope.posts = data.data.results
        if (data.data.results.length == 0) {
          console.log('aaa')
          $ionicLoading.show({ template: '没有搜索到该帖', duration: 1000 })
        }
      }, function (err) {
        console.log(err)
      })
    }
  }

  $scope.clearSearch = function () {
    $scope.search.title = ''
    // $scope.posts = $scope.allposts
    pagecontrol = {skip: 0, limit: 10},
    allposts = []
    $scope.posts = $scope.loadMore()
  }
    // ----------------结束搜索患者------------------
}])

.controller('postCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', '$ionicPopover', 'Forum', 'Camera', 'CONFIG', '$ionicLoading', '$timeout', function ($scope, $state, Storage, $ionicHistory, $ionicPopover, Forum, Camera, CONFIG, $ionicLoading, $timeout) {
  $scope.GoBack = function () {
    $state.go('tab.forum')
  }
  $scope.hasDeliver = true
  $scope.postphoto = ''
  $scope.post = {
    title: '',
    content: [{
      text: ''
    },
    {
      image: []
    }],
    anonymous: ''
  }

  $scope.Post = function () {
    var param = {
      token: Storage.get('TOKEN'),
      title: $scope.post.title,
      content: $scope.post.content,
      time: new Date(),
      anonymous: $scope.post.anonymous
    }
    console.log('param', param)
    Forum.newpost(param).then(function (data) {
      console.log(data)
      if (data.msg == 'success') {
        $ionicLoading.show({
          template: '发帖成功',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
        })
        $timeout(function () { $state.go('tab.forum') }, 900)
      }
    }, function (err) {
      $scope.hasDeliver = false
      $ionicLoading.show({
        template: '发帖失败',
        noBackdrop: false,
        duration: 1000,
        hideOnStateChange: true
      })
      console.log(err)
    })
  }

  $scope.onClickCamera = function ($event) {
    $scope.openPopover($event)
  }
  // $scope.reload = function () {
  //   var t = $scope.myAvatar
  //   $scope.myAvatar = ''

  //   $scope.$apply(function () {
  //     $scope.myAvatar = t
  //   })
  // }

 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function (imgURI) {
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get('UID') + '_' + new Date().getTime() + 'post.jpg'
    console.log(temp_photoaddress)
    Camera.uploadPicture(imgURI, temp_photoaddress)
    .then(function (res) {
      var data = angular.fromJson(res)
      // res.path_resized
      // 图片路径
      // $scope.post.imgurl.push(CONFIG.mediaUrl + String(data.path_resized) + '?' + new Date().getTime())
      $scope.post.content[1].image.push(CONFIG.mediaUrl + String(data.path_resized))
      // console.log($scope.postphoto)
      // $state.reload("tab.mine")
      // Storage.set('myAvatarpath',$scope.myAvatar);
      // ImagePath = $scope.postphoto;
      // var obj = document.getElementById("posttext");
      // obj.focus();
      // document.execCommand('InsertImage', false, ImagePath)
      // console.log($scope.post.content[1].image)
      // $scope.showflag=true;
    }, function (err) {
      console.log(err)
      reject(err)
    })
  }
  // -----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        // --------------------------------------------
        // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('partials/pop/cameraPopover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (popover) {
    $scope.popover = popover
  })
  $scope.openPopover = function ($event) {
    $scope.popover.show($event)
  }
  $scope.closePopover = function () {
    $scope.popover.hide()
  }
  // Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove()
  })
  // Execute action on hide popover
  $scope.$on('popover.hidden', function () {
    // Execute action
  })
  // Execute action on remove popover
  $scope.$on('popover.removed', function () {
    // Execute action
  })

// 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function () {
   // console.log("选个照片");

    $scope.choosePhotos()
    $scope.closePopover()
  }
  $scope.choosePhotos = function () {
    Camera.getPictureFromPhotos('gallery', true).then(function (data) {
        // data里存的是图像的地址
        // console.log(data);
      var imgURI = data
      photo_upload_display(imgURI)
    }, function (err) {
        // console.err(err);
      var imgURI
    })// 从相册获取照片结束
  } // function结束

    // 照相机的点击事件----------------------------------
  $scope.getPhoto = function () {
      // console.log("要拍照了！");
    $scope.takePicture()
    $scope.closePopover()
  }
  $scope.isShow = true
  $scope.takePicture = function () {
    Camera.getPicture('cam', true).then(function (data) {
      console.log(data)
      photo_upload_display(data)
    }, function (err) {
          // console.err(err);
      var imgURI
    })// 照相结束
  } // function结束

  // $scope.showoriginal = function (resizedpath) {
  //   // $scope.openModal();
  //   // console.log(resizedpath)
  //   var originalfilepath = CONFIG.imgLargeUrl + resizedpath.slice(resizedpath.lastIndexOf('/') + 1).substr(7)
  //   // console.log(originalfilepath)
  //   // $scope.doctorimgurl=originalfilepath;

  //   $scope.imageHandle.zoomTo(1, true)
  //   $scope.imageUrl = originalfilepath
  //   $scope.modal.show()
  // }

  $scope.deleteimg = function (index) {
    // somearray.removeByValue("tue");
    // console.log($scope.post.imgurl)
    // $scope.post.imgurl.splice(index, 1)
    $scope.post.content[1].image.splice(index, 1)
    // Storage.set('tempimgrul',angular.toJson($scope.images));
  }
}])

.controller('postsdetailCtrl', ['CONFIG', '$scope', '$state', 'Storage', '$ionicHistory', 'Forum', '$http', '$ionicPopup', '$timeout', '$ionicPopover', function (CONFIG, $scope, $state, Storage, $ionicHistory, Forum, $http, $ionicPopup, $timeout, $ionicPopover) {
// ----------------页面跳转------------------
  $scope.GoBack = function () {
    $state.go('tab.forum')
  }
  $scope.GoToCommentf = function (tip) {
    $state.go('comment')
    Storage.set('POSTID', tip)
  }
  $scope.GoToReplyf = function (rep, tib) {
    $state.go('reply')
    Storage.set('POSTID', $scope.postId)
    Storage.set('COMMENTID', tib.commentId)
    Storage.set('AT', rep.userId)
  }
  $scope.GoToReply = function (tip) {
    $state.go('reply')
    Storage.set('POSTID', $scope.postId)
    Storage.set('COMMENTID', tip.commentId)
    Storage.set('AT', tip.userId)
  }

  $scope.replies = []
  $scope.Images = []
  var PostContent = function () {
    Forum.postcontent({token: Storage.get('TOKEN'), postId: Storage.get('POSTID')}).then(function (data) {
            // console.log(data)
      $scope.name = data.data.sponsorName
      $scope.sponsorId = data.data.sponsorId
      $scope.postId = data.data.postId
      $scope.time = data.data.time
      $scope.avatar = data.data.avatar
      $scope.title = data.data.title
      $scope.text = data.data.content[0].text
      $scope.image = data.data.content[1].image
      $scope.replyCount = data.data.replyCount
      $scope.favoritesNum = data.data.favoritesNum
      $scope.anonymous = data.data.anonymous
      $scope.comments = data.data.replies
      for (i = 0; i < data.data.content[1].image.length; i++) {
        $scope.Images[i] = CONFIG.imgLargeUrl + data.data.content[1].image[i].slice(data.data.content[1].image[i].lastIndexOf('/') + 1).substr(7)
              // console.log('Images',$scope.Images)
              // console.log('images',$scope.image)
      }
    }, function (err) {
      console.log(err)
    })
  }
  $scope.$on('$ionicView.enter', function () {
    PostContent()
    imgModalInit()
  })

  var userId = Storage.get('UID'),
    postId = $scope.postId

  $scope.ReplyOrDelete1 = function (tip) {
    if (userId == tip.userId) {
      var confirmPopup = $ionicPopup.confirm({
        title: '删除提示',
        template: '评论删除后将无法恢复，确认删除？',
        cancelText: '取消',
        okText: '删除'
      })
      confirmPopup.then(function (res) {
        if (res) {
          Forum.deletecomment({token: Storage.get('TOKEN'), postId: $scope.postId, commentId: tip.commentId}).then(function (data) {
            PostContent()
            console.log(data)
          }, function (err) {
            console.log(err)
          })
        }
      })
    } else {
      var confirmPopup = $ionicPopup.confirm({
        title: '回复提示',
        template: '是否对此评论进行回复，确认回复？',
        cancelText: '取消',
        okText: '确认'
      })
      confirmPopup.then(function (res) {
        if (res) {
          $scope.GoToReply(tip)
        }
      })
    }
  }

  $scope.ReplyOrDelete2 = function (rep, tib) {
    if (userId == rep.userId) {
      var confirmPopup = $ionicPopup.confirm({
        title: '删除提示',
        template: '评论删除后将无法恢复，确认删除？',
        cancelText: '取消',
        okText: '确认'
      })
      confirmPopup.then(function (res) {
        if (res) {
          Forum.deletecomment({token: Storage.get('TOKEN'), postId: $scope.postId, commentId: tib.commentId, replyId: rep.replyId}).then(function (data) {
            PostContent()
            console.log(data)
          }, function (err) {
            console.log(err)
          })
        }
      })
    } else {
      var confirmPopup = $ionicPopup.confirm({
        title: '回复提示',
        template: '是否对此评论进行回复，确认回复？',
        cancelText: '取消',
        okText: '确认'
      })
      confirmPopup.then(function (res) {
        if (res) {
          $scope.GoToReplyf(rep, tib)
        }
      })
    }
  }

  function imgModalInit () {
    $scope.zoomMin = 1
    $scope.imageUrl = ''
    $scope.imageIndex = -1// 当前展示的图片
    $ionicModal.fromTemplateUrl('partials/tabs/consult/msg/imageViewer.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal
        // $scope.modal.show();
      $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
    })
  }

  $scope.showoriginal = function (resizedpath) {
        // $scope.openModal();
    console.log(resizedpath)
    $scope.imageIndex = 0
        // console.log($scope.imageIndex)
    var originalfilepath = CONFIG.imgLargeUrl + resizedpath.slice(resizedpath.lastIndexOf('/') + 1).substr(7)
        // console.log(originalfilepath)
        // $scope.doctorimgurl=originalfilepath;
    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = originalfilepath
    $scope.modal.show()
  }
  // 关掉图片
  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
      // $scope.modal.remove()
  }
  // 双击调整缩放
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }
  // 右划图片
  $scope.onSwipeRight = function () {
    if ($scope.imageIndex <= $scope.Images.length - 1 && $scope.imageIndex > 0) { $scope.imageIndex = $scope.imageIndex - 1 } else {
      // 如果图片已经是第一张图片了，则取index = Images.length-1
      $scope.imageIndex = $scope.Images.length - 1
    }
    $scope.imageUrl = $scope.Images[$scope.imageIndex]
  }

  // 左划图片
  $scope.onSwipeLeft = function () {
    if ($scope.imageIndex < $scope.Images.length - 1 && $scope.imageIndex >= 0) { $scope.imageIndex = $scope.imageIndex + 1 } else {
      // 如果图片已经是最后一张图片了，则取index = 0
      $scope.imageIndex = 0
    }
    // 替换url，展示图片
    $scope.imageUrl = $scope.Images[$scope.imageIndex]
  }
}])

.controller('commentCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', 'Forum', '$ionicLoading', '$timeout', function ($scope, $state, Storage, $ionicHistory, Forum, $ionicLoading, $timeout) {
 // debugger
  $scope.GoBack = function () {
    $ionicHistory.goBack()
  }

  $scope.hasDeliver = true
  $scope.post = {
    content: ''
  }

  $scope.Post = function () {
    var param = {
      token: Storage.get('TOKEN'),
      content: $scope.post.content,
      time: new Date(),
      postId: Storage.get('POSTID')
    }
    console.log('param', param)
    Forum.comment(param).then(function (data) {
      console.log(data)
      if (data.msg == 'success') {
        $ionicLoading.show({
          template: '提交成功',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
        })
        $timeout(function () { $ionicHistory.goBack() }, 900)
      }
    }, function (err) {
      $scope.hasDeliver = false
      $ionicLoading.show({
        template: '提交失败',
        noBackdrop: false,
        duration: 1000,
        hideOnStateChange: true
      })
      console.log(err)
    })
  }
}])

.controller('replyCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', 'Forum', '$ionicLoading', '$timeout', function ($scope, $state, Storage, $ionicHistory, Forum, $ionicLoading, $timeout) {
 // debugger
  $scope.GoBack = function () {
    $ionicHistory.goBack()
  }

  $scope.hasDeliver = true
  $scope.reply = {
    content: ''
  }

  $scope.Reply = function () {
    var param = {
      token: Storage.get('TOKEN'),
      content: $scope.reply.content,
      time: new Date(),
      postId: Storage.get('POSTID'),
      commentId: Storage.get('COMMENTID'),
      at: Storage.get('AT')
    }
    console.log('param', param)
    Forum.reply(param).then(function (data) {
      console.log(data)
      if (data.msg == 'success') {
        $ionicLoading.show({
          template: '提交成功',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
        })
        $timeout(function () { $ionicHistory.goBack() }, 900)
      }
    }, function (err) {
      $scope.hasDeliver = false
      $ionicLoading.show({
        template: '提交失败',
        noBackdrop: false,
        duration: 1000,
        hideOnStateChange: true
      })
      console.log(err)
    })
  }
}])
