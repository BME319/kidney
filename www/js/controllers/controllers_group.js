angular.module('group.controllers', ['ionic', 'kidney.services'])

//新建团队
.controller('NewGroupCtrl', ['$scope', '$state', '$ionicLoading', '$rootScope', 'Communication', 'Storage', 'Doctor','$filter', function($scope, $state, $ionicLoading, $rootScope, Communication, Storage, Doctor,$filter) {
    $rootScope.newMember = [];

    $scope.members = [];
    $scope.team = {
        teamId: '',
        name: '',
        sponsorId: '',
        sponsorName: '',
        description: ''
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.members = $rootScope.newMember;
    });

     $scope.confirm = function(){
        if($scope.team.name=='' || $scope.team.description==''){
            $ionicLoading.show({ template: '请完整填写信息', duration: 1500 });
        }else if(!$scope.members){
            $ionicLoading.show({ template: '请至少添加一个成员', duration: 1500 });
        }else{
            
            upload();
        }
    }

    function upload(gid) {
        var time = new Date();
        $scope.team.teamId = $filter('date')(time, 'ssmsssH');
        $scope.team.sponsorId = Storage.get('UID');
        Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
            .then(function(data) {
                $scope.team.sponsorName = data.results.name;
                Communication.newTeam($scope.team)
                    .then(function(data) {
                        //add members
                        Communication.insertMember({ teamId: $scope.team.teamId, members: $rootScope.newMember })
                            .then(function(data) {
                                $ionicLoading.show({ template: '创建成功', duration: 1500 });
                                setTimeout(function() {
                                    $state.go('tab.groups', { type: '0' });
                                }, 1000);

                            }, function(err) {
                                console.log(err);
                            });
                    }, function(err) {
                        $ionicLoading.show({ template: '创建失败', duration: 1500 });
                        console.log(err);
                    });
            });
    }


    $scope.addMember = function() {
        $state.go('tab.group-add-member', { type: 'new' });
    }
}])

//团队查找
.controller('GroupsSearchCtrl', ['$scope', '$state','Communication','$ionicLoading','QRScan', function($scope, $state,Communication,$ionicLoading,QRScan) {
    $scope.search='';
    $scope.noteam=0;
    $scope.searchStyle={'margin-top':'44px'}
    if(ionic.Platform.isIOS()){
        $scope.searchStyle={'margin-top':'64px'}
    }
    $scope.Searchgroup = function() {
        $scope.noteam = 0;
        Communication.getTeam({ teamId: $scope.search })
            .then(function(data) {
                console.log(data.results)

                if (data.results == null) {
                    $scope.noteam = 1;
                    $ionicLoading.show({ template: '查无此群', duration: 1000 })
                } else { $scope.teamresult = data }
            }, function(err) {
                console.log(err);
            })
    }
    $scope.QRscan = function(){
        QRScan.getCode()
        .then(function(teamId){
            if(teamId){
                $state.go('tab.group-add',{teamId:teamId});
            }
        },function(err){

        })
    }
}])

//我的团队
.controller('groupsCtrl', ['$scope', '$http', '$state', '$ionicPopover', 'Doctor', 'Storage', 'Patient','arrTool','$q','New','$interval','$timeout',function($scope, $http, $state, $ionicPopover, Doctor, Storage, Patient,arrTool,$q,New,$interval,$timeout) {
    $scope.countAllDoc='?';
    $scope.query = {
        name: ''
    }
    $scope.params = {
        isTeam: true,
        showSearch: false,
        updateTime: 0
    }
    var countDocs=function()
    {
        Doctor.getDocNum()
        .then(function(data)
        {
            console.log(data)
            $scope.countAllDoc=data.results;
        },function(err)
        {
            console.log(err)
        })
    }
    countDocs();

    $scope.load = function(force) {
        var time = Date.now();
        if (!force && time - $scope.params.updateTime < 60000){
            New.addNews('13',Storage.get('UID'),$scope.teams,'teamId')
            .then(function(teams){
                $scope.teams=teams;
            });
            New.addNestNews('12',Storage.get('UID'),$scope.doctors,'userId','doctorId')
            .then(function(doctors){
                $scope.doctors=doctors;
            });
        }else{
            $scope.params.updateTime = time;
            Doctor.getMyGroupList({ userId: Storage.get('UID') })
                .then(function(data) {
                    console.log(data);
                    return New.addNews('13',Storage.get('UID'),data,'teamId')
                    .then(function(teams){
                        return $scope.teams=teams;
                    });
                }).then(function(data){
                    console.log(data);
                });
            function getData(){
                Doctor.getRecentDoctorList({ userId: Storage.get('UID') })
                    .then(function(data) {
                        console.log(data);
                        New.addNestNews('12',Storage.get('UID'),data.results,'userId','doctorId')
                        .then(function(doctors){
                            $scope.doctors=doctors;
                        });
                    }, function(err) {
                        console.log(err)
                    });
            }
            $timeout(getData,500);
            $interval(getData,5000,1);
        }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        //type:   '0'=team  '1'=doctor
        $scope.params.isTeam = $state.params.type == '0';
        $scope.params.showSearch = false;
        $scope.msgListener = $scope.$on('im:getMsg',function(event, msg) {
            $scope.load();
        });
    })
    // $scope.$on('im:getMsg',function(event, msg) {
    //     $scope.load();
    // });
    $scope.$on('$ionicView.enter', function() {
        $scope.load(true);
    })
    $scope.doRefresh = function(){
        $scope.load(true);
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }   
    $scope.showTeams = function() {
        $scope.params.isTeam = true;
    }
    $scope.showDocs = function() {
        $scope.params.isTeam = false;
    }
    $scope.search = function() {
        $scope.params.showSearch = true;
    }
    $scope.closeSearch = function() {
        $scope.params.showSearch = false;
    }
    $scope.clearSearch = function() {
            $scope.query.name = '';
        }
    //popover option
    var options = [{
        name: '搜索团队',
        href: '#/tab/groupsearch'
    }, {
        name: '新建团队',
        href: '#/tab/newgroup'
    }, {
        name: '搜索医生',
        href: '#/tab/doctorsearch'        
    }];
    $ionicPopover.fromTemplateUrl('partials/group/pop-menu.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.options = options;
        $scope.popover = popover;
    });

    $scope.itemClick = function(ele, team) {
        if (ele.target.id == 'discuss') $state.go("tab.group-patient", { teamId: team.teamId });
        else $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId });
    }
    $scope.doctorClick = function(ele, doc) {
        if (ele.target.id == 'profile') $state.go("tab.group-profile", { memberId: doc.userId });
        else $state.go('tab.detail', { type: '2', chatId: doc.userId });
    }

    $scope.$on('$ionicView.beforeLeave', function() {
        $scope.msgListener();
        if ($scope.popover) $scope.popover.hide();
    })
}])

//团队病历
.controller('groupPatientCtrl', ['$scope', '$http', '$state', 'Storage', '$ionicHistory','Doctor','$ionicLoading','New', function($scope, $http, $state, Storage, $ionicHistory,Doctor,ionicLoading,New) {

    $scope.grouppatients0 = "";
    $scope.grouppatients1 = "";
    $scope.params = {
        teamId: ''
    };
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.grouppatients1 = "";
        $scope.grouppatients2 = "";
        $scope.params.teamId = $state.params.teamId;
        $scope.load();
    });
    $scope.load = function() {
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 1 }) //1->进行中
            .then(function(data) {
                console.log(data)
                New.addNews($scope.params.teamId,Storage.get('UID'),data.results,'consultationId')
                .then(function(pats){
                    $scope.grouppatients0 = pats;
                },function(err){

                });
            }, function(err) {
                console.log(err)
            });
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 0 }) //0->已处理
            .then(function(data) {
                console.log(data);
                New.addNews($scope.params.teamId,Storage.get('UID'),data.results,'consultationId')
                .then(function(pats){
                    $scope.grouppatients1 = pats;
                },function(err){

                });
            }, function(err) {
                console.log(err)
            });
    }

    $scope.doRefresh = function(){
        $scope.load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.enterChat = function(type, patient) {
        $state.go('tab.group-chat', { type: type, teamId: $scope.params.teamId, groupId: patient.consultationId});
    };

    $scope.backToGroups = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.groups', { type: '0' });
    };
}])

.controller('GroupAddCtrl', ['$scope', '$state','$ionicHistory','Communication','$ionicPopup', 'Storage','Doctor','$ionicLoading','CONFIG',function($scope, $state,$ionicHistory,Communication,$ionicPopup,Storage,Doctor,$ionicLoading,CONFIG) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.alreadyIn = true;
        var inGroup = false,me = Storage.get('UID');
        $scope.me = [{ userId: '', name: '', photoUrl: '' }];
        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function(data) {
                console.log(data)
                $scope.group = data.results;

                if (data.results.sponsorId == me) inGroup = true;
                for(var i in data.results.members){
                    if(data.results.members[i].userId==me) inGroup = true;
                }
                $scope.alreadyIn = inGroup;
            }, function(err) {
                console.log(err);
            })
    });

    $scope.request = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要加入吗?',
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                Doctor.getDoctorInfo({ userId: Storage.get('UID') })
                    .then(function(data) {
                        $scope.me[0].userId = data.results.userId;
                        $scope.me[0].name = data.results.name;
                        $scope.me[0].photoUrl = data.results.photoUrl;
                        var idStr = $scope.me[0].userId;
                        Communication.insertMember({ teamId: $state.params.teamId, members: $scope.me })
                            .then(function(data) {
                                if (data.result == "更新成员成功") {
                                    $ionicLoading.show({ template: '加入成功', duration: 1500 });
                                    $ionicHistory.nextViewOptions({ disableBack: true });
                                    $state.go('tab.groups', { type: '0' });
                                } else { 
                                    $ionicLoading.show({ template: '你已经是成员了', duration: 1500 });
                                };
                            });
                    });

            }
        });
    }

}])

//团队信息
.controller('GroupDetailCtrl', ['$scope', '$state', '$ionicModal', 'Communication','$ionicPopup','Storage','Doctor',function($scope, $state, $ionicModal,Communication,$ionicPopup,Storage,Doctor) {
    $scope.$on('$ionicView.beforeEnter', function() {

        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function(data) {

                $scope.team = data.results;
                $scope.members2 = data.results.members;
                Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
                    .then(function(data) {
                        console.log(data);
                        // $scope.members1=data.results;
                        $scope.members = $scope.members2.concat(data.results);
                        console.log($scope.members1)
                    });
                if ($scope.team.sponsorId == Storage.get('UID')) $scope.ismyteam = true;
                else $scope.ismyteam = false;
            }, function(err) {
                console.log(err);
            });
    });

    $scope.addMember = function() {
        console.log($scope.team.teamId)
        $state.go('tab.group-add-member', {teamId:$scope.team.teamId});
    }
    $scope.viewProfile = function(member){
        $state.go('tab.group-profile',{memberId:member.userId});
    }
    $scope.showQRCode = function() {
        $state.go('tab.group-qrcode', { team: $scope.team });
    }
    $scope.gokick=function(){
          $state.go('tab.group-kick', { teamId: $scope.team.teamId });

    }
}])
//踢人
.controller('GroupKickCtrl', ['$scope', '$state','$ionicModal', 'Communication','$ionicPopup','Storage','CONFIG', function($scope, $state,$ionicModal,Communication,$ionicPopup,Storage,CONFIG) {
    $scope.$on('$ionicView.beforeEnter', function() {
        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function(data) {
                $scope.teamname = data.results.name;
                $scope.doctors = data.results.members;
            }, function(err) {
                console.log(err);
            });
    });

    $scope.kick = function(id) {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要将此人移出团队吗?',
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                Communication.removeMember({ teamId: $state.params.teamId, membersuserId: $scope.doctors[id].userId })
                    .then(function(data) {
                        if (data.result == "更新成员成功") {
                            Communication.getTeam({ teamId: $state.params.teamId })
                                .then(function(data) {
                                    $scope.doctors = data.results.members;
                                }, function(err) {
                                });
                        };
                    }, function(err) {
                        console.log(err)
                    });
            }
        });
    }

}])
//团队二维码
.controller('GroupQrcodeCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.params = {
        team: {}
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.team = $state.params.team;
    })
}])
//添加成员
.controller('GroupAddMemberCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG) {
    $scope.searchStyle={'margin-top':'44px'}
    if(ionic.Platform.isIOS()){
        $scope.searchStyle={'margin-top':'64px'}
    }
    $scope.memStyle={'padding':'3px 16px','position':'absolute','top':'88px','height':'50px','width':'100%','margin':'0','max-height':'30vh','overflow-y':'scroll'}
    if(ionic.Platform.isIOS()){
        $scope.memStyle={'padding':'3px 16px','position':'absolute','top':'108px','height':'50px','width':'100%','margin-top':'0px','max-height':'30vh','overflow-y':'scroll'}
    } 
    //get groupId via $state.params.groupId
    $scope.moredata = true;
    $scope.issearching = true;
    $scope.isnotsearching = false;
    $scope.group = {
        members: []
    }
    $scope.doctors = [];
    $scope.alldoctors = [];
    $scope.skipnum = 0;
    $scope.update = function(id) {
        if ($scope.doctors[id].check) $scope.group.members.push({ photoUrl: $scope.doctors[id].photoUrl, name: $scope.doctors[id].name, userId: $scope.doctors[id].userId });
        else $scope.group.members.splice(arrTool.indexOf($scope.group.members, 'userId', $scope.doctors[id].userId), 1);
    }

    $scope.loadMore = function() {
        Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function(data) {
                console.log(data.results)
                $scope.$broadcast('scroll.infiniteScrollComplete');

                $scope.alldoctors = $scope.alldoctors.concat(data.results);
                $scope.doctors = $scope.alldoctors;
                $scope.nexturl = data.nexturl;
                var skiploc = data.nexturl.indexOf('skip');
                $scope.skipnum = data.nexturl.substring(skiploc + 5);
                if (data.results.length == 0) { $scope.moredata = false } else { $scope.moredata = true };
            }, function(err) {
                console.log(err);
            });
    }
    $scope.goSearch = function() {
        $scope.isnotsearching = true;
        $scope.issearching = false;

        $scope.moredata = false;
        Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function(data) {
                console.log(data.results)
                $scope.doctors = data.results;
                if (data.results.length == 0) {
                    console.log("aaa")
                    $ionicLoading.show({ template: '查无此人', duration: 1000 })
                }
            }, function(err) {
                console.log(err);
            })
    }
    // $scope.closeSearch = function() {
    //     $scope.issearching = true;
    //     $scope.isnotsearching = false;

    //     $scope.moredata = true;
    //     $scope.doctors = $scope.alldoctors;
    //     $scope.search.name = '';

    // }
    $scope.clearSearch = function() {
        $scope.search.name = '';
         $scope.issearching = true;
        $scope.isnotsearching = false;

        $scope.moredata = true;
        $scope.doctors = $scope.alldoctors;
        $scope.search.name = '';
    }

    $scope.confirmAdd = function() {
        if ($state.params.type == 'new') {
            $rootScope.newMember = $rootScope.newMember.concat($scope.group.members);
            $ionicHistory.goBack();
        } else {
            Communication.insertMember({ teamId: $state.params.teamId, members: $scope.group.members })
                .then(function(data) {
                    console.log(data.result)
                    if (data.result == "更新成员成功") {
                        $ionicLoading.show({ template: '添加成功', duration: 1000 });
                    }
                    setTimeout(function() { $ionicHistory.goBack(); }, 1000);
                });
        }
    }

}])

//团队聊天
.controller('GroupChatCtrl', ['$ionicPlatform','$scope', '$state', '$ionicHistory', '$http', '$ionicModal', '$ionicScrollDelegate', '$rootScope', '$stateParams', '$ionicPopover','$ionicLoading', '$ionicPopup', 'Camera', 'voice', 'Communication','Storage','Doctor','$q','CONFIG','arrTool','New','socket','notify', '$timeout',function($ionicPlatform,$scope, $state, $ionicHistory, $http, $ionicModal, $ionicScrollDelegate, $rootScope, $stateParams, $ionicPopover,$ionicLoading, $ionicPopup, Camera, voice, Communication,Storage,Doctor,$q,CONFIG,arrTool,New,socket,notify,$timeout) {
    if($ionicPlatform.is('ios')) cordova.plugins.Keyboard.disableScroll(true);
    $scope.itemStyle={'position':'absolute','top':'44px','width':'100%','margin':'0','min-height':'35vh','max-height':'55vh','overflow-y': 'scroll'}
    if(ionic.Platform.isIOS()){
        $scope.itemStyle={'position':'absolute','top':'64px','width':'100%','margin':'0','min-height':'35vh','max-height':'55vh','overflow-y': 'scroll'}
    }     
    $scope.input = {
        text: ''
    };
    $scope.photoUrls={};
    $scope.params = {
        type: '', //'0':团队交流  '1': 未结束病历  '2':已结束病历
        groupId: '',
        teamId: '',
        team: {},
        msgCount: 0,
        title: '',
        helpDivHeight: 0,
        hidePanel: true,
        isDiscuss: false,
        isOver: false,
        UID:Storage.get('UID'),
        newsType:'',//消息字段
        targetName:'',//消息字段
        moreMsgs: true,
        recording:false,
        loaded:false
    }
    $rootScope.patient = {};

    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        $timeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.photoUrls={};
        $rootScope.patient = {};
        $scope.msgs = [];
        $scope.params.msgCount = 0;
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        $scope.params.loaded = false;
        try{
            notify.remove($scope.params.groupId);
        }catch(e){}
        
        Doctor.getDoctorInfo({userId:Storage.get('UID')})
            .then(function(data){
                thisDoctor=data.results;
                $scope.photoUrls[data.results.userId]=data.results.photoUrl;
            });
        if ($scope.params.type == '0') {
            $scope.params.newsType='13';
            Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function(data) {
                    console.log(data)
                    $scope.params.team = data.results;
                    $scope.params.title = $scope.params.team.name + '(' + $scope.params.team.number + ')';
                    $scope.params.targetName = $scope.params.team.name;
                    getSponsor(data.results.sponsorId);
                    for(i=0;i<data.results.members.length;i++){
                        $scope.photoUrls[data.results.members[i].userId]=data.results.members[i].photoUrl;
                    }
                });
        } else if ($scope.params.type == '1') {//进行中
            getConsultation();
            $scope.params.newsType=$scope.params.teamId;
            $scope.params.hidePanel = true;
            $scope.params.title = '病历';
            $scope.params.isDiscuss = true;
        } else if ($scope.params.type == '2') {//已处理
            getConsultation();
             
            $scope.params.newsType=$scope.params.teamId;
            $scope.params.hidePanel = false;
            $scope.params.title = '病历';
            $scope.params.isDiscuss = true;
            $scope.params.isOver = true;
        }
    })
    $scope.$on('$ionicView.enter', function () {
        console.log($scope.photoUrls);
        $rootScope.conversation.type = 'group';
        $rootScope.conversation.id = $scope.params.groupId;
        var loadWatcher = $scope.$watch('params.loaded', function (newv, oldv) {
            if (newv) {
                loadWatcher();
                if ($scope.msgs.length == 0) return;
                var lastMsg = $scope.msgs[$scope.msgs.length - 1];
                if (lastMsg.fromID == $scope.params.UID) return;
                return New.insertNews({ userId: $scope.params.UID, sendBy: lastMsg.targetID, type: $scope.params.newsType, readOrNot: 1 });
            }
        });
        imgModalInit();
        $scope.getMsg(15).then(function (data) {
            $scope.msgs = data;
            toBottom(true, 400);
            $scope.params.loaded = true;
        });
    })

    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height;
        toBottom(true,100);
    })
    $scope.$on('keyboardhide', function(event) {
        $scope.params.helpDivHeight = 0;
        $scope.scrollHandle.resize();
    })
    $scope.$on('$ionicView.beforeLeave', function() {
        if ($scope.popover) $scope.popover.hide();
        if ($scope.modal) $scope.modal.remove();
    })
    $scope.$on('$ionicView.leave', function() {
        $scope.msgs = [];
        $rootScope.conversation.type = null;
        $rootScope.conversation.id = '';
    })
    $scope.$on('im:getMsg',function(event,data){
        console.info('getMsg');
        console.log(data);
        if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
            $scope.$apply(function(){
                insertMsg(data.msg);
            });
            New.insertNews({userId:$scope.params.UID,sendBy:$scope.params.groupId,type:$scope.params.newsType,readOrNot:1});
        }
    });
    $scope.$on('im:messageRes',function(event,data){
        console.info('messageRes');
        console.log(data);
        if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
            $scope.$apply(function(){
                insertMsg(data.msg);
            })
        }
    })
    function getConsultation(){
        Communication.getConsultation({ consultationId: $scope.params.groupId })
        .then(function(data) {
            $scope.viewChat = viewChatFn(data.result.sponsorId.userId,data.result.patientId.userId);
            $scope.params.title+= '-'+data.result.patientId.name;
            console.log(data)
            $rootScope.patient = data.result;
            Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function(res) {
                    $scope.params.team = res.results;
                    $scope.params.targetName = '['+data.result.patientId.name+']'+$scope.params.team.name;
                    getSponsor(res.results.sponsorId);
                    for(i=0;i<res.results.members.length;i++){
                        $scope.photoUrls[res.results.members[i].userId]=res.results.members[i].photoUrl;
                    }
                });
        });
    }
    function viewChatFn(DID,PID){
        return function(){
            $state.go('tab.view-chat',{doctorId:DID,patientId:PID});
        }
    }
    function getSponsor(id){
        Doctor.getDoctorInfo({userId:id})
            .then(function(sponsor){
                $scope.photoUrls[sponsor.results.userId]=sponsor.results.photoUrl;
            });
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }
    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.scrollBottom = function() {
        $scope.showVoice = false;
        $scope.showMore = false;
        $scope.scrollHandle.scrollBottom(true);
    }

    $scope.getMsg = function(num) {
        console.log('getMsg:' + num);
        return $q(function(resolve,reject){
            var q={
                messageType:'2',
                id2:$scope.params.groupId,
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
                if(res.length==0) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                }
                console.log($scope.msgs);
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            });
        })
    };

    $scope.togglePanel = function() {
        $scope.params.hidePanel = !$scope.params.hidePanel;
    }
    $scope.viewGroup = function(){
        $state.go('tab.group-detail',{teamId:$scope.params.teamId});
    }

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
    })
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }
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
    }

    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.sound = new Media(args[1],
            function() {
                // resolve(audio.media)
            },
            function(err) {
                console.log(err);
                // reject(err);
            })
        $scope.sound.play();
    })
   
    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb));
        $scope.modal.show();
    });
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
        if(args[1].direct=='receive'){
            $state.go('tab.group-profile', { memberId: args[1].fromID });
        }
    })

    $scope.$on('viewcard', function(event, args) {
        console.log(args[1]);
        event.stopPropagation();

        if($scope.params.type=='0'){
            Communication.getConsultation({ consultationId: args[1].content.consultationId})
                .then(function(data) {
                    var ctype = data.result.status;
                    if(ctype=='0') ctype='2';
                    $state.go('tab.group-chat',{'type':ctype,'teamId':$scope.params.teamId,'groupId':args[1].content.consultationId});
                })
        }
    });

    // $scope.toolChoose = function(data) {
    //     if (data == 0) $state.go('tab.selectDoc');
    //     if (data == 1) $state.go('tab.selectTeam');
    // }

    $scope.viewPatient = function(pid){
        Storage.set('getpatientId',pid);
        var statep={
            type:$scope.params.type,
            groupId:$scope.params.groupId,
            teamId:$scope.params.teamId
        }
        Storage.set('backId','tab.group-chat');
        Storage.set('groupChatParams',JSON.stringify(statep));
        $state.go('tab.patientDetail');
    }
    $scope.updateMsg = function(msg,pos){
        console.info('updateMsg');
        if (pos == 0) {
            msg.diff = true;
        }else if(msg.hasOwnProperty('time') && $scope.msgs[pos-1].hasOwnProperty('time')){
            msg.diff = (msg.time - $scope.msgs[pos-1].time) > 300000 ? true : false;
        }
        msg.content.src=$scope.msgs[pos].content.src;
        msg.direct = $scope.msgs[pos].direct;
        $scope.msgs[pos]=msg;
    };
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        var len = $scope.msgs.length;
        if(msg.hasOwnProperty('time')){
            if(len==0){
                msg.diff=true;
            }else{
                var m = $scope.msgs[len-1];
                if(m.hasOwnProperty('time')){
                    msg.diff=(msg.time - m.time) > 300000 ? true : false;
                }
            }
        }
        $scope.params.msgCount++;
        $scope.msgs.push(msg);
        toBottom(true, 200);
        toBottom(true, 600);
        setTimeout(function(){
            var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
            if(pos!=-1 && $scope.msgs[pos].status=='send_going') $scope.msgs[pos].status='send_fail';
        },10000);
    };
    function insertMsg(msg){
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos==-1){
            $scope.pushMsg(msg);
        }else{
            $scope.updateMsg(msg,pos);
        }
    }
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
            targetID: $scope.params.groupId,
            teamId: $scope.params.teamId,
            targetName: $scope.params.targetName,
            targetType: 'group',
            status: 'send_going',
            createTimeInMillis: Date.now(),
            newsType: $scope.params.newsType,
            targetRole:'doctor',
            content: data
        }
        return msgJson;
    }

    function localMsgGen(msg, url) {
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
            clientType: 'doctor',
            contentType: type,
            fromID: msg.fromID,
            fromName: msg.fromName,
            fromUser: msg.fromUser,
            targetID: msg.targetID,
            teamId: msg.teamId,
            targetName: msg.targetName,
            targetType: 'group',
            status: 'send_going',
            createTimeInMillis: msg.createTimeInMillis,
            newsType: msg.newsType,
            content: d
        }
    }

    function sendmsg(content,type){
        var msgJson=msgGen(content,type);
        console.info('[socket.connected]',socket.connected);
        socket.emit('message',{msg:msgJson,to:$scope.params.groupId,role:'doctor'});
        $scope.pushMsg(msgJson);
        // toBottom(true);
    }
    
    $scope.submitMsg = function() {
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
                        socket.emit('message',{msg:imgMsg,to:$scope.params.groupId,role:'doctor'});
                    }, function() {
                        $ionicLoading.show({ template: '图片上传失败', duration: 2000 })
                    });
            }, function(err) {
                console.error(err);
            })
    };
        //get voice
    $scope.getVoice = function() {
        //voice.record() does 2 things: record --- file manipulation 
        voice.record()
            .then(function(fileUrl) {
                window.JMessage.sendGroupVoiceMessageWithExtras($scope.params.groupId, fileUrl, $scope.msgExtra,
                    function(res) {
                        console.log(res);
                        $scope.params.recording=false;
                        viewUpdate(5, true);
                        Communication.postCommunication({messageType:2,sendBy:Storage.get('UID'),receiver:$scope.params.groupId,content:JSON.parse(res)})
                                  .then(function(data){
                                    console.log(data);
                                  },function(err){
                                    console.error(err);
                                    })
                    },
                    function(err) {
                        console.log(err);
                    });
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
        console.log($ionicHistory);
        console.log($scope.params);

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if ($scope.params.type == '0') $state.go('tab.groups', { type: '0' });
        else $state.go('tab.group-patient', { teamId: $scope.params.teamId });
    }
    $scope.goConclusion =function(){
        $state.go('tab.group-conclusion',{groupId:$scope.params.groupId,teamId:$scope.params.teamId});
    }
}])
//病历结论
.controller('GroupConclusionCtrl',['$state','$scope','$ionicModal','$ionicScrollDelegate','Communication','$ionicLoading','CONFIG','Storage','Account','socket','mySocket','Counsel',function($state,$scope,$ionicModal,$ionicScrollDelegate,Communication,$ionicLoading,CONFIG,Storage,Account,socket,mySocket,Counsel){
   
    $scope.input = {
        text: ''
    }
    $scope.params = {
        type: '',
        groupId: '',
        teamId: '',
        chatId: '' ///回复患者讨论结论
    }

    $scope.patient = {};

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.input.text='';
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        Communication.getConsultation({ consultationId: $state.params.groupId })
            .then(function(data) {
                $scope.patient = data.result;
            });
    });

    $scope.save = function() {
        Communication.conclusion({ consultationId: $state.params.groupId, conclusion: $scope.input.text})
            .then(function(data) {
                console.log(data)
                Communication.getCounselReport({ counselId: $scope.patient.diseaseInfo.counselId })
                    .then(function(res) {
                        var DID = res.results.doctorId.userId,
                            PID = res.results.patientId.userId;
                        var msgJson = {
                            clientType:'doctor',
                            contentType: 'text',
                            fromID: DID,
                            fromName: res.results.doctorId.name,
                            fromUser: {
                                avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + DID + '_myAvatar.jpg'
                            },
                            targetID: PID,
                            targetName: res.results.patientId.name,
                            targetType: 'single',
                            status: 'send_going',
                            newsType: '11',
                            createTimeInMillis: Date.now(),
                            targetRole:'patient',
                            content: {
                                text: $scope.input.text

                            }
                        }
                        if(res.results.type!='1'){
                            //暂时把socket连接指向DID，用于此条消息的发送。之后call resetUserAsAppUser改回APP使用者
                            // var resetUserAsAppUser = mySocket.newUserForTempUse(DID,res.results.doctorId.name);
                            // socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID });
                            socket.emit('message', { msg: msgJson, to: PID ,role:'doctor'});
                            // resetUserAsAppUser();

                            $ionicLoading.show({ template: '回复成功'});
                            setTimeout(function() {
                                $ionicLoading.hide();
                                $state.go('tab.groups', { type: '0' });
                            }, 1000);
                        }else{
                            Account.modifyCounts({doctorId:DID,patientId:PID,modify:'-1'})
                            .then(function(){
                                Account.getCounts({doctorId:DID,patientId:PID})
                                .then(function(response){
                                    // var resetUserAsAppUser = mySocket.newUserForTempUse(DID,res.results.doctorId.name);
                                    // socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID });
                                    socket.emit('message', { msg: msgJson, to: PID ,role:'doctor'});

                                    
                                    if(response.result.count<=0){
                                        var endlMsg={
                                            type:'endl',
                                            info:"咨询已结束",
                                            docId:DID,
                                            counseltype:1
                                        }
                                        var endJson={
                                            clientType:'doctor',
                                            contentType:'custom',
                                            fromID:DID,
                                            fromName:res.results.doctorId.name,
                                            fromUser:{
                                                avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+DID+'_myAvatar.jpg'
                                            },
                                            targetID:PID,
                                            targetName:res.results.patientId.name,
                                            targetType:'single',
                                            status:'send_going',
                                            createTimeInMillis: Date.now(),
                                            newsType:'11',
                                            targetRole:'patient',
                                            content:endlMsg
                                        }
                                        socket.emit('message', { msg: endJson, to: PID ,role:'doctor'});
                                        Counsel.changeStatus({doctorId:DID,patientId:PID,type:res.results.type,status:0});
                                    }
                                    // resetUserAsAppUser();
                                    $ionicLoading.show({ template: '回复成功'});
                                    setTimeout(function() {
                                        $ionicLoading.hide();
                                        $state.go('tab.groups', { type: '0' });
                                    }, 1000);

                                });

                            });
                        }
                    })

            }, function(err) {
                console.log(err);
            })
    }
}])