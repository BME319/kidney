angular.module('fyl.controllers', ['ionic', 'kidney.services'])

// "工作台”页-fyl,zy
.controller('workplaceCtrl', ['CONFIG', 'Camera', 'Doctor', 'Counsel', 'Doctor2', 'services', '$scope', '$state', '$interval', '$rootScope', 'Storage', '$ionicPopover', '$http', 'New', '$ionicPopup', function (CONFIG, Camera, Doctor, Counsel, Doctor2, services, $scope, $state, $interval, $rootScope, Storage, $ionicPopover, $http, New, $ionicPopup) {
  $scope.barwidth = 'width:0%'
  $scope.hasUnreadMessages = false
  $scope.review = false
  console.log(Storage.get('reviewStatus'))
  if (Storage.get('reviewStatus') == 1) {
    $scope.review = true
  }
  // 获取最新的消息
  var GetLatest = function () {
    New.getNewsByReadOrNot({readOrNot: 0, userRole: 'doctor'}).then(function (data) {
      // console.log(data)
      if (data.results[0] == undefined) {
        document.getElementById('newMes').innerText = '最新消息：没有最新消息！'
      } else {
        document.getElementById('newMes').innerText = '最新消息：' + data.results[0].description
      }
    }, function (err) {
    })
  }

  // 获取各项任务数量
  var GetNum = function () {
    // 获取进行中咨询数量
    Counsel.getCounsels({
      status: 1 // 进行中
    }).then(function (data) {
      $scope.consultNum = data.count
    }, function (err) {
      console.log(err)
    })
    // 获取待审核患者数量
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
      $scope.PDNum = data.results.length
    }, function (err) {
      console.log(err)
    })
    // 获取患者数量
    Doctor2.getPatientList({
    }).then(function (data) {
      $scope.patNum = data.results.length
    }, function (err) {
      console.log(err)
    })
  }

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

  $scope.goQrcode = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.QRcode')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goMessage = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('messages')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goConsult = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.consult')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goReserve = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.myreserve')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goPatient = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.patient')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
  }
  $scope.goService = function () {
    if (Storage.get('reviewStatus') == 1) {
      $state.go('tab.myservice')
    } else if (Storage.get('reviewStatus') == 0 || Storage.get('reviewStatus') == 2) {
      myPopup()
    }
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
    New.getNewsByReadOrNot({readOrNot: 0, userRole: 'doctor'}).then(function (data) {
      console.log(data)
      if (data.results.length) {
        for (i = 0; i < data.results.length; i++) {
          if (data.results[i].type == 9 || data.results[i].type == 14 || data.results[i].type == 2 || data.results[i].type == 11 || data.results[i].type == 12 || data.results[i].type == 13 || data.results[i].type == 15) {
            $scope.hasUnreadMessages = true
            console.log(data.results)
            break
          }
        }
        if (i == data.results.length) {
          $scope.hasUnreadMessages = false
        }
        // console.log($scope.HasUnreadMessages);
      } else {
        $scope.hasUnreadMessages = false
      }
    }, function (err) {
      if (err.status === 401 && angular.isDefined(RefreshUnread)) {
        $interval.cancel(RefreshUnread)
      }
      console.log(err)
    })
  }

  // 审核通过进入页面执行查询是否有未读消息
  if (Storage.get('reviewStatus') == 1) {
    $scope.$on('$ionicView.enter', function () {
      console.log('enter')
      GetLatest()
      GetNum()
      RefreshUnread = $interval(GetUnread, 2000)
    })
  }

  // 审核通过离开页面destroy查询
  if (Storage.get('reviewStatus') == 1) {
    $scope.$on('$ionicView.leave', function () {
      console.log('destroy')
      if (RefreshUnread) {
        $interval.cancel(RefreshUnread)
      }
    })
  }
  /**
   * [获取医生详细信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId: string
   * @return   data.results(医生详细信息)
   */
  // console.log(Storage.get('TOKEN'))
  Doctor.getDoctorInfo({
    // userId: Storage.get('UID')
  }).then(function (data) {
    // alert(Storage.get('UID')+JSON.stringify(data))
    // console.log(data)
    $scope.doctor = data.results
    if ($scope.doctor.photoUrl == '' || $scope.doctor.photoUrl == null || $scope.doctor.photoUrl == undefined) {
      $scope.doctor.photoUrl = 'img/doctor.png'
      // if(Storage.get('wechatheadimgurl')!=undefined||Storage.get('wechatheadimgurl')!=""||Storage.get('wechatheadimgurl')!=null){
      //     $scope.doctor.photoUrl=Storage.get('wechatheadimgurl')
      // }
    }
  }, function (err) {
    console.log(err)
  })
}])

// 病情报告--fyl
.controller('ReportCtrl', ['Storage', '$scope', '$state', 'getPatientData', '$ionicLoading', function (Storage, $scope, $state, getPatientData, $ionicLoading) {
  $scope.barStyle = {'margin-top': '40px'}
  if (ionic.Platform.isIOS()) {
    $scope.barStyle = {'margin-top': '60px'}
  }
  patientId = Storage.get('getpatientId')
  $scope.writeReport = true
  $scope.type = 'week'
  $scope.typeC = '周'
  $scope.charge = false
  $scope.follow = false
  if (Storage.get('dprelation') == 'charge') {
    $scope.charge = true
  }
  if (Storage.get('dprelation') == 'follow') {
    $scope.follow = true
  }

  var ShowTime = function () {
    var date = new Date()
    var modify = $scope.modify
    var timeType = $scope.type
    if (modify == 0) {
      if (timeType == 'week') {
        document.getElementById('middle').innerText = '本周'
      } else if (timeType == 'month') {
        document.getElementById('middle').innerText = '本月'
      } else if (timeType == 'season') {
        document.getElementById('middle').innerText = '本季'
      } else if (timeType == 'year') {
        document.getElementById('middle').innerText = '本年'
      }
    } else {
    // 周
      if (timeType == 'week') {
        getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Temperature', showType: $scope.type, modify: $scope.modify}).then(
          function (data) {
            if (data.results == '不存在该段时间的报告!') {
              var week1 = data.startTime
              var week2 = data.endTime
              week1 = week1.substring(0, 10)
              week2 = week2.substring(0, 10)
              document.getElementById('middle').innerText = week1 + ' ' + week2
            } else {
              var week1 = data.results.startTime
              var week2 = data.results.endTime
              week1 = week1.substring(0, 10)
              week2 = week2.substring(0, 10)
              document.getElementById('middle').innerText = week1 + ' ' + week2
            }
          }, function (err) {
        })
      }
    // 月
      else if (timeType == 'month') {
        getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Temperature', showType: $scope.type, modify: $scope.modify}).then(
          function (data) {
            if (data.results == '不存在该段时间的报告!') {
              var month = data.time
              month1 = month.substring(0, 4)
              month2 = month.substring(4, 6)
              document.getElementById('middle').innerText = month1 + '年' + month2 + '月'
            } else {
              var month = data.results.item.time
              month1 = month.substring(0, 4)
              month2 = month.substring(4, 6)
              document.getElementById('middle').innerText = month1 + '年' + month2 + '月'
            }
          }, function (err) {
        })
      }
    // 季
      else if (timeType == 'season') {
        getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Temperature', showType: $scope.type, modify: $scope.modify}).then(
          function (data) {
            if (data.results == '不存在该段时间的报告!') {
              var season = data.time
              season1 = season.substring(0, 4)
              season2 = season.substring(5, 6)
              document.getElementById('middle').innerText = season1 + '年第' + season2 + '季'
            } else {
              var season = data.results.item.time
              season1 = season.substring(0, 4)
              season2 = season.substring(5, 6)
              document.getElementById('middle').innerText = season1 + '年第' + season2 + '季'
            }
          }, function (err) {
        })
      }
    // 年
      else if (timeType == 'year') {
        getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Temperature', showType: $scope.type, modify: $scope.modify}).then(
          function (data) {
            if (data.results == '不存在该段时间的报告!') {
              var year = data.time
              document.getElementById('middle').innerText = year + '年'
            } else {
              var year = data.results.item.time
              document.getElementById('middle').innerText = year + '年'
            }
          }, function (err) {
        })
      }
    }
  }

  $scope.toWeekReports = function () {
    $scope.modify = 0
    $scope.writeReport = true
    document.getElementById($scope.type).style.backgroundColor = '#FFFFFF'
    document.getElementById($scope.type).style.color = '#000000'
    $scope.type = 'week'; $scope.typeC = '周'
    document.getElementById($scope.type).style.backgroundColor = '#6ac4f8'
    document.getElementById($scope.type).style.color = '#FFFFFF'
    ShowTime()
    healthyCurve()
  }

  $scope.toMonthReports = function () {
    $scope.modify = 0
    $scope.writeReport = true
    document.getElementById($scope.type).style.backgroundColor = '#FFFFFF'
    document.getElementById($scope.type).style.color = '#000000'
    $scope.type = 'month'; $scope.typeC = '月'
    document.getElementById($scope.type).style.backgroundColor = '#6ac4f8'
    document.getElementById($scope.type).style.color = '#FFFFFF'
    ShowTime()
    healthyCurve()
  }

  $scope.toSeasonReports = function () {
    $scope.modify = 0
    $scope.writeReport = true
    document.getElementById($scope.type).style.backgroundColor = '#FFFFFF'
    document.getElementById($scope.type).style.color = '#000000'
    $scope.type = 'season'; $scope.typeC = '季度'
    document.getElementById($scope.type).style.backgroundColor = '#6ac4f8'
    document.getElementById($scope.type).style.color = '#FFFFFF'
    ShowTime()
    healthyCurve()
  }

  $scope.toYearReports = function () {
    $scope.modify = 0
    $scope.writeReport = true
    document.getElementById($scope.type).style.backgroundColor = '#FFFFFF'
    document.getElementById($scope.type).style.color = '#000000'
    $scope.type = 'year'; $scope.typeC = '年度'
    document.getElementById($scope.type).style.backgroundColor = '#6ac4f8'
    document.getElementById($scope.type).style.color = '#FFFFFF'
    ShowTime()
    healthyCurve()
  }

  $scope.last = function () {
    console.log($scope.modify)
    $scope.modify -= 1
    $scope.writeReport = true
    ShowTime()
    healthyCurve()
  }
  $scope.next = function () {
    console.log($scope.modify)
    $scope.modify += 1
    $scope.writeReport = true
    ShowTime()
    healthyCurve()
  }

  var healthyCurve = function () {
    var date = new Date()
    // var date = "2017-07-27T00:00:00.000Z"
    $scope.outOfTime = false

    // 体温
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Temperature', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        var vitalsign = new Array()
        var ChartData = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.Temp = data.results.item
        $scope.Temp.flag = data.results.flag.flagT
        if (vitalsign.results.item.data1.length == 0) {
          $scope.Temp.hasdata = false
          var chart = new Highcharts.Chart('container1', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有体温的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData = vitalsign.results.item.data1
          ChartTimeTemp = vitalsign.results.item.recordTime
          $scope.Temp.hasdata = true
          if (vitalsign.results.item.doctorComment == undefined) { $scope.Temp.report = '本' + $scope.typeC + '中有发热，是x月' } else { $scope.Temp.report = vitalsign.results.item.doctorComment }
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container1', {
            credits: {enabled: false},
            chart: {
                            // backgroundColor:"#ECFFFF",//图表背景色
                            // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                            // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                            // plotBorderColor:'blue',//主图表边框颜色
                            // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '体温',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '温度(°C)',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: '°C'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '体温℃',
              data: ChartData
            }]
          })
        }
        // $scope.TempAdvice = "体温高于37.3为发热"
      }, function (err) {
    })

    // 体重
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Weight', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.Weight = data.results.item
        $scope.Weight.flag = data.results.flag.flagWeight

        if (data.results.item.recommendValue11 == undefined) {
            // $scope.Weight.hasAdvice = false
          $scope.Weight.Low = $scope.Weight.recommendValue1
          $scope.Weight.High = $scope.Weight.recommendValue2
        } else {
            // $scope.Weight.hasAdvice = true
          $scope.Weight.Low = $scope.Weight.recommendValue11
          $scope.Weight.High = $scope.Weight.recommendValue12
        }
        if (vitalsign.results.item.data1.length == 0) {
          $scope.Weight.hasdata = false
          var chart = new Highcharts.Chart('container2', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有体重的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData = vitalsign.results.item.data1
          ChartTimeTemp = vitalsign.results.item.recordTime
          if (vitalsign.results.item.doctorComment == undefined) { $scope.Weight.report = '本' + $scope.typeC + '中体重控制最佳为x月，最差为x月；记录最完整为为x月，最差为x月' } else { $scope.Weight.report = vitalsign.results.item.doctorComment }
          $scope.Weight.hasdata = true
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container2', {
            credits: {enabled: false},
            chart: {
                        // backgroundColor:"#ECFFFF",//图表背景色
                        // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                        // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                        // plotBorderColor:'blue',//主图表边框颜色
                        // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '体重',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '质量(Kg)',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: 'Kg'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '体重Kg',
              data: ChartData
            }]
          })
        }
        $scope.WeightLow = 50
        $scope.WeightHigh = 60
      }, function (err) {
    })

    // 血压
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'BloodPressure', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData1 = new Array()
        var ChartData2 = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.BP = data.results.item
        $scope.BP.flag = data.results.flag.flagBP

        if (data.results.item.recommendValue11 == undefined) {
            // $scope.BP.hasAdvice = false
          $scope.BP.BPH1 = $scope.BP.recommendValue1
          $scope.BP.BPH2 = $scope.BP.recommendValue2
          $scope.BP.BPL1 = $scope.BP.recommendValue3
          $scope.BP.BPL2 = $scope.BP.recommendValue4
        } else {
            // $scope.BP.hasAdvice = true
          $scope.BP.BPH1 = $scope.BP.recommendValue11
          $scope.BP.BPH2 = $scope.BP.recommendValue12
          $scope.BP.BPL1 = $scope.BP.recommendValue13
          $scope.BP.BPL2 = $scope.BP.recommendValue14
        }
        if (vitalsign.results.item.recordTime.length == 0) {
          $scope.BP.hasdata = false
          var chart = new Highcharts.Chart('container3', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有血压的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData1 = vitalsign.results.item.data1
          ChartData2 = vitalsign.results.item.data2
          ChartTimeTemp = vitalsign.results.item.recordTime
          if (vitalsign.results.item.doctorComment == undefined) { $scope.BP.report = '本' + $scope.typeC + '中血压控制最佳为x月，最差为x月；记录最完整为为x月，最差为x月' } else { $scope.BP.report = vitalsign.results.item.doctorComment }
          $scope.BP.hasdata = true
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container3', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '血压',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '压强(mmHg)',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: 'mmHg'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '高压mmHg',
              data: ChartData1
            }, {
              name: '低压mmHg',
              data: ChartData2
            }]
          })
        }
      }, function (err) {
    })

    // 尿量
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'Vol', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.Vol = data.results.item
        $scope.Vol.flag = data.results.flag.flagVol
        if (vitalsign.results.item.recordTime.length == 0) {
          $scope.Vol.hasdata = false
          var chart = new Highcharts.Chart('container4', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有尿量的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData = vitalsign.results.item.data1
          ChartTimeTemp = vitalsign.results.item.recordTime
          if (vitalsign.results.item.doctorComment == undefined) { $scope.Vol.report = '' } else { $scope.Vol.report = vitalsign.results.item.doctorComment }
          $scope.Vol.hasdata = true
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container4', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '尿量',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '体积(mL)',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: 'mL'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '尿量mL',
              data: ChartData
            }]
          })
        }
      }, function (err) {
    })

    // 心率
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'HeartRate', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.HR = data.results.item
        $scope.HR.flag = data.results.flag.flagHR
        if (data.results.item.recommendValue11 == undefined) {
            // $scope.HR.hasAdvice = false
          $scope.HR.HRL = $scope.HR.recommendValue1
          $scope.HR.HRH = $scope.HR.recommendValue2
        } else {
            // $scope.HR.hasAdvice = true
          $scope.HR.HRL = $scope.HR.recommendValue11
          $scope.HR.HRH = $scope.HR.recommendValue12
        }
        if (vitalsign.results.item.recordTime.length == 0) {
          $scope.HR.hasdata = false
          var chart = new Highcharts.Chart('container5', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有心率的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData = vitalsign.results.item.data1
          ChartTimeTemp = vitalsign.results.item.recordTime
          if (vitalsign.results.item.doctorComment == undefined) { $scope.HR.report = '' } else { $scope.HR.report = vitalsign.results.item.doctorComment }
          $scope.HR.hasdata = true
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container5', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '心率',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '频率(次/分钟)',
                x: 0,
                y: -10
              },
              plotLines: [{
                      // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: '次/分钟'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '心率（次/分钟）',
              data: ChartData
            }]
          })
        }
      }, function (err) {
    })

    // 腹透
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'PeritonealDialysis', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData1 = new Array()
        var ChartData2 = new Array()
        var ChartTime = new Array()
        var ChartTimeTemp = new Array()
        vitalsign = data
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        $scope.PD = data.results.item
        $scope.PD.flag = data.results.flag.flagPD
        // $scope.PD.PDL = $scope.PD.recommendValue1
        // $scope.PD.PDH = $scope.PD.recommendValue2
        if (data.results.item.recommendValue11 == undefined) {
            // $scope.PD.hasAdvice = false
          $scope.PD.PDL = $scope.PD.recommendValue1
          $scope.PD.PDH = $scope.PD.recommendValue2
        } else {
            // $scope.PD.hasAdvice = true
          $scope.PD.PDL = $scope.PD.recommendValue11
          $scope.PD.PDH = $scope.PD.recommendValue12
        }
        if (vitalsign.results.item.recordTime.length == 0) {
          $scope.PD.hasdata = false
          var chart = new Highcharts.Chart('container6', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有腹透的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData1 = vitalsign.results.item.data1
          ChartData2 = vitalsign.results.item.data2
          ChartTimeTemp = vitalsign.results.item.recordTime
          if (vitalsign.results.item.doctorComment == undefined) { $scope.PD.report = '本' + $scope.typeC + '腹透状况良好／x月出现透析不充分／腹膜炎' } else { $scope.PD.report = vitalsign.results.item.doctorComment }
          $scope.PD.hasdata = true
          for (i = 0; i < ChartTimeTemp.length; i++) {
            ChartTime[i] = ChartTimeTemp[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container6', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '腹透',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime
            },
            yAxis: {
              title: {
                text: '流量(mL)',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: 'mL'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '超滤量mL',
              data: ChartData1
            }, {
              name: '出量mL',
              data: ChartData2
            }]
          })
        }
      }, function (err) {
    })

    // 化验
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'LabTest', showType: $scope.type, modify: $scope.modify}).then(
      function (data) {
        console.log(data.results)
        var vitalsign = new Array()
        var ChartData1 = new Array()
        var ChartData2 = new Array()
        var ChartData3 = new Array()
        var ChartData4 = new Array()
        var ChartData5 = new Array()
        var ChartTime1 = new Array()
        var ChartTime2 = new Array()
        var ChartTime3 = new Array()
        var ChartTime4 = new Array()
        var ChartTime5 = new Array()

        vitalsign = data
        console.log(data)
        if (data.results == '不存在该段时间的报告!') {
          $scope.outOfTime = true
          return
        }
        if (($scope.type == 'season' || $scope.type == 'year') && ($scope.modify)) {
          $scope.LT = ''
          if (!data.results.lab.SCr == '') { $scope.LT += data.results.lab.SCr.min + data.results.lab.SCr.max }
          if (!data.results.lab.SCr == '') { $scope.LT += data.results.lab.GFR.min + data.results.lab.GFR.max }
          if (!data.results.lab.SCr == '') { $scope.LT += data.results.lab.PRO.min + data.results.lab.PRO.max }
          if (!data.results.lab.SCr == '') { $scope.LT += data.results.lab.ALB.min + data.results.lab.ALB.max }
          if (!data.results.lab.SCr == '') { $scope.LT += data.results.lab.HB.min + data.results.lab.HB.max }
        }
        if (vitalsign.results.item.doctorReport == undefined) {
          if ($scope.type == 'week' || $scope.type == 'month') { $scope.LTreport = '' } else { $scope.LTreport = '建议增加检测xx，x月发生肌酐升高／贫血／肾病复发' }
        } else { $scope.LTreport = vitalsign.results.doctorReport }
        if (vitalsign.results.item.recordTime.length == 0) {
          var chart = new Highcharts.Chart('container7', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有肌酐的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData1 = vitalsign.results.item.data1
          ChartTime1 = vitalsign.results.item.recordTime
          for (i = 0; i < ChartTime1.length; i++) {
            ChartTime1[i] = ChartTime1[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container7', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '肌酐',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime1
            },
            yAxis: {
              title: {
                text: 'umol/L',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
            tooltip: {
              valueSuffix: 'mL'
            },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '肌酐值',
              data: ChartData1
            }]
          })
        }
        if (vitalsign.results.item.recordTime2.length == 0) {
          var chart = new Highcharts.Chart('container8', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有GFR的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData2 = vitalsign.results.item.data2
          ChartTime2 = vitalsign.results.item.recordTime2
          for (i = 0; i < ChartTime2.length; i++) {
            ChartTime2[i] = ChartTime2[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container8', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: 'GFR',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime2
            },
            yAxis: {
              title: {
                text: 'GFR（mL/min）',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
                // tooltip: {
                //     valueSuffix: 'mL'
                // },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: 'GFR',
              data: ChartData2
            }]
          })
        }
        if (vitalsign.results.item.recordTime3.length == 0) {
          var chart = new Highcharts.Chart('container9', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有尿蛋白的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData3 = vitalsign.results.item.data3
          ChartTime3 = vitalsign.results.item.recordTime3
          for (i = 0; i < ChartTime3.length; i++) {
            ChartTime3[i] = ChartTime3[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container9', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '尿蛋白',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime3
            },
            yAxis: {
              title: {
                text: '尿蛋白（g/24h）',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
                // tooltip: {
                //     valueSuffix: 'mL'
                // },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '尿蛋白',
              data: ChartData3
            }]
          })
        }
        if (vitalsign.results.item.recordTime4.length == 0) {
          var chart = new Highcharts.Chart('container10', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有血白蛋白的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData4 = vitalsign.results.item.data4
          ChartTime4 = vitalsign.results.item.recordTime4
          for (i = 0; i < ChartTime4.length; i++) {
            ChartTime4[i] = ChartTime4[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container10', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '血白蛋白',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime4
            },
            yAxis: {
              title: {
                text: '血白蛋白（g/L）',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
                // tooltip: {
                //     valueSuffix: 'mL'
                // },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '血白蛋白',
              data: ChartData4
            }]
          })
        }
        if (vitalsign.results.item.recordTime5.length == 0) {
          var chart = new Highcharts.Chart('container11', {
            credits: {enabled: false},
            chart: {
              height: 50,
              borderRadius: 5, // 图表边框圆角角度
              shadow: true// 是否设置阴影
            },
            title: {
              text: '您没有血红蛋白的测量数据！',
              x: 0,
              y: 20
            }
          })
        } else {
          ChartData5 = vitalsign.results.item.data5
          ChartTime5 = vitalsign.results.item.recordTime5
          for (i = 0; i < ChartTime5.length; i++) {
            ChartTime5[i] = ChartTime5[i].substring(0, 10)
          }
          var chart = new Highcharts.Chart('container11', {
            credits: {enabled: false},
            chart: {
                    // backgroundColor:"#ECFFFF",//图表背景色
                    // borderWidth:5,//图表边框宽度
              borderRadius: 5, // 图表边框圆角角度
                    // plotBackgroundColor:"#46A3FF",//主图表区背景颜色
                    // plotBorderColor:'blue',//主图表边框颜色
                    // plotBorderWidth:2,//主图表边框宽度
              shadow: true, // 是否设置阴影
              zoomType: 'xy'
            },
            colors: [
              '#FF8040',
              '#66B3FF',
              '#0080FF',
              '#00FF00', // 绿
              '#0000FF', // 蓝
              '#FFFF00', // 黄
              '#FF00FF', // 紫
              '#FFFFFF', // 紫
              '#000000', // 黑
              '#FF0000'// 红
            ],
            title: {
              text: '血红蛋白',
              x: 0,
              y: 33
            },
            xAxis: {
              categories: ChartTime5
            },
            yAxis: {
              title: {
                text: '血红蛋白（g/L）',
                x: 0,
                y: -10
              },
              plotLines: [{
                        // 控制x轴线型
                value: 0,
                width: 0.1,
                color: '#808080'
              }]
            },
                // tooltip: {
                //     valueSuffix: 'mL'
                // },
            legend: {
              layout: 'horizontal',   // 图例内容布局方式，有水平布局及垂直布局可选，对应的配置值是： “horizontal”， “vertical”
              align: 'center',      // 图例在图表中的对齐方式，有 “left”, "center", "right" 可选
              verticalAlign: 'top', // 垂直对齐方式，有 'top'， 'middle' 及 'bottom' 可选
              borderWidth: 0,
              x: 0,
              y: +50
            },
            series: [{
              name: '血红蛋白',
              data: ChartData5
            }]
          })
        }
      }, function (err) {
    })

    // 报告
    getPatientData.ReportData({time: date, type: 'Measure', patientId: patientId, code: 'DoctorReport', showType: $scope.type, modify: $scope.modify}).then(
        function (data) {
          console.log(data.results)
          if (data.results.doctorReport == undefined) {
            if ($scope.type == 'week' || $scope.type == 'month') { $scope.DoctorReport = '' } else { $scope.DoctorReport = '定时记录生命体征及用药情况。下次门诊就诊时间建议为****-**-**' }
          } else { $scope.DoctorReport = data.results.doctorReport }
        }, function (err) {
    })
  }

  $scope.Options = ['正常', '信息缺失']

  // $scope.editReport = function(){
  //   $scope.writeReport = false
  //   // $scope.MeasureData = "MeasureData1"
  //   // document.getElementByName('')
  // }
  $scope.saveReport = function () {
    $scope.writeReport = true
    if ($scope.type == 'week' || $scope.type == 'month') {
      data = [
            {itemType: 'Weight', recommendValue11: $scope.Weight.Low, recommendValue12: $scope.Weight.High},
            {itemType: 'BloodPressure', recommendValue11: $scope.BP.BPH1, recommendValue12: $scope.BP.BPH2, recommendValue13: $scope.BP.BPL1, recommendValue14: $scope.BP.BPL2},
            {itemType: 'HeartRate', recommendValue11: $scope.HR.HRL, recommendValue12: $scope.HR.HRH},
            {itemType: 'PeritonealDialysis', recommendValue11: $scope.PD.PDL, recommendValue12: $scope.PD.PDH},
            {itemType: 'DoctorReport', doctorReport: document.getElementById('doctorReport').value},
            {itemType: 'LabTest', doctorReport: document.getElementById('labTestReport').value}
      ]
    } else {
      data = [
            {itemType: 'Weight', recommendValue11: $scope.Weight.Low, recommendValue12: $scope.Weight.High, doctorComment: document.getElementById('WeightReport').value},
            {itemType: 'BloodPressure', recommendValue11: $scope.BP.BPH1, recommendValue12: $scope.BP.BPH2, recommendValue13: $scope.BP.BPL1, recommendValue14: $scope.BP.BPL2, doctorComment: document.getElementById('BPReport').value},
            {itemType: 'HeartRate', recommendValue11: $scope.HR.HRL, recommendValue12: $scope.HR.HRH, doctorComment: document.getElementById('HRReport').value},
            {itemType: 'PeritonealDialysis', recommendValue11: $scope.PD.PDL, recommendValue12: $scope.PD.PDH, doctorComment: document.getElementById('PDReport').value},
            {itemType: 'DoctorReport', doctorReport: document.getElementById('doctorReport').value},
            {itemType: 'LabTest', doctorReport: document.getElementById('labTestReport').value},
            {itemType: 'Temperature', recommendValue11: 37.3, doctorComment: document.getElementById('TempReport').value},
            {itemType: 'Vol', recommendValue11: 500, doctorComment: document.getElementById('VolReport').value}
      ]
    }
    console.log(data)
    if (data[5].doctorReport == '' || data[4].doctorReport == '') {
      $ionicLoading.show({
        template: '请把报告填写完整再提交',
        duration: 1000,
        hideOnStateChange: true
      })
    } else {
      getPatientData.SaveReport({patientId: patientId, time: $scope.Temp.time, type: $scope.type, data: data}).then(
        function (data) {
          $ionicLoading.show({
            template: '提交成功',
            duration: 1000,
            hideOnStateChange: true
          })
        },
        function (err) {})
    }
    $scope.MeasureData = 'MeasureData'
  }

  $scope.Goback = function () {
    $state.go('tab.patient')
  }

  $scope.toWeekReports()
}])
