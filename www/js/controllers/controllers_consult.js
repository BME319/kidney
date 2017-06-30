angular.module('consult.controllers', ['ionic','kidney.services'])

//咨询
.controller('consultCtrl', ['$scope','$state','$interval','$rootScope', 'Storage','QRScan','Counsel',  function($scope, $state,$interval,$rootScope,Storage,QRScan,Counsel) {
    $scope.barwidth="width:0%";
    //变量a 等待患者数量 变量b 已完成咨询患者数量
    $scope.doctor={a:0,b:0};
    var now=new Date();
    var year=now.getYear();
    var month=now.getMonth()+1;
    var day=now.getDate();
    var date1=month+"月"+day+"日";
    //var date1=new Date().format("MM月dd日");
    $scope.riqi=date1;
    
    var load = function()
    {
        //获取已完成
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:0
        })
        .then(
            function(data)
            {
                // console.log(data)
                Storage.set("consulted",angular.toJson(data.results))
                // console.log(angular.fromJson(Storage.get("consulted",data.results)))
                $scope.doctor.b=data.results.length;
            },
            function(err)
            {
                console.log(err)
            }
        )
        //获取进行中
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:1
        })
        .then(
            function(data)
            {
                // console.log(data)
                Storage.set("consulting",angular.toJson(data.results))
                // console.log(angular.fromJson(Storage.get("consulting",data.results)))
                $scope.doctor.a=data.results.length;
            },
            function(err)
            {
                console.log(err)
            }
        )        
    }  
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
    $scope.$on('$ionicView.enter', function() {
        load();
    })
}])

//"咨询”进行中
.controller('doingCtrl', ['$scope','$state','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover','Counsel','$ionicHistory','New',  function($scope, $state,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover,Counsel,$ionicHistory,New) {
    var load = function(){
        Counsel.getCounsels({userId:Storage.get('UID'), status:1 })
        .then(function(data){
            $scope.allpatients=data.results;
            New.addNestNews('11',Storage.get('UID'),$scope.allpatients,'userId','patientId')
            .then(function(pats){
                $scope.patients=pats;
            })
            // $scope.patients=data.results;
        })        
    }
    $scope.$on('$ionicView.beforeEnter',function(){
        load();
    })
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }   
    // $scope.allpatients=angular.fromJson(Storage.get("consulting"));
    // $scope.patients=$scope.allpatients;
    // console.log($scope.allpatients)
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    
    $scope.goSearch = function() {
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:1,
            name:$scope.search.name
        })
        .then(function(data) {
            $scope.patients = data.results
            if (data.results.length == 0) {
                //console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    // $scope.clearSearch = function() {
    //     $scope.search.name = '';
    //     $scope.patients = $scope.allpatients;
    // }
    //----------------结束搜索患者------------------
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
        //$scope.testt=12345
    };
    $scope.filters={
        item1:true,
        item2:true
    }
    $scope.filterShow=function()
    {
        angular.forEach($scope.patients,function(value,key)
        {
            value.show=true;
            if(!$scope.filters.item1)
            {
                if(value.type==1)
                    value.show=false;
            }
            if(!$scope.filters.item2)
            {
                if(value.type==2||value.type==3)
                    value.show=false;
            }
        })
        // console.log($scope.patients)
    }

    $scope.goCounsel = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.consult');
    }

    $scope.itemClick = function(ele, userId, counselId) {
        if (ele.target.id == 'doingdetail'){
            // console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'1',chatId:userId,counselId:counselId});
        }
    }
}])

//"咨询”已完成
.controller('didCtrl', ['$scope','$state','Counsel','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover','$ionicHistory','New',  function($scope, $state,Counsel,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover,$ionicHistory,New) {
    var load = function(){
        Counsel.getCounsels({userId:Storage.get('UID'), status:0 })
        .then(function(data){
            $scope.allpatients=data.results;
            New.addNestNews('11',Storage.get('UID'),$scope.allpatients,'userId','patientId')
            .then(function(pats){
                $scope.patients=pats;
            })

            // $scope.patients=data.results;
        })        
    }
    $scope.$on('$ionicView.beforeEnter',function(){
        load();
    })
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }   
    // $scope.allpatients=angular.fromJson(Storage.get("consulted"));
    // $scope.patients=$scope.allpatients;
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    $scope.goSearch = function() {
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:0,
            name:$scope.search.name
        })
        .then(function(data) {
            $scope.patients = data.results
            if (data.results.length == 0) {
                //console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    // $scope.clearSearch = function() {
    //     $scope.search.name = '';
    //     $scope.patients = $scope.allpatients;
    // }
    //----------------结束搜索患者------------------      
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
        //$scope.testt=12345
    };
    $scope.goCounsel = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.consult');
    }
    $scope.filters={
        item1:true,
        item2:true
    }
    $scope.filterShow=function()
    {
        angular.forEach($scope.patients,function(value,key)
        {
            value.show=true;
            if(!$scope.filters.item1)
            {
                if(value.type==1)
                    value.show=false;
            }
            if(!$scope.filters.item2)
            {
                if(value.type==2||value.type==3)
                    value.show=false;
            }
        })
        // console.log($scope.patients)
    }

    $scope.itemClick = function(ele, userId, counselId) {
        if (ele.target.id == 'diddetail'){
            console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'0',chatId:userId,counselId:counselId});
        }
    }
    //$scope.isChecked1=true;
}])

//"咨询”问题详情
.controller('detailCtrl', ['$ionicPlatform','$scope', '$state', '$rootScope', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', '$http', 'CONFIG', 'arrTool', 'Communication','Counsel','Storage','Doctor','Patient','$q','New','Mywechat','Account','socket','notify','$timeout',function($ionicPlatform,$scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicHistory, $ionicPopover, $ionicPopup, Camera, voice, $http, CONFIG, arrTool, Communication, Counsel,Storage,Doctor,Patient,$q,New,Mywechat,Account,socket,notify,$timeout) {
    if($ionicPlatform.is('ios')) cordova.plugins.Keyboard.disableScroll(true);

    $scope.input = {
        text: ''
    }
    $scope.photoUrls={}
    $scope.params = {
        //[type]:0=已结束;1=进行中;2=医生
        type: '',
        counselId: '',
        title: '',
        msgCount: 0,
        helpDivHeight: 0,
        realCounselType: '',
        moreMsgs: true,
        UID: Storage.get('UID'),
        newsType: '',
        targetRole: '',
        counsel: {},
        loaded:false,
        recording: false
    }

    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        $timeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs 
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.timer=[];
        $scope.photoUrls = {};
        $scope.msgs = [];
        $scope.params.chatId = $state.params.chatId;
        $scope.params.counselId = $state.params.counselId;
        $scope.params.type = $state.params.type;
        //消息初次加载
        $scope.params.loaded = false;
        $scope.params.msgCount = 0;
        
        //消息字段
        $scope.params.targetRole = '';
        $scope.params.newsType = $scope.params.type=='2'?'12':'11';

        try{
            notify.remove($scope.params.chatId);
        }catch(e){}
        console.log($scope.params)

        if ($scope.params.type == '2') {
            $scope.params.title = "医生交流";
            $scope.params.targetRole = 'doctor';
            Doctor.getDoctorInfo({ userId: $scope.params.chatId })
                .then(function(data) {
                    $scope.params.targetName = data.results.name;
                    $scope.photoUrls[data.results.userId] = data.results.photoUrl;
                });
        } else {
            $scope.params.title = "咨询";
            $scope.params.targetRole = 'patient';
            Patient.getPatientDetail({ userId: $state.params.chatId })
                .then(function(data) {
                    $scope.params.targetName = data.results.name;
                    $scope.photoUrls[data.results.userId] = data.results.photoUrl;
                });
            //获取counsel信息
            Counsel.getStatus({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                .then(function(data) {
                    console.log(data)
                    $scope.params.counsel = data.result;
                    $scope.params.counselId = data.result.counselId;
                    $scope.counseltype = data.result.type == '3' ? '2' : data.result.type;
                    $scope.params.type = data.result.status;
                    $scope.counselstatus = data.result.status;
                    $scope.params.realCounselType = data.result.type;
                    Account.getCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                        .then(function(res) {

                            if ($scope.params.loaded) {
                                return sendNotice($scope.counseltype, $scope.counselstatus, res.result.count);
                            } else {
                                var connectWatcher = $scope.$watch('params.loaded', function(newv, oldv) {
                                    if (newv) {
                                        connectWatcher();
                                        return sendNotice($scope.counseltype, $scope.counselstatus, res.result.count);
                                    }
                                });
                            }
                        });
                }, function(err) {
                    console.log(err);
                })
        }

        var loadWatcher = $scope.$watch('params.loaded', function(newv, oldv) {
            if (newv) {
                loadWatcher();
                if($scope.msgs.length==0) return;
                var lastMsg = $scope.msgs[$scope.msgs.length - 1];
                if (lastMsg.fromID == $scope.params.UID) return;
                return New.insertNews({ userId: lastMsg.targetID, sendBy: lastMsg.fromID, type: $scope.params.newsType, readOrNot: 1 });
            }
        });
    });


    $scope.$on('$ionicView.enter', function() {
        if ($rootScope.conversation) {
            $rootScope.conversation.type = 'single';
            $rootScope.conversation.id = $state.params.chatId;
        }
        Doctor.getDoctorInfo({ userId: $scope.params.UID })
            .then(function(response) {
                thisDoctor = response.results;
                $scope.photoUrls[response.results.userId] = response.results.photoUrl;
            }, function(err) {
                console.log(err);
            })
        imgModalInit();
        $scope.getMsg(15).then(function(data) {
            $scope.msgs = data;
            toBottom(true, 400);
            $scope.params.loaded = true;
        });
    })

    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height ;
        toBottom(true,100);
    });
    $scope.$on('keyboardhide', function(event) {
        $scope.params.helpDivHeight = 0;
        $scope.scrollHandle.resize();
    });
    $scope.$on('$ionicView.beforeLeave', function() {
        for(var i in $scope.timer) clearTimeout($scope.timer[i]);
        if ($scope.popover) $scope.popover.hide();
    });
    $scope.$on('$ionicView.leave', function() {
        if ($scope.params.type == '2' && $scope.msgs.length)
            Communication.updateLastTalkTime($scope.params.chatId, $scope.msgs[$scope.msgs.length - 1].createTimeInMillis);
        $scope.msgs = [];
        if ($scope.modal) $scope.modal.remove();
        $rootScope.conversation.type = null;
        $rootScope.conversation.id = '';
    });
    $scope.$on('im:getMsg',function(event,data){
        console.log(arguments);
        console.info('getMsg');
        console.log(data);
        if (data.msg.targetType == 'single' && data.msg.fromID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
            $scope.$apply(function() {
                insertMsg(data.msg);
            });
            if ($scope.params.type != '2' && data.msg.contentType == 'custom' && (data.msg.content.type == 'card' || data.msg.content.type == 'counsel-payment')) {
                Communication.getCounselReport({ counselId: data.msg.content.counselId })
                    .then(function(data) {
                        console.log(data)
                        $scope.params.counsel = data.results;
                        $scope.counseltype = data.results.type == '3' ? '2' : data.results.type;
                        $scope.counselstatus = data.results.status;
                        $scope.params.realCounselType = data.results.type;
                    }, function(err) {
                        console.log(err);
                    })
            }
            if (data.msg.contentType == 'custom' && data.msg.content.type == 'counsel-upgrade') {
                $scope.$apply(function() {
                    $scope.counseltype = '2';
                });
                $scope.counselstatus = 1;
            }
            New.insertNews({ userId: $scope.params.UID, sendBy: $scope.params.chatId, type: $scope.params.newsType, readOrNot: 1 });

        }
    });
    $scope.$on('im:messageRes',function(event,data){
        console.log(arguments);
        console.info('messageRes');
        console.log(data);
        if (data.msg.targetType == 'single' && data.msg.targetID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
            $scope.$apply(function() {
                insertMsg(data.msg);
            });
            if ($scope.counselstatus == 1 && $scope.counseltype == 1 && !(data.msg.contentType == 'custom' && data.msg.content.type == 'count-notice')) {
                Account.modifyCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId, modify: '-1' })
                    .then(function() {
                        Account.getCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                            .then(function(data) {
                                if (data.result.count <= 0) {
                                    $scope.counselstatus = 0;
                                    $scope.params.title = "咨询";
                                    endCounsel(1);
                                }
                            })
                    })
            }
        }
    });

    function sendNotice(type,status,cnt){
        // var t = setTimeout(function(){
            return sendCnNotice(type,status,cnt);
        // },500);
        // $scope.timer.push(t);
    }
    function sendCnNotice(type,status,cnt){
        var len=$scope.msgs.length;
        if(len==0 || !($scope.msgs[len-1].content.type=='count-notice' && $scope.msgs[len-1].content.count==cnt)){
            var bodyDoc='';
            if(type!='1'){
                if(status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='患者提问不限次数';
                    bodyPat='您可以不限次数进行提问';
                }
            }else{
                if(cnt<=0 || status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='您还需要回答'+cnt+'个问题';
                    bodyPat='您还有'+cnt+'次提问机会';
                }
            }

            var notice={
                type:'count-notice',
                ctype:type,
                cstatus:status,
                count:cnt,
                bodyDoc:bodyDoc,
                bodyPat:bodyPat,
                counseltype:$scope.counseltype
            }
            var msgJson={
                clientType:'doctor',
                contentType:'custom',
                fromID:$scope.params.UID,
                fromName:'',
                fromUser:{
                    // avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                },
                targetID:$scope.params.chatId,
                targetName:$scope.params.targetName,
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:$scope.params.newsType,
                targetRole:$scope.params.targetRole,
                content:notice
            }
            // socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
            $scope.msgs.push(msgJson);
            // toBottom(true,300);
            // $scope.pushMsg(msgJson);
        }
    }
    $scope.getMsg = function (num) {
        console.info('getMsg');
        return $q(function (resolve, reject) {
            var q = {
                messageType: '1',
                newsType: $scope.params.newsType,
                id1: Storage.get('UID'),
                id2: $scope.params.chatId,
                skip: $scope.params.msgCount,
                limit: num
            }
            Communication.getCommunication(q)
                .then(function (data) {
                    console.log(data);
                    var d = data.results;
                    $scope.$broadcast('scroll.refreshComplete');
                    if (d == '没有更多了!') return noMore();
                    var res = [];
                    for (var i in d) {
                        res.push(d[i].content);
                    }
                    if (res.length == 0) $scope.params.moreMsgs = false;
                    else {
                        $scope.params.msgCount += res.length;
                        if ($scope.msgs.length != 0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if (res[i].contentType == 'image') res[i].content.thumb = CONFIG.mediaUrl + res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                    }
                    console.log($scope.msgs);
                    resolve($scope.msgs);
                }, function (err) {
                    $scope.$broadcast('scroll.refreshComplete');
                    resolve($scope.msgs);
                });
        })

    }

    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }

    $scope.scrollBottom = function() {
        $scope.showVoice = false;
        $scope.showMore = false;
        $scope.scrollHandle.scrollBottom(true);
    }
    //长按工具条
    var options = [{
        name: '转发医生',
    }, {
        name: '转发团队',
    }]
    $ionicPopover.fromTemplateUrl('partials/others/toolbox-pop.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.options = options;
        $scope.popover = popover;
    });
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            // $scope.modal.show();
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }

    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb));
        $scope.modal.show();
    });

    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    };
    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.sound = new Media(args[1],
            function() {
            },
            function(err) {
                console.log(err);
            })
        $scope.sound.play();
    });

    $scope.$on('holdmsg', function(event, args) {
        event.stopPropagation();
        $scope.holdId = args[1];
        console.log(args)
        $scope.popover.show(args[2]);
    });
  
    $scope.$on('viewcard', function(event, args) {
        event.stopPropagation();
        console.log(args[2]);
        if (args[2].target.tagName == "IMG") {
            $scope.imageHandle.zoomTo(1, true);
            $scope.imageUrl = args[2].target.currentSrc;
            console.log(args[2].target.attributes.hires.nodeValue);
            $scope.modal.show();
        } else {
            Storage.set('getpatientId',args[1].content.patientId);

            var statep={
            type:$scope.params.type,
            chatId:$scope.params.chatId
            }
            Storage.set('backId','tab.detail');
            Storage.set('singleChatParams',JSON.stringify(statep));
            $state.go('tab.patientDetail');
            // $state.go('tab.consult-detail',{consultId:args[1]});
        }
        // $state.go('tab.consult-detail',{consultId:args[1]});
    });
    $scope.toolChoose = function(data) {
        // console.log(data);
        var content = $scope.msgs[arrTool.indexOf($scope.msgs, 'createTimeInMillis', $scope.holdId)].content;
        if (data == 0) $state.go('tab.selectDoc', { msg: content });
        if (data == 1) $state.go('tab.selectTeam', { msg: content });
    };
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
        if(args[1].direct=='receive'){
            if($scope.params.type=='2'){
                return $state.go('tab.group-profile', { memberId: args[1].fromID});
            }else{
                Storage.set('getpatientId',args[1].fromID); 
                var statep={
                    type:$scope.params.type,
                    chatId:$scope.params.chatId
                }
                Storage.set('backId','tab.detail');
                Storage.set('singleChatParams',JSON.stringify(statep));
                return $state.go('tab.patientDetail');
            }
            
        }
    });

    function endCounsel(type){
        Counsel.changeStatus({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,type:type,status:0})
        .then(function(data){
            var endlMsg={
                type:'endl',
                info:"咨询已结束",
                docId:thisDoctor.userId,
                counseltype:1
            }
            if(type==2){
                endlMsg.info="问诊已结束";
                endlMsg.counseltype=2;
            }
            var msgJson={
                clientType:'doctor',
                contentType:'custom',
                fromID:thisDoctor.userId,
                fromName:thisDoctor.name,
                fromUser:{
                    avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                },
                targetID:$scope.params.chatId,
                targetName:$scope.params.targetName,
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:$scope.params.newsType,
                targetRole:'patient',
                content:endlMsg
            }
            socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
            $scope.counselstatus='0';
            $scope.pushMsg(msgJson);
        });
        Counsel.changeCounselStatus({counselId:$state.params.counselId,status:0});
    }
    $scope.finishConsult = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要结束此次咨询吗?',
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                Account.modifyCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,modify:'900'})
                .then(function(){
                    endCounsel($scope.params.realCounselType);
                },function(err){
                    console.error(err);
                })
            } else {
            }
        });
    };
    $scope.updateMsg = function (msg, pos) {
        console.info('updateMsg');
        if (pos == 0) {
            msg.diff = true;
        } else if (msg.hasOwnProperty('time')) {
            var m = $scope.msgs[pos - 1];
            if (m.contentType == 'custom' && m.content.type == 'count-notice' && pos>1) {
                m = $scope.msgs[pos - 2];
            }
            if (m.hasOwnProperty('time')) {
                msg.diff = (msg.time - m.time) > 300000 ? true : false;
            } else {
                msg.diff = false;
            }
        }

        msg.content.src = $scope.msgs[pos].content.src;
        msg.direct = $scope.msgs[pos].direct;
        $scope.msgs[pos] = msg;
    };
    $scope.pushMsg = function (msg) {
        console.info('pushMsg');
        var len = $scope.msgs.length;
        if (msg.hasOwnProperty('time')) {
            if (len == 0) {
                msg.diff = true;
            } else {
                var m = $scope.msgs[len - 1];
                if (m.contentType == 'custom' && m.content.type == 'count-notice' && len>1) {
                    m = $scope.msgs[len - 2];
                }
                if (m.hasOwnProperty('time')) {
                    msg.diff = (msg.time - m.time) > 300000 ? true : false;
                }
            }
        }
        // msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        $scope.params.msgCount++;
        $scope.msgs.push(msg);
        toBottom(true, 200);
        toBottom(true, 600);
        setTimeout(function () {
            var pos = arrTool.indexOf($scope.msgs, 'createTimeInMillis', msg.createTimeInMillis);
            if (pos != -1 && $scope.msgs[pos].status == 'send_going') $scope.msgs[pos].status = 'send_fail';
        }, 10000);
    };
    function insertMsg(msg){
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos==-1){
            $scope.pushMsg(msg);
        }else{
            $scope.updateMsg(msg,pos);
        }
    }
    // send message--------------------------------------------------------------------------------
    //
    function msgGen(content, type) {
        var data = {};
        if (type == 'text') {
            data = {
                text: content
            };
        } else if (type == 'image') {
            data = {
                src: content[0],
                src_thumb: content[1]
            };
        } else if (type == 'voice') {
            data = {
                src: content
            };
        }
        var msgJson = {
            clientType: 'doctor',
            contentType: type,
            fromID: $scope.params.UID,
            fromName: thisDoctor.name,
            fromUser: {
                avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + $scope.params.UID + '_myAvatar.jpg'
            },
            targetID: $scope.params.chatId,
            targetName: $scope.params.targetName,
            targetType: 'single',
            status: 'send_going',
            createTimeInMillis: Date.now(),
            newsType: $scope.params.newsType,
            targetRole: $scope.params.targetRole,
            content: data
        }
        return msgJson;
    }
    function localMsgGen(msg,url){
        var d = {},
            type = msg.contentType;
        if (type == 'image') {
            d.src = msg.content.src;
            d.src_thumb = msg.content.src_thumb;
            d.localPath = url;
        } else if (type == 'voice') {
            d.localPath = url;
            d.src = msg.content.src;
        }
        return {
            clientType:'doctor',
            contentType:type,
            fromID: msg.fromID,
            fromName: msg.fromName,
            fromUser: msg.fromUser,
            targetID: msg.targetID,
            targetName: msg.targetName,
            targetType:'single',
            status:'send_going',
            createTimeInMillis: msg.createTimeInMillis,
            newsType:msg.newsType,
            targetRole:$scope.params.targetRole,
            content:d
        }
    }
    function sendmsg(content,type){
        var msgJson=msgGen(content,type);
        console.info('[socket.connected]',socket.connected);
        socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
        $scope.pushMsg(msgJson);
    }

    $scope.submitMsg = function() {
        var template = {
            "userId": $scope.params.chatId, //患者的UID
            "role": "patient",
            "postdata": {
                "template_id": "N_0kYsmxrQq-tfJhGUo746G8Uem6uHZgK138HIBKI2I",
                "data": {
                    "first": {
                        "value": "您的"+($scope.counseltype==1?'咨询':'问诊') +$scope.params.counsel.symptom+"已被回复！", //XXX取那个咨询或问诊的标题
                        "color": "#173177"
                    },
                    "keyword1": {
                        "value": $scope.params.counsel.help, //咨询的问题
                        "color": "#173177"
                    },
                    "keyword2": {
                        "value": $scope.input.text, //医生的回复
                        "color": "#173177"
                    },
                    "keyword3": {
                        "value": thisDoctor.name, //回复医生的姓名
                        "color": "#173177"
                    },
                    "remark": {
                        "value": "感谢您的使用！",
                        "color": "#173177"
                    }
                }
            }
        }
        Mywechat.messageTemplate(template);
        sendmsg($scope.input.text,'text');
        $scope.input.text = '';
    }

    //get image
    $scope.getImage = function(type) {
        $scope.showMore = false;
        Camera.getPicture(type,true)
            .then(function(url) {
                console.log(url);
                var fm = md5(Date.now(), $scope.params.chatId) + '.jpg',
                    d = [
                        'uploads/photos/' + fm,
                        'uploads/photos/resized' + fm
                    ],
                    imgMsg = msgGen(d,'image'),
                    localMsg = localMsgGen(imgMsg,url);
                $scope.pushMsg(localMsg);
                Camera.uploadPicture(url, fm)
                    .then(function() {
                        socket.emit('message',{msg:imgMsg,to:$scope.params.chatId,role:'doctor'});
                    }, function() {
                        $ionicLoading.show({ template: '图片上传失败', duration: 2000 })
                    });
            }, function(err) {
                // console.error(err);
            });
    };

    //get voice
    $scope.getVoice = function() {
        //voice.record() do 2 things: record --- file manipulation 
        voice.record()
            .then(function(fileUrl) {


                $scope.params.recording=false;
                // window.JMessage.sendSingleVoiceMessage($state.params.chatId, fileUrl, $scope.params.key, onSendSuccess, onSendErr);
                viewUpdate(5, true);
            }, function(err) {
                console.log(err);
            });
        $scope.params.recording=true;

    }

    $scope.stopAndSend = function() {
        voice.stopRec();
    }

    $scope.goChats = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if ($state.params.type == "1") $state.go('tab.doing');
        else if ($state.params.type == "0") $state.go('tab.did');
        else $state.go('tab.groups', { type: '1' });
    }
}])

.controller('selectDocCtrl', ['$state', '$scope', '$ionicPopup','$ionicLoading','$ionicScrollDelegate','Patient', 'Storage', 'Communication','CONFIG','Mywechat','socket',function($state, $scope, $ionicPopup,$ionicLoading,$ionicScrollDelegate,Patient, Storage,Communication,CONFIG,Mywechat,socket) {

    $scope.params={
        moredata:true,
        skip:0,
        limit:20,
        query:'',
        isSearch:false
    }
    var allDoctors=[];
    $scope.doctors=[];
    $scope.$on('$ionicView.beforeEnter',function(){
        $ionicScrollDelegate.scrollTop();
        $scope.params.query='';
        $scope.params.isSearch=false;
    });
    
    $scope.loadMore = function() {
        Patient.getDoctorLists({ skip: $scope.params.skip, limit: $scope.params.limit })
            .then(function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                allDoctors = $scope.doctors.concat(data.results);
                $scope.doctors = allDoctors;
                $scope.params.skip+=data.results.length;
                if (data.results.length <$scope.params.limit) 
                    $scope.moredata = false;
            }, function(err) {
                console.log(err);
            })
    };

    $scope.$watch('params.query',function(val,val1){
        if($scope.params.query==''){
            $scope.doctors=allDoctors;
            $scope.params.isSearch=false;
        }
    });

    $scope.docSearch = function() {
        if (!$scope.params.isSearch) {
            $ionicLoading.show();
            Patient.getDoctorLists({ skip: 0, limit: 100, name: $scope.params.query })
                .then(function(data) {
                    if (data.results.length == 0) {
                        $ionicLoading.show({ template: '结果为空', duration: 1000 });
                    } else {
                        $ionicLoading.hide();
                        allDoctors = $scope.doctors;
                        $scope.doctors = data.results;
                        $scope.params.isSearch = true;
                    }
                }, function(err) {
                    console.log(err);
                });
        } else {
            $scope.doctors = allDoctors;
            $scope.params.query = '';

        }
    };

    $scope.sendTo = function(doc) {
        var confirmPopup = $ionicPopup.confirm({
            title: '转发给：' + doc.name,
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var msgdata = $state.params.msg;
                msgdata.fromId = Storage.get('UID');
                msgdata.targetId = doc.userId;
                var msgJson={
                    clientType:'doctor',
                    contentType:'custom',
                    fromID:thisDoctor.userId,
                    fromName:thisDoctor.name,
                    fromUser:{
                        avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                    },
                    targetID:doc.userId,
                    targetName:doc.name,
                    targetType:'single',
                    status:'send_going',
                    createTimeInMillis: Date.now(),
                    newsType:'12',
                    targetRole:'doctor',
                    content:msgdata
                }
                // socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId});
                socket.emit('message',{msg:msgJson,to:doc.userId,role:'doctor'});
                var listener = $scope.$on('im:messageRes',function(event,messageRes){
                    if(messageRes.msg.createTimeInMillis!=msgJson.createTimeInMillis) return;
                    var csl = messageRes.msg.content.counsel;
                    listener();
                    // socket.emit('disconnect');
                    var template = {
                        "userId": doc.userId, //医生的UID
                        "role": "doctor",
                        "postdata": {
                            "template_id": "DWrM__2UuaLxYf5da6sKOQA_hlmYhlsazsaxYX59DtE",
                            "data": {
                                "first": {
                                    "value": thisDoctor.name+"向您转发了一个"+(csl.type==1?'咨询':'问诊')+"消息，请及时查看",
                                    "color": "#173177"
                                },
                                "keyword1": {
                                    "value": csl.counselId, //咨询ID
                                    "color": "#173177"
                                },
                                "keyword2": {
                                    "value": doc.name, //患者信息（姓名，性别，年龄）
                                    "color": "#173177"
                                },
                                "keyword3": {
                                    "value": csl.help, //问题描述
                                    "color": "#173177"
                                },
                                "keyword4": {
                                    "value": csl.time.substr(0,10), //提交时间
                                    "color": "#173177"
                                },

                                "remark": {
                                    "value": "感谢您的使用！",
                                    "color": "#173177"
                                }
                            }
                        }
                    };
                    Mywechat.messageTemplate(template);
                    $state.go('tab.detail', { type: '2', chatId: doc.userId,counselId:msgdata.counselId});
                });
            }
        });
    };
}])
.controller('selectTeamCtrl', ['$state', '$scope','$ionicPopup', 'Doctor', 'Communication', 'Storage','$filter','CONFIG','socket', function($state, $scope, $ionicPopup, Doctor, Communication, Storage,$filter,CONFIG,socket) {
    $scope.params = {
        // isSearch:false,
    }
    $scope.query = {
        name: '',
    }
    console.log($state.params);
    Doctor.getMyGroupList({ userId: Storage.get('UID') })
        .then(function(data) {
            $scope.teams = data;
        }, function(err) {
            console.log(err);
        });

    $scope.sendTo = function(team) {
        var confirmPopup = $ionicPopup.confirm({
            title: '转发到：' + team.name,
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var time = new Date();
                var gid='G'+$filter('date')(time, 'MMddHmsss');
                var msgdata = $state.params.msg;

                var d = {
                    teamId: team.teamId,
                    counselId: msgdata.counselId,
                    sponsorId: msgdata.doctorId,
                    patientId: msgdata.patientId,
                    consultationId: gid,
                    status: '1'
                }
                msgdata.consultationId = gid;
                msgdata.targetId = team.teamId;
                msgdata.fromId = thisDoctor.userId;
                var msgJson = {
                    clientType:'doctor',
                    contentType: 'custom',
                    fromID: thisDoctor.userId,
                    fromName: thisDoctor.name,
                    fromUser: {
                        avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + thisDoctor.userId + '_myAvatar.jpg'
                    },
                    targetID: team.teamId,
                    teamId: team.teamId,
                    targetName: team.name,
                    targetType: 'group',
                    status: 'send_going',
                    newsType: '13',
                    targetRole:'doctor',
                    createTimeInMillis: Date.now(),
                    content: msgdata
                }

                Communication.newConsultation(d)
                    .then(function(data) {
                        console.log(data);
                        // socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId });
                        socket.emit('message', { msg: msgJson, to: team.teamId, role: 'doctor' });
                        var listener = $scope.$on('im:messageRes', function(event,messageRes) {
                            if (messageRes.msg.createTimeInMillis != msgJson.createTimeInMillis) return;
                            listener();
                            $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId });
                        });
                    }, function(er) {
                        console.error(err);
                    });
            }
        });
    };
}])

.controller('doctorProfileCtrl',['$scope','$state','Doctor','Storage',function($scope,$state,Doctor,Storage){
    $scope.doctor = {};
    $scope.goChat = function() {
        $state.go('tab.detail', { type: '2', chatId: $state.params.memberId });
    };
    $scope.$on('$ionicView.beforeEnter', function() {
        Doctor.getDoctorInfo({ userId: $state.params.memberId })
            .then(function(data) {
                $scope.doctor = data.results;
            });
        $scope.isme = $state.params.memberId == Storage.get('UID');
    });

}])
.controller('viewChatCtrl',['$scope', '$state', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', 'voice', 'CONFIG', 'Communication','Doctor','Patient','$q','Storage',function($scope, $state, $ionicModal, $ionicScrollDelegate, $ionicHistory, voice, CONFIG, Communication,Doctor,Patient,$q,Storage){

    $scope.photoUrls={}
    $scope.params = {
        msgCount: 0,
        moreMsgs: true,
        chatId:'',
        doctorId: '',
        counsel: {},
        patientName:''
    }

    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs 
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.photoUrls = {};
        $scope.msgs = [];
        $scope.params.chatId = $state.params.patientId;
        $scope.params.doctorId = $state.params.doctorId;
        Storage.set('chatSender',$scope.params.doctorId);
        $scope.params.msgCount = 0;
        console.log($scope.params)
        //获取counsel信息
        Patient.getPatientDetail({ userId: $scope.params.chatId })
            .then(function (data) {
                if(data.results.name) $scope.params.patientName = '-'+data.results.name;
                $scope.photoUrls[data.results.userId] = data.results.photoUrl;
            });
        Doctor.getDoctorInfo({ userId: $scope.params.doctorId })
            .then(function(response) {
                $scope.photoUrls[response.results.userId] = response.results.photoUrl;
            }, function(err) {
                console.log(err);
            })
        //获取counsel信息
        // Counsel.getStatus({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
        //     .then(function (data) {
        //         console.log(data)
        //         $scope.params.counsel = data.result;
        //     }, function (err) {
        //         console.log(err);
        //     })

        $scope.getMsg(15).then(function (data) {
            $scope.msgs = data;
            toBottom(true, 400);
        });
    });


    $scope.$on('$ionicView.enter', function() {
        imgModalInit();
    })

    $scope.$on('$ionicView.beforeLeave', function() {
        Storage.rm('chatSender');
        if ($scope.modal) $scope.modal.remove();
        if ($scope.popover) $scope.popover.hide();
    });
    $scope.$on('$ionicView.leave', function() {
        $scope.msgs = [];
    });

    $scope.getMsg = function(num) {
        console.info('getMsg');
        return $q(function(resolve,reject){
            var q={
                messageType:'1',
                newsType:'11',
                id1:$scope.params.doctorId,
                id2:$scope.params.chatId,
                skip:$scope.params.msgCount,
                limit:num
            }
            Communication.getCommunication(q)
            .then(function(data){
                console.log(data);
                var d=data.results;
                $scope.$broadcast('scroll.refreshComplete');
                if(d=='没有更多了!') return noMore();
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0 ) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.doctorId?'send':'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.doctorId?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                    // });
                }
                console.log($scope.msgs);
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            });
        })

    }

    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }

    $scope.scrollBottom = function() {
        $scope.showVoice = false;
        $scope.showMore = false;
        $scope.scrollHandle.scrollBottom(true);
    }
    
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            // $scope.modal.show();
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }

    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb));
        $scope.modal.show();
    });

    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    };
    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.sound = new Media(args[1],
            function() {
            },
            function(err) {
                console.log(err);
            })
        $scope.sound.play();
    });
    //长按工具条
    // var options = [{
    //     name: '转发医生',
    // }, {
    //     name: '转发团队',
    // }]
    // $ionicPopover.fromTemplateUrl('partials/others/toolbox-pop.html', {
    //     scope: $scope,
    // }).then(function(popover) {
    //     $scope.options = options;
    //     $scope.popover = popover;
    // });
    $scope.$on('holdmsg', function(event, args) {
        event.stopPropagation();
        // $scope.holdId = args[1];
        // console.log(args)
        // $scope.popover.show(args[2]);
    });
    // $scope.toolChoose = function(data) {
    //     // console.log(data);
    //     var content = $scope.msgs[arrTool.indexOf($scope.msgs, 'createTimeInMillis', $scope.holdId)].content;
    //     if (data == 0) $state.go('tab.selectDoc', { msg: content });
    //     if (data == 1) $state.go('tab.selectTeam', { msg: content });
    // };
    $scope.$on('viewcard', function(event, args) {
        event.stopPropagation();
        // console.log(args[2]);
        // if (args[2].target.tagName == "IMG") {
        //     $scope.imageHandle.zoomTo(1, true);
        //     $scope.imageUrl = args[2].target.currentSrc;
        //     console.log(args[2].target.attributes.hires.nodeValue);
        //     $scope.modal.show();
        // } else {
        //     Storage.set('getpatientId',args[1].content.contentStringMap.patientId);

        //     var statep={
        //     type:$scope.params.type,
        //     chatId:$scope.params.chatId
        //     }
        //     Storage.set('backId','tab.detail');
        //     Storage.set('singleChatParams',JSON.stringify(statep));
        //     $state.go('tab.patientDetail');
        //     // $state.go('tab.consult-detail',{consultId:args[1]});
        // }
        // $state.go('tab.consult-detail',{consultId:args[1]});
    });
    
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
        // if(args[1].direct=='receive'){
        //         Storage.set('getpatientId',args[1].fromID); 
        //         var statep={
        //             type:$scope.params.type,
        //             chatId:$scope.params.chatId
        //         }
        //         Storage.set('backId','tab.detail');
        //         Storage.set('singleChatParams',JSON.stringify(statep));
        //         $state.go('tab.patientDetail');
        // }else{
        //     $state.go('tab.group-profile', { memberId: args[1].fromID});
        // }
    });

    $scope.goBack = function() {
        $ionicHistory.goBack();
    }
}])