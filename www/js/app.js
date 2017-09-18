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
  'fyl.controllers',
  'kidney.services',
  'kidney.filters',
  'kidney.directives',
  'monospaced.qrcode',
  'ionic-datepicker',
  'kidney.icon_filter',
  'btford.socket-io',
  'angular-jwt'
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
    // version.checkUpdate($rootScope)// 在app.js的ready里加
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
      $state.go('tab.workplace')
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

    if ($ionicPlatform.is('ios')) {
      cordova.plugins.notification.local.on('click', function (note, state) {
        alert(note.id + ' was clicked')
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
      }, this)
    }
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
    // 未读消息列表
    .state('messages', {
      cache: false,
      url: '/messages',
      templateUrl: 'partials/others/AllMessage.html',
      controller: 'messageCtrl'
    })
    // 未读未及时回复咨询列表
    .state('nocomess', {
      // cache: false,
      url: '/nocomess',
      templateUrl: 'partials/others/nocomess.html',
      controller: 'nocomessCtrl'
    })
    // 未修改治疗方案列表
    .state('changeTasks', {
      // cache: false,
      url: '/changeTasks',
      templateUrl: 'partials/others/changeTasks.html',
      controller: 'changeTasksCtrl'
    })
    // 警报消息
    .state('patientAlerts', {
      // cache: false,
      url: '/patientAlerts',
      templateUrl: 'partials/others/patientAlerts.html',
      controller: 'patientAlertsCtrl'
    })

    // 选项卡
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'partials/tabs.html',
      controller: 'tabCtrl'
    })

    // 工作台
    .state('tab.workplace', {
      cache: false,
      url: '/workplace',
      views: {
        'tab-workplace': {
          controller: 'workplaceCtrl',
          templateUrl: 'partials/workplace/workplace.html'
        }
      }
    })

    // 主页面
    // .state('tab.home', {
    //   cache: false,
    //   url: '/home',
    //   views: {
    //     'tab-home': {
    //       controller: 'homeCtrl',
    //       templateUrl: 'partials/home/homepage.html'
    //     }
    //   }
    // })

    // 咨询
    .state('tab.consult', {
        // cache: false,
      url: '/consult',
      views: {
        'tab-workplace': {
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
        'tab-workplace': {
          controller: 'patientCtrl',
          templateUrl: 'partials/patient/patient.html'
        }
      }
    })

    // 团队
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

    // "我的"页面
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

    // "论坛"页面
    .state('tab.forum', {
      url: '/forum',
      cache: false,
      views: {
        'tab-forum': {
          controller: 'forumCtrl',
          templateUrl: 'partials/forum/forum.html'
        }
      }
    })
    .state('post', {
      url: '/post',
      cache: false,
      templateUrl: 'partials/forum/post.html',
      controller: 'postCtrl'
    })
    .state('comment', {
      url: '/comment',
      cache: false,
      templateUrl: 'partials/forum/comment.html',
      controller: 'commentCtrl'
    })
    .state('postsdetail', {
      url: '/postsdetail',
      cache: false,
      templateUrl: 'partials/forum/postsdetail.html',
      controller: 'postsdetailCtrl'
    })
    .state('reply', {
      url: '/reply',
      cache: false,
      templateUrl: 'partials/forum/reply.html',
      controller: 'replyCtrl'
    })

    // views-tab-home

    // views-tab-workplace

    // 我的二维码
    .state('tab.QRcode', {
        // cache: false,
      url: '/qrcode',
      views: {
        'tab-workplace': {
          controller: 'QRcodeCtrl',
          templateUrl: 'partials/workplace/qrcode.html'
        }
      }
    })
    // 服务管理
    .state('tab.myservice', {
        // cache: false,
      url: '/myservice',
      views: {
        'tab-workplace': {
          controller: 'myserviceCtrl',
          templateUrl: 'partials/workplace/myservice.html'
        }
      }
    })
    // 我的预约
    .state('tab.myreserve', {
      cache: false,
      url: '/myreserve',
      views: {
        'tab-workplace': {
          controller: 'myreserveCtrl',
          templateUrl: 'partials/workplace/myreserve.html'
        }
      }
    })
    // 主管医生审核申请--rzx
    .state('tab.review', {
        // cache: false,
      url: '/review',
      views: {
        'tab-workplace': {
          controller: 'reviewCtrl',
          templateUrl: 'partials/workplace/review.html'
        }
      }
    })

// 预约面诊列表
    .state('tab.face', {
        // cache: false,
      url: '/face',
      views: {
        'tab-workplace': {
          controller: 'faceCtrl',
          templateUrl: 'partials/workplace/face.html'
        }
      }
    })
    // 咨询
    // 进行中
    .state('tab.doing', {
      cache: false,
      url: '/doing',
      views: {
        'tab-workplace': {
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
        'tab-workplace': {
          controller: 'detailCtrl',
          templateUrl: 'partials/consult/detail.html'
        }
      }
        // params:{counselId:null}
    })

    .state('tab.selectDoc', {
        // cache: false,
      url: '/selectdoc',
      views: {
        'tab-workplace': {
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
        'tab-workplace': {
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
        'tab-workplace': {
          controller: 'didCtrl',
          templateUrl: 'partials/consult/did.html'
        }
      }
    })

    // 患者详情页面
    .state('tab.Report', {
      url: '/Report',
      cache: false,
      views: {
        'tab-workplace': {
          controller: 'ReportCtrl',
          templateUrl: 'partials/patient/Report.html'
        }
      }
    })
    .state('tab.patientDetail', {
      cache: false,
      url: '/patientDetail',
      views: {
        'tab-workplace': {
          controller: 'patientDetailCtrl',
          templateUrl: 'partials/patient/patientDetail.html'
        }
      }
    })
    .state('tab.DoctorDiagnose', {
        // cache: false,
      url: '/DoctorDiagnose',
      views: {
        'tab-workplace': {
          controller: 'DoctorDiagnoseCtrl',
          templateUrl: 'partials/patient/DoctorDiagnose.html'
        }
      }
    })
    // .state('tab.TestRecord', {
    //     // cache: false,
    //   url: '/TestRecord',
    //   params: {PatinetId: null},
    //   views: {
    //     'tab-workplace': {
    //       cache: true,
    //       controller: 'TestRecordCtrl',
    //       templateUrl: 'partials/patient/testrecord.html'
    //     }
    //   }
    // })

    .state('tab.TaskSet', {
      cache: false,
      url: '/TaskSet',
      views: {
        'tab-workplace': {
          controller: 'TaskSetCtrl',
          templateUrl: 'partials/patient/TaskSet.html'
        }
      }
    })

    .state('tab.HealthInfo', {
        // cache: false,
      url: '/HealthInfo',
      views: {
        'tab-workplace': {
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
        'tab-workplace': {
          controller: 'HealthDetailCtrl',
          templateUrl: 'partials/patient/editHealthInfo.html'
        }
      }
    })

// // 主管医生审核申请--rzx
//     .state('tab.review', {
//         // cache: false,
//       url: '/review',
//       views: {
//         'tab-patient': {
//           controller: 'reviewCtrl',
//           templateUrl: 'partials/patient/review.html'
//         }
//       }
//     })

// // 预约面诊列表
//     .state('tab.face', {
//         // cache: false,
//       url: '/face',
//       views: {
//         'tab-patient': {
//           controller: 'faceCtrl',
//           templateUrl: 'partials/patient/face.html'
//         }
//       }
//     })
   .state('tab.GroupMessage', {
        // cache: false,
     url: '/GroupMessage',
     views: {
       'tab-workplace': {
         controller: 'GroupMessageCtrl',
         templateUrl: 'partials/patient/GroupMessage.html'
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
      url: '/viewchat/:doctorId/:patientId/:groupId/:teamId',
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
    // // 我的二维码
    // .state('tab.QRcode', {
    //     // cache: false,
    //   url: '/qrcode',
    //   views: {
    //     'tab-me': {
    //       controller: 'QRcodeCtrl',
    //       templateUrl: 'partials/me/qrcode.html'
    //     }
    //   }
    // })

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

    // 我的账户管理
    .state('tab.accountManage', {
        // cache: false,
      url: '/myfee/accountManage',
      views: {
        'tab-me': {
          controller: 'accountManageCtrl',
          templateUrl: 'partials/me/accountManage.html'
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

    // 我的服务
    // .state('tab.myservice', {
    //     // cache: false,
    //   url: '/myservice',
    //   views: {
    //     'tab-me': {
    //       controller: 'myserviceCtrl',
    //       templateUrl: 'partials/me/myservice.html'
    //     }
    //   }
    // })

    // 自动转发页
    .state('tab.forwarding', {
        // cache: false,
      url: '/me/forwarding',
      views: {
        'tab-me': {
          controller: 'forwardingCtrl',
          templateUrl: 'partials/me/forwarding.html'
        }
      }
    })

    // 面诊服务页面
    .state('tab.faceconsult', {
      cache: false,
      url: '/me/faceconsult',
      views: {
        'tab-me': {
          controller: 'faceconsultCtrl',
          templateUrl: 'partials/me/faceconsult.html'
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

    // 科室管理
    .state('tab.nocounsel', {
        // cache: false,
      url: '/nocounsel',
      views: {
        'tab-me': {
          controller: 'nocounselCtrl',
          templateUrl: 'partials/me/nocounsel.html'
        }
      }
    })
    // 未及时回复咨询报告详情
    .state('tab.nocodetail', {
        // cache: false,
      url: '/nocodetail',
      views: {
        'tab-me': {
          controller: 'nocodetailCtrl',
          templateUrl: 'partials/me/nocodetail.html'
        }
      }
    })

  $urlRouterProvider.otherwise('/signin')
})
.controller('tabCtrl', ['$state', '$scope', '$interval', 'Storage', '$ionicPopup', function ($state, $scope, $interval, Storage, $ionicPopup) {
  $scope.goWorkplace = function () {
    setTimeout(function () {
      $state.go('tab.workplace', {})
    }, 20)
  }
  // $scope.goHome = function () {
  //   setTimeout(function () {
  //     $state.go('tab.home', {})
  //   }, 20)
  // }
  $scope.destroy = function () {
    // console.log('destroy')
    if (Storage.get('reviewStatus') == 1) {
      if (RefreshUnread) {
        $interval.cancel(RefreshUnread)
      }
    }
  }
  $scope.goForum = function () {
    if (Storage.get('reviewStatus') == 1) {
      setTimeout(function () {
        $state.go('tab.forum', {type: '0'})
      }, 20)
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
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
    } else {
      $ionicPopup.show({
        title: '数据异常！',
        buttons: [
          {
            text: '確定',
            type: 'button-positive'
          }
        ]
      })
    }
  }
  $scope.goGroups = function () {
    if (Storage.get('reviewStatus') == 1) {
      setTimeout(function () {
        $state.go('tab.groups', {type: '0'})
      }, 20)
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
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
    } else {
      $ionicPopup.show({
        title: '数据异常！',
        buttons: [
          {
            text: '確定',
            type: 'button-positive'
          }
        ]
      })
    }
  }
  // $scope.goPatient = function () {
  //   setTimeout(function () {
  //     $state.go('tab.patient', {})
  //   }, 20)
  // }
  $scope.goMe = function () {
    setTimeout(function () {
      $state.go('tab.me', {})
    }, 20)
  }
}])

// $httpProvider.interceptors提供http request及response的预处理
.config(['$httpProvider', 'jwtOptionsProvider', function ($httpProvider, jwtOptionsProvider) {
    // 下面的getter可以注入各种服务, service, factory, value, constant, provider等, constant, provider可以直接在.config中注入, 但是前3者不行
  jwtOptionsProvider.config({
    whiteListedDomains: ['docker2.haihonghospitalmanagement.com', '121.196.221.44', '106.15.185.172', 'testpatient.haihonghospitalmanagement.com', 'testdoctor.haihonghospitalmanagement.com', 'patient.haihonghospitalmanagement.com', 'doctor.haihonghospitalmanagement.com', 'localhost'],
    tokenGetter: ['options', 'jwtHelper', '$http', 'CONFIG', 'Storage', '$state', '$ionicPopup', '$interval', function (options, jwtHelper, $http, CONFIG, Storage, $state, $ionicPopup, $interval) {
         // console.log(config);
        // console.log(CONFIG.baseUrl);

        // var token = sessionStorage.getItem('token');
      var token = Storage.get('TOKEN')
        // var refreshToken = sessionStorage.getItem('refreshToken');
      var refreshToken = Storage.get('refreshToken')
      if (!token && !refreshToken) {
        return null
      }

      var isExpired = true
      try {
          /*
           * 由于jwt自带的过期判断方法与服务器端使用的加密方法不匹配，使用jwthelper解码的方法对token进行解码后自行判断token是否过期
           */
            // isExpired = jwtHelper.isTokenExpired(token);
        var temp = jwtHelper.decodeToken(token)
        if (temp.exp === 'undefined') {
          isExpired = false
        } else {
              // var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
              // d.setUTCSeconds(temp.expireAfter);
          isExpired = !(temp.exp > new Date().valueOf())// (new Date().valueOf() - 8*3600*1000));
              // console.log(temp)
        }

             // console.log(isExpired);
      } catch (e) {
        console.log(e)
        isExpired = true
      }
        // 这里如果同时http.get两个模板, 会产生两个$http请求, 插入两次jwtInterceptor, 执行两次getrefreshtoken的刷新token操作, 会导致同时查询redis的操作, ×××估计由于数据库锁的关系×××(由于token_manager.js中的exports.refreshToken中直接删除了redis数据库里前一个refreshToken, 导致同时发起的附带有这个refreshToken的getrefreshtoken请求查询返回reply为null, 导致返回"凭证不存在!"错误), 其中一次会查询失败, 导致返回"凭证不存在!"错误, 使程序流程出现异常(但是为什么会出现模板不能加载的情况? 是什么地方阻止了模板的下载?)
      if (options.url.substr(options.url.length - 5) === '.html' || options.url.substr(options.url.length - 3) === '.js' || options.url.substr(options.url.length - 4) === '.css' || options.url.substr(options.url.length - 4) === '.jpg' || options.url.substr(options.url.length - 4) === '.png' || options.url.substr(options.url.length - 4) === '.ico' || options.url.substr(options.url.length - 5) === '.woff') {  // 应该把这个放到最前面, 否则.html模板载入前会要求refreshToken, 如果封装成APP后, 这个就没用了, 因为都在本地, 不需要从服务器上获取, 也就不存在http get请求, 也就不会interceptors
             // console.log(config.url);
        return null
      } else if (isExpired) {    // 需要加上refreshToken条件, 否则会出现网页循环跳转
            // This is a promise of a JWT token
             // console.log(token);
        if (refreshToken && refreshToken.length >= 16) {  // refreshToken字符串长度应该大于16, 小于即为非法
                /**
                 * [刷新token]
                 * @Author   TongDanyang
                 * @DateTime 2017-07-05
                 * @param    {[string]}  refreshToken [description]
                 * @return   {[object]}  data.results  [新的token信息]
                 */
          console.log(options)
          return $http({
            url: CONFIG.baseTwoUrl + 'token/refresh?refresh_token=' + refreshToken,
                    // This makes it so that this request doesn't send the JWT
            skipAuthorization: true,
            method: 'GET',
            timeout: 5000
          }).then(function (res) { // $http返回的值不同于$resource, 包含config等对象, 其中数据在res.data中
            console.log(res.status)
            console.log(res.data)
            console.log('成功')
                    // sessionStorage.setItem('token', res.data.token);
                    // sessionStorage.setItem('refreshToken', res.data.refreshToken);
            Storage.set('TOKEN', res.data.results.token)
            Storage.set('refreshToken', res.data.results.refreshToken)
            return res.data.results.token
          }, function (err) {
            console.log('错误')
            console.log(err.status)
            console.log(err.data)
            console.log(err)
            if (refreshToken == Storage.get('refreshToken')) {
              // console.log("凭证不存在!")
              console.log(options)
              $ionicPopup.show({
                title: '您离开太久了，请重新登录',
                buttons: [
                  {
                    text: '取消',
                    type: 'button'
                  },
                  {
                    text: '確定',
                    type: 'button-positive',
                    onTap: function (e) {
                      // 清除登陆信息
                      Storage.rm('password')
                      // Storage.rm('UID');
                      Storage.rm('doctorunionid')
                      Storage.rm('IsSignIn')
                      // Storage.rm('USERNAME');
                      Storage.rm('PASSWORD')
                      Storage.rm('userid')
                      $interval.cancel(RefreshUnread)
                      // mySocket.cancelAll()
                      // socket.emit('disconnect')
                      // socket.disconnect()
                      $state.go('signin')
                    }
                  }
                ]
              })
            }
                    // sessionStorage.removeItem('token');
                    // sessionStorage.removeItem('refreshToken');
                    // Storage.rm('token');
                    // Storage.rm('refreshToken');
            return null
          })
        } else {
          console.log('清除refreshtoken')
          Storage.rm('refreshToken')  // 如果是非法refreshToken, 删除之
          return null
        }
      } else {
            // console.log(token);
        return token
      }
    }]
  })

  $httpProvider.interceptors.push('jwtInterceptor')
}])
