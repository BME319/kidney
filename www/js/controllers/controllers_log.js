angular.module('log.controllers', ['ionic','kidney.services'])

//登录
.controller('SignInCtrl', ['$ionicLoading','User','$scope','$timeout','$state','Storage','loginFactory','$ionicHistory','$sce','Doctor','$rootScope','notify','$interval','socket','Mywechat','mySocket', function($ionicLoading,User,$scope, $timeout,$state,Storage,loginFactory,$ionicHistory,$sce,Doctor,$rootScope,notify,$interval,socket,Mywechat,mySocket) {
    $scope.barwidth="width:0%";
    $scope.navigation_login=$sce.trustAsResourceUrl("http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx");
    if(Storage.get('USERNAME')!=null&&Storage.get('USERNAME')!=undefined){
        $scope.logOn={username:Storage.get('USERNAME'),password:""};
    }
    else{
        $scope.logOn={username:"",password:""};
    }


    if(Storage.get('doctorunionid')!=undefined&&Storage.get('bindingsucc')=='yes'){
    User.logIn({username:Storage.get('doctorunionid'),password:"112233",role:"doctor"}).then(function(data){
      if(data.results.mesg=="login success!"){
        Storage.set('isSignIn',true);
        Storage.set('UID',data.results.userId);//后续页面必要uid
        Storage.set('bindingsucc','yes')
        Doctor.getDoctorInfo({userId:data.results.userId})
        .then(function(response){
            thisDoctor = response.results;
            mySocket.newUser(response.results.userId);
            // $interval(function newuser(){
            //     socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId, client:'app'});
            //     return newuser;
            // }(),10000);

        },function(err){
            thisDoctor=null;
        }); 
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory(); 
        $state.go('tab.home')  
      }
    })
  }else if(Storage.get('USERNAME')!=null&&Storage.get('USERNAME')!=undefined&&Storage.get('password')!=null&&Storage.get('password')!=undefined){
    User.logIn({username:Storage.get('USERNAME'),password:Storage.get('password'),role:"doctor"}).then(function(data){
      if(data.results.mesg=="login success!"){
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        Storage.set('isSignIn',true);
        Storage.set('UID',data.results.userId);//后续页面必要uid
        // Storage.set('bindingsucc','yes')
        Doctor.getDoctorInfo({userId:data.results.userId})
        .then(function(response){
            thisDoctor = response.results;
            mySocket.newUser(response.results.userId);

        },function(err){
            thisDoctor=null;
        });
        Storage.set('USERNAME',Storage.get('USERNAME'));
        // alert(Storage.get('UID')+Storage.get('USERNAME'))
        $timeout(function(){$state.go('tab.home');},500);
      }
    })
  }

    $scope.signIn = function(logOn) {  
        $scope.logStatus='';

        if((logOn.username!="") && (logOn.password!="")){
            var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            //手机正则表达式验证
            if(!phoneReg.test(logOn.username)){
                $scope.logStatus="手机号验证失败！";
                return;
            }
            else{
                var logPromise = User.logIn({username:logOn.username,password:logOn.password,role:"doctor"});
                logPromise.then(function(data){
                    if(data.results==1){
                        if(data.mesg== "User doesn't Exist!"){
                            $scope.logStatus="账号不存在！";
                        }
                        else if(data.mesg== "User password isn't correct!"){
                            $scope.logStatus = "账号或密码错误！";
                        }
                    }
                    else if(data.results.mesg=="login success!"){
                        Storage.set('password',logOn.password)
                        Doctor.getDoctorInfo({userId:data.results.userId})
                        .then(function(response){
                            thisDoctor = response.results;
                            mySocket.newUser(response.results.userId);

                        },function(err){
                            thisDoctor=null;
                        });
                        $scope.logStatus = "登录成功！";
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        Storage.set('USERNAME',$scope.logOn.username);
                        Storage.set('TOKEN',data.results.token);//token作用目前还不明确
                        Storage.set('isSignIn',true);
                        Storage.set('UID',data.results.userId);
                        User.getAgree({userId:data.results.userId}).then(function(res){
                            if(res.results.agreement=="0"){
                                $timeout(function(){$state.go('tab.home');},500);
                            }else{
                                $timeout(function(){$state.go('agreement',{last:'signin'});},500);
                            }
                        },function(err){
                            console.log(err);
                        })

                    }
                },
                function(data){
                    if(data.results==null && data.status==0){
                        $scope.logStatus = "网络错误！";
                        return;
                    }
                    if(data.status==404){
                        $scope.logStatus = "连接服务器失败！";
                        return;
                    }
                });
            }     
        }
        else{
            $scope.logStatus="请输入完整信息！";
        }
    }
    var ionicLoadingshow = function() {
        $ionicLoading.show({
        template: '登录中...'
        });
    };
    var ionicLoadinghide = function(){
        $ionicLoading.hide();
    };
    $scope.toRegister = function(){
        console.log($state);
        Storage.set('validMode',0);//注册
        $state.go('phonevalid');     
    }

    $scope.toReset = function(){
        Storage.set('validMode',1);//修改密码
        $state.go('phonevalid');   
    }

    // if(Storage.get('doctorunionid')!=undefined&&Storage.get('bindingsucc')=='yes'){
    //     User.logIn({username:Storage.get('doctorunionid'),password:"112233",role:"doctor"}).then(function(data){
    //       if(data.results.mesg=="login success!"){
    //         Storage.set('isSignIn',"Yes");
    //         Storage.set('UID',data.results.UserId);//后续页面必要uid
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
    //0531
    $scope.wxsignIn=function(){
        /*Wechat.isInstalled(function (installed) {
            alert("Wechat installed: " + (installed ? "Yes" : "No"));
        }, function (reason) {
            alert("Failed: " + reason);
        });*/
        //先判断localstorage是否有unionid
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
        var wxscope = "snsapi_userinfo",
        wxstate = "_" + (+new Date());
        Wechat.auth(wxscope, wxstate, function (response) {
            // you may use response.code to get the access token.
            // alert(JSON.stringify(response));
            // alert(response.code)

            Mywechat.getUserInfo({role:"appDoctor",code:response.code}).then(function(persondata){
                // alert(JSON.stringify(persondata))

              // alert(persondata.headimgurl)
              Storage.set('wechatheadimgurl',persondata.results.headimgurl)

              $scope.unionid=persondata.results.unionid;

              User.getUserId({username:$scope.unionid}).then(function(ret){
                // alert(JSON.stringify(ret))
                //用户已经存在id 说明公众号注册过
                if(ret.results==0&&ret.roles.indexOf("doctor")!=-1){//直接登录
                    ionicLoadingshow();
                  User.logIn({username:$scope.unionid,password:"112233",role:"doctor"}).then(function(data){
                    // alert(JSON.stringify(data));
                    if(data.results.mesg=="login success!"){
                      Storage.set('isSignIn',"Yes");
                      Storage.set('UID',ret.UserId);//后续页面必要uid
                      // alert(Storage.get('UID'))
                      Storage.set("doctorunionid",$scope.unionid);//自动登录使用
                      Storage.set('bindingsucc','yes')
                      Storage.set('USERNAME',ret.phoneNo)
                      $timeout(function(){
                            ionicLoadinghide();
                            $state.go('tab.home');
                        },500);
                      Doctor.getDoctorInfo({userId:data.results.userId})
                        .then(function(response){
                            thisDoctor = response.results;
                            mySocket.newUser(response.results.userId);

                        },function(err){
                            thisDoctor=null;
                        });  
                    }
                  })
                }else{
                  Storage.set("doctorunionid",$scope.unionid);//自动登录使用
                  $state.go('phonevalid',{last:'wechatsignin'})
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
            alert("Failed: " + reason);
        });

        // }
    } 
  
}])


//手机号码验证
.controller('phonevalidCtrl', ['$scope','$state','$interval', '$stateParams','Storage','User','$timeout',  function($scope, $state,$interval,$stateParams,Storage,User,$timeout) {
    $scope.barwidth="width:0%";
    $scope.Verify={Phone:"",Code:""};
    $scope.veritext="获取验证码";
    $scope.isable=false;
    $scope.hasimport=false;
    var validMode=Storage.get('validMode');//0->set;1->reset
    var unablebutton = function(){      
     //验证码BUTTON效果
        $scope.isable=true;
        //console.log($scope.isable)
        $scope.veritext="60S再次发送"; 
        var time = 59;
        var timer;
        timer = $interval(function(){
            if(time==0){
            $interval.cancel(timer);
            timer=undefined;        
            $scope.veritext="获取验证码";       
            $scope.isable=false;
        }else{
            $scope.veritext=time+"S再次发送";
            time--;
            }
        },1000);
    }

    //点击获取验证码
    $scope.getcode=function(Verify){
        $scope.logStatus='';
    
        if (Verify.Phone=="") {
      
        $scope.logStatus="手机号码不能为空！";
        return;
    }
    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    //手机正则表达式验证
    if(!phoneReg.test(Verify.Phone))
    {
        $scope.logStatus="请输入正确的手机号码！";
        return;
    }
    else//通过基本验证-正确的手机号
    {
        console.log(Verify.Phone)
        Storage.set('RegisterNO',$scope.Verify.Phone)
        Storage.set('USERNAME',$scope.Verify.Phone)
        //验证手机号是否注册，没有注册的手机号不允许重置密码
        User.getUserId({
            username:Verify.Phone
        })
        .then(function(succ)
        {
            console.log(succ)
            if($stateParams.last=='wechatsignin'){
                if (succ.mesg =="User doesn't Exist!")
                {
                    User.sendSMS({
                        mobile:Verify.Phone,
                        smsType:2
                    })
                    .then(function(data)
                    {
                        unablebutton();
                        if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                            $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                        }else if (data.results == 1){
                            $scope.logStatus = "验证码发送失败，请稍后再试";
                        }
                        else{
                            $scope.logStatus ="验证码发送成功！";
                        }
                    },function(err)
                    {
                        $scope.logStatus="验证码发送失败！";
                    })
                }
                else 
                {
                    if (succ.roles.indexOf('doctor') != -1)
                    {
                        // $scope.logStatus="您已经注册过了";
                        Storage.set('UID',succ.UserId)//导入的用户 只要绑定下手机号码就行了
                        $scope.hasimport=true;
                    }
                    User.sendSMS({
                        mobile:Verify.Phone,
                        smsType:2
                    })
                    .then(function(data)
                    {
                        unablebutton();
                        if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                            $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                        }else if (data.results == 1){
                            $scope.logStatus = "验证码发送失败，请稍后再试";
                        }
                        else{
                            $scope.logStatus ="验证码发送成功！";
                        }
                    },function(err)
                    {
                        $scope.logStatus="验证码发送失败！";
                    })
                }
            }
            else if(validMode==0)
            {
                if (succ.mesg =="User doesn't Exist!")
                {
                    User.sendSMS({
                        mobile:Verify.Phone,
                        smsType:2
                    })
                    .then(function(data)
                    {
                        unablebutton();
                        if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                            $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                        }else if (data.results == 1){
                            $scope.logStatus = "验证码发送失败，请稍后再试";
                        }
                        else{
                            $scope.logStatus ="验证码发送成功！";
                        }
                    },function(err)
                    {
                        $scope.logStatus="验证码发送失败！";
                    })
                }
                else 
                {
                    if (succ.roles.indexOf('doctor') != -1)
                    {
                        $scope.logStatus="您已经注册过了";
                    }
                    else
                    {
                        User.sendSMS({
                            mobile:Verify.Phone,
                            smsType:2
                        })
                        .then(function(data)
                        {
                            unablebutton();
                            if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                                $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                            }else if (data.results == 1){
                                $scope.logStatus = "验证码发送失败，请稍后再试";
                            }
                            else{
                                $scope.logStatus ="验证码发送成功！";
                            }
                        },function(err)
                        {
                            $scope.logStatus="验证码发送失败！";
                        })
                    }
                }
            }
            else if(validMode==1&&succ.mesg =="User doesn't Exist!")
            {
                $scope.logStatus="您还没有注册呢！";
            }
            else
            {
                User.sendSMS({
                    mobile:Verify.Phone,
                    smsType:2
                })
                .then(function(data)
                {
                    unablebutton();
                    if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                        $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                    }else if (data.results == 1){
                        $scope.logStatus = "验证码发送失败，请稍后再试";
                    }
                    else{
                        $scope.logStatus ="验证码发送成功！";
                    }
                },function(err)
                {
                    $scope.logStatus="验证码发送失败！";
                })
            }
        },function(err)
        {
            console.log(err)
            $scope.logStatus="网络错误！";
        })
    }
  }

    //判断验证码和手机号是否正确
    $scope.gotoReset = function(Verify){
        $scope.logStatus = '';
        if(Verify.Phone!="" && Verify.Code!="")
        {
            var tempVerify = 123;
            //结果分为三种：(手机号验证失败)1验证成功；2验证码错误；3连接超时，验证失败
            var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            //手机正则表达式验证
            if(phoneReg.test(Verify.Phone)){
                //测试用
                // if(Verify.Code==123456){
                //     $scope.logStatus = "验证成功";
                //     Storage.set('phoneNumber',Verify.Phone);
                //     if(validMode == 0){
                //         $timeout(function(){$state.go('agreement',{last:'register'});},500);
                //     }else{
                //        $timeout(function(){$state.go('setpassword')}); 
                //     }
                    
                // }else{$scope.logStatus = "验证码错误";}

                User.verifySMS({
                    mobile:Verify.Phone,
                    smsType:2,
                    smsCode:Verify.Code
                })
                .then(function(succ)
                {
                    console.log(succ)
                    if(succ.results==0)//验证成功
                    {
                        $scope.logStatus="验证成功！";
                        Storage.set('phoneNumber',Verify.Phone);
                        if($stateParams.last=='wechatsignin'){
                            if($scope.hasimport){//导入的用户绑定手机号就行了
                                // User.setOpenId({phoneNo:Verify.Phone,openId:Storage.get('doctorunionid')}).then(function(response){
                                  // Storage.set('bindingsucc','yes')
                                  $timeout(function(){$state.go('agreement',{last:'wechatimport'});},500);
                                // })
                            }else{
                                $timeout(function(){$state.go('agreement',{last:'wechatsignin'});},500);
                            }
                        }
                        else if(validMode == 0){
                            $timeout(function(){$state.go('agreement',{last:'register'});},500);
                        }else{
                            $timeout(function(){$state.go('setpassword')}); 
                        }
                    }
                    else //验证码错误
                    {
                        $scope.logStatus="请输入正确的验证码！";
                    }
                },
                function(err)
                {   
                    console.log(err)
                    $scope.logStatus="网络错误！";
                })
            }
            else{$scope.logStatus="手机号验证失败！";}        
            }       
        else{$scope.logStatus = "请输入完整信息！";}
        }

}])

//签署协议（0为签署）
.controller('AgreeCtrl', ['User','$stateParams','$scope','$timeout','$state','Storage','$ionicHistory','$http','Data','$ionicPopup','Camera','CONFIG', function(User,$stateParams,$scope, $timeout,$state,Storage,$ionicHistory,$http,Data,$ionicPopup,Camera,CONFIG) {
    $scope.YesIdo = function(){
        console.log('yesido');
        if($stateParams.last=='wechatimport'){
            User.updateAgree({userId:Storage.get('UID'),agreement:"0"}).then(function(data){
                if(data.results!=null){
                    User.setOpenId({phoneNo:Storage.get('phoneNumber'),openId:Storage.get('doctorunionid')}).then(function(response){
                        Storage.set('bindingsucc','yes')
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

                    $ionicPopup.show({   
                         title: '微信账号绑定手机账号成功，您的初始密码是123456，您以后也可以用手机号码登录！',
                         buttons: [
                           {
                                text: '確定',
                                type: 'button-positive',
                                onTap: function(e) {
                                    $state.go('tab.home');
                                }
                           }
                           ]
                    })
                }else{
                    console.log("用户不存在!");
                }
            },function(err){
                console.log(err);
            })
        }else if($stateParams.last=='wechatsignin'){
            $timeout(function(){$state.go('userdetail',{last:'wechatsignin'})},500);
        }
        else if($stateParams.last=='signin'){
            User.updateAgree({userId:Storage.get('UID'),agreement:"0"}).then(function(data){
                if(data.results!=null){
                    $timeout(function(){$state.go('tab.home');},500);
                }else{
                    console.log("用户不存在!");
                }
            },function(err){
                console.log(err);
            })
        }
        else if($stateParams.last=='register'){
            $timeout(function(){$state.go('setpassword',0)},500);
        }
    }
    // var a=document.getElementById("agreement");
    // console.log(document.body.clientHeight);
    // console.log(window.screen.height);
    // a.style.height=window.screen.height*0.65+"px";
}])

//设置密码
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' ,'Storage','User','$stateParams',function($scope,$state,$rootScope,$timeout,Storage,User,$stateParams) {
    $scope.barwidth="width:0%";
    var validMode=Storage.get('validMode');//0->set;1->reset
    var phoneNumber=Storage.get('RegisterNO');
    $scope.headerText="设置密码";
    $scope.buttonText="";
    $scope.logStatus='';

    if(validMode==0)
        $scope.buttonText="下一步";
    else
        $scope.buttonText="完成";
    $scope.setPassword = function(password){
        if(password.newPass!=""&&password.confirm!="")
        {
            if(password.newPass==password.confirm)
            {
                if(password.newPass.length<6)//此处要验证密码格式，//先简单的
                {
                    $scope.logStatus='密码太短了！';
                }
                else
                {
                    if(validMode==0)
                    {
                        Storage.set('password',password.newPass);
                        $state.go('userdetail');
                    }
                    else
                    { 
                        User.changePassword({
                            phoneNo:phoneNumber,
                            password:password.newPass
                        })
                        .then(function(succ)
                        {
                            Storage.set('password',password.newPass);
                            console.log(succ)
                            $state.go('signin')
                        },function(err)
                        {
                            console.log(err)
                        })
                    }
                }
            }
            else
           {
                $scope.logStatus='两次输入的密码不一致';
            }
        }
        else
        {
        $scope.logStatus='输入不正确!';
        }
    }
}])

//注册时填写医生个人信息
.controller('userdetailCtrl',['CONFIG','Dict','Doctor','$scope','$state','$ionicHistory','$timeout' ,'Storage', '$ionicPopup','$ionicLoading','$ionicPopover','$ionicScrollDelegate','User','$http','Camera','$ionicModal','$stateParams',function(CONFIG,Dict,Doctor,$scope,$state,$ionicHistory,$timeout,Storage, $ionicPopup,$ionicLoading, $ionicPopover,$ionicScrollDelegate,User,$http,Camera,$ionicModal,$stateParams){
    $scope.barwidth="width:0%";
    var phoneNumber=Storage.get('RegisterNO');
    var password=Storage.get('password');
    if(Storage.get('password')==undefined||Storage.get('password')==""||Storage.get('password')==null){
        password='123456'
        Storage.set('password','123456');
    }
    $scope.Titles =
    [
        {Name:"主任医师",Type:1},
        {Name:"副主任医师",Type:2},
        {Name:"主治医师",Type:3},
        {Name:"住院医师",Type:4},
        {Name:"主任护师",Type:5},
        {Name:"副主任护师",Type:6},
        {Name:"主管护师",Type:7},
        {Name:"护师",Type:8},
        {Name:"护士",Type:9}
    ]   
    $scope.doctor={
        userId:"",
        name:"",
        workUnit:"",
        department:"",
        title:"",
        IDNo:"",
        major:"",
        description:""
    };

    //------------省市医院读字典表---------------------
    Dict.getDistrict({level:"1",province:"",city:"",district:""})
    .then(
        function(data)
        {
            $scope.Provinces = data.results;
            // $scope.Province.province = "";
            console.log($scope.Provinces)
        },
        function(err)
        {
            console.log(err);
        }
    )    

    $scope.getCity = function (pro) {
        console.log(pro)
        if(pro!=null){
            Dict.getDistrict({level:"2",province:pro,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    console.log($scope.Cities);            
                },
                function(err)
                {
                    console.log(err);
                }
            );
        }else{
            $scope.Cities = {};
            $scope.Hospitals = {};
        }
    }

    $scope.getHospital = function (city) {
            console.log(city)
        if(city!=null){
            //var locationCode = district.province + district.city + district.district
            //console.log(locationCode)

            Dict.getHospital({city:city})
            .then(
                function(data)
                {
                    $scope.Hospitals = data.results;
                    console.log($scope.Hospitals);
                },
                function(err)
                {
                    console.log(err);
                }
            )
        }else{
            $scope.Hospitals = {};
        }
    }
    $scope.test = function(docinfo){
        console.log(docinfo)
        $scope.doctor.province = docinfo.province;
        $scope.doctor.city = docinfo.city;
        $scope.doctor.workUnit = docinfo.hospitalName;        
    }
    //------------省市医院读字典表---------------------

    $scope.infoSetup = function() 
    {
        if ($scope.doctor.name&&$scope.doctor.province&&$scope.doctor.city&&$scope.doctor.workUnit&&$scope.doctor.department&&$scope.doctor.title&&$scope.doctor.IDNo){
            //如果必填信息已填
            var IDreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  //身份证号判断
            if ($scope.doctor.IDNo!='' && IDreg.test($scope.doctor.IDNo) == false){
                // console.log("身份证");
                $ionicLoading.show({
                    template: '请输入正确的身份证号',
                    duration:1000
                });
            }
            else{
                $scope.doctor.title = $scope.doctor.title.Name
                User.register({
                    'phoneNo':phoneNumber,
                    'password':password,
                    'role':'doctor'
                })
                .then(function(succ)
                {
                    console.log(phoneNumber)
                    console.log(password)
                    console.log(succ)
                    Storage.set('UID',succ.userNo);
                    //绑定手机号和unionid
                    if($stateParams.last=='wechatsignin'){
                        User.setOpenId({phoneNo:Storage.get('phoneNumber'),openId:Storage.get('doctorunionid')}).then(function(response){
                            Storage.set('bindingsucc','yes')
                            // $timeout(function(){$state.go('tab.home');},500);
                        })
                        // //6-6zxf
                        // var temp_photoaddress = succ.userNo + "_" +  "doctor.photoUrl.jpg";
                        // alert(temp_photoaddress)
                        // alert(Storage.get('wechatheadimgurl'))
                        //     // console.log(temp_photoaddress)
                        // Camera.uploadPicture(Storage.get('wechatheadimgurl'), temp_photoaddress)
                        // .then(function(res){
                        //     var data=angular.fromJson(res)
                        //     alert(JSON.stringify(res));
                        //     //res.path_resized
                        //     //图片路径
                        //     $scope.doctor.photoUrl=CONFIG.mediaUrl+String(data.path_resized)+'?'+new Date().getTime();
                        //     // console.log($scope.doctor.photoUrl)
                        //     // $state.reload("tab.mine")
                        //     // Storage.set('doctor.photoUrlpath',$scope.doctor.photoUrl);
                        //     Doctor.editDoctorDetail({userId:succ.userNo,photoUrl:$scope.doctor.photoUrl}).then(function(r){
                        //         console.log(r);
                        //     })
                        // },function(err){
                        //     console.log(err);
                        //     reject(err);
                        // })
                    }


                    //签署协议置位0，同意协议
                    User.updateAgree({userId:Storage.get('UID'),agreement:"0"})
                    .then(function(data){
                        console.log(data);
                    },function(err){
                        console.log(err);
                    })

                    //填写个人信息
                    $scope.doctor.userId = Storage.get('UID')
                    $scope.doctor.photoUrl=Storage.get('wechatheadimgurl')
                    Doctor.postDocBasic($scope.doctor)
                    .then(
                        function(data)
                        {
                            console.log(data);
                            console.log($scope.doctor)
                            //$scope.doctor = data.newResults;                  
                        },
                        function(err)
                        {
                            console.log(err)
                        }
                    );            

                    //注册论坛

                    $http({
                        method  : 'POST',
                        url     : 'http://proxy.haihonghospitalmanagement.com/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
                        params    :{
                            'regsubmit':'yes',
                            'formhash':'',
                            'username':$scope.doctor.name+phoneNumber.slice(7),
                            'password':$scope.doctor.name+phoneNumber.slice(7),
                            'password2':$scope.doctor.name+phoneNumber.slice(7),
                            'email':phoneNumber+'@bme319.com'
                        },  // pass in data as strings
                        headers : {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept':'application/xml, text/xml, */*'
                        }  // set the headers so angular passing info as form data (not request payload)
                    }).success(function(data) {
                        // console.log(data);
                    });
                    //zxf
                    if($stateParams.last=='wechatsignin'){
                        $state.go('uploadcertificate',{last:'wechatsignin'});
                    }else{
                        $state.go('uploadcertificate')
                    }
                    Storage.set("lt",'bme319');

                },function(err)
                {
                    console.log(err)       
                })                 
            }                         
        }
        else{
            $ionicLoading.show({
                template: '信息填写不完整,请完善必填信息(红色*)',
                duration:1000
            });            
        }
    
    };
    

    // $scope.$on('$ionicView.leave', function() {
    //     $scope.modal.remove();
    // })
}])

.controller('uploadcertificateCtrl',['$interval','CONFIG','Dict','Doctor','$scope','$state','$ionicHistory','$timeout' ,'Storage', '$ionicPopup','$ionicLoading','$ionicPopover','$ionicScrollDelegate','User','$http','Camera','$ionicModal','$stateParams','socket','mySocket',function($interval,CONFIG,Dict,Doctor,$scope,$state,$ionicHistory,$timeout,Storage, $ionicPopup,$ionicLoading, $ionicPopover,$ionicScrollDelegate,User,$http,Camera,$ionicModal,$stateParams,socket,mySocket){
    
    $scope.doctor={


    }
    User.logIn({username:Storage.get('phoneNumber'),password:Storage.get('password'),role:"doctor"}).then(function(data){
        console.log(data)
        if(data.results.mesg=="login success!"){
            $scope.doctor.userId=data.results.userId
        }
    },function(err){
        console.log(err);
    })

    $scope.uploadcetify = function() {
        if($scope.doctor.userId&&$scope.doctor.certificatePhotoUrl&&$scope.doctor.practisingPhotoUrl){
            Doctor.editDoctorDetail($scope.doctor)
            .then(
                function(data)
                {
                    if($stateParams.last=='wechatsignin'){
                        $ionicPopup.show({   
                             title: '微信账号绑定手机账号成功，您的初始密码是123456，您以后也可以用手机号码登录！',
                             buttons: [
                               {
                                    text: '確定',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                        // alert(Storage.get('UID'))
                                        Doctor.getDoctorInfo({userId:$scope.doctor.userId})
                                        .then(function(response){
                                            thisDoctor = response.results;
                                            mySocket.newUser(response.results.userId);

                                        },function(err){
                                            thisDoctor=null;
                                        });
                                        $state.go('tab.home');
                                    }
                               }
                               ]
                        })
                    }else{
                        $state.go('signin')
                    }
                    console.log(data)
                },
                function(err)
                {
                    console.log(err)
                }
            );
        }else{
            $ionicLoading.show({
                template: '信息填写不完整,请完善必填信息(红色*)',
                duration:1000
            });  
        }
        // $scope.ProvinceObject = $scope.doctor.province;
        // console.log("123"+$scope.ProvinceObject);
      
    };
    //0516 zxf
    $scope.flag=0;//判断是给谁传图片 默认是资格证书
    //点击显示大图
    $scope.zoomMin = 1;
    $scope.imageUrl = '';
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        // $scope.modal.show();
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    });

        

    $scope.onClickCamera = function($event,index){
        $scope.openPopover($event);
        $scope.flag=index;
    };
     // 上传照片并将照片读入页面-------------------------
    var photo_upload_display = function(imgURI){
        var temp_photoaddress;
        if($scope.flag==0){
            temp_photoaddress=Storage.get("UID") + "_" + new Date().getTime() + "certificate.jpg";
        }else{
            temp_photoaddress=Storage.get("UID") + "_" + new Date().getTime() + "practising.jpg";
        }
        Camera.uploadPicture(imgURI, temp_photoaddress)
        .then(function(res){
            var data=angular.fromJson(res)
            //图片路径
            if($scope.flag==0){
                $scope.doctor.certificatePhotoUrl=CONFIG.mediaUrl+String(data.path_resized)
            }
            else{
                $scope.doctor.practisingPhotoUrl=CONFIG.mediaUrl+String(data.path_resized)
            }
        },function(err){
            console.log(err);
            reject(err);
        })
    };
    ////-----------------------上传头像---------------------
    // ionicPopover functions 弹出框的预定义
    $ionicPopover.fromTemplateUrl('partials/pop/cameraPopover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function() {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
    // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
    // Execute action
    });

    
    // 相册键的点击事件---------------------------------
    $scope.onClickCameraPhotos = function(){
        // console.log("选个照片");
        $scope.choosePhotos();
        $scope.closePopover();
    };
    $scope.choosePhotos = function() {
        Camera.getPictureFromPhotos('gallery',true).then(function(data) {
          // data里存的是图像的地址
          // console.log(data);
          var imgURI = data;
          photo_upload_display(imgURI);
        }, function(err) {
          // console.err(err);
          var imgURI = undefined;
        });// 从相册获取照片结束
    }; // function结束


    // 照相机的点击事件----------------------------------
    $scope.getPhoto = function() {
        // console.log("要拍照了！");
        $scope.takePicture();
        $scope.closePopover();
    };

    $scope.takePicture = function() {
        Camera.getPicture('cam',true).then(function(data) {
          var imgURI = data;
          photo_upload_display(imgURI);
        }, function(err) {
            // console.err(err);
            var imgURI = undefined;
        })// 照相结束
    }; // function结束

    $scope.showoriginal=function(resizedpath){
        // $scope.openModal();
        // console.log(resizedpath)
        var originalfilepath=CONFIG.imgLargeUrl+resizedpath.slice(resizedpath.lastIndexOf('/')+1).substr(7)
        // console.log(originalfilepath)
        // $scope.doctorimgurl=originalfilepath;

        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = originalfilepath;
        $scope.modal.show();
    }
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
        // $scope.modal.remove()
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    }
}])
