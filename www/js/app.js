// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney', [
  'ionic',
  'ngCordova',
  'tdy.controllers',
  'xjz.controllers',
  'zy.controllers',
  'kidney.services',
  'kidney.filters',
  'kidney.directives',
  'monospaced.qrcode',
  'ionic-datepicker',
  'kidney.icon_filter',
  'btford.socket-io'
])

.run(['version', '$ionicPlatform', '$state', 'Storage', '$rootScope', 'CONFIG', 'Communication', 'notify', '$interval', 'socket', 'mySocket', '$ionicPopup', 'session', function (version, $ionicPlatform, $state, Storage, $rootScope, CONFIG, Communication, notify, $interval, socket, mySocket, $ionicPopup, session) {
  // 虚拟返回键显示退出提示框
  $ionicPlatform.registerBackButtonAction(function (e) {
    e.preventDefault()

    function showConfirm () {
      var confirmPopup = $ionicPopup.confirm({
        title: '<strong>退出应用?</strong>',
        template: '你确定要退出应用吗?',
        okText: '退出',
        cancelText: '取消'
      })

      confirmPopup.then(function (res) {
        if (res) {
          ionic.Platform.exitApp()
        } else {
                        // Don't close
        }
      })
    }
    showConfirm()

    return false
  }, 101)

  $ionicPlatform.ready(function () {
    version.checkUpdate($rootScope)// 在app.js的ready里加
    // 记录message当前会话
    $rootScope.isIOS = $ionicPlatform.is('ios')
    $rootScope.conversation = {
      type: null,
      id: ''
    }
    thisDoctor = null
    var appState = {
      background: false
    }
    document.addEventListener('pause', onPause, false)
    document.addEventListener('resume', onResume, false)
    function onPause () {
      appState.background = true
    }
    function onResume () {
      appState.background = false
      var id = Storage.get('UID'),
        name = thisDoctor === null ? '' : thisDoctor.name
      mySocket.newUserOnce(id, name)
    }
    socket.on('error', function (data) {
      console.error('socket error')
      console.log(data)
    })
    socket.on('disconnected', function (data) {
      console.error('disconnected')
      console.error(data)
    })
    socket.on('reconnect', function (attempt) {
      console.info('reconnect: ' + attempt)
      var id = Storage.get('UID'),
        name = thisDoctor === null ? '' : thisDoctor.name
      mySocket.newUserOnce(id, name)
            // socket.emit('newUser',{ user_name: name, user_id: id, client:'app'});
    })
    socket.on('kick', function () {
      session.logOut()
      $ionicPopup.alert({
        title: '请重新登录'
      }).then(function () {
                // $scope.navigation_login=$sce.trustAsResourceUrl("http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx");
        $state.go('signin')
      })
    })

    socket.on('getMsg', listenGetMsg)

    function listenGetMsg (data) {
      console.info('getMsg')
      console.log(data)
            // $rootScope.$broadcast('im:getMsg',data);
      if (!appState.background && (($rootScope.conversation.type == 'single' && $rootScope.conversation.id == data.msg.fromID) || ($rootScope.conversation.type == 'group' && $rootScope.conversation.id == data.msg.targetID))) return
      notify.add(data.msg)
    }

        // 是否登陆
    var isSignIN = Storage.get('isSignIN')
    if (isSignIN == 'YES') {
      $state.go('tab.home')
    }

        // 用户ID
    var userid = ''

    if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true)
    }
    if (window.StatusBar) {
      StatusBar.backgroundColorByHexString('#33bbff')
    }
    // 显示通知栏消息
    // custom消息内容
    // 患者发送咨询：{
    //     counsel:data.results,
                // {
                //     counselId : "CL201704280021"
                //     diagnosisPhotoUrl : Array(0)
                //     doctorId : "58eb2ee11e152b523139e723"
                //     help : ""
                //     hospital : "折腾"
                //     messages : Array(0)
                //     patientId : "58eb86b9a177a0eab3fbff38"
                //     revisionInfo : Object
                //     sickTime : "2017-04-20"
                //     status : 1
                //     symptom : ""
                //     symptomPhotoUrl : Array(0)
                //     time : "2017-04-28T14:36:40.403Z"
                //     type : 1
                //     visitDate : "2017-04-28T00:00:00.000Z"
                //     __v : 0
                //     _id : "5903537836408c33ae0663be"
                // }
    //     type:'card',
    //     counselId:'',
    //     patientId:patientId,
    //     patientName:patientname,
    //     doctorId:DoctorId,
    //     //转发信息
    //     fromId:
    //     targetId:
    // }
    // 咨询转发医生：{
    //     counsel:data.results,
    //     type:'card',
    //     counselId:'',
    //     patientId:patientId,
    //     patientName:patientname,
    //     doctorId:DoctorId,
    //     //转发信息
    //     targetId:DoctorId,
    //     fromId
    // }
    // 咨询转发团队：{
    //     counsel:data.results,
    //     type:'card',
    //     counselId:'',
    //     patientId:patientId,
    //     patientName:patientname,
    //     doctorId:DoctorId,
    //     //转发信息
    //     targetId:teamId,
    //     fromId:doctorId,
    //     //consultation info
    //     consultationId:
    // }
    // 名片{
    //     type:'contact',
    //     doctorInfo:{},
    //     //转发信息
    //     fromId:
    //     targetId:
    // }
    // 结束消息{
    //    type:'endl',
    //    info:
    //    docId:
    //    counseltype:1或2
    //    counselId:
    // }
    // 显示通知栏消息
    $rootScope.$on('$cordovaLocalNotification:click', function (event, note, state) {
      console.log(arguments)
      var msg = JSON.parse(note.data)
      if (msg.targetType == 'group') {
                // '0':团队交流  '1': 未结束病历  '2':已结束病历
        if (msg.teamId == msg.targetID) {
          $state.go('tab.group-chat', { type: '0', groupId: msg.targetID, teamId: msg.teamId})
        } else {
          $state.go('tab.group-chat', { type: '1', groupId: msg.targetID, teamId: msg.teamId})
        }
      } else {
        if (msg.newsType == '12') {
          $state.go('tab.detail', { type: '2', chatId: msg.fromID})
        } else {
          $state.go('tab.detail', { type: '1', chatId: msg.fromID})
        }
      }
    })
        // 聊天用，防止消息被keyboard遮挡
    window.addEventListener('native.keyboardshow', function (e) {
      $rootScope.$broadcast('keyboardshow', e.keyboardHeight)
    })
    window.addEventListener('native.keyboardhide', function (e) {
      $rootScope.$broadcast('keyboardhide')
    })
  })
}])

// --------路由, url模式设置----------------
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  // ios 白屏可能问题配置
  $ionicConfigProvider.views.swipeBackEnabled(false)

    // android导航栏在顶部解决办法
  $ionicConfigProvider.platform.android.tabs.style('standard')
  $ionicConfigProvider.platform.android.tabs.position('standard')

    // 注册与登录
  $stateProvider
    // 登陆
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/others/signin.html',
      controller: 'SignInCtrl'
    })
    .state('agreement', {
      cache: false,
      url: '/agreeOrNot',
      params: {last: null},
      templateUrl: 'partials/others/agreement.html',
      controller: 'AgreeCtrl'
    })
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      templateUrl: 'partials/others/phonevalid.html',
      controller: 'phonevalidCtrl',
      params: {last: null}
    })
    .state('setpassword', {
      cache: false,
      url: '/setpassword',
      templateUrl: 'partials/others/setpassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail', {
      cache: false,
      url: '/userdetail',
      params: {last: null},
      templateUrl: 'partials/others/userDetail.html',
      controller: 'userdetailCtrl'
    })
    .state('uploadcertificate', {
      cache: false,
      params: {last: null},
      url: '/uploadcertificate',
      templateUrl: 'partials/others/uploadcertificate.html',
      controller: 'uploadcertificateCtrl'
    })

    .state('messages', {
      cache: false,
      url: '/messages',
      templateUrl: 'partials/others/AllMessage.html',
      controller: 'messageCtrl'
    })
    .state('messagesDetail', {
      cache: false,
      url: '/messagesDetail',
      templateUrl: 'partials/others/VaryMessage.html',
      controller: 'VaryMessageCtrl'
    })

    // 选项卡
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'partials/tabs.html',
      controller: 'tabCtrl'
    })

    // 主页面
    .state('tab.home', {
      cache: false,
      url: '/home',
      views: {
        'tab-home': {
          controller: 'homeCtrl',
          templateUrl: 'partials/home/homepage.html'
        }
      }
    })

    // 咨询
    .state('tab.consult', {
        // cache: false,
      url: '/consult',
      views: {
        'tab-consult': {
          controller: 'consultCtrl',
          templateUrl: 'partials/consult/consult.html'
        }
      }
    })

    // 患者页面
    .state('tab.patient', {
      cache: false,
      url: '/patient',
      views: {
        'tab-patient': {
          controller: 'patientCtrl',
          templateUrl: 'partials/patient/patient.html'
        }
      }
    })

    // 交流
    .state('tab.groups', {
        // cache: false,
        // type:   '0'=team  '1'=doctor
      url: '/groups/type/:type',
      views: {
        'tab-groups': {
          controller: 'groupsCtrl',
          templateUrl: 'partials/group/groups.html'
        }
      }
    })

    // "我"页面
    .state('tab.me', {
      url: '/me',
      cache: false,
      views: {
        'tab-me': {
          controller: 'meCtrl',
          templateUrl: 'partials/me/mepage.html'
        }
      }
    })

    // views-tab-home

    // views-tab-consult

    // 进行中
    .state('tab.doing', {
      cache: false,
      url: '/doing',
      views: {
        'tab-consult': {
          controller: 'doingCtrl',
          templateUrl: 'partials/consult/doing.html'
        }
      }
    })
    // 进行中详情
    .state('tab.detail', {
        // cache: false,
        // [type]:0=已结束;1=进行中;2=医生
        // 传一个counselId进来
      url: '/detail/:type/:chatId',
      views: {
        'tab-consult': {
          controller: 'detailCtrl',
          templateUrl: 'partials/consult/detail.html'
        }
      }
        // params:{counselId:null}
    })
    // .state('tab.consult-detail', {
    //     // cache: false,
    //     url: '/consult/detail/:consultId',
    //     views: {
    //         'tab-consult':{
    //             controller: 'consultDetailCtrl',
    //             templateUrl: 'partials/consult/consult-detail.html'
    //         }
    //     }
    // })
    .state('tab.selectDoc', {
        // cache: false,
      url: '/selectdoc',
      views: {
        'tab-consult': {
          controller: 'selectDocCtrl',
          templateUrl: 'partials/consult/select-doctor.html'
        }
      },
      params: {msg: null}
    })
    .state('tab.selectTeam', {
        // cache: false,
      url: '/selectteam',
      views: {
        'tab-consult': {
          controller: 'selectTeamCtrl',
          templateUrl: 'partials/consult/select-team.html'
        }
      },
      params: {msg: null}
    })
    // 已完成
    .state('tab.did', {
      cache: false,
      url: '/did',
      views: {
        'tab-consult': {
          controller: 'didCtrl',
          templateUrl: 'partials/consult/did.html'
        }
      }
    })

    // views-tab-patient

    // 患者详情页面
    .state('tab.patientDetail', {
      cache: false,
      url: '/patientDetail',
      views: {
        'tab-patient': {
          controller: 'patientDetailCtrl',
          templateUrl: 'partials/patient/patientDetail.html'
        }
      }
    })
    .state('tab.DoctorDiagnose', {
        // cache: false,
      url: '/DoctorDiagnose',
      views: {
        'tab-patient': {
          controller: 'DoctorDiagnoseCtrl',
          templateUrl: 'partials/patient/DoctorDiagnose.html'
        }
      }
    })
    .state('tab.TestRecord', {
        // cache: false,
      url: '/TestRecord',
      params: {PatinetId: null},
      views: {
        'tab-patient': {
          cache: true,
          controller: 'TestRecordCtrl',
          templateUrl: 'partials/patient/testrecord.html'
        }
      }
    })

    .state('tab.TaskSet', {
        // cache: false,
      url: '/TaskSet',
      views: {
        'tab-patient': {
          controller: 'TaskSetCtrl',
          templateUrl: 'partials/patient/TaskSet.html'
        }
      }
    })

    .state('tab.HealthInfo', {
        // cache: false,
      url: '/HealthInfo',
      views: {
        'tab-patient': {
          controller: 'HealthInfoCtrl',
          templateUrl: 'partials/patient/HealthInfo.html'
        }
      }
    })

    .state('tab.HealthInfoDetail', {
        // cache: false,
      url: '/HealthInfoDetail',
      params: {id: null},
      views: {
        'tab-patient': {
          controller: 'HealthDetailCtrl',
          templateUrl: 'partials/patient/editHealthInfo.html'
        }
      }
    })

// 主管医生审核申请--rzx
    .state('tab.review', {
        // cache: false,
      url: '/review',
      views: {
        'tab-patient': {
          controller: 'reviewCtrl',
          templateUrl: 'partials/patient/review.html'
        }
      }
    })

    // views-tab-groups
    .state('tab.new-group', {
      url: '/newgroup',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/new-group.html',
          controller: 'NewGroupCtrl'
        }
      }
    })
    .state('tab.groups-search', {
      url: '/groupsearch',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/groups-search.html',
          controller: 'GroupsSearchCtrl'
        }
      }
    })
    .state('tab.doctor-search', {
      url: '/doctorsearch',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/doctor-search.html',
          controller: 'DoctorSearchCtrl'
        }
      }
    })
    .state('tab.group-add', {
      url: '/groups/add/:teamId',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-add.html',
          controller: 'GroupAddCtrl'
        }
      }
    })
    .state('tab.group-kick', {
      url: '/groups/:teamId/kick',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-kick.html',
          controller: 'GroupKickCtrl'
        }
      }
    })
    .state('tab.group-add-member', {
            // type : 'new'表示从新建组进来的，不是'new'就是已有team加成员
      url: '/groups/:teamId/addmember/:type/',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-add-member.html',
          controller: 'GroupAddMemberCtrl'
        }
      }
    })
    .state('tab.group-detail', {
      url: '/groups/:teamId/detail',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-detail.html',
          controller: 'GroupDetailCtrl'
        }
      }
            // params:{teamId:null}
    })
    .state('tab.group-qrcode', {
      url: '/groups/qrcode',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-qrcode.html',
          controller: 'GroupQrcodeCtrl'
        }
      },
      params: {team: null}
    })
    .state('tab.group-chat', {
        // '0':团队交流  '1': 未结束病历  '2':已结束病历
      url: '/groups/chat/t/:type/:groupId/:teamId',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/group-chat.html',
          controller: 'GroupChatCtrl'
        }
      }
    })
    .state('tab.view-chat', {
        // '0':团队交流  '1': 未结束病历  '2':已结束病历
      url: '/viewchat/:doctorId/:patientId',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/view-chat.html',
          controller: 'viewChatCtrl'
        }
      }
    })
    .state('tab.group-conclusion', {
      url: '/groups/conclusion/:groupId/:teamId',
      views: {
        'tab-groups': {
          templateUrl: 'partials/group/conclusion.html',
          controller: 'GroupConclusionCtrl'
        }
      }
    })
    .state('tab.group-patient', {
        // cache: false,
      url: '/group/patients/:teamId',
      views: {
        'tab-groups': {
          controller: 'groupPatientCtrl',
          templateUrl: 'partials/group/group-patient.html'
        }
      }
    })
    // 医生个人信息
    .state('tab.group-profile', {
        // cache: false,
      url: '/group/doctor/:memberId/profile',
      views: {
        'tab-groups': {
          controller: 'doctorProfileCtrl',
          templateUrl: 'partials/group/profile.html'
        }
      }
    })

    // views-tab-me
    // 账单
    .state('tab.bill', {
        // cache: false,
      url: '/bill',
      views: {
        'tab-me': {
          controller: 'billCtrl',
          templateUrl: 'partials/me/bill.html'
        }
      }
    })
    // schedual
    .state('tab.schedual', {
        // cache: false,
      url: '/schedual',
      views: {
        'tab-me': {
          controller: 'schedualCtrl',
          templateUrl: 'partials/me/schedual.html'
        }
      }
    })
    // 我的二维码
    .state('tab.QRcode', {
        // cache: false,
      url: '/qrcode',
      views: {
        'tab-me': {
          controller: 'QRcodeCtrl',
          templateUrl: 'partials/me/qrcode.html'
        }
      }
    })

    // 我的信息
    .state('tab.myinfo', {
      cache: false,
      url: '/myinfo',
      views: {
        'tab-me': {
          controller: 'myinfoCtrl',
          templateUrl: 'partials/me/myinfo.html'
        }
      }
    })

    // 收费定制
    .state('tab.myfee', {
        // cache: false,
      url: '/myfee',
      views: {
        'tab-me': {
          controller: 'myfeeCtrl',
          templateUrl: 'partials/me/myfee.html'
        }
      }
    })

    // 我的评价
    .state('tab.feedback', {
        // cache: false,
      url: '/feedback',
      views: {
        'tab-me': {
          controller: 'feedbackCtrl',
          templateUrl: 'partials/me/feedback.html'
        }
      }
    })
    // 评价展示
    .state('tab.commentdetail', {
      url: '/commentdetail',
      params: {rating: null, content: null},
      cache: false,
      views: {
        'tab-me': {
          cache: false,
          templateUrl: 'partials/me/commentDoctor.html',
          controller: 'SetCommentCtrl'
        }
      }
    })
    // 设置
    .state('tab.set', {
        // cache: false,
      url: '/set',
      views: {
        'tab-me': {
          controller: 'setCtrl',
          templateUrl: 'partials/me/set.html'
        }
      }
    })
    // 设置内容页
    .state('tab.set-content', {
      url: '/me/set/set-content/:type',
      views: {
        'tab-me': {
          templateUrl: 'partials/me/set/set-content.html',
          controller: 'set-contentCtrl'
        }
      }
    })
    // 查看协议页
    .state('tab.viewAgree', {
        // cache: false,
      url: '/me/set/viewAgree',
      views: {
        'tab-me': {
          controller: 'viewAgreeCtrl',
          templateUrl: 'partials/me/set/viewAgree.html'
        }
      }
    })
    // 意见反馈
    .state('tab.advice', {
        // cache: false,
      url: '/advice',
      views: {
        'tab-me': {
          controller: 'adviceCtrl',
          templateUrl: 'partials/me/advice.html'
        }
      }
    })

    // 关于
    .state('tab.about', {
        // cache: false,
      url: '/about',
      views: {
        'tab-me': {
          controller: 'aboutCtrl',
          templateUrl: 'partials/me/about.html'
        }
      }
    })

  $urlRouterProvider.otherwise('/signin')
})
.controller('tabCtrl', ['$state', '$scope', '$interval', function ($state, $scope, $interval) {
  $scope.goHome = function () {
    setTimeout(function () {
      $state.go('tab.home', {})
    }, 20)
  }
  $scope.destroy = function () {
    console.log('destroy')
    if (RefreshUnread) {
      $interval.cancel(RefreshUnread)
    }
  }
  $scope.goConsult = function () {
    setTimeout(function () {
      $state.go('tab.consult', {})
    }, 20)
  }
  $scope.goGroups = function () {
    setTimeout(function () {
      $state.go('tab.groups', {type: '0'})
    }, 20)
  }
  $scope.goPatient = function () {
    setTimeout(function () {
      $state.go('tab.patient', {})
    }, 20)
  }
  $scope.goMe = function () {
    setTimeout(function () {
      $state.go('tab.me', {})
    }, 20)
  }
}])
