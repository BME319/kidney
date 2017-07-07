angular.module('xjz.controllers', ['ionic', 'kidney.services'])
/**
 * 新建团队
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('NewGroupCtrl', ['$scope', '$state', '$ionicLoading', '$rootScope', 'Communication', 'Storage', 'Doctor', '$filter', function ($scope, $state, $ionicLoading, $rootScope, Communication, Storage, Doctor, $filter) {
  $rootScope.newMember = []

  $scope.members = []
  $scope.team = {
    teamId: '',
    name: '',
    sponsorId: '',
    sponsorName: '',
    description: ''
  }

  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.members = $rootScope.newMember
  })
  /**
   * 确认新建按键
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {null}
   */
  $scope.confirm = function () {
    if ($scope.team.name == '' || $scope.team.description == '') {
      $ionicLoading.show({ template: '请完整填写信息', duration: 1500 })
    } else if (!$scope.members) {
      $ionicLoading.show({ template: '请至少添加一个成员', duration: 1500 })
    } else {
      upload()
    }
  }
  /**
   * 上传新建团队信息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {str}   gid   groupid
   * @return   {null}
   */
  function upload (gid) {
    var time = new Date()
    $scope.team.teamId = $filter('date')(time, 'ssmsssH')
    $scope.team.sponsorId = Storage.get('UID')
    Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
            .then(function (data) {
              $scope.team.sponsorName = data.results.name
              Communication.newTeam($scope.team)
                    .then(function (data) {
                        // add members
                      Communication.insertMember({ teamId: $scope.team.teamId, members: $rootScope.newMember })
                            .then(function (data) {
                              $ionicLoading.show({ template: '创建成功', duration: 1500 })
                              setTimeout(function () {
                                $state.go('tab.groups', { type: '0' })
                              }, 1000)
                            }, function (err) {
                              console.log(err)
                            })
                    }, function (err) {
                      $ionicLoading.show({ template: '创建失败', duration: 1500 })
                      console.log(err)
                    })
            })
  }
  /**
   * 跳转到添加人头页面按键
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.addMember = function () {
    $state.go('tab.group-add-member', { type: 'new' })
  }
}])
/**
 * 查找团队
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('GroupsSearchCtrl', ['$scope', '$state', 'Communication', '$ionicLoading', 'QRScan', function ($scope, $state, Communication, $ionicLoading, QRScan) {
  $scope.search = ''
  $scope.noteam = 0
  $scope.searchStyle = {'margin-top': '44px'}
  if (ionic.Platform.isIOS()) {
    $scope.searchStyle = {'margin-top': '64px'}
  }
  /**
   * 搜索群号
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.Searchgroup = function () {
    $scope.noteam = 0
    Communication.getTeam({ teamId: $scope.search })
            .then(function (data) {
              console.log(data.results)

              if (data.results == null) {
                $scope.noteam = 1
                $ionicLoading.show({ template: '查无此群', duration: 1000 })
              } else { $scope.teamresult = data }
            }, function (err) {
              console.log(err)
            })
  }
  /**
   * 扫团队二维码
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.QRscan = function () {
    QRScan.getCode()
        .then(function (teamId) {
          if (teamId) {
            $state.go('tab.group-add', {teamId: teamId})
          }
        }, function (err) {

        })
  }
}])
/**
 * 查找医生
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('DoctorSearchCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG', 'Storage', function ($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG, Storage) {
  $scope.searchStyle = {'margin-top': '44px'}
  if (ionic.Platform.isIOS()) {
    $scope.searchStyle = {'margin-top': '64px'}
    $scope.docStyle = {'margin-top': '20px'}
  }
  $scope.docStyle = {'margin-top': '0px'}

    // get groupId via $state.params.groupId
  $scope.moredata = true
  $scope.issearching = true
  $scope.isnotsearching = false
  $scope.group = {
    members: []
  }
  $scope.doctors = []
  $scope.alldoctors = []
  $scope.skipnum = 0
  /**
   * 下拉加载更多
   * @Author   zyh
   * @DateTime 2017-07-05
   * @return   {null}
   */
  $scope.loadMore = function () {
        // $scope.$apply(function() {
    Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function (data) {
              console.log(data.results)
              $scope.$broadcast('scroll.infiniteScrollComplete')

              $scope.alldoctors = $scope.alldoctors.concat(data.results)
              $scope.doctors = $scope.alldoctors
              $scope.nexturl = data.nexturl
              var skiploc = data.nexturl.indexOf('skip')
              $scope.skipnum = data.nexturl.substring(skiploc + 5)
              if (data.results.length == 0) { $scope.moredata = false } else { $scope.moredata = true };
            }, function (err) {
              console.log(err)
            })
            // });
  }
  /**
   * “搜索”按钮
   * @Author   zyh
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goSearch = function () {
    $scope.isnotsearching = true
    $scope.issearching = false
    $scope.moredata = false
    Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function (data) {
              console.log(data.results)
              $scope.doctors = data.results
              if (data.results.length == 0) {
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
              }
            }, function (err) {
              console.log(err)
            })
  }

    // directive <button-clear-input>新建了scope， 导致clearSearch不能正确bind，不能触发
    // 影响使用体验
    /**
     * 清空输入圆形×
     * @Author   zyh
     * @DateTime 2017-07-05
     * @return   {[type]}
     */
  $scope.clearSearch = function () {
    $scope.search.name = ''
    $scope.issearching = true
    $scope.isnotsearching = false
    $scope.moredata = true
    $scope.doctors = $scope.alldoctors
  }
  /**
   * 点击医生触发事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {str}
   * @return   {null}
   */
  $scope.doctorClick = function (doc) {
    if (doc == Storage.get('UID')) $state.go('tab.me')
    else $state.go('tab.detail', { type: '2', chatId: doc })
  }
}])

/**
 * (我的)团队页面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('groupsCtrl', ['$scope', '$http', '$state', '$ionicPopover', 'Doctor', 'Storage', 'Patient', 'arrTool', '$q', 'New', '$interval', '$timeout', function ($scope, $http, $state, $ionicPopover, Doctor, Storage, Patient, arrTool, $q, New, $interval, $timeout) {
  $scope.countAllDoc = '?'
  $scope.query = {
    name: ''
  }
  $scope.params = {
    isTeam: true,
    showSearch: false,
    updateTime: 0
  }
  /**
   * 获取医生数量
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  var countDocs = function () {
    Doctor.getDocNum()
        .then(function (data) {
          console.log(data)
          $scope.countAllDoc = data.results
        }, function (err) {
          console.log(err)
        })
  }
  countDocs()
  /**
   * 本页面的加载事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {boolean}  force  是否为硬加载
   * @return   {[type]}
   */
  $scope.load = function (force) {
    var time = Date.now()
    if (!force && time - $scope.params.updateTime < 60000) {
      New.addNews('13', Storage.get('UID'), $scope.teams, 'teamId')
            .then(function (teams) {
              $scope.teams = teams
            })
      New.addNestNews('12', Storage.get('UID'), $scope.doctors, 'userId', 'doctorId')
            .then(function (doctors) {
              $scope.doctors = doctors
            })
    } else {
      $scope.params.updateTime = time
      Doctor.getMyGroupList({ userId: Storage.get('UID') })
                .then(function (data) {
                  console.log(data)
                  return New.addNews('13', Storage.get('UID'), data, 'teamId')
                    .then(function (teams) {
                      return $scope.teams = teams
                    })
                }).then(function (data) {
                  console.log(data)
                })
      function getData () {
        Doctor.getRecentDoctorList({ userId: Storage.get('UID') })
                    .then(function (data) {
                      console.log(data)
                      New.addNestNews('12', Storage.get('UID'), data.results, 'userId', 'doctorId')
                        .then(function (doctors) {
                          $scope.doctors = doctors
                        })
                    }, function (err) {
                      console.log(err)
                    })
      }
      $timeout(getData, 500)
      $interval(getData, 5000, 1)
    }
  }

  $scope.$on('$ionicView.beforeEnter', function () {
        // type:   '0'=team  '1'=doctor
    $scope.params.isTeam = $state.params.type == '0'
    $scope.params.showSearch = false
    $scope.msgListener = $scope.$on('im:getMsg', function (event, msg) {
      $scope.load()
    })
  })
    // $scope.$on('im:getMsg',function(event, msg) {
    //     $scope.load();
    // });
  $scope.$on('$ionicView.enter', function () {
    $scope.load(true)
  })
  /**
   * 刷新
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.doRefresh = function () {
    $scope.load(true)
        // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
  /**
   * 团队和医生版面切换（的按键）
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.showTeams = function () {
    $scope.params.isTeam = true
  }
  $scope.showDocs = function () {
    $scope.params.isTeam = false
  }
  /**
   * 搜索，关掉搜索，清空搜索
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.search = function () {
    $scope.params.showSearch = true
  }
  $scope.closeSearch = function () {
    $scope.params.showSearch = false
  }
  $scope.clearSearch = function () {
    $scope.query.name = ''
  }
    // popover option
  var options = [{
    name: '搜索团队',
    href: '#/tab/groupsearch'
  }, {
    name: '新建团队',
    href: '#/tab/newgroup'
  }, {
    name: '搜索医生',
    href: '#/tab/doctorsearch'
  }]
  $ionicPopover.fromTemplateUrl('partials/group/pop-menu.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.options = options
    $scope.popover = popover
  })
  /**
   * 点击团队
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {element}  ele  点击的元素
   * @param    {array}    team 被点击的那个团队的信息
   * @return   {[type]}
   */
  $scope.itemClick = function (ele, team) {
    if (ele.target.id == 'discuss') $state.go('tab.group-patient', { teamId: team.teamId })
    else $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId })
  }
  /**
   * 点击医生
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {element}  ele  点击的元素
   * @param    {array}    doc 被点击的那个医生的信息
   * @return   {[type]}
   */
  $scope.doctorClick = function (ele, doc) {
    if (ele.target.id == 'profile') $state.go('tab.group-profile', { memberId: doc.userId })
    else $state.go('tab.detail', { type: '2', chatId: doc.userId })
  }

  $scope.$on('$ionicView.beforeLeave', function () {
    $scope.msgListener()
    if ($scope.popover) $scope.popover.hide()
  })
}])
/**
 * 团队病历
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('groupPatientCtrl', ['$scope', '$http', '$state', 'Storage', '$ionicHistory', 'Doctor', '$ionicLoading', 'New', function ($scope, $http, $state, Storage, $ionicHistory, Doctor, ionicLoading, New) {
  $scope.grouppatients0 = ''
  $scope.grouppatients1 = ''
  $scope.params = {
    teamId: ''
  }
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.grouppatients1 = ''
    $scope.grouppatients2 = ''
    $scope.params.teamId = $state.params.teamId
    $scope.load()
  })
  /**
   * 加载事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.load = function () {
    Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 1 }) // 1->进行中
            .then(function (data) {
              console.log(data)
              New.addNews($scope.params.teamId, Storage.get('UID'), data.results, 'consultationId')
                .then(function (pats) {
                  $scope.grouppatients0 = pats
                }, function (err) {

                })
            }, function (err) {
              console.log(err)
            })
    Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 0 }) // 0->已处理
            .then(function (data) {
              console.log(data)
              New.addNews($scope.params.teamId, Storage.get('UID'), data.results, 'consultationId')
                .then(function (pats) {
                  $scope.grouppatients1 = pats
                }, function (err) {

                })
            }, function (err) {
              console.log(err)
            })
  }
  /**
   * 刷新事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.doRefresh = function () {
    $scope.load()
        // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete')
  }
  /**
   * 点击进入聊天
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {str}      type   聊天类型
   * @param    {arr}      patient 那个病人的信息
   * @return   {[type]}
   */
  $scope.enterChat = function (type, patient) {
    $state.go('tab.group-chat', { type: type, teamId: $scope.params.teamId, groupId: patient.consultationId})
  }
  /**
   * 返回
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.backToGroups = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    })
    $state.go('tab.groups', { type: '0' })
  }
}])
/**
 * 加群
 * @Author   zyh
 * @DateTime 2017-07-05
 */
.controller('GroupAddCtrl', ['$scope', '$state', '$ionicHistory', 'Communication', '$ionicPopup', 'Storage', 'Doctor', '$ionicLoading', 'CONFIG', function ($scope, $state, $ionicHistory, Communication, $ionicPopup, Storage, Doctor, $ionicLoading, CONFIG) {
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.alreadyIn = true
    var inGroup = false, me = Storage.get('UID')
    $scope.me = [{ userId: '', name: '', photoUrl: '' }]
    Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {
              console.log(data)
              $scope.group = data.results

              if (data.results.sponsorId == me) inGroup = true
              for (var i in data.results.members) {
                if (data.results.members[i].userId == me) inGroup = true
              }
              $scope.alreadyIn = inGroup
            }, function (err) {
              console.log(err)
            })
  })
  /**
   * 加群按键
   * @Author   zyh
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.request = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: '确定要加入吗?',
      okText: '确定',
      cancelText: '取消'
    })
    confirmPopup.then(function (res) {
      if (res) {
        Doctor.getDoctorInfo({ userId: Storage.get('UID') })
                    .then(function (data) {
                      $scope.me[0].userId = data.results.userId
                      $scope.me[0].name = data.results.name
                      $scope.me[0].photoUrl = data.results.photoUrl
                      var idStr = $scope.me[0].userId
                      Communication.insertMember({ teamId: $state.params.teamId, members: $scope.me })
                            .then(function (data) {
                              if (data.result == '更新成员成功') {
                                $ionicLoading.show({ template: '加入成功', duration: 1500 })
                                $ionicHistory.nextViewOptions({ disableBack: true })
                                $state.go('tab.groups', { type: '0' })
                              } else {
                                $ionicLoading.show({ template: '你已经是成员了', duration: 1500 })
                              };
                            })
                    })
      }
    })
  }
}])
/**
 * 单聊界面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('detailCtrl', ['$ionicPlatform', '$scope', '$state', '$rootScope', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', '$http', 'CONFIG', 'arrTool', 'Communication', 'Counsel', 'Storage', 'Doctor', 'Patient', '$q', 'New', 'Mywechat', 'Account', 'socket', 'notify', '$timeout', function ($ionicPlatform, $scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicHistory, $ionicPopover, $ionicPopup, Camera, voice, $http, CONFIG, arrTool, Communication, Counsel, Storage, Doctor, Patient, $q, New, Mywechat, Account, socket, notify, $timeout) {
  if ($ionicPlatform.is('ios')) cordova.plugins.Keyboard.disableScroll(true)

  $scope.input = {
    text: ''
  }
  $scope.photoUrls = {}
  $scope.params = {
        // [type]:0=已结束;1=进行中;2=医生
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
    loaded: false,
    recording: false
  }

  $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll')
  /**
   * 滚动到底部
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {bool}   animate 是否要动画
   * @param    {number}   delay   延时
   * @return   {null}           
   */
  function toBottom (animate, delay) {
    if (!delay) delay = 100
    $timeout(function () {
      $scope.scrollHandle.scrollBottom(animate)
    }, delay)
  }
    // render msgs
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.timer = []
    $scope.photoUrls = {}
    $scope.msgs = []
    $scope.params.chatId = $state.params.chatId
    $scope.params.counselId = $state.params.counselId
    $scope.params.type = $state.params.type
        // 消息初次加载
    $scope.params.loaded = false
    $scope.params.msgCount = 0

        // 消息字段
    $scope.params.targetRole = ''
    $scope.params.newsType = $scope.params.type == '2' ? '12' : '11'

    try {
      notify.remove($scope.params.chatId)
    } catch (e) {}
    console.log($scope.params)

    if ($scope.params.type == '2') {
      $scope.params.title = '医生交流'
      $scope.params.targetRole = 'doctor'
      Doctor.getDoctorInfo({ userId: $scope.params.chatId })
                .then(function (data) {
                  $scope.params.targetName = data.results.name
                  $scope.photoUrls[data.results.userId] = data.results.photoUrl
                })
    } else {
      $scope.params.title = '咨询'
      $scope.params.targetRole = 'patient'
      Patient.getPatientDetail({ userId: $state.params.chatId })
                .then(function (data) {
                  $scope.params.targetName = data.results.name
                  $scope.photoUrls[data.results.userId] = data.results.photoUrl
                })
            // 获取counsel信息
      Counsel.getStatus({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                .then(function (data) {
                  console.log(data)
                  $scope.params.counsel = data.result
                  $scope.params.counselId = data.result.counselId
                  $scope.counseltype = data.result.type == '3' ? '2' : data.result.type
                  $scope.params.type = data.result.status
                  $scope.counselstatus = data.result.status
                  $scope.params.realCounselType = data.result.type
                  Account.getCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                        .then(function (res) {
                          if ($scope.params.loaded) {
                            return sendNotice($scope.counseltype, $scope.counselstatus, res.result.count)
                          } else {
                            var connectWatcher = $scope.$watch('params.loaded', function (newv, oldv) {
                              if (newv) {
                                connectWatcher()
                                return sendNotice($scope.counseltype, $scope.counselstatus, res.result.count)
                              }
                            })
                          }
                        })
                }, function (err) {
                  console.log(err)
                })
    }

    var loadWatcher = $scope.$watch('params.loaded', function (newv, oldv) {
      if (newv) {
        loadWatcher()
        if ($scope.msgs.length == 0) return
        var lastMsg = $scope.msgs[$scope.msgs.length - 1]
        if (lastMsg.fromID == $scope.params.UID) return
        return New.insertNews({ userId: lastMsg.targetID, sendBy: lastMsg.fromID, type: $scope.params.newsType, readOrNot: 1 })
      }
    })
  })

  $scope.$on('$ionicView.enter', function () {
    if ($rootScope.conversation) {
      $rootScope.conversation.type = 'single'
      $rootScope.conversation.id = $state.params.chatId
    }
    Doctor.getDoctorInfo({ userId: $scope.params.UID })
            .then(function (response) {
              thisDoctor = response.results
              $scope.photoUrls[response.results.userId] = response.results.photoUrl
            }, function (err) {
              console.log(err)
            })
    imgModalInit()
    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
      toBottom(true, 400)
      $scope.params.loaded = true
    })
  })

  $scope.$on('keyboardshow', function (event, height) {
    $scope.params.helpDivHeight = height
    toBottom(true, 100)
  })
  $scope.$on('keyboardhide', function (event) {
    $scope.params.helpDivHeight = 0
    $scope.scrollHandle.resize()
  })
  $scope.$on('$ionicView.beforeLeave', function () {
    for (var i in $scope.timer) clearTimeout($scope.timer[i])
    if ($scope.popover) $scope.popover.hide()
  })
  $scope.$on('$ionicView.leave', function () {
    if ($scope.params.type == '2' && $scope.msgs.length) { Communication.updateLastTalkTime($scope.params.chatId, $scope.msgs[$scope.msgs.length - 1].createTimeInMillis) }
    $scope.msgs = []
    if ($scope.modal) $scope.modal.remove()
    $rootScope.conversation.type = null
    $rootScope.conversation.id = ''
  })
  /**
   * 收到消息事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    event
   * @param    {object}   data     消息体
   * @return   {null}            
   */
  $scope.$on('im:getMsg', function (event, data) {
    console.log(arguments)
    console.info('getMsg')
    console.log(data)
    if (data.msg.targetType == 'single' && data.msg.fromID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
      $scope.$apply(function () {
        insertMsg(data.msg)
      })
      if ($scope.params.type != '2' && data.msg.contentType == 'custom' && (data.msg.content.type == 'card' || data.msg.content.type == 'counsel-payment')) {
        Communication.getCounselReport({ counselId: data.msg.content.counselId })
                    .then(function (data) {
                      console.log(data)
                      $scope.params.counsel = data.results
                      $scope.counseltype = data.results.type == '3' ? '2' : data.results.type
                      $scope.counselstatus = data.results.status
                      $scope.params.realCounselType = data.results.type
                    }, function (err) {
                      console.log(err)
                    })
      }
      if (data.msg.contentType == 'custom' && data.msg.content.type == 'counsel-upgrade') {
        $scope.$apply(function () {
          $scope.counseltype = '2'
        })
        $scope.counselstatus = 1
      }
      New.insertNews({ userId: $scope.params.UID, sendBy: $scope.params.chatId, type: $scope.params.newsType, readOrNot: 1 })
    }
  })
  /**
   * 收到消息回执事件
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    event
   * @param    {object}   data     消息体
   * @return   {null}            
   */
  $scope.$on('im:messageRes', function (event, data) {
    console.log(arguments)
    console.info('messageRes')
    console.log(data)
    if (data.msg.targetType == 'single' && data.msg.targetID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
      $scope.$apply(function () {
        insertMsg(data.msg)
      })
      if ($scope.counselstatus == 1 && $scope.counseltype == 1 && !(data.msg.contentType == 'custom' && data.msg.content.type == 'count-notice')) {
        Account.modifyCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId, modify: '-1' })
                    .then(function () {
                      Account.getCounts({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
                            .then(function (data) {
                              if (data.result.count <= 0) {
                                $scope.counselstatus = 0
                                $scope.params.title = '咨询'
                                endCounsel(1)
                              }
                            })
                    })
      }
    }
  })
  /**
   * 发送通知
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  function sendNotice (type, status, cnt) {
        // var t = setTimeout(function(){
    return sendCnNotice(type, status, cnt)
        // },500);
        // $scope.timer.push(t);
  }
  /**
   * 提示剩余条数的通知
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  /**
   * [sendCnNotice description]
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {string}   type   咨询/问诊
   * @param    {string}   status 是否进行中
   * @param    {number}   cnt    剩余次数
   * @return   {null}          
   */
  function sendCnNotice (type, status, cnt) {
    var len = $scope.msgs.length
    if (len == 0 || !($scope.msgs[len - 1].content.type == 'count-notice' && $scope.msgs[len - 1].content.count == cnt)) {
      var bodyDoc = ''
      if (type != '1') {
        if (status == '0') {
          bodyDoc = '您仍可以向患者追加回答，该消息不计费'
          bodyPat = '您没有提问次数了。如需提问，请新建咨询或问诊'
        } else {
          bodyDoc = '患者提问不限次数'
          bodyPat = '您可以不限次数进行提问'
        }
      } else {
        if (cnt <= 0 || status == '0') {
          bodyDoc = '您仍可以向患者追加回答，该消息不计费'
          bodyPat = '您没有提问次数了。如需提问，请新建咨询或问诊'
        } else {
          bodyDoc = '您还需要回答' + cnt + '个问题'
          bodyPat = '您还有' + cnt + '次提问机会'
        }
      }

      var notice = {
        type: 'count-notice',
        ctype: type,
        cstatus: status,
        count: cnt,
        bodyDoc: bodyDoc,
        bodyPat: bodyPat,
        counseltype: $scope.counseltype
      }
      var msgJson = {
        clientType: 'doctor',
        contentType: 'custom',
        fromID: $scope.params.UID,
        fromName: '',
        fromUser: {
                    // avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
        },
        targetID: $scope.params.chatId,
        targetName: $scope.params.targetName,
        targetType: 'single',
        status: 'send_going',
        createTimeInMillis: Date.now(),
        newsType: $scope.params.newsType,
        targetRole: $scope.params.targetRole,
        content: notice
      }
            // socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
      $scope.msgs.push(msgJson)
            // toBottom(true,300);
            // $scope.pushMsg(msgJson);
    }
  }
  /**
   * 获取消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {num}   num   获取的数量
   * @return   {promise}
   */
  $scope.getMsg = function (num) {
    console.info('getMsg')
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
                  console.log(data)
                  var d = data.results
                  $scope.$broadcast('scroll.refreshComplete')
                  if (d == '没有更多了!') return noMore()
                  var res = []
                  for (var i in d) {
                    res.push(d[i].content)
                  }
                  if (res.length == 0) $scope.params.moreMsgs = false
                  else {
                    $scope.params.msgCount += res.length
                    if ($scope.msgs.length != 0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000
                    for (var i = 0; i < res.length - 1; ++i) {
                      if (res[i].contentType == 'image') res[i].content.thumb = CONFIG.mediaUrl + res[i].content['src_thumb']
                      res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive'
                      res[i].diff = (res[i].time - res[i + 1].time) > 300000
                      $scope.msgs.unshift(res[i])
                    }
                    res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive'
                    res[i].diff = true
                    $scope.msgs.unshift(res[i])
                  }
                  console.log($scope.msgs)
                  resolve($scope.msgs)
                }, function (err) {
                  $scope.$broadcast('scroll.refreshComplete')
                  resolve($scope.msgs)
                })
    })
  }
  /**
   * 没有更多了
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {}
   */
  function noMore () {
    $scope.params.moreMsgs = false
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.params.moreMsgs = true
      })
    }, 5000)
  }
  /**
   * 再加载15条
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.DisplayMore = function () {
    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
    })
  }
  /**
   * 滚到底了
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.scrollBottom = function () {
    $scope.showVoice = false
    $scope.showMore = false
    $scope.scrollHandle.scrollBottom(true)
  }
    // 长按工具条
  var options = [{
    name: '转发医生'
  }, {
    name: '转发团队'
  }]
  $ionicPopover.fromTemplateUrl('partials/others/toolbox-pop.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.options = options
    $scope.popover = popover
  })
    // view image
    /**
     * 图片模板初始化
     * @Author   xjz
     * @DateTime 2017-07-05
     * @return   {[type]}
     */
  function imgModalInit () {
    $scope.zoomMin = 1
    $scope.imageUrl = ''
    $scope.sound = {}
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal
            // $scope.modal.show();
      $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
    })
  }

  $scope.$on('image', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src || args[2].src_thumb))
    $scope.modal.show()
  })
  /**
   * 关掉图片
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
  }
  /**
   * 调整缩放
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }
  /**
   * 事件：听语音消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    事件
   * @param    {array}    args     ['voice',msg.content]
   * @return   {null}            
   */
  $scope.$on('voice', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.sound = new Media(args[1],
            function () {
            },
            function (err) {
              console.log(err)
            })
    $scope.sound.play()
  })
  /**
   * 事件：长按消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    事件
   * @param    {array}    args     ['holdmsg',msg.createTimeInMillis,$event]
   * @return   {null}            
   */
  $scope.$on('holdmsg', function (event, args) {
    event.stopPropagation()
    $scope.holdId = args[1]
    console.log(args)
    $scope.popover.show(args[2])
  })
  /**
   * 事件：点击card
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    事件
   * @param    {array}    args     ['viewcard',msg,$event]
   * @return   {null}            
   */
  $scope.$on('viewcard', function (event, args) {
    event.stopPropagation()
    console.log(args[2])
    if (args[2].target.tagName == 'IMG') {
      $scope.imageHandle.zoomTo(1, true)
      $scope.imageUrl = args[2].target.currentSrc
      console.log(args[2].target.attributes.hires.nodeValue)
      $scope.modal.show()
    } else {
      Storage.set('getpatientId', args[1].content.patientId)

      var statep = {
        type: $scope.params.type,
        chatId: $scope.params.chatId
      }
      Storage.set('backId', 'tab.detail')
      Storage.set('singleChatParams', JSON.stringify(statep))
      $state.go('tab.patientDetail')
            // $state.go('tab.consult-detail',{consultId:args[1]});
    }
        // $state.go('tab.consult-detail',{consultId:args[1]});
  })
  /**
   * 选转发给团队/医生
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {num}  data  两种选择
   * @return   {[type]}
   */
  $scope.toolChoose = function (data) {
        // console.log(data);
    var content = $scope.msgs[arrTool.indexOf($scope.msgs, 'createTimeInMillis', $scope.holdId)].content
    if (data == 0) $state.go('tab.selectDoc', { msg: content })
    if (data == 1) $state.go('tab.selectTeam', { msg: content })
  }
  /**
   * 事件：点击头像
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   event    事件
   * @param    {array}    args     ['profile',msg]
   * @return   {null}            
   */
  $scope.$on('profile', function (event, args) {
    event.stopPropagation()
    if (args[1].direct == 'receive') {
      if ($scope.params.type == '2') {
        return $state.go('tab.group-profile', { memberId: args[1].fromID})
      } else {
        Storage.set('getpatientId', args[1].fromID)
        var statep = {
          type: $scope.params.type,
          chatId: $scope.params.chatId
        }
        Storage.set('backId', 'tab.detail')
        Storage.set('singleChatParams', JSON.stringify(statep))
        return $state.go('tab.patientDetail')
      }
    }
  })
  /**
   * 结束咨询问诊
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {num}     type  咨询还是问诊
   * @return   {[type]}
   */
  function endCounsel (type) {
    Counsel.changeStatus({doctorId: Storage.get('UID'), patientId: $scope.params.chatId, type: type, status: 0})
        .then(function (data) {
          var endlMsg = {
            type: 'endl',
            info: '咨询已结束',
            docId: thisDoctor.userId,
            counseltype: 1
          }
          if (type == 2) {
            endlMsg.info = '问诊已结束'
            endlMsg.counseltype = 2
          }
          var msgJson = {
            clientType: 'doctor',
            contentType: 'custom',
            fromID: thisDoctor.userId,
            fromName: thisDoctor.name,
            fromUser: {
              avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + thisDoctor.userId + '_myAvatar.jpg'
            },
            targetID: $scope.params.chatId,
            targetName: $scope.params.targetName,
            targetType: 'single',
            status: 'send_going',
            createTimeInMillis: Date.now(),
            newsType: $scope.params.newsType,
            targetRole: 'patient',
            content: endlMsg
          }
          socket.emit('message', {msg: msgJson, to: $scope.params.chatId, role: 'doctor'})
          $scope.counselstatus = '0'
          $scope.pushMsg(msgJson)
        })
    Counsel.changeCounselStatus({counselId: $state.params.counselId, status: 0})
  }
  /**
   * 结束咨询按钮
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.finishConsult = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: '确定要结束此次咨询吗?',
            // template: '确定要结束此次咨询吗?'
      okText: '确定',
      cancelText: '取消'
    })
    confirmPopup.then(function (res) {
      if (res) {
        Account.modifyCounts({doctorId: Storage.get('UID'), patientId: $scope.params.chatId, modify: '900'})
                .then(function () {
                  endCounsel($scope.params.realCounselType)
                }, function (err) {
                  console.error(err)
                })
      } else {
      }
    })
  }
  /**
   * 更新一条消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   msg 消息体
   * @param    {number}   pos msg在msgs中的下标
   * @return   {null}       
   */
  $scope.updateMsg = function (msg, pos) {
    console.info('updateMsg')
    if (pos == 0) {
      msg.diff = true
    } else if (msg.hasOwnProperty('time')) {
      var m = $scope.msgs[pos - 1]
      if (m.contentType == 'custom' && m.content.type == 'count-notice' && pos > 1) {
        m = $scope.msgs[pos - 2]
      }
      if (m.hasOwnProperty('time')) {
        msg.diff = (msg.time - m.time) > 300000
      } else {
        msg.diff = false
      }
    }

    msg.content.src = $scope.msgs[pos].content.src
    msg.direct = $scope.msgs[pos].direct
    $scope.msgs[pos] = msg
  }
  /**
   * 消息加入队列
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {obj}     msg    那条消息
   * @return   {[type]}
   */
  $scope.pushMsg = function (msg) {
    console.info('pushMsg')
    var len = $scope.msgs.length
    if (msg.hasOwnProperty('time')) {
      if (len == 0) {
        msg.diff = true
      } else {
        var m = $scope.msgs[len - 1]
        if (m.contentType == 'custom' && m.content.type == 'count-notice' && len > 1) {
          m = $scope.msgs[len - 2]
        }
        if (m.hasOwnProperty('time')) {
          msg.diff = (msg.time - m.time) > 300000
        }
      }
    }
        // msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
    $scope.params.msgCount++
    $scope.msgs.push(msg)
    toBottom(true, 200)
    toBottom(true, 600)
    setTimeout(function () {
      var pos = arrTool.indexOf($scope.msgs, 'createTimeInMillis', msg.createTimeInMillis)
      if (pos != -1 && $scope.msgs[pos].status == 'send_going') $scope.msgs[pos].status = 'send_fail'
    }, 10000)
  }
  /**
   * 插入消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   msg 消息
   * @return   {null}       
   */
  function insertMsg (msg) {
    var pos = arrTool.indexOf($scope.msgs, 'createTimeInMillis', msg.createTimeInMillis)
    if (pos == -1) {
      $scope.pushMsg(msg)
    } else {
      $scope.updateMsg(msg, pos)
    }
  }
    // send message--------------------------------------------------------------------------------
    //
  /**
   * 生成消息体
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   content 用于生成msg.content字段
   * @param    {string}   type    msg type
   * @return   {[type]}           [description]
   */
  function msgGen (content, type) {
    var data = {}
    if (type == 'text') {
      data = {
        text: content
      }
    } else if (type == 'image') {
      data = {
        src: content[0],
        src_thumb: content[1]
      }
    } else if (type == 'voice') {
      data = {
        src: content
      }
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
    return msgJson
  }
  /**
   * 生成消息体，用于消息发送成功前，页面显示。发送成功后，$scope.updateMsg更新该消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   msg 消息
   * @param    {string}   url 资源本地路径（图片等）
   * @return   {[type]}       [description]
   */
  function localMsgGen (msg, url) {
    var d = {},
      type = msg.contentType
    if (type == 'image') {
      d.src = msg.content.src
      d.src_thumb = msg.content.src_thumb
      d.localPath = url
    } else if (type == 'voice') {
      d.localPath = url
      d.src = msg.content.src
    }
    return {
      clientType: 'doctor',
      contentType: type,
      fromID: msg.fromID,
      fromName: msg.fromName,
      fromUser: msg.fromUser,
      targetID: msg.targetID,
      targetName: msg.targetName,
      targetType: 'single',
      status: 'send_going',
      createTimeInMillis: msg.createTimeInMillis,
      newsType: msg.newsType,
      targetRole: $scope.params.targetRole,
      content: d
    }
  }
  /**
   * 发送消息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   content msg.content相关
   * @param    {string}   type    消息类型
   * @return   {[type]}           [description]
   */
  function sendmsg (content, type) {
    var msgJson = msgGen(content, type)
    console.info('[socket.connected]', socket.connected)
    socket.emit('message', {msg: msgJson, to: $scope.params.chatId, role: 'doctor'})
    $scope.pushMsg(msgJson)
  }
  /**
   * 点击输入框提交按钮
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}   [description]
   */
  $scope.submitMsg = function () {
    var template = {
      'userId': $scope.params.chatId, // 患者的UID
      'role': 'patient',
      'postdata': {
        'template_id': 'N_0kYsmxrQq-tfJhGUo746G8Uem6uHZgK138HIBKI2I',
        'data': {
          'first': {
            'value': '您的' + ($scope.counseltype == 1 ? '咨询' : '问诊') + $scope.params.counsel.symptom + '已被回复！', // XXX取那个咨询或问诊的标题
            'color': '#173177'
          },
          'keyword1': {
            'value': $scope.params.counsel.help, // 咨询的问题
            'color': '#173177'
          },
          'keyword2': {
            'value': $scope.input.text, // 医生的回复
            'color': '#173177'
          },
          'keyword3': {
            'value': thisDoctor.name, // 回复医生的姓名
            'color': '#173177'
          },
          'remark': {
            'value': '感谢您的使用！',
            'color': '#173177'
          }
        }
      }
    }
    Mywechat.messageTemplate(template)
    sendmsg($scope.input.text, 'text')
    $scope.input.text = ''
  }

/**
 * 捕捉上传的图片
 * @Author   xjz
 * @DateTime 2017-07-05
 * @param    {[type]}
 * @return   {[type]}
 */
  $scope.getImage = function (type) {
    $scope.showMore = false
    Camera.getPicture(type, true)
            .then(function (url) {
              console.log(url)
              var fm = md5(Date.now(), $scope.params.chatId) + '.jpg',
                d = [
                  'uploads/photos/' + fm,
                  'uploads/photos/resized' + fm
                ],
                imgMsg = msgGen(d, 'image'),
                localMsg = localMsgGen(imgMsg, url)
              $scope.pushMsg(localMsg)
              Camera.uploadPicture(url, fm)
                    .then(function () {
                      socket.emit('message', {msg: imgMsg, to: $scope.params.chatId, role: 'doctor'})
                    }, function () {
                      $ionicLoading.show({ template: '图片上传失败', duration: 2000 })
                    })
            }, function (err) {
                // console.error(err);
            })
  }

  /**
   * 上传的语音
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.getVoice = function () {
        // voice.record() do 2 things: record --- file manipulation
    voice.record()
            .then(function (fileUrl) {
              $scope.params.recording = false
                // window.JMessage.sendSingleVoiceMessage($state.params.chatId, fileUrl, $scope.params.key, onSendSuccess, onSendErr);
              viewUpdate(5, true)
            }, function (err) {
              console.log(err)
            })
    $scope.params.recording = true
  }
  /**
   * 停止录音
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.stopAndSend = function () {
    voice.stopRec()
  }
  /**
   * 进团队聊天页面
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goChats = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    })
    if ($state.params.type == '1') $state.go('tab.doing')
    else if ($state.params.type == '0') $state.go('tab.did')
    else $state.go('tab.groups', { type: '1' })
  }
}])
/**
 * 团队详情页面
 * @Author   zyh
 * @DateTime 2017-07-05
 */
.controller('GroupDetailCtrl', ['$scope', '$state', '$ionicModal', 'Communication', '$ionicPopup', 'Storage', 'Doctor', function ($scope, $state, $ionicModal, Communication, $ionicPopup, Storage, Doctor) {
  $scope.$on('$ionicView.beforeEnter', function () {
    Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {
              $scope.team = data.results
              $scope.members2 = data.results.members
              Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
                    .then(function (data) {
                      console.log(data)
                        // $scope.members1=data.results;
                      $scope.members = $scope.members2.concat(data.results)
                      console.log($scope.members1)
                    })
              if ($scope.team.sponsorId == Storage.get('UID')) $scope.ismyteam = true
              else $scope.ismyteam = false
            }, function (err) {
              console.log(err)
            })
  })
  /**
   * 团队加人
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.addMember = function () {
    console.log($scope.team.teamId)
    $state.go('tab.group-add-member', {teamId: $scope.team.teamId})
  }
  /**
   * 查看医生信息
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {object}   member doctor
   * @return   {[type]}          [description]
   */
  $scope.viewProfile = function (member) {
    $state.go('tab.group-profile', {memberId: member.userId})
  }
  /**
   * 查看团队二维码
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}   [description]
   */
  $scope.showQRCode = function () {
    $state.go('tab.group-qrcode', { team: $scope.team })
  }
  /**
   * state.go团队踢人 
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}   [description]
   */
  $scope.gokick = function () {
    $state.go('tab.group-kick', { teamId: $scope.team.teamId })
  }
}])
/**
 * 踢人页面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('GroupKickCtrl', ['$scope', '$state', '$ionicModal', 'Communication', '$ionicPopup', 'Storage', 'CONFIG', function ($scope, $state, $ionicModal, Communication, $ionicPopup, Storage, CONFIG) {
  $scope.$on('$ionicView.beforeEnter', function () {
    Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {
              $scope.teamname = data.results.name
              $scope.doctors = data.results.members
            }, function (err) {
              console.log(err)
            })
  })

  $scope.kick = function (id) {
    var confirmPopup = $ionicPopup.confirm({
      title: '确定要将此人移出团队吗?',
      okText: '确定',
      cancelText: '取消'
    })
    confirmPopup.then(function (res) {
      if (res) {
        Communication.removeMember({ teamId: $state.params.teamId, membersuserId: $scope.doctors[id].userId })
                    .then(function (data) {
                      if (data.result == '更新成员成功') {
                        Communication.getTeam({ teamId: $state.params.teamId })
                                .then(function (data) {
                                  $scope.doctors = data.results.members
                                }, function (err) {
                                })
                      };
                    }, function (err) {
                      console.log(err)
                    })
      }
    })
  }
}])
/**
 * 团队二维码页面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('GroupQrcodeCtrl', ['$scope', '$state', function ($scope, $state) {
  $scope.params = {
    team: {}
  }
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.team = $state.params.team
  })
}])
/**
 * 拉人页面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('GroupAddMemberCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG', function ($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG) {
  $scope.searchStyle = {'margin-top': '44px'}
  if (ionic.Platform.isIOS()) {
    $scope.searchStyle = {'margin-top': '64px'}
  }
  $scope.memStyle = {'padding': '3px 16px', 'position': 'absolute', 'top': '88px', 'height': '50px', 'width': '100%', 'margin': '0', 'max-height': '30vh', 'overflow-y': 'scroll'}
  if (ionic.Platform.isIOS()) {
    $scope.memStyle = {'padding': '3px 16px', 'position': 'absolute', 'top': '108px', 'height': '50px', 'width': '100%', 'margin-top': '0px', 'max-height': '30vh', 'overflow-y': 'scroll'}
  }
    // get groupId via $state.params.groupId
  $scope.moredata = true
  $scope.issearching = true
  $scope.isnotsearching = false
  $scope.group = {
    members: []
  }
  $scope.doctors = []
  $scope.alldoctors = []
  $scope.skipnum = 0
  /**
   * 刷新
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {[type]}
   * @return   {[type]}
   */
  $scope.update = function (id) {
    if ($scope.doctors[id].check) $scope.group.members.push({ photoUrl: $scope.doctors[id].photoUrl, name: $scope.doctors[id].name, userId: $scope.doctors[id].userId })
    else $scope.group.members.splice(arrTool.indexOf($scope.group.members, 'userId', $scope.doctors[id].userId), 1)
  }
  /**
   * 底端加载
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.loadMore = function () {
    Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function (data) {
              console.log(data.results)
              $scope.$broadcast('scroll.infiniteScrollComplete')

              $scope.alldoctors = $scope.alldoctors.concat(data.results)
              $scope.doctors = $scope.alldoctors
              $scope.nexturl = data.nexturl
              var skiploc = data.nexturl.indexOf('skip')
              $scope.skipnum = data.nexturl.substring(skiploc + 5)
              if (data.results.length == 0) { $scope.moredata = false } else { $scope.moredata = true };
            }, function (err) {
              console.log(err)
            })
  }
  /**
   * 搜索医生
   * @Author   zyh
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goSearch = function () {
    $scope.isnotsearching = true
    $scope.issearching = false

    $scope.moredata = false
    Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function (data) {
              console.log(data.results)
              $scope.doctors = data.results
              if (data.results.length == 0) {
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
              }
            }, function (err) {
              console.log(err)
            })
  }
    // $scope.closeSearch = function() {
    //     $scope.issearching = true;
    //     $scope.isnotsearching = false;

    //     $scope.moredata = true;
    //     $scope.doctors = $scope.alldoctors;
    //     $scope.search.name = '';

    // }
    /**
     * 圆×
     * @Author   zyh
     * @DateTime 2017-07-05
     * @return   {[type]}
     */
  $scope.clearSearch = function () {
    $scope.search.name = ''
    $scope.issearching = true
    $scope.isnotsearching = false

    $scope.moredata = true
    $scope.doctors = $scope.alldoctors
    $scope.search.name = ''
  }
  /**
   * 确定拉人
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.confirmAdd = function () {
    if ($state.params.type == 'new') {
      $rootScope.newMember = $rootScope.newMember.concat($scope.group.members)
      $ionicHistory.goBack()
    } else {
      Communication.insertMember({ teamId: $state.params.teamId, members: $scope.group.members })
                .then(function (data) {
                  console.log(data.result)
                  if (data.result == '更新成员成功') {
                    $ionicLoading.show({ template: '添加成功', duration: 1000 })
                  }
                  setTimeout(function () { $ionicHistory.goBack() }, 1000)
                })
    }
  }
}])

/**
 * 群聊界面
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('GroupChatCtrl', ['$ionicPlatform', '$scope', '$state', '$ionicHistory', '$http', '$ionicModal', '$ionicScrollDelegate', '$rootScope', '$stateParams', '$ionicPopover', '$ionicLoading', '$ionicPopup', 'Camera', 'voice', 'Communication', 'Storage', 'Doctor', '$q', 'CONFIG', 'arrTool', 'New', 'socket', 'notify', '$timeout', function ($ionicPlatform, $scope, $state, $ionicHistory, $http, $ionicModal, $ionicScrollDelegate, $rootScope, $stateParams, $ionicPopover, $ionicLoading, $ionicPopup, Camera, voice, Communication, Storage, Doctor, $q, CONFIG, arrTool, New, socket, notify, $timeout) {
  if ($ionicPlatform.is('ios')) cordova.plugins.Keyboard.disableScroll(true)
  $scope.itemStyle = {'position': 'absolute', 'top': '44px', 'width': '100%', 'margin': '0', 'min-height': '35vh', 'max-height': '55vh', 'overflow-y': 'scroll'}
  if (ionic.Platform.isIOS()) {
    $scope.itemStyle = {'position': 'absolute', 'top': '64px', 'width': '100%', 'margin': '0', 'min-height': '35vh', 'max-height': '55vh', 'overflow-y': 'scroll'}
  }
  $scope.input = {
    text: ''
  }
  $scope.photoUrls = {}
  $scope.params = {
    type: '', // '0':团队交流  '1': 未结束病历  '2':已结束病历
    groupId: '',
    teamId: '',
    team: {},
    msgCount: 0,
    title: '',
    helpDivHeight: 0,
    hidePanel: true,
    isDiscuss: false,
    isOver: false,
    UID: Storage.get('UID'),
    newsType: '', // 消息字段
    targetName: '', // 消息字段
    moreMsgs: true,
    recording: false,
    loaded: false
  }
  $rootScope.patient = {}

  $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll')
  function toBottom (animate, delay) {
    if (!delay) delay = 100
    $timeout(function () {
      $scope.scrollHandle.scrollBottom(animate)
    }, delay)
  }
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.photoUrls = {}
    $rootScope.patient = {}
    $scope.msgs = []
    $scope.params.msgCount = 0
    $scope.params.type = $state.params.type
    $scope.params.groupId = $state.params.groupId
    $scope.params.teamId = $state.params.teamId
    $scope.params.loaded = false
    try {
      notify.remove($scope.params.groupId)
    } catch (e) {}

    Doctor.getDoctorInfo({userId: Storage.get('UID')})
            .then(function (data) {
              thisDoctor = data.results
              $scope.photoUrls[data.results.userId] = data.results.photoUrl
            })
    if ($scope.params.type == '0') {
      $scope.params.newsType = '13'
      Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function (data) {
                  console.log(data)
                  $scope.params.team = data.results
                  $scope.params.title = $scope.params.team.name + '(' + $scope.params.team.number + ')'
                  $scope.params.targetName = $scope.params.team.name
                  getSponsor(data.results.sponsorId)
                  for (i = 0; i < data.results.members.length; i++) {
                    $scope.photoUrls[data.results.members[i].userId] = data.results.members[i].photoUrl
                  }
                })
    } else if ($scope.params.type == '1') { // 进行中
      getConsultation()
      $scope.params.newsType = $scope.params.teamId
      $scope.params.hidePanel = true
      $scope.params.title = '病历'
      $scope.params.isDiscuss = true
    } else if ($scope.params.type == '2') { // 已处理
      getConsultation()

      $scope.params.newsType = $scope.params.teamId
      $scope.params.hidePanel = false
      $scope.params.title = '病历'
      $scope.params.isDiscuss = true
      $scope.params.isOver = true
    }
  })
  $scope.$on('$ionicView.enter', function () {
    console.log($scope.photoUrls)
    $rootScope.conversation.type = 'group'
    $rootScope.conversation.id = $scope.params.groupId
    var loadWatcher = $scope.$watch('params.loaded', function (newv, oldv) {
      if (newv) {
        loadWatcher()
        if ($scope.msgs.length == 0) return
        var lastMsg = $scope.msgs[$scope.msgs.length - 1]
        if (lastMsg.fromID == $scope.params.UID) return
        return New.insertNews({ userId: $scope.params.UID, sendBy: lastMsg.targetID, type: $scope.params.newsType, readOrNot: 1 })
      }
    })
    imgModalInit()
    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
      toBottom(true, 400)
      $scope.params.loaded = true
    })
  })

  $scope.$on('keyboardshow', function (event, height) {
    $scope.params.helpDivHeight = height
    toBottom(true, 100)
  })
  $scope.$on('keyboardhide', function (event) {
    $scope.params.helpDivHeight = 0
    $scope.scrollHandle.resize()
  })
  $scope.$on('$ionicView.beforeLeave', function () {
    if ($scope.popover) $scope.popover.hide()
    if ($scope.modal) $scope.modal.remove()
  })
  $scope.$on('$ionicView.leave', function () {
    $scope.msgs = []
    $rootScope.conversation.type = null
    $rootScope.conversation.id = ''
  })
  $scope.$on('im:getMsg', function (event, data) {
    console.info('getMsg')
    console.log(data)
    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
      $scope.$apply(function () {
        insertMsg(data.msg)
      })
      New.insertNews({userId: $scope.params.UID, sendBy: $scope.params.groupId, type: $scope.params.newsType, readOrNot: 1})
    }
  })
  $scope.$on('im:messageRes', function (event, data) {
    console.info('messageRes')
    console.log(data)
    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
      $scope.$apply(function () {
        insertMsg(data.msg)
      })
    }
  })
  /**
   * 获取病例讨论结论
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  function getConsultation () {
    Communication.getConsultation({ consultationId: $scope.params.groupId })
        .then(function (data) {
          $scope.viewChat = viewChatFn(data.result.sponsorId.userId, data.result.patientId.userId)
          $scope.params.title += '-' + data.result.patientId.name
          console.log(data)
          $rootScope.patient = data.result
          Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function (res) {
                  $scope.params.team = res.results
                  $scope.params.targetName = '[' + data.result.patientId.name + ']' + $scope.params.team.name
                  getSponsor(res.results.sponsorId)
                  for (i = 0; i < res.results.members.length; i++) {
                    $scope.photoUrls[res.results.members[i].userId] = res.results.members[i].photoUrl
                  }
                })
        })
  }
  /**
   * 查看病例讨论前的聊天记录
   * @Author   xjz
   * @DateTime 2017-07-05
   * @param    {[type]}
   * @param    {[type]}
   * @return   {[type]}
   */
  function viewChatFn (DID, PID) {
    return function () {
      $state.go('tab.view-chat', {doctorId: DID, patientId: PID})
    }
  }
  function getSponsor (id) {
    Doctor.getDoctorInfo({userId: id})
            .then(function (sponsor) {
              $scope.photoUrls[sponsor.results.userId] = sponsor.results.photoUrl
            })
  }
  $scope.DisplayMore = function () {
    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
    })
  }
  function noMore () {
    $scope.params.moreMsgs = false
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.params.moreMsgs = true
      })
    }, 5000)
  }
  $scope.scrollBottom = function () {
    $scope.showVoice = false
    $scope.showMore = false
    $scope.scrollHandle.scrollBottom(true)
  }

  $scope.getMsg = function (num) {
    console.log('getMsg:' + num)
    return $q(function (resolve, reject) {
      var q = {
        messageType: '2',
        id2: $scope.params.groupId,
        skip: $scope.params.msgCount,
        limit: num
      }
      Communication.getCommunication(q)
            .then(function (data) {
              console.log(data)
              var d = data.results
              $scope.$broadcast('scroll.refreshComplete')
              if (d == '没有更多了!') return noMore()
              var res = []
              for (var i in d) {
                res.push(d[i].content)
              }
              if (res.length == 0) $scope.params.moreMsgs = false
              else {
                $scope.params.msgCount += res.length
                if ($scope.msgs.length != 0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000
                for (var i = 0; i < res.length - 1; ++i) {
                  if (res[i].contentType == 'image') res[i].content.thumb = CONFIG.mediaUrl + res[i].content['src_thumb']
                  res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive'
                  res[i].diff = (res[i].time - res[i + 1].time) > 300000
                  $scope.msgs.unshift(res[i])
                }
                res[i].direct = res[i].fromID == $scope.params.UID ? 'send' : 'receive'
                res[i].diff = true
                $scope.msgs.unshift(res[i])
              }
              console.log($scope.msgs)
              resolve($scope.msgs)
            }, function (err) {
              $scope.$broadcast('scroll.refreshComplete')
              resolve($scope.msgs)
            })
    })
  }

  $scope.togglePanel = function () {
    $scope.params.hidePanel = !$scope.params.hidePanel
  }
  $scope.viewGroup = function () {
    $state.go('tab.group-detail', {teamId: $scope.params.teamId})
  }

        // 长按工具条
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
  $scope.$on('holdmsg', function (event, args) {
    event.stopPropagation()
  })
    // view image
  function imgModalInit () {
    $scope.zoomMin = 1
    $scope.imageUrl = ''
    $scope.sound = {}
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal
      $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
    })
  }
  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
  }
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }

  $scope.$on('voice', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.sound = new Media(args[1],
            function () {
                // resolve(audio.media)
            },
            function (err) {
              console.log(err)
                // reject(err);
            })
    $scope.sound.play()
  })

  $scope.$on('image', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src || args[2].src_thumb))
    $scope.modal.show()
  })
  $scope.$on('profile', function (event, args) {
    event.stopPropagation()
    if (args[1].direct == 'receive') {
      $state.go('tab.group-profile', { memberId: args[1].fromID })
    }
  })

  $scope.$on('viewcard', function (event, args) {
    console.log(args[1])
    event.stopPropagation()

    if ($scope.params.type == '0') {
      Communication.getConsultation({ consultationId: args[1].content.consultationId})
                .then(function (data) {
                  var ctype = data.result.status
                  if (ctype == '0') ctype = '2'
                  $state.go('tab.group-chat', {'type': ctype, 'teamId': $scope.params.teamId, 'groupId': args[1].content.consultationId})
                })
    }
  })

    // $scope.toolChoose = function(data) {
    //     if (data == 0) $state.go('tab.selectDoc');
    //     if (data == 1) $state.go('tab.selectTeam');
    // }

  $scope.viewPatient = function (pid) {
    Storage.set('getpatientId', pid)
    var statep = {
      type: $scope.params.type,
      groupId: $scope.params.groupId,
      teamId: $scope.params.teamId
    }
    Storage.set('backId', 'tab.group-chat')
    Storage.set('groupChatParams', JSON.stringify(statep))
    $state.go('tab.patientDetail')
  }
  /**
   * 下面几个是发消息相关、上传语音图片
   * @Author   xjz
   * @DateTime 2017-07-05
   */
  $scope.updateMsg = function (msg, pos) {
    console.info('updateMsg')
    if (pos == 0) {
      msg.diff = true
    } else if (msg.hasOwnProperty('time') && $scope.msgs[pos - 1].hasOwnProperty('time')) {
      msg.diff = (msg.time - $scope.msgs[pos - 1].time) > 300000
    }
    msg.content.src = $scope.msgs[pos].content.src
    msg.direct = $scope.msgs[pos].direct
    $scope.msgs[pos] = msg
  }
  $scope.pushMsg = function (msg) {
    console.info('pushMsg')
    var len = $scope.msgs.length
    if (msg.hasOwnProperty('time')) {
      if (len == 0) {
        msg.diff = true
      } else {
        var m = $scope.msgs[len - 1]
        if (m.hasOwnProperty('time')) {
          msg.diff = (msg.time - m.time) > 300000
        }
      }
    }
    $scope.params.msgCount++
    $scope.msgs.push(msg)
    toBottom(true, 200)
    toBottom(true, 600)
    setTimeout(function () {
      var pos = arrTool.indexOf($scope.msgs, 'createTimeInMillis', msg.createTimeInMillis)
      if (pos != -1 && $scope.msgs[pos].status == 'send_going') $scope.msgs[pos].status = 'send_fail'
    }, 10000)
  }
  function insertMsg (msg) {
    var pos = arrTool.indexOf($scope.msgs, 'createTimeInMillis', msg.createTimeInMillis)
    if (pos == -1) {
      $scope.pushMsg(msg)
    } else {
      $scope.updateMsg(msg, pos)
    }
  }
  function msgGen (content, type) {
    var data = {}
    if (type == 'text') {
      data = {
        text: content
      }
    } else if (type == 'image') {
      data = {
        src: content[0],
        src_thumb: content[1]
      }
    } else if (type == 'voice') {
      data = {
        src: content
      }
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
      targetRole: 'doctor',
      content: data
    }
    return msgJson
  }

  function localMsgGen (msg, url) {
    var d = {},
      type = msg.contentType
    if (type == 'image') {
      d.src = msg.content.src
      d.src_thumb = msg.content.src_thumb
      d.localPath = url
    } else if (type == 'voice') {
      d.localPath = url
      d.src = msg.content.src
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

  function sendmsg (content, type) {
    var msgJson = msgGen(content, type)
    console.info('[socket.connected]', socket.connected)
    socket.emit('message', {msg: msgJson, to: $scope.params.groupId, role: 'doctor'})
    $scope.pushMsg(msgJson)
        // toBottom(true);
  }

  $scope.submitMsg = function () {
    sendmsg($scope.input.text, 'text')
    $scope.input.text = ''
  }
        // get image
  $scope.getImage = function (type) {
    $scope.showMore = false
    Camera.getPicture(type, true)
            .then(function (url) {
              console.log(url)
              var fm = md5(Date.now(), $scope.params.chatId) + '.jpg',
                d = [
                  'uploads/photos/' + fm,
                  'uploads/photos/resized' + fm
                ],
                imgMsg = msgGen(d, 'image'),
                localMsg = localMsgGen(imgMsg, url)
              $scope.pushMsg(localMsg)
              Camera.uploadPicture(url, fm)
                    .then(function () {
                      socket.emit('message', {msg: imgMsg, to: $scope.params.groupId, role: 'doctor'})
                    }, function () {
                      $ionicLoading.show({ template: '图片上传失败', duration: 2000 })
                    })
            }, function (err) {
              console.error(err)
            })
  }
        // get voice
  $scope.getVoice = function () {
        // voice.record() does 2 things: record --- file manipulation
    voice.record()
            .then(function (fileUrl) {
              window.JMessage.sendGroupVoiceMessageWithExtras($scope.params.groupId, fileUrl, $scope.msgExtra,
                    function (res) {
                      console.log(res)
                      $scope.params.recording = false
                      viewUpdate(5, true)
                      Communication.postCommunication({messageType: 2, sendBy: Storage.get('UID'), receiver: $scope.params.groupId, content: JSON.parse(res)})
                                  .then(function (data) {
                                    console.log(data)
                                  }, function (err) {
                                    console.error(err)
                                  })
                    },
                    function (err) {
                      console.log(err)
                    })
              viewUpdate(5, true)
            }, function (err) {
              console.log(err)
            })
    $scope.params.recording = true
  }
  $scope.stopAndSend = function () {
    voice.stopRec()
  }
  /**
   * 去病例讨论页面
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goChats = function () {
    console.log($ionicHistory)
    console.log($scope.params)

    $ionicHistory.nextViewOptions({
      disableBack: true
    })
    if ($scope.params.type == '0') $state.go('tab.groups', { type: '0' })
    else $state.go('tab.group-patient', { teamId: $scope.params.teamId })
  }
  /**
   * 去病历结论页面
   * @Author   zyh
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goConclusion = function () {
    $state.go('tab.group-conclusion', {groupId: $scope.params.groupId, teamId: $scope.params.teamId})
  }
}])
/**
 * 病历结论页面
 * @Author   zyh
 * @DateTime 2017-07-05
 */
.controller('GroupConclusionCtrl', ['$state', '$scope', '$ionicModal', '$ionicScrollDelegate', 'Communication', '$ionicLoading', 'CONFIG', 'Storage', 'Account', 'socket', 'mySocket', 'Counsel', function ($state, $scope, $ionicModal, $ionicScrollDelegate, Communication, $ionicLoading, CONFIG, Storage, Account, socket, mySocket, Counsel) {
  $scope.input = {
    text: ''
  }
  $scope.params = {
    type: '',
    groupId: '',
    teamId: '',
    chatId: '' /// 回复患者讨论结论
  }

  $scope.patient = {}

  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.input.text = ''
    $scope.params.type = $state.params.type
    $scope.params.groupId = $state.params.groupId
    $scope.params.teamId = $state.params.teamId
    Communication.getConsultation({ consultationId: $state.params.groupId })
            .then(function (data) {
              $scope.patient = data.result
            })
  })
  /**
   * 保存结论
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.save = function () {
    Communication.conclusion({ consultationId: $state.params.groupId, conclusion: $scope.input.text})
            .then(function (data) {
              console.log(data)
              Communication.getCounselReport({ counselId: $scope.patient.diseaseInfo.counselId })
                    .then(function (res) {
                      var DID = res.results.doctorId.userId,
                        PID = res.results.patientId.userId
                      var msgJson = {
                        clientType: 'doctor',
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
                        targetRole: 'patient',
                        content: {
                          text: $scope.input.text

                        }
                      }
                      if (res.results.type != '1') {
                            // 暂时把socket连接指向DID，用于此条消息的发送。之后call resetUserAsAppUser改回APP使用者
                            // var resetUserAsAppUser = mySocket.newUserForTempUse(DID,res.results.doctorId.name);
                            // socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID });
                        socket.emit('message', { msg: msgJson, to: PID, role: 'doctor'})
                            // resetUserAsAppUser();

                        $ionicLoading.show({ template: '回复成功'})
                        setTimeout(function () {
                          $ionicLoading.hide()
                          $state.go('tab.groups', { type: '0' })
                        }, 1000)
                      } else {
                        Account.modifyCounts({doctorId: DID, patientId: PID, modify: '-1'})
                            .then(function () {
                              Account.getCounts({doctorId: DID, patientId: PID})
                                .then(function (response) {
                                    // var resetUserAsAppUser = mySocket.newUserForTempUse(DID,res.results.doctorId.name);
                                    // socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID });
                                  socket.emit('message', { msg: msgJson, to: PID, role: 'doctor'})

                                  if (response.result.count <= 0) {
                                    var endlMsg = {
                                      type: 'endl',
                                      info: '咨询已结束',
                                      docId: DID,
                                      counseltype: 1
                                    }
                                    var endJson = {
                                      clientType: 'doctor',
                                      contentType: 'custom',
                                      fromID: DID,
                                      fromName: res.results.doctorId.name,
                                      fromUser: {
                                        avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + DID + '_myAvatar.jpg'
                                      },
                                      targetID: PID,
                                      targetName: res.results.patientId.name,
                                      targetType: 'single',
                                      status: 'send_going',
                                      createTimeInMillis: Date.now(),
                                      newsType: '11',
                                      targetRole: 'patient',
                                      content: endlMsg
                                    }
                                    socket.emit('message', { msg: endJson, to: PID, role: 'doctor'})
                                    Counsel.changeStatus({doctorId: DID, patientId: PID, type: res.results.type, status: 0})
                                  }
                                    // resetUserAsAppUser();
                                  $ionicLoading.show({ template: '回复成功'})
                                  setTimeout(function () {
                                    $ionicLoading.hide()
                                    $state.go('tab.groups', { type: '0' })
                                  }, 1000)
                                })
                            })
                      }
                    })
            }, function (err) {
              console.log(err)
            })
  }
}])
/**
 * 选择转发的医生
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('selectDocCtrl', ['$state', '$scope', '$ionicPopup', '$ionicLoading', '$ionicScrollDelegate', 'Patient', 'Storage', 'Communication', 'CONFIG', 'Mywechat', 'socket', function ($state, $scope, $ionicPopup, $ionicLoading, $ionicScrollDelegate, Patient, Storage, Communication, CONFIG, Mywechat, socket) {
  $scope.params = {
    moredata: true,
    skip: 0,
    limit: 20,
    query: '',
    isSearch: false
  }
  var allDoctors = []
  $scope.doctors = []
  $scope.$on('$ionicView.beforeEnter', function () {
    $ionicScrollDelegate.scrollTop()
    $scope.params.query = ''
    $scope.params.isSearch = false
  })

  $scope.loadMore = function () {
    Patient.getDoctorLists({ skip: $scope.params.skip, limit: $scope.params.limit })
            .then(function (data) {
              $scope.$broadcast('scroll.infiniteScrollComplete')
              allDoctors = $scope.doctors.concat(data.results)
              $scope.doctors = allDoctors
              $scope.params.skip += data.results.length
              if (data.results.length < $scope.params.limit) { $scope.moredata = false }
            }, function (err) {
              console.log(err)
            })
  }

  $scope.$watch('params.query', function (val, val1) {
    if ($scope.params.query == '') {
      $scope.doctors = allDoctors
      $scope.params.isSearch = false
    }
  })

  $scope.docSearch = function () {
    if (!$scope.params.isSearch) {
      $ionicLoading.show()
      Patient.getDoctorLists({ skip: 0, limit: 100, name: $scope.params.query })
                .then(function (data) {
                  if (data.results.length == 0) {
                    $ionicLoading.show({ template: '结果为空', duration: 1000 })
                  } else {
                    $ionicLoading.hide()
                    allDoctors = $scope.doctors
                    $scope.doctors = data.results
                    $scope.params.isSearch = true
                  }
                }, function (err) {
                  console.log(err)
                })
    } else {
      $scope.doctors = allDoctors
      $scope.params.query = ''
    }
  }

  $scope.sendTo = function (doc) {
    var confirmPopup = $ionicPopup.confirm({
      title: '转发给：' + doc.name,
            // template: '确定要结束此次咨询吗?'
      okText: '确定',
      cancelText: '取消'
    })
    confirmPopup.then(function (res) {
      if (res) {
        var msgdata = $state.params.msg
        msgdata.fromId = Storage.get('UID')
        msgdata.targetId = doc.userId
        var msgJson = {
          clientType: 'doctor',
          contentType: 'custom',
          fromID: thisDoctor.userId,
          fromName: thisDoctor.name,
          fromUser: {
            avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + thisDoctor.userId + '_myAvatar.jpg'
          },
          targetID: doc.userId,
          targetName: doc.name,
          targetType: 'single',
          status: 'send_going',
          createTimeInMillis: Date.now(),
          newsType: '12',
          targetRole: 'doctor',
          content: msgdata
        }
                // socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId});
        socket.emit('message', {msg: msgJson, to: doc.userId, role: 'doctor'})
        var listener = $scope.$on('im:messageRes', function (event, messageRes) {
          if (messageRes.msg.createTimeInMillis != msgJson.createTimeInMillis) return
          var csl = messageRes.msg.content.counsel
          listener()
                    // socket.emit('disconnect');
          var template = {
            'userId': doc.userId, // 医生的UID
            'role': 'doctor',
            'postdata': {
              'template_id': 'DWrM__2UuaLxYf5da6sKOQA_hlmYhlsazsaxYX59DtE',
              'data': {
                'first': {
                  'value': thisDoctor.name + '向您转发了一个' + (csl.type == 1 ? '咨询' : '问诊') + '消息，请及时查看',
                  'color': '#173177'
                },
                'keyword1': {
                  'value': csl.counselId, // 咨询ID
                  'color': '#173177'
                },
                'keyword2': {
                  'value': doc.name, // 患者信息（姓名，性别，年龄）
                  'color': '#173177'
                },
                'keyword3': {
                  'value': csl.help, // 问题描述
                  'color': '#173177'
                },
                'keyword4': {
                  'value': csl.time.substr(0, 10), // 提交时间
                  'color': '#173177'
                },

                'remark': {
                  'value': '感谢您的使用！',
                  'color': '#173177'
                }
              }
            }
          }
          Mywechat.messageTemplate(template)
          $state.go('tab.detail', { type: '2', chatId: doc.userId, counselId: msgdata.counselId})
        })
      }
    })
  }
}])
/**
 * 选择转发的团队
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('selectTeamCtrl', ['$state', '$scope', '$ionicPopup', 'Doctor', 'Communication', 'Storage', '$filter', 'CONFIG', 'socket', function ($state, $scope, $ionicPopup, Doctor, Communication, Storage, $filter, CONFIG, socket) {
  $scope.params = {
        // isSearch:false,
  }
  $scope.query = {
    name: ''
  }
  console.log($state.params)
  Doctor.getMyGroupList({ userId: Storage.get('UID') })
        .then(function (data) {
          $scope.teams = data
        }, function (err) {
          console.log(err)
        })

  $scope.sendTo = function (team) {
    var confirmPopup = $ionicPopup.confirm({
      title: '转发到：' + team.name,
            // template: '确定要结束此次咨询吗?'
      okText: '确定',
      cancelText: '取消'
    })
    confirmPopup.then(function (res) {
      if (res) {
        var time = new Date()
        var gid = 'G' + $filter('date')(time, 'MMddHmsss')
        var msgdata = $state.params.msg

        var d = {
          teamId: team.teamId,
          counselId: msgdata.counselId,
          sponsorId: msgdata.doctorId,
          patientId: msgdata.patientId,
          consultationId: gid,
          status: '1'
        }
        msgdata.consultationId = gid
        msgdata.targetId = team.teamId
        msgdata.fromId = thisDoctor.userId
        var msgJson = {
          clientType: 'doctor',
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
          targetRole: 'doctor',
          createTimeInMillis: Date.now(),
          content: msgdata
        }

        Communication.newConsultation(d)
                    .then(function (data) {
                      console.log(data)
                        // socket.emit('newUser', { user_name: thisDoctor.name, user_id: thisDoctor.userId });
                      socket.emit('message', { msg: msgJson, to: team.teamId, role: 'doctor' })
                      var listener = $scope.$on('im:messageRes', function (event, messageRes) {
                        if (messageRes.msg.createTimeInMillis != msgJson.createTimeInMillis) return
                        listener()
                        $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId })
                      })
                    }, function (er) {
                      console.error(err)
                    })
      }
    })
  }
}])
/**
 * 医生信息
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('doctorProfileCtrl', ['$scope', '$state', 'Doctor', 'Storage', function ($scope, $state, Doctor, Storage) {
  $scope.doctor = {}
  /**
   * 点击与医生聊天
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goChat = function () {
    $state.go('tab.detail', { type: '2', chatId: $state.params.memberId })
  }
  $scope.$on('$ionicView.beforeEnter', function () {
    Doctor.getDoctorInfo({ userId: $state.params.memberId })
            .then(function (data) {
              $scope.doctor = data.results
            })
    $scope.isme = $state.params.memberId == Storage.get('UID')
  })
}])
/**
 * 转发前的聊天记录页面，从病例讨论过来的，参见detailCtrl
 * @Author   xjz
 * @DateTime 2017-07-05
 */
.controller('viewChatCtrl', ['$scope', '$state', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', 'voice', 'CONFIG', 'Communication', 'Doctor', 'Patient', '$q', 'Storage', function ($scope, $state, $ionicModal, $ionicScrollDelegate, $ionicHistory, voice, CONFIG, Communication, Doctor, Patient, $q, Storage) {
  $scope.photoUrls = {}
  $scope.params = {
    msgCount: 0,
    moreMsgs: true,
    chatId: '',
    doctorId: '',
    counsel: {},
    patientName: ''
  }

  $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll')
  function toBottom (animate, delay) {
    if (!delay) delay = 100
    setTimeout(function () {
      $scope.scrollHandle.scrollBottom(animate)
    }, delay)
  }
    // render msgs
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.photoUrls = {}
    $scope.msgs = []
    $scope.params.chatId = $state.params.patientId
    $scope.params.doctorId = $state.params.doctorId
    Storage.set('chatSender', $scope.params.doctorId)
    $scope.params.msgCount = 0
    console.log($scope.params)
        // 获取counsel信息
    Patient.getPatientDetail({ userId: $scope.params.chatId })
            .then(function (data) {
              if (data.results.name) $scope.params.patientName = '-' + data.results.name
              $scope.photoUrls[data.results.userId] = data.results.photoUrl
            })
    Doctor.getDoctorInfo({ userId: $scope.params.doctorId })
            .then(function (response) {
              $scope.photoUrls[response.results.userId] = response.results.photoUrl
            }, function (err) {
              console.log(err)
            })
        // 获取counsel信息
        // Counsel.getStatus({ doctorId: Storage.get('UID'), patientId: $scope.params.chatId })
        //     .then(function (data) {
        //         console.log(data)
        //         $scope.params.counsel = data.result;
        //     }, function (err) {
        //         console.log(err);
        //     })

    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
      toBottom(true, 400)
    })
  })

  $scope.$on('$ionicView.enter', function () {
    imgModalInit()
  })

  $scope.$on('$ionicView.beforeLeave', function () {
    Storage.rm('chatSender')
    if ($scope.modal) $scope.modal.remove()
    if ($scope.popover) $scope.popover.hide()
  })
  $scope.$on('$ionicView.leave', function () {
    $scope.msgs = []
  })

  $scope.getMsg = function (num) {
    console.info('getMsg')
    return $q(function (resolve, reject) {
      var q = {
        messageType: '1',
        newsType: '11',
        id1: $scope.params.doctorId,
        id2: $scope.params.chatId,
        skip: $scope.params.msgCount,
        limit: num
      }
      Communication.getCommunication(q)
            .then(function (data) {
              console.log(data)
              var d = data.results
              $scope.$broadcast('scroll.refreshComplete')
              if (d == '没有更多了!') return noMore()
              var res = []
              for (var i in d) {
                res.push(d[i].content)
              }
              if (res.length == 0) $scope.params.moreMsgs = false
              else {
                $scope.params.msgCount += res.length
                    // $scope.$apply(function() {
                if ($scope.msgs.length != 0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000
                for (var i = 0; i < res.length - 1; ++i) {
                  if (res[i].contentType == 'image') res[i].content.thumb = CONFIG.mediaUrl + res[i].content['src_thumb']
                  res[i].direct = res[i].fromID == $scope.params.doctorId ? 'send' : 'receive'
                  res[i].diff = (res[i].time - res[i + 1].time) > 300000
                  $scope.msgs.unshift(res[i])
                }
                res[i].direct = res[i].fromID == $scope.params.doctorId ? 'send' : 'receive'
                res[i].diff = true
                $scope.msgs.unshift(res[i])
                    // });
              }
              console.log($scope.msgs)
              resolve($scope.msgs)
            }, function (err) {
              $scope.$broadcast('scroll.refreshComplete')
              resolve($scope.msgs)
            })
    })
  }

  function noMore () {
    $scope.params.moreMsgs = false
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.params.moreMsgs = true
      })
    }, 5000)
  }
  $scope.DisplayMore = function () {
    $scope.getMsg(15).then(function (data) {
      $scope.msgs = data
    })
  }

  $scope.scrollBottom = function () {
    $scope.showVoice = false
    $scope.showMore = false
    $scope.scrollHandle.scrollBottom(true)
  }

    // view image
  function imgModalInit () {
    $scope.zoomMin = 1
    $scope.imageUrl = ''
    $scope.sound = {}
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal
            // $scope.modal.show();
      $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle')
    })
  }

  $scope.$on('image', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.imageHandle.zoomTo(1, true)
    $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src || args[2].src_thumb))
    $scope.modal.show()
  })

  $scope.closeModal = function () {
    $scope.imageHandle.zoomTo(1, true)
    $scope.modal.hide()
  }
  $scope.switchZoomLevel = function () {
    if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin) { $scope.imageHandle.zoomTo(1, true) } else {
      $scope.imageHandle.zoomTo(5, true)
    }
  }
  $scope.$on('voice', function (event, args) {
    console.log(args)
    event.stopPropagation()
    $scope.sound = new Media(args[1],
            function () {
            },
            function (err) {
              console.log(err)
            })
    $scope.sound.play()
  })
    // 长按工具条
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
  $scope.$on('holdmsg', function (event, args) {
    event.stopPropagation()
        // $scope.holdId = args[1];
        // console.log(args)
        // $scope.popover.show(args[2]);
  })
    // $scope.toolChoose = function(data) {
    //     // console.log(data);
    //     var content = $scope.msgs[arrTool.indexOf($scope.msgs, 'createTimeInMillis', $scope.holdId)].content;
    //     if (data == 0) $state.go('tab.selectDoc', { msg: content });
    //     if (data == 1) $state.go('tab.selectTeam', { msg: content });
    // };
  $scope.$on('viewcard', function (event, args) {
    event.stopPropagation()
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
  })

  $scope.$on('profile', function (event, args) {
    event.stopPropagation()
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
  })
  /**
   * 回去
   * @Author   xjz
   * @DateTime 2017-07-05
   * @return   {[type]}
   */
  $scope.goBack = function () {
    $ionicHistory.goBack()
  }
}])
