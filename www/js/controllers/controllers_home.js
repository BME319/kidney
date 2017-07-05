angular.module('home.controllers', ['ionic','kidney.services'])

//首页
.controller('homeCtrl', ['Communication','$scope','$state','$interval','$rootScope', 'Storage','$http','$sce','$timeout','Doctor','New',function(Communication,$scope, $state,$interval,$rootScope,Storage,$http,$sce,$timeout,Doctor,New) {
    $scope.barwidth="width:0%";
    $scope.sliderStyle={'margin-top':'44px','height':'170px'}
    if(ionic.Platform.isIOS()){
        $scope.sliderStyle={'margin-top':'64px','height':'170px'}
    }
    var windowHeight=$(window).height();
    console.log(Storage.get('USERNAME'));    
    $scope.hasUnreadMessages = false;
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
    $scope.isfullScreen=false;
    $scope.fullScreen=function()
    {
        // console.log("full")
        if($scope.isfullScreen)
        {
            $scope.isfullScreen=false;
            $scope.isWriting={'margin-top': '170px'};
        }
        else
        {
            $scope.isfullScreen=true;
            $scope.isWriting={'margin-top': '0px','z-index':'20'};
        }
    }
    $scope.isWriting={'margin-top': '170px'};
    if(!sessionStorage.addKBEvent)
    {
        // console.log("true")
        $(window).resize(function () {          //当浏览器大小变化时
            if($(window).height()<windowHeight)
                keyboardShowHandler();
            else
                keyboardHideHandler();
        });

        sessionStorage.addKBEvent=true;
    }
    function keyboardShowHandler(e){
        $scope.$apply(function(){
            $scope.isWriting={'margin-top': '-40px','z-index':'20'};
        })
    }
    function keyboardHideHandler(e){
        $scope.$apply(function(){
            if($scope.isfullScreen)
            {
                $scope.isWriting={'margin-top': '0px','z-index':'20'};
            }
            else
            {
                $scope.isWriting={'margin-top': '100px'};
            }
        })
    }
    $scope.forumPermission=false;
    $scope.goToPersonalInfo=function()
    {
        console.log("go to pers Info")
    }
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            console.log(data)
            if(data.hasOwnProperty("results")&&data.results.hasOwnProperty("name")&&data.results.name!="")
                $scope.forumPermission=true;
            $scope.navigation_login=$sce.trustAsResourceUrl("http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=$loginhash&mobile=2&username="+data.results.name+Storage.get('USERNAME').slice(7)+"&password="+data.results.name+Storage.get('USERNAME').slice(7));
            $scope.navigation=$sce.trustAsResourceUrl("http://proxy.haihonghospitalmanagement.com/");
        },
        function(err)
        {
            console.log(err)
        }
    )
    $scope.options = {
        loop: false,
        effect: 'fade',
        speed: 500,
    }
    $scope.testregis=function()
    {
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
    var forumReg=function(phone,role)
    {
        // console.log(phone.userName+phone.phoneNo.slice(7))
        var un=phone.userName+phone.phoneNo.slice(7);
        var url='http://121.43.107.106';
        if(role=='patient')
            url+=':6699/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1'
        else if(role=='doctor')
            url+='/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1';
        $http({
            method  : 'POST',
            url     : url,
            params    :{
                'regsubmit':'yes',
                'formhash':'xxxxxx',
                'username':un,
                'password':un,
                'password2':un,
                'email':phone.phoneNo+'@bme319.com'
            },  // pass in data as strings
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept':'application/xml, text/xml, */*'
            }  // set the headers so angular passing info as form data (not request payload)
        }).success(function(s){
            console.log(s)
        })
    }
    $scope.importDocs=function()
    {
        $http({
            method:'GET',
            url:'http://121.196.221.44:4050/user/getPhoneNoByRole?role=patient'
        })
        .success(function(data)
        {
            console.log(data)
            var users=data.results;
            for(var i=0;i<users.length;i++)
            {
                forumReg(users[i],'patient');
            }
        })
        $http({
            method:'GET',
            url:'http://121.196.221.44:4050/user/getPhoneNoByRole?role=doctor'
        })
        .success(function(data)
        {
            console.log(data)
            var users=data.results;
            for(var i=0;i<users.length;i++)
            {
                forumReg(users[i],'doctor');
            }
        })
    }

    var GetUnread = function(){
      // console.log(new Date());
      New.getNewsByReadOrNot({userId:Storage.get('UID'),readOrNot:0,userRole:'doctor'}).then(//
          function(data){
              // console.log(data);
              if(data.results.length){
                  $scope.hasUnreadMessages = true;
                  // console.log($scope.HasUnreadMessages);
              }else{
                  $scope.hasUnreadMessages = false;
              }
          },function(err){
                  console.log(err);
          });
    }

    $scope.$on('$ionicView.enter', function() {
      console.log("enter");
      RefreshUnread = $interval(GetUnread,2000);
    });

    $scope.$on('$ionicView.leave', function ()
    {
      console.log('destroy');
      if(RefreshUnread){
        $interval.cancel(RefreshUnread);
      }
    });

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

//消息类型
.controller('VaryMessageCtrl', ['$scope','$state','$ionicHistory','Storage',function($scope, $state,$ionicHistory,Storage) {

    var messageType = Storage.get("getMessageType")
    $scope.messages=angular.fromJson(Storage.get("allMessages"))[messageType]
    console.log($scope.messages)

    if(messageType=='ZF')
        $scope.avatar='payment.png'
    else if(messageType=='JB')
        $scope.avatar='alert.png'
    else if(messageType=='RW')
        $scope.avatar='task.png'
    else if(messageType=='BX')
        $scope.avatar='security.png'

    $scope.Goback = function(){
        $ionicHistory.goBack();
    }

  
}])
//消息中心--ZY
.controller('messageCtrl', ['$ionicPopup','$q','$scope','$state','$ionicHistory','New','Storage','Doctor','Patient','Communication','Counsel',function($ionicPopup,$q,$scope, $state,$ionicHistory,New,Storage,Doctor,Patient,Communication,Counsel) {
    $scope.barwidth="width:0%";
    var getPatNamePhoto = function(sender,patient){
        Patient.getPatientDetail({userId:sender}).then(
            function(data){
                if(data.results){
                    if(data.results.photoUrl){
                        patient.Name = data.results.name;
                        patient.Photo = data.results.photoUrl;                        
                        
                    }
                    else {
                        patient.Name = data.results.name;
                        patient.Photo = 'img/patient.png'
                    }
                }                        
            },function(err){
                console.log(err);
            });
    }   

    var getDocNamePhoto = function(sender,doctor){
        Doctor.getDoctorInfo({userId:sender}).then(
            function(data){
                if(data.results){
                    console.log(data.results)
                    if(data.results.photoUrl){
                        doctor.Name = data.results.name;
                        doctor.Photo = data.results.photoUrl;                        
                    }
                    else {                        
                        doctor.Name = data.results.name;
                        doctor.Photo = 'img/doctor.png'
                    }
                }                        
            },function(err){
                console.log(err);
            });
    }

    var getTeamNamePhoto = function(sender,team){
        Communication.getTeam({teamId:sender}).then(
            function(data){
                if(data.results){
                    if(data.results.photoUrl){
                        team.Name = data.results.name;
                        team.Photo = data.results.photoUrl;                                                
                    }
                    else {
                        team.Name = data.results.name;
                        team.Photo = 'img/doctor_group.png'
                    }
                }                        
            },function(err){
                console.log(err);
            });
    }

    var Lastnews = function(){
        var receiver = Storage.get('UID');
        // News.getNews({userId:receiver,type:1}).then(
        //     function(data){
        //         if(data.results.length){
        //             console.log(data.results);
        //             $scope.pay = data.results[0];
        //         }
                
        //     },function(err){
        //         console.log(err);
        //     }
        // );

        //获取所有类别聊天消息 type=chat  分类别type11患者-医生  type12医生-医生  type13团队-医生
        New.getNewsByReadOrNot({userId:receiver,type:'chat',readOrNot:0,userRole:'doctor'}).then(
            function(data){
                //console.log(data.results)
                if(data.results.length){
                    for (var i = 0; i < data.results.length; i++){
                        //console.log(data.results[i].type)
                        if(data.results[i].type == 11){
                            getPatNamePhoto(data.results[i].sendBy,data.results[i]);                    
                        }
                        if(data.results[i].type == 12){
                            getDocNamePhoto(data.results[i].sendBy,data.results[i]);                   
                        }
                        if(data.results[i].type == 13){
                            getTeamNamePhoto(data.results[i].sendBy,data.results[i]);                                                
                        } 
                    } 
                    $scope.chats=data.results;
                }
            },function(err){
                console.log(err);
            }
        );        

    }
     $scope.$on('$ionicView.enter', function() {
        Lastnews();
    })

    $scope.do_refresher = function(){
        Lastnews();
        $scope.$broadcast("scroll.refreshComplete");
    }

    $scope.Goback = function(){
        $state.go('tab.home')
    }

    //患者-医生  获取咨询状态 [status]：1进行中；0已完成  进入聊天：[type]:1=进行中;0=已结束;
    getPChatDetail = function(Pchat) {
        var patientId = Pchat.sendBy;
        Counsel.getStatus({doctorId:Storage.get('UID'),patientId:patientId})
        .then(function(data){
            Storage.set('consultId',data.result.consultId)
            if(data.result.status==1){
                $state.go("tab.detail",{chatId:patientId,type:1,consultId:Storage.get('consultId')});
            }
            else if(data.result.status==0){
                $state.go("tab.detail",{chatId:patientId,type:0,consultId:Storage.get('consultId')});
            }
        })
    }

    //医生-医生 进入聊天：type：2
    getDChatDetail = function(Dchat) {
        console.log(Dchat.sendBy)
        $state.go("tab.detail",{chatId:Dchat.sendBy,type:2,consultId:'DoctorChat'});
    }

    //团队-医生  获取交流状态 [status]：1进行中；0已完成  进入聊天：[type]:1=进行中;2=已结束;
    getTChatDetail = function(Tchat) {
        var msg = JSON.parse(Tchat.url)
        var teamId = msg.teamId
        var groupId = msg.targetID
        if(teamId == groupId) return $state.go("tab.group-chat",{type:0,teamId:teamId,groupId:groupId});
        Communication.getConsultation({consultationId:msg.targetID})
        .then(function(data){
            Storage.set('consultId',data.result.consultId)
            if(data.result.status==1){
                $state.go("tab.group-chat",{type:1,teamId:teamId,groupId:groupId});
            }
            else if(data.result.status==0){
                $state.go("tab.group-chat",{type:2,teamId:teamId,groupId:groupId});
            }
        })
    }

    $scope.getChatDetail = function(chat){
        console.log(chat.type);
        if(chat.type==11){
            getPChatDetail(chat)
        }
        else if(chat.type==12){
            getDChatDetail(chat)
        }
        else if(chat.type==13){
            getTChatDetail(chat)
        }        
    }
}])