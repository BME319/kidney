angular.module('tdy.controllers', ['ionic','kidney.services'])

/////////////////////////tongdanyang/////////////////
.controller('DoctorDiagnoseCtrl', ['$scope', 'Storage','ionicDatePicker','Patient','$ionicHistory', function ($scope, Storage,ionicDatePicker,Patient,$ionicHistory) {
    $scope.goback = function () {
      $ionicHistory.goBack();
    }


  $scope.Hypers =
  [
    {Name:"是",Type:1},
    {Name:"否",Type:2}
  ]

  $scope.Diseases =
  [
    {Name:"CKD1-2期",Type:2},
    {Name:"CKD3-4期",Type:3},
    {Name:"CDK5期未透析",Type:4},
    {Name:"腹透",Type:5},
    {Name:"血透",Type:6},
    {Name:"肾移植",Type:1}
  ]
  $scope.progressSelect =
  [
    [
      "疾病活跃期",
      "稳定期",
      ">3年"
    ],
    [
      "疾病活跃期",
      "稳定期"
    ]
  ]
  $scope.showDateTitle=function(type)
  {
    // console.log(type)
    var title="";
    if(type==1)
      title="手术日期"
    else if(type==5)
      title="插管日期"
    else if(type==6)
      title="开始日期"
    return title
  }

  $scope.Diagnose =
  {
    "diagname": null,
    "diagtime": null,
    "operationTime": null,
    "hypertension": null,
    "diagprogress": '稳定期',
    "diagcontent":""
  }
  var datepickerD = {
        callback: function (val) {  //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.Diagnose.operationTime=new Date(val);
        },
        titleLabel: '手术日期',
        inputDate: new Date(),
        mondayFirst: true,
        closeOnSelect: false,
        templateType: 'popup',
        setLabel: '确定',
        todayLabel: '今天',
        closeLabel: '取消',
        showTodayButton: true,
        dateFormat: 'yyyy MMMM dd',
        weeksList: ["周日","周一","周二","周三","周四","周五","周六"],
        monthsList:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
    };
    $scope.openDatePicker = function(){
        ionicDatePicker.openDatePicker(datepickerD);
    };

  // {
  //     patientId:'',
  //     doctorId:'',
  //     diagname:'',
  //     diagtime:'',
  //     diagprogress:'',
  //     diagcontent:''
  //   }
  $scope.saveDiagnose=function()
  {
    $scope.Diagnose.patientId=Storage.get('getpatientId');
    $scope.Diagnose.doctorId=Storage.get('UID');
    console.log($scope.Diagnose)
    Patient.insertDiagnosis($scope.Diagnose)
    .then(function(data){
      console.log(data)
      $state.go('tab.patientDetail');
    },function(err)
    {
      console.log(err)
    })
  }

  $scope.reset =function(){
    $scope.Diagnose =
    {
      "KidneyDisease": null,
      "DiseaseDetail": null,
      "OperationDate": null,
      "Hypertension": '稳定期',
      "DetailDiagnose": null
    }
  }
}])
.controller('TestRecordCtrl', ['$scope', '$http','Storage','VitalSign','$ionicHistory', function ($scope,$http, Storage,VitalSign,$ionicHistory) {
  $scope.goback = function () {
    $ionicHistory.goBack();
  }


      VitalSign.getVitalSigns({userId:'U201702071766',type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].date>="2017-04-08"&&Data.results[i].code=="舒张压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        AmCharts.makeChart("chartdiv", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"舒张压","mmHg");
      }, function(e) {
      });

      VitalSign.getVitalSigns({userId:'U201702071766',type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="收缩压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        AmCharts.makeChart("chartdiv1", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"收缩压","mmHg");
      }, function(e) {
      });

      VitalSign.getVitalSigns({userId:'U201702071766',type:'体温'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体温"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv2", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'体重'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体重"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv3", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'尿量'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="尿量"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv4", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'心率'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="心率"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv5", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {
      });
  // $scope.$on('$ionicView.afterEnter', function() {

//                 console.log('afterEnter');

// }, false);
 // console.log("mmb");
 //  $scope.$on('$ionicView.enter', function()
 //  {
 //    console.log("mmb");
     // $http.get("../data/pressure.json").success(function(data) {
     //     $scope.pressuredata = data;
     //     console.log($scope.pressuredata)
     //     createStockChart($scope.pressuredata,"血压","mmHg");
     // });
  // })

  // $scope.title="血压"
  // $scope.unit="mmHg"
  // $scope.chart = createStockChart($scope.data1,$scope.title,$scope.unit);
  ////提振参数选择下拉框选项 默认收缩压selected
  //下拉选择不同体征类型
  // $scope.options = [{"SignName":"血压"},
  //   {"SignName":"体重"},
  //   {"SignName":"体温"},
  //   {"SignName":"尿量"},
  //   {"SignName":"心率"}
  // ];
  // $scope.vitalInfo=$scope.options[0].SignName

  // //切换体征
  // $scope.changeVitalInfo = function(option)
  //   {
  //      $scope.selectedname=option;
  //      console.log($scope.selectedname)
  //      drawcharts($scope.selectedname);
  //   };
  //   //根据体征类型画图
  //   var drawcharts=function(param){
  //   if (param=="血压") {
  //     VitalSign.getVitalSigns({userId:'zxftest001',type:'type1'}).then(
  //     function(Data){
  //       $scope.ChartData=[];
  //       console.log(Data.results[0])
  //       console.log(Data.results.length)
  //       for(var i=0;i<Data.results.length;i++){
  //         if(Data.results[i].date>="2017-04-07"){
  //           for(var j=0;j<Data.results[i].data.length;j++){
  //             $scope.ChartData.push(Data.results[i].data[j])
  //           }
  //         }
  //       }

  //       console.log($scope.ChartData);
  //       createStockChart($scope.ChartData,"舒张压","mmHg");
  //     }, function(e) {
  //     });


  //   }
  //   if(param=="体温"){
  //     VitalSign.getVitalSigns({userId:'zxftest001',type:'type2'}).then(
  //     function(Data){
  //       $scope.ChartData=[];
  //       console.log(Data.results[0])
  //       console.log(Data.results.length)
  //       for(var i=0;i<Data.results.length;i++){
  //         if(Data.results[i].date>="2017-04-07"){
  //           for(var j=0;j<Data.results[i].data.length;j++){
  //             $scope.ChartData.push(Data.results[i].data[j])
  //           }
  //         }
  //       }

  //       console.log($scope.ChartData);
  //       createStockChart($scope.ChartData,"舒张压","mmHg");
  //     }, function(e) {
  //     });

  //   }
  // }
  //传参绘图
  function createStockChart(chartname,ChartData,title,unit) {

    chart="";
    var chart = AmCharts.makeChart("chartname", {
    "type": "serial",
    "theme": "light",
    "marginTop":0,
    "marginRight": 80,
    "dataProvider": ChartData,
    "valueAxes": [{
        "axisAlpha": 0,
        "position": "left"
    }],
    "graphs": [{
        "id":"g1",
        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
        "bullet": "round",
        "bulletSize": 8,
        "lineColor": "#d1655d",
        "lineThickness": 2,
        "negativeLineColor": "#637bb6",
        "type": "smoothedLine",
        "valueField": "value"
    }],
    "chartScrollbar": {
        "graph":"g1",
        "gridAlpha":0,
        "color":"#888888",
        "scrollbarHeight":55,
        "backgroundAlpha":0,
        "selectedBackgroundAlpha":0.1,
        "selectedBackgroundColor":"#888888",
        "graphFillAlpha":0,
        "autoGridCount":true,
        "selectedGraphFillAlpha":0,
        "graphLineAlpha":0.2,
        "graphLineColor":"#c2c2c2",
        "selectedGraphLineColor":"#888888",
        "selectedGraphLineAlpha":1

    },
    "chartCursor": {
        "categoryBalloonDateFormat": "YYYY-MM-DD",
        "cursorAlpha": 0,
        "valueLineEnabled":true,
        "valueLineBalloonEnabled":true,
        "valueLineAlpha":0.5,
        "fullWidth":true
    },
    "dataDateFormat": "YYYY-MM-DD",
    "categoryField": "time",
    "categoryAxis": {
        "minPeriod": "mm",
        "parseDates": true,
        "minorGridAlpha": 0.1,
        "minorGridEnabled": true
    },
    "export": {
        "enabled": true
    }
});


  // chart.addListener("rendered", zoomChart);
  // if(chart.zoomChart){
  //   chart.zoomChart();
  // }

  // function zoomChart(){
  //     chart.zoomToIndexes(Math.round(chart.dataProvider.length * 0.4), Math.round(chart.dataProvider.length * 0.55));
  // }
  }

}])

//任务设置--GL
.controller('TaskSetCtrl', ['$scope', '$state', '$ionicPopup', 'Storage','$ionicHistory', function ($scope, $state, $ionicPopup, Storage,$ionicHistory) {
   var UserId = Storage.get('UID');
    $scope.$on('$ionicView.enter', function() {
        Temp();
    });
  $scope.goback = function () {
    $ionicHistory.goBack();
  }
  //任务先写死
    $scope.Tasks = [
        {
          "type": "Measure",
          "details": [
            {
              "code": "Temperature",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "Weight",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "BloodPressure",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 2,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "Vol",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "HeartRate",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 2,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            }
          ]
        },
        {
          "type": "ReturnVisit",
          "details": [
            {
              "code": "TimeInterval_3",
              "instruction": "术后时间>3年",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 2,
              "frequencyUnits": "月"
            }
          ]
        },
        {
          "type": "LabTest",
          "details": [
            {
              "code": "LabTest_3",
              "instruction": "术后时间>3年",
              "content": "血常规、血生化、尿常规、尿生化、移植肾彩超、血药浓度",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 2,
              "frequencyUnits": "周"
            }
          ]
        },
        {
          "type": "SpecialEvaluate",
          "details": [
            {
              "code": "ECG",
              "instruction": "",
              "content": "心电图，胸片，移植肾B超",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "年"
            }
          ]
        }
      ];

  function Temp()
    {
       //console.log($scope.Tasks);
       $scope.Tasks.Other = [];
      for (var i=0;i<$scope.Tasks.length;i++)
      {
         var task = $scope.Tasks[i];
         if(task.type == 'Measure')
         {
            $scope.Tasks.Measure = task.details;
            for(var j=0;j<$scope.Tasks.Measure.length;j++)
            {
                $scope.Tasks.Measure[j].Name = NameMatch($scope.Tasks.Measure[j].code);
            }
         }
         else
         {
            var newTask = task.details[0];
            newTask.type = task.type;
            newTask.Name = NameMatch(newTask.type);
            $scope.Tasks.Other.push(newTask);
         }

      }
      //console.log($scope.Tasks);
    }

  //名称转换
   function NameMatch(name)
   {
     var Tbl = [
                 {Name:'体温', Code:'Temperature'},
                 {Name:'体重', Code:'Weight'},
                 {Name:'血压', Code:'BloodPressure'},
                 {Name:'尿量', Code:'Vol'},
                 {Name:'心率', Code:'HeartRate'},
                 {Name:'复诊', Code:'ReturnVisit'},
                 {Name:'化验', Code:'LabTest'},
                 {Name:'特殊评估', Code:'SpecialEvaluate'}
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == name)
         {
            name = Tbl[i].Name
            break;
         }
      }
      return name;
   }

  //下拉框数据
    $scope.Units = ["天", "周", "年", "月"];
    $scope.Times = [1, 2, 3, 4, 5, 6];

  //确定按钮
    $scope.OkClick = function()
    {
        //调用修改模板函数
        $state.go('tab.patientDetail');
    }

  //编辑任务描述
    $scope.showPopup = function(task) {
      $scope.data = {};
      $scope.data.value = task.content;
      var myPopup = $ionicPopup.show({
         template: '<textarea style="height:150px;" placeholder="在此输入备注消息......" ng-model="data.value"></textarea>',
         title: '请填写'+ task.Name + '备注',
         scope: $scope,
         buttons: [
           { text: '取消' },
           {
             text: '<b>保存</b>',
             type: 'button-positive',
             onTap: function(e) {
               if (!$scope.data.value) {
                 // 不允许用户关闭，除非输入内容
                 e.preventDefault();
               } else {
                return $scope.data.value;
               }
            }
           },
           ]
       });
       myPopup.then(function(res) {
        //console.log(res);
        if(res)
        {
          for(var i=0;i<$scope.Tasks.Measure.length;i++)
          {
              if($scope.Tasks.Measure[i].Name == task.Name)
              {
                  $scope.Tasks.Measure[i].content = res;
                  break;
              }
          }
          for(var i=0;i<$scope.Tasks.Other.length;i++)
          {
              if($scope.Tasks.Other[i].Name == task.Name)
              {
                  $scope.Tasks.Other[i].content = res;
                  break;
              }
          }
        }
        //console.log( $scope.Tasks);
      });
    };

}])


  .controller('messagesDetailCtrl', [ '$scope', '$state','$rootScope', function ( $scope,$state, $rootScope) {
    console.log('22222')
  }])
  .controller('healthCtrl',['$scope','$state', '$rootScope', function($scope,$state,$rootScope) {
  console.log('22222');
}])



//消息类型--PXY
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
//消息中心--PXY
.controller('messageCtrl', ['$scope','$state','$ionicHistory','Dict','Message','Storage',function($scope, $state,$ionicHistory,Dict,Message,Storage) {
    $scope.barwidth="width:0%";
    //get all message types
    Dict.typeOne({category:'MessageType'})
    .then(function(data)
    {
        // console.log(data.results.details)
        var messages={};
        angular.forEach(data.results.details,function(value,key)
        {
            // console.log(value)
            messages[value.inputCode]={name:value.name,code:value.code,values:[]};
        })
        // console.log(messages)
        Message.getMessages({userId:'U201704120001',type:""})//Storage.get('UID')
        .then(function(data)
        {
            // console.log(data)
            angular.forEach(data.results,function(value,key)
            {
                // console.log(value)
                if(value.type==1)//支付消息
                {
                    messages.ZF.values.push(value)
                }
                else if(value.type==2)//警报消息
                {
                    messages.JB.values.push(value)
                }
                else if(value.type==3)//任务消息
                {
                    messages.RW.values.push(value)
                }
                else if(value.type==4)//聊天消息
                {
                    messages.LT.values.push(value)
                }
                else if(value.type==5)//保险消息
                {
                    messages.BX.values.push(value)
                }
            })
            console.log(messages)
            Storage.set("allMessages",angular.toJson(messages));
            $scope.messages=messages;
        },function(err)
        {
            console.log(err)
        })
    },function(err)
    {
        console.log(err)
    })

  $scope.Goback = function(){
    $ionicHistory.goBack();
  }

    $scope.getMessageDetail = function(type){
        Storage.set("getMessageType",type);
        $state.go('messagesDetail');
    }
  //查询余额等等。。。。。
  // $scope.messages =[
  // {
  //   img:"img/default_user.png",
  //   name:"支付消息",
  //   type:1,
  //   time:"2017/04/01",
  //   response:"恭喜你！成功充值50元，交易账号为0093842345."
  // },
  // {
  //   img:"img/default_user.png",
  //   name:"任务消息",
  //   type:2,
  //   time:"2017/03/21",
  //   response:"今天还没有测量血压，请及时完成！"

  // },
  // {
  //   img:"img/default_user.png",
  //   name:"警报消息",
  //   type:3,
  //   time:"2017/03/11",
  //   response:"你的血压值已超出控制范围！"

  // }]


  // $scope.consults =[
  // {
  //   img:"img/default_user.png",
  //   name:"李芳",
  //   time:"2017/03/04",
  //   response:"您好,糖尿病患者出现肾病的,一般会出现低蛋白血症.低蛋白血症患者一般会出现浮肿.治疗浮肿时就需要适当的补充蛋白,但我们一般提倡使用优质蛋白,我不知道您的蛋白粉是不是植物蛋白,所以您还是慎重一点好."

  // },
  // {
  //   img:"img/default_user.png",
  //   name:"张三",
  //   time:"2017/03/01",
  //   response:"糖尿病肾损害的发生发展分5期.Ⅰ期,为糖尿病初期,肾体积增大,肾小球滤过滤增高,肾小球入球小动脉扩张,肾小球内压升高.Ⅱ期,肾小球毛细血管基底膜增厚,尿白蛋白排泄率多正常,或间歇性升高。"

  // }


  // ]



}])
// .controller('groupQRCodeCtrl', ['$scope', 'Storage', function ($scope, Storage) {
//   $scope.groupQRCodedata = "www.baidu.com"
// }])
