angular.module('tdy.controllers', ['ionic','kidney.services','ionic-datepicker'])

// 医生诊断-mzb
.controller('DoctorDiagnoseCtrl', ['Task','$scope', 'Storage','ionicDatePicker','Patient','$state','$ionicLoading', function (Task,$scope, Storage,ionicDatePicker,Patient,$state,$ionicLoading) {
  $scope.barStyle={'margin-top':'40px'}
  if(ionic.Platform.isIOS()){
      $scope.barStyle={'margin-top':'60px'}
  }
  $scope.BacktoPD = function(){
    $state.go('tab.patient');
  }

  $scope.charge = false
  $scope.follow = false
  if (Storage.get('dprelation') == 'charge') {
    $scope.charge = true
  }
  if (Storage.get('dprelation') == 'follow') {
    $scope.follow = true
  }
      
  var decodeDiseases=function(type)
  {
    var dict;
    switch(type)
    {
      case '2':
        dict="class_2";
        break;
      case '3':
        dict="class_3";
        break;
      case '4':
        dict="class_4";
        break;
      case '5':
        dict="class_6";
        break;
      case '6':
        dict="class_5";
        break;
      case '1':
        dict="class_1";
        break;
    }
    return dict;
  }
  var encodeDiseases=function(dict)
  {
    var type;
    switch(dict)
    {
      case "class_2":
        type='2';
        break;
      case "class_3":
        type='3';
        break;
      case "class_4":
        type='4';
        break;
      case "class_6":
        type='5';
        break;
      case "class_5":
        type='6';
        break;
      case "class_1":
        type='1';
        break;
    }
    return type;
  }
  var decodeprogress=function(type)
  {
    var dict;
    switch(type)
    {
      case '疾病活跃期':
        dict="stage_5";
        break;
      case '稳定期':
        dict="stage_6";
        break;
      case '>3年':
        dict="stage_7";
        break;
    }
    return dict;
  }
  var encodeprogress=function(dict)
  {
    var type;
    switch(dict)
    {
      case "stage_5":
        type='疾病活跃期';
        break;
      case "stage_6":
        type='稳定期';
        break;
      case "stage_7":
        type='>3年';
        break;
    }
    return type;
  }
  $scope.Hypers =
  [
    {Name:"是",Type:'1'},
    {Name:"否",Type:'2'}
  ]
  $scope.edit=false;
  var tmpDiagnose;
  $scope.canEdit=function()
  {
    $scope.edit=~$scope.edit;
    if($scope.edit)
    {
      tmpDiagnose=angular.copy($scope.Diagnose);
    }
    else
    {
      // console.log(tmpDiagnose)
      $scope.Diagnose=angular.copy(tmpDiagnose);
    }
  }
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
  var latestDiagnose=angular.fromJson(Storage.get("latestDiagnose"))
  // console.log(latestDiagnose)
  $scope.Diagnose = 
  {
    "diagname": encodeDiseases(latestDiagnose.name),
    "diagtime": (new Date()).toDateString(),
    "diagoperationTime": latestDiagnose.operationTime==undefined?(new Date()).toDateString():latestDiagnose.operationTime,
    "diaghypertension": ""+latestDiagnose.hypertension,
    "diagProgress": encodeprogress(latestDiagnose.progress),
    "diagContent":latestDiagnose.content
  }
  //console.log($scope.Diagnose)
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
    var MonthInterval = function(usertime){
        interval = new Date().getTime() - Date.parse(usertime);
        return(Math.floor(interval/(24*3600*1000*30)));
    }

    var distinctTask = function(kidneyType,kidneyTime,kidneyDetail){
        var sortNo = 1;
        //console.log(kidneyType);
        //console.log(kidneyDetail);
        // if(kidneyTime){
        //     kidneyTime = kidneyTime.substr(0,10);
        // }
        if(kidneyDetail){
            var kidneyDetail = kidneyDetail[0];
        }
        switch(kidneyType)
        {
            case "class_1":
                //肾移植
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    console.log("month"+month);
                    if(month>=0 && month<3){
                        sortNo = 1;//0-3月
                    }else if(month>=3 && month<6){
                        sortNo = 2; //3-6个月
                    }else if(month>=6 && month<36){
                        sortNo = 3; //6个月到3年
                    }else if(month>=36){
                        sortNo = 4;//对应肾移植大于3年
                    }

                }
                else{
                    sortNo = 4;
                }
                break;
            case "class_2": case "class_3"://慢性1-4期
                if(kidneyDetail!=undefined && kidneyDetail!=null && kidneyDetail!=""){
                    if(kidneyDetail=="stage_5"){//"疾病活跃期"
                        sortNo = 5;
                    }else if(kidneyDetail=="stage_6"){//"稳定期
                        sortNo = 6;
                    }else if(kidneyDetail == "stage_7"){//>3年
                        sortNo = 7;

                    }
                }
                else{
                    sortNo = 6;
                }
                break;
                
            case "class_4"://慢性5期
                sortNo = 8;
                break;
            case "class_5"://血透
                sortNo = 9;
                break;

            case "class_6"://腹透
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    //console.log("month"+month);
                    if(month<6){
                        sortNo = 10;
                    }
                    else{
                        sortNo = 11;
                    }
                }
                break;
        }
        return sortNo;

    }
  $scope.saveDiagnose=function()
  {
    $ionicLoading.show({
      template: '提交中...',
      duration:10000
    });    
    $scope.Diagnose.patientId=Storage.get('getpatientId');
    $scope.Diagnose.doctorId=Storage.get('UID');
    $scope.Diagnose.diagname=decodeDiseases($scope.Diagnose.diagname);
    $scope.Diagnose.diagProgress=decodeprogress($scope.Diagnose.diagProgress);
    //console.log($scope.Diagnose)
    var D = angular.copy($scope.Diagnose)
    //console.log(D)

    Patient.insertDiagnosis($scope.Diagnose)
    .then(function(data){
        var task = distinctTask(D.diagname,D.diagoperationTime,D.diagProgress);
        var patientId = Storage.get('getpatientId')
        //console.log(task)
        if(Storage.get('dprelation') == 'charge'){
          Task.insertTask({userId:patientId,sortNo:task}).then(
              function(data){
                  //console.log(data)
              },function(err){
                  //console.log("err" + err);
              });          
        }
        //console.log($scope.Diagnose)

      var lD={
          content:$scope.Diagnose.diagContent,
          hypertension:$scope.Diagnose.diaghypertension,
          name:$scope.Diagnose.diagname,
          operationTime:$scope.Diagnose.diagoperationTime,
          progress:$scope.Diagnose.diagProgress,
          time:$scope.Diagnose.diagtime
      }
      Storage.set("latestDiagnose",angular.toJson(lD));
      
      $scope.Diagnose.diagname=encodeDiseases($scope.Diagnose.diagname);
      $scope.Diagnose.diagProgress=encodeprogress($scope.Diagnose.diagProgress);

      tmpDiagnose=angular.copy($scope.Diagnose);
      $scope.canEdit();
    $ionicLoading.hide()
      // $state.go('tab.patientDetail');
    },function(err)
    {
      console.log(err)
    })
  }
  $scope.gototestrecord=function(){
      console.log(Storage.get('getpatientId'))
      $state.go('tab.TestRecord',{PatinetId:Storage.get('getpatientId')});
  }

}])

//测量记录-zxf
.controller('TestRecordCtrl', ['$state','$scope', '$http','$stateParams','Storage','VitalSign','labtestImport', function ($state,$scope,$http,$stateParams,Storage,VitalSign,labtestImport) {
  $scope.barStyle={'margin-top':'40px'}
  if(ionic.Platform.isIOS()){
      $scope.barStyle={'margin-top':'60px'}
  }
  $scope.BacktoPD = function(){
    $state.go('tab.patient');
  }  

      //console.log($stateParams.PatinetId)
      console.log(Storage.get("getpatientId"))
      var load =  function(){
          VitalSign.getVitalSigns({patientId:Storage.get("getpatientId"),type:'血压'}).then(
          function(Data){
            $scope.ChartDatas=[];
            $scope.ChartData1=[];
            $scope.ChartData2=[];
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
              if(Data.results[i].code=="血压"){
                for(var j=0;j<Data.results[i].data.length;j++){
                  if(Data.results[i].data[j].value||Data.results[i].data[j].value2){
                    $scope.ChartDatas.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value,Data.results[i].data[j].value2])
                  }
                  if(Data.results[i].data[j].value){
                    $scope.ChartData1.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value])
                  }
                  if(Data.results[i].data[j].value2){
                    $scope.ChartData2.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value2])
                  }

                }
              }
            }
            if($scope.ChartData1.length||$scope.ChartData2.length){
              
            // $scope.chartdiv1=true;
            }else{
              console.log(222)
              // $scope.chartdiv1=false;
            }
            var option1 = {
              title : {
                  text : '血压',
                  subtext : 'mmHg',
                  textStyle :{
                    fontSize :14
                  }
              },
              tooltip : {
                  trigger: 'axis'
                  // formatter : function (params) {
                  //     var date = new Date(params.value[0]);
                  //     data = date.getFullYear() + '-'
                  //            + (date.getMonth() + 1) + '-'
                  //            + date.getDate() + ' '
                  //            + date.getHours() + ':'
                  //            + date.getMinutes();
                  //     return data + '<br/>'
                  //            + params.value[1] + ', ' 
                  //            + params.value[2];
                  // }
              },
              dataZoom: {
                  show: true
                  // start : 50
              },
              legend : {
                  data : ['收缩压','舒张压']
              },
              grid: {
                  y2: 80
              },
              xAxis : [
                  {
                      type : 'time'
                      // splitNumber:8//分割的个数
                  }
              ],
              yAxis : [
                  {
                      type : 'value',
                      min:50,
                      max:250
                  }
              ],
              //new date(axisData[i]).getFullYear()+'-'+(new date(axisData[i]).getMonth()+1)+'-'+new date(axisData[i]).getDate()+' '+new date(axisData[i]).getHours()+':'+new date(axisData[i]).getMinutes()
              toolbox: {
                  show : true,
                  right :30,
                  feature : {
                      // mark : {show: true},
                      dataView : {
                        show: true, 
                        readOnly: true,
                        optionToContent: function(opt) {
                          var axisData = $scope.ChartDatas;
                          console.log(axisData)
                          var series = opt.series;
                          var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                       + '<td>时间</td>'
                                       + '<td>' + series[0].name + '</td>'
                                       + '<td>' + series[1].name + '</td>'
                                       + '</tr>';
                          for (var i = axisData.length-1, l = axisData.length; i >=0 ; i--) {
                            var td1,td2;
                            td1=(axisData[i][1]==undefined?"空":axisData[i][1])
                            td2=(axisData[i][2]==undefined?"空":axisData[i][2])
                            console.log(td1)
                              table += '<tr>'
                                       + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate()+' '+new Date(axisData[i][0]).getHours()+':'+new Date(axisData[i][0]).getMinutes() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                       + '<td>' + td1 + '</td>'
                                       + '<td>' + td2 + '</td>'
                                       + '</tr>';
                          }
                          table += '</tbody></table>';
                          return table;
                      }
                      }

                      // magicType : {show: true, type: ['line', 'bar']},
                      // restore : {show: true},
                      // saveAsImage : {show: true}
                  }
              },
              series : [
                  {
                      name: '收缩压',
                      type: 'line',
                      symbol:'roundRect',
                      symbolSize :8,
                      // showAllSymbol: true,
                      // symbolSize: function (value){
                      //     return Math.round(value[2]/10) + 2;
                      // },
                      data: $scope.ChartData1
                  },{
                    name:'舒张压',
                    type: 'line',
                    symbol:'diamond',
                    symbolSize :8,
                      // showAllSymbol: true,
                      // symbolSize: function (value){
                      //     return Math.round(value[2]/10) + 2;
                      // },
                      data: $scope.ChartData2
                  }
              ]
          };
            var myChart = echarts.init(document.getElementById('chartdiv1'));
            myChart.setOption(option1);
            
          }, function(e) {  
          });


          VitalSign.getVitalSigns({patientId:Storage.get("getpatientId"),type:'体温'}).then(
          function(Data){
            $scope.ChartData3=[];
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
              if(Data.results[i].code=="体温"){
                for(var j=0;j<Data.results[i].data.length;j++){
                  $scope.ChartData3.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value])
                }
              }
            }

            if($scope.ChartData3.length){
                  
              // $scope.chartdiv2=true;
            }else{
              // $scope.chartdiv2=false;
            }
            var option1 = {
                  title : {
                      text : '体温',
                      subtext : '℃',
                      textStyle :{
                        fontSize :14
                      }
                  },
                  tooltip : {
                      trigger: 'axis'
                      // formatter : function (params) {
                      //     var date = new Date(params.value[0]);
                      //     data = date.getFullYear() + '-'
                      //            + (date.getMonth() + 1) + '-'
                      //            + date.getDate() + ' '
                      //            + date.getHours() + ':'
                      //            + date.getMinutes();
                      //     return data + '<br/>'
                      //            + params.value[1] + ', ' 
                      //            + params.value[2];
                      // }
                  },
                  dataZoom: {
                      show: true
                      // start : 50
                  },
                  legend : {
                      data : ['体温']
                  },
                  grid: {
                      y2: 80
                  },
                  xAxis : [
                      {
                          type : 'time'
                          // splitNumber:8//分割的个数
                      }
                  ],
                  yAxis : [
                      {
                          type : 'value',
                          min:32,
                          max:50
                      }
                  ],
                  toolbox: {
                      show : true,
                      right :30,
                      feature : {
                          // mark : {show: true},
                          dataView : {
                            show: true, 
                            readOnly: true,
                            optionToContent: function(opt) {
                              var axisData = $scope.ChartData3;
                              console.log(axisData)
                              var series = opt.series;
                              var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                           + '<td>时间</td>'
                                           + '<td>' + series[0].name + '</td>'
                                           + '</tr>';
                              for (var i = axisData.length-1, l = axisData.length; i >= 0; i--) {
                                  table += '<tr>'
                                           + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate()+' '+new Date(axisData[i][0]).getHours()+':'+new Date(axisData[i][0]).getMinutes() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                           + '<td>' + axisData[i][1] + '</td>'
                                           + '</tr>';
                              }
                              table += '</tbody></table>';
                              return table;
                          }
                          }

                          // magicType : {show: true, type: ['line', 'bar']},
                          // restore : {show: true},
                          // saveAsImage : {show: true}
                      }
                  },
                  series : [
                      {
                          name: '体温',
                          type: 'line',
                          symbol:'emptyCircle',
                          symbolSize :8,
                          itemStyle:{
                            normal:{
                              color:"#ff6600"
                            }
                          },
                          // showAllSymbol: true,
                          // symbolSize: function (value){
                          //     return Math.round(value[2]/10) + 2;
                          // },
                          data: $scope.ChartData3
                      }
                  ]
              };
            var myChart = echarts.init(document.getElementById('chartdiv2'));
            myChart.setOption(option1);  


          }, function(e) {  
          });
          VitalSign.getVitalSigns({patientId:Storage.get("getpatientId"),type:'体重'}).then(
          function(Data){
            $scope.ChartData4=[];
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
              if(Data.results[i].code=="体重"){
                for(var j=0;j<Data.results[i].data.length;j++){
                  $scope.ChartData4.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value])
                }
              }
            }
            if($scope.ChartData4.length){
                  
              $scope.chartdiv3=true;
            }else{
              $scope.chartdiv3=false;
            }
            var option1 = {
                  title : {
                      text : '体重',
                      subtext : 'kg',
                      textStyle :{
                        fontSize :14
                      }
                  },
                  tooltip : {
                      trigger: 'axis'
                      // formatter : function (params) {
                      //     var date = new Date(params.value[0]);
                      //     data = date.getFullYear() + '-'
                      //            + (date.getMonth() + 1) + '-'
                      //            + date.getDate() + ' '
                      //            + date.getHours() + ':'
                      //            + date.getMinutes();
                      //     return data + '<br/>'
                      //            + params.value[1] + ', ' 
                      //            + params.value[2];
                      // }
                  },
                  dataZoom: {
                      show: true
                      // start : 50
                  },
                  legend : {
                      data : ['体重']
                  },
                  grid: {
                      y2: 80
                  },
                  xAxis : [
                      {
                          type : 'time'
                          // splitNumber:8//分割的个数
                      }
                  ],
                  yAxis : [
                      {
                          type : 'value',
                          min:30
                      }
                  ],
                  toolbox: {
                      show : true,
                      right :30,
                      feature : {
                          // mark : {show: true},
                          dataView : {
                            show: true, 
                            readOnly: true,
                            optionToContent: function(opt) {
                              var axisData = $scope.ChartData4;
                              console.log(axisData)
                              var series = opt.series;
                              var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                           + '<td>时间</td>'
                                           + '<td>' + series[0].name + '</td>'
                                           + '</tr>';
                              for (var i = axisData.length-1, l = axisData.length; i >= 0; i--) {
                                  table += '<tr>'
                                           + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate()+' '+new Date(axisData[i][0]).getHours()+':'+new Date(axisData[i][0]).getMinutes() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                           + '<td>' + axisData[i][1] + '</td>'
                                           + '</tr>';
                              }
                              table += '</tbody></table>';
                              return table;
                          }
                          }

                          // magicType : {show: true, type: ['line', 'bar']},
                          // restore : {show: true},
                          // saveAsImage : {show: true}
                      }
                  },
                  series : [
                      {
                          name: '体重',
                          type: 'line',
                          symbol:'circle',
                          symbolSize :8,
                          itemStyle:{
                            normal:{
                              color:"#990033"
                            }
                          },
                          // showAllSymbol: true,
                          // symbolSize: function (value){
                          //     return Math.round(value[2]/10) + 2;
                          // },
                          data: $scope.ChartData4
                      }
                  ]
              };
            var myChart = echarts.init(document.getElementById('chartdiv3'));
            myChart.setOption(option1);

          }, function(e) {  
          });
          VitalSign.getVitalSigns({patientId:Storage.get("getpatientId"),type:'尿量'}).then(
          function(Data){
            $scope.ChartData5=[];
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
              if(Data.results[i].code=="尿量"){
                for(var j=0;j<Data.results[i].data.length;j++){
                  $scope.ChartData5.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value])
                }
              }
            }
            if($scope.ChartData5.length){
              
              // $scope.chartdiv4=true;
            }else{
              // $scope.chartdiv4=false;
            }
            var option1 = {
              title : {
                  text : '尿量',
                  subtext : 'ml',
                  textStyle :{
                    fontSize :14
                  }
              },
              tooltip : {
                  trigger: 'axis'
                  // formatter : function (params) {
                  //     var date = new Date(params.value[0]);
                  //     data = date.getFullYear() + '-'
                  //            + (date.getMonth() + 1) + '-'
                  //            + date.getDate() + ' '
                  //            + date.getHours() + ':'
                  //            + date.getMinutes();
                  //     return data + '<br/>'
                  //            + params.value[1] + ', ' 
                  //            + params.value[2];
                  // }
              },
              dataZoom: {
                  show: true
                  // start : 50
              },
              legend : {
                  data : ['尿量']
              },
              grid: {
                  y2: 80
              },
              xAxis : [
                  {
                      type : 'time'
                      // splitNumber:8//分割的个数
                  }
              ],
              yAxis : [
                  {
                      type : 'value',
                      min:200
                  }
              ],
              toolbox: {
                  show : true,
                  right :30,
                  feature : {
                      // mark : {show: true},
                      dataView : {
                        show: true, 
                        readOnly: true,
                        optionToContent: function(opt) {
                          var axisData = $scope.ChartData5;
                          console.log(axisData)
                          var series = opt.series;
                          var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                       + '<td>时间</td>'
                                       + '<td>' + series[0].name + '</td>'
                                       + '</tr>';
                          for (var i = axisData.length-1, l = axisData.length; i >= 0; i--) {
                              table += '<tr>'
                                       + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate()+' '+new Date(axisData[i][0]).getHours()+':'+new Date(axisData[i][0]).getMinutes() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                       + '<td>' + axisData[i][1] + '</td>'
                                       + '</tr>';
                          }
                          table += '</tbody></table>';
                          return table;
                      }
                      }

                      // magicType : {show: true, type: ['line', 'bar']},
                      // restore : {show: true},
                      // saveAsImage : {show: true}
                  }
              },
              series : [
                  {
                      name: '尿量',
                      type: 'line',
                      symbol:'emptyCircle',
                      symbolSize :8,
                      itemStyle:{
                        normal:{
                          color:"#33cccc"
                        }
                      },
                      // showAllSymbol: true,
                      // symbolSize: function (value){
                      //     return Math.round(value[2]/10) + 2;
                      // },
                      data: $scope.ChartData5
                  }
              ]
          };
            var myChart = echarts.init(document.getElementById('chartdiv4'));
            myChart.setOption(option1);

          }, function(e) {  
          });
          VitalSign.getVitalSigns({patientId:Storage.get("getpatientId"),type:'心率'}).then(
          function(Data){
            $scope.ChartData6=[];
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
              if(Data.results[i].code=="心率"){
                for(var j=0;j<Data.results[i].data.length;j++){
                  $scope.ChartData6.push([new Date(new Date(Data.results[i].data[j].time)),Data.results[i].data[j].value])
                }
              }
            }
            if($scope.ChartData6.length){
                  
              $scope.chartdiv5=true;
            }else{
              $scope.chartdiv5=false;
            }
            var option1 = {
                  title : {
                      text : '心率',
                      subtext : '次/分钟',
                      textStyle :{
                        fontSize :14
                      }
                  },
                  tooltip : {
                      trigger: 'axis'
                      // formatter : function (params) {
                      //     var date = new Date(params.value[0]);
                      //     data = date.getFullYear() + '-'
                      //            + (date.getMonth() + 1) + '-'
                      //            + date.getDate() + ' '
                      //            + date.getHours() + ':'
                      //            + date.getMinutes();
                      //     return data + '<br/>'
                      //            + params.value[1] + ', ' 
                      //            + params.value[2];
                      // }
                  },
                  dataZoom: {
                      show: true
                      // start : 50
                  },
                  legend : {
                      data : ['心率']
                  },
                  grid: {
                      y2: 80
                  },
                  xAxis : [
                      {
                          type : 'time'
                          // splitNumber:8//分割的个数
                      }
                  ],
                  yAxis : [
                      {
                          type : 'value',
                          min:30
                      }
                  ],
                  toolbox: {
                      show : true,
                      right :30,
                      feature : {
                          // mark : {show: true},
                          dataView : {
                            show: true, 
                            readOnly: true,
                            optionToContent: function(opt) {
                              var axisData = $scope.ChartData6;
                              console.log(axisData)
                              var series = opt.series;
                              var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                           + '<td>时间</td>'
                                           + '<td>' + series[0].name + '</td>'
                                           + '</tr>';
                              for (var i = axisData.length-1, l = axisData.length; i >= 0; i--) {
                                  table += '<tr>'
                                           + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate()+' '+new Date(axisData[i][0]).getHours()+':'+new Date(axisData[i][0]).getMinutes() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                           + '<td>' + axisData[i][1] + '</td>'
                                           + '</tr>';
                              }
                              table += '</tbody></table>';
                              return table;
                          }
                          }

                          // magicType : {show: true, type: ['line', 'bar']},
                          // restore : {show: true},
                          // saveAsImage : {show: true}
                      }
                  },
                  series : [
                      {
                          name: '心率',
                          type: 'line',
                          symbol:'Circle',
                          symbolSize :8,
                          itemStyle:{
                            normal:{
                              color:"#cc0033"
                            }
                          },
                          // showAllSymbol: true,
                          // symbolSize: function (value){
                          //     return Math.round(value[2]/10) + 2;
                          // },
                          data: $scope.ChartData6
                      }
                  ]
              };
            var myChart = echarts.init(document.getElementById('chartdiv5'));
            myChart.setOption(option1);

          }, function(e) {  
          });        
      }
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }    
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
    $scope.$on('$ionicView.enter', function() {
        load();
    })

  // --------------化验信息-zy------------------
  $scope.params = {
    isTests: true,
    updateTime: 0
  }
  // 点亮测量记录标签
  $scope.showTests = function () {
    $scope.params.isTests = true
    load()
  }
  // 点亮化验信息标签
  $scope.showAssays = function () {
    $scope.params.isTests = false
    loadAssay()
  }

  //  SCr: 血肌酐, mm; GFR: 肾小球滤过率, df; ALB: 血白蛋白, qk/a; PRO: 尿蛋白, idii
  var loadAssay =  function(){
      labtestImport.getLabtestImport({
      patientId: Storage.get("getpatientId"),
      // token:Storage.get("TOKEN"),
      sort:'time' //根据时间降序排序
      }).then(function(Data){
        //console.log(Data)
            $scope.ChartDatas=[];
            $scope.ChartData1=[];
            $scope.ChartData2=[]; 
            $scope.ChartData3=[];
            $scope.ChartData4=[];         
            //console.log(Data.results.length)
            for(var i=0;i<Data.results.length;i++){
                  if(Data.results[i].type=="SCr"||Data.results[i].type=="GFR"||Data.results[i].type=="df"||Data.results[i].type=="PRO"){
                    $scope.ChartDatas.push([new Date(new Date(Data.results[i].time)),Data.results[i].type,Data.results[i].value])
                    //console.log($scope.ChartDatas)
                  }
                  if(Data.results[i].type=="SCr"){
                    $scope.ChartData1.push([new Date(new Date(Data.results[i].time)),Data.results[i].value])                   
                    //console.log($scope.ChartData1)
                  }
                  if(Data.results[i].type=="GFR"){
                    $scope.ChartData2.push([new Date(new Date(Data.results[i].time)),Data.results[i].value])
                    //console.log($scope.ChartData2)
                  }
                  if(Data.results[i].type=="ALB"){
                    $scope.ChartData3.push([new Date(new Date(Data.results[i].time)),Data.results[i].value])
                    //console.log($scope.ChartData3)
                  }
                  if(Data.results[i].type=="PRO"){
                    $scope.ChartData4.push([new Date(new Date(Data.results[i].time)),Data.results[i].value])
                    //console.log($scope.ChartData4)
                  }
            }
            var option1 = {
              title : {
                  text : '化验蛋白',
                  //subtext : 'mmHg',
                  textStyle :{
                    fontSize :12
                  }
              },
              tooltip : {
                  trigger: 'axis'
                  // formatter : function (params) {
                  //     var date = new Date(params.value[0]);
                  //     data = date.getFullYear() + '-'
                  //            + (date.getMonth() + 1) + '-'
                  //            + date.getDate() + ' '
                  //            + date.getHours() + ':'
                  //            + date.getMinutes();
                  //     return data + '<br/>'
                  //            + params.value[1] + ', ' 
                  //            + params.value[2];
                  // }
              },
              dataZoom: {
                  show: true
                  // start : 50
              },
              legend : {
                  data : ['血肌酐(SCr)','肾小球滤过率(GFR)','血白蛋白(ALB)','尿蛋白(PRO)']
              },
              grid: {
                  y2: 80
              },
              xAxis : [
                  {
                      type : 'time',
                      //min: 'dataMin'
                      // splitNumber:8//分割的个数
                  }
              ],
              yAxis : [
                  {
                      type : 'value',
                      min:0,
                      max:5
                  }
              ],
              //new date(axisData[i]).getFullYear()+'-'+(new date(axisData[i]).getMonth()+1)+'-'+new date(axisData[i]).getDate()+' '+new date(axisData[i]).getHours()+':'+new date(axisData[i]).getMinutes()
              toolbox: {
                  show : true,
                  right :30,
                  feature : {
                      // mark : {show: true},
                      dataView : {
                        show: true, 
                        readOnly: true,
                        optionToContent: function(opt) {
                          var axisData = $scope.ChartDatas;
                          // console.log(axisData)
                          var series = opt.series;
                          var table = '<table style="width:100%;text-align:center"><tbody><tr>'
                                       + '<td>时间</td>'
                                       // + '<td>' + series[0].name + '</td>'
                                       // + '<td>' + series[1].name + '</td>'
                                       // + '<td>' + series[2].name + '</td>'
                                       // + '<td>' + series[3].name + '</td>'
                                       + '<td>类别</td>'
                                       + '<td>数值</td>' 
                                       + '</tr>';
                          for (var i = axisData.length-1, l = axisData.length; i >=0 ; i--) {
                            var td1,td2;
                            td1=(axisData[i][1]==undefined?"空":axisData[i][1])
                            td2=(axisData[i][2]==undefined?"空":axisData[i][2])
                            // td3=(axisData[i][3]==undefined?"空":axisData[i][3])
                            // td4=(axisData[i][4]==undefined?"空":axisData[i][4])
                            // console.log(td1)
                            table += '<tr>'
                                     + '<td>' + (new Date(axisData[i][0]).getMonth()+1)+'-'+new Date(axisData[i][0]).getDate() + '</td>' //axisData[i].getFullYear()+'-'+(axisData[i].getMonth()+1)+'-'+axisData[i].getDate()+' '+axisData[i].getHours()+':'+axisData[i].getMinutes();
                                     + '<td>' + td1 + '</td>'
                                     + '<td>' + td2 + '</td>'
                                     // + '<td>' + td3 + '</td>'
                                     // + '<td>' + td4 + '</td>'
                                     + '</tr>';
                          }
                          table += '</tbody></table>';
                          return table;
                      }
                      }
                  }
              },
              series : [
                  {
                      name: '血肌酐(SCr)',
                      type: 'line',
                      symbol:'roundRect',
                      symbolSize :8,
                      data: $scope.ChartData1
                  },{
                      name:'肾小球滤过率(GFR)',
                      type: 'line',
                      symbol:'diamond',
                      symbolSize :8,
                      data: $scope.ChartData2
                  },{
                      name: '血白蛋白(ALB)',
                      type: 'line',
                      symbol:'bar',
                      symbolSize :8,
                      data: $scope.ChartData3
                  },{
                      name:'尿蛋白(PRO)',
                      type: 'line',
                      symbol:'diamond',
                      symbolSize :8,
                      data: $scope.ChartData4
                  }
              ]
          };
      var myChart = echarts.init(document.getElementById('chartdiv11'));
      myChart.setOption(option1);      
    }, function(e) {  
    });
  }

  // $scope.test = function(){
  //   labtestImport.getLabtestImport({
  //     patientId: 'U201705170020',
  //     token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTE0NzY1MjQ0MDBlZjEzYzA1ZmY5MzEiLCJ1c2VySWQiOiJVMjAxNzA1MTEwMDAxIiwicm9sZSI6ImRvY3RvciIsImV4cCI6MTQ5OTY3MDI0NDkxNiwiaWF0IjoxNDk5NjY2NjQ0fQ.mwJq-IrB1RNSW5XILWMgKCwUhaMSIsZPBr-jQkHzGrU'
  //   }) .then(function (data) {
  //     console.log(data)
  //   }, function (err) {
  //     console.log(err)
  //   })
  // }
  
}])

//任务设置--GL
.controller('TaskSetCtrl', ['$scope', '$state', '$ionicPopup', 'Storage', 'Task','$ionicLoading', function ($scope, $state, $ionicPopup, Storage, Task,$ionicLoading) {
  $scope.barStyle={'margin-top':'40px'}
  if(ionic.Platform.isIOS()){
      $scope.barStyle={'margin-top':'60px'}
  }
  $scope.BacktoPD = function(){
    $state.go('tab.patient');
  }
  //初始化
  var UserId = Storage.get('getpatientId'); 
  //UserId = "Test12";
  $scope.Tasks = [];
  $scope.EditTasks = []; //修改任务
  $scope.$on('$ionicView.enter', function() {
      GetTasks();
  }); 
  var index = 0;//方法调用计数

  $scope.charge = false
  $scope.follow = false
  if (Storage.get('dprelation') == 'charge') {
    $scope.charge = true
  }
  if (Storage.get('dprelation') == 'follow') {
    $scope.follow = true
  }
  // console.log($scope.charge)

  //获取对应任务模板
    function GetTasks(TaskCode)
    {     
       var promise =  Task.getUserTask({userId:UserId});
       promise.then(function(data){
         if(data.result.length != 0)
         {
            $scope.Tasks = data.result.task;
            //console.log($scope.Tasks);
            HandleTasks();
         }
       },function(){
                      
       })
    }

  //获取任务后处理
    function HandleTasks()
    {                       
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
                $scope.Tasks.Measure[j].type = task.type;               
            }
         }
         else
         {
            for(var j=0;j<task.details.length;j++)
            {
               var newTask = task.details[j];       
               if(newTask.times != 0)
               {
                 newTask.flag = true;
                 newTask.type = task.type;
                 if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
                 {
                    //newTask.dateStr = newTask.content;
                    newTask.flag = false; //暂时设定血透排班不可更改备注
                    newTask.content = "设定血透排班";
                 }    
                 newTask.Name = NameMatch(newTask.type);               
                 $scope.Tasks.Other.push(newTask);   
               }
            }                        
         }   
      }
    }

  //修改任务模板
   function UpdateUserTask()
    {
      if(index < $scope.EditTasks.length)
      {
        var temp = $scope.EditTasks[index];
        var task = {
                            "userId":UserId, 
                            "type":temp.type, 
                            "code":temp.code, 
                            "instruction":temp.instruction, 
                            "content":temp.content, 
                            "startTime":temp.startTime, 
                            "endTime":temp.endTime, 
                            "times":temp.times,
                            "timesUnits":temp.timesUnits, 
                            "frequencyTimes":temp.frequencyTimes, 
                            "frequencyUnits":temp.frequencyUnits
                    };
        var promise = Task.updateUserTask(task);
         promise.then(function(data){
         if(data.results)
         { 
           //task.Flag = true;
           //console.log(task.code);
           index = index + 1; 
           if(index == $scope.EditTasks.length)
           {
             $state.go('tab.patientDetail');
           }
           else
           {
             UpdateUserTask();      
           }                  
         };
         },function(){                    
         })
      }
      
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
                 {Name:'特殊评估', Code:'SpecialEvaluate'},
                 {Name:'血管通路情况', Code:'VascularAccess'},
                 {Name:'腹透', Code:'PeritonealDialysis'},
                 {Name:'超滤量', Code:'cll'},
                 {Name:'浮肿', Code:'ywfz'},
                 {Name:'引流通畅', Code:'yl'}
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
      $ionicLoading.show({
        template: '提交中...',
        duration:10000
      });           
       UpdateUserTask();                 
    }
  
    $scope.$on('$ionicView.beforeLeave',function(){
       $ionicLoading.hide();
     })


  //编辑任务描述
    $scope.showPopup = function(task) {
      $scope.data = {};    
      $scope.data.value = task.content;                    
      var myPopup = $ionicPopup.show({
         template: '<textarea style="height:150px;" ng-model="data.value"></textarea>',     
         title: '请填写'+ task.Name + '备注',
         scope: $scope,
         buttons: [
           { text: '取消' },
           {
             text: '保存',
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
          task.content = res;
          var flag = false;
          var newTask = JSON.parse(JSON.stringify(task));
          newTask.Flag = false;
         /* if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
          {            
             newTask.content = newTask.dateStr;
          }*/
          for(var i=0;i<$scope.EditTasks.length;i++)
          {
             if($scope.EditTasks[i].Name == newTask.Name)
             {
                $scope.EditTasks[i] = newTask;
                flag = true;
                break;
             }
          }
          if(!flag)
          {
             $scope.EditTasks.push(newTask);
          }
        } 
        //console.log( $scope.Tasks);
      });
    };

  //修改任务执行频率
    $scope.ChangeFreq = function (item)
    {
      if($scope.charge == false){
        $ionicPopup.show({
          title: '抱歉！您不是该患者的主管医生，没有权限修改健康方案！',
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
      var newTask = JSON.parse(JSON.stringify(item));
      var flag = false;
      /*if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
      {
         newTask.instruction = newTask.content;
         newTask.content = newTask.dateStr;
      }*/
      for(var i=0;i<$scope.EditTasks.length;i++)
      { 
         var task = $scope.EditTasks[i]
         if(task.Name == newTask.Name)
         {
            task = newTask;
            flag = true;
         }
      }
      if(!flag)
      {
         newTask.Flag = false;
         $scope.EditTasks.push(newTask);
      }      
    }

    $scope.gototestrecord=function(){
        console.log(Storage.get('getpatientId'))
        $state.go('tab.TestRecord',{PatinetId:Storage.get('getpatientId')});
    }

}])


//健康信息-pxy,zy
.controller('HealthInfoCtrl', ['$state','$scope','$timeout','$state','$ionicHistory','$ionicPopup','Storage','Health','Dict','CONFIG','$ionicModal','$ionicScrollDelegate',function($state,$scope, $timeout,$state,$ionicHistory,$ionicPopup,Storage,Health,Dict,CONFIG,$ionicModal,$ionicScrollDelegate) {
  $scope.barStyle={'margin-top':'40px'}
  if(ionic.Platform.isIOS()){
    $scope.barStyle={'margin-top':'60px'}
  }
  $scope.barwidth="width:0%";
  // 返回健康详情
  $scope.BacktoPD = function(){
    $state.go('tab.patient');
  }
  var patientId = Storage.get('getpatientId')
  //console.log(Storage.get('getpatientId'))
  // var patientId = 'U201702071766'  //测试ID

  $scope.Goback = function(){
    $state.go('tab.patientDetail')
  }

  //从字典中搜索选中的对象。
  // var searchObj = function(code,array){
  //     for (var i = 0; i < array.length; i++) {
  //       if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
  //     };
  //     return "未填写";
  // }

  $scope.items = []

  /**
   * [获取健康详情信息]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    userId(患者id): string
   * @return   data.results(患者健康信息)
   */
  var urlArray = new Array()
  var load = function(code){
    console.log(patientId)
    Health.getAllHealths({patientId:patientId,type:code}).then(function(data)
      {
        if (data.results!= null)
        {
          $scope.items = data.results
          //console.log($scope.items)
          //var testtime=$scope.items[0]
          //console.log(testtime)
          for (var i = 0; i < $scope.items.length; i++){
            $scope.items[i].acture = $scope.items[i].insertTime
              if ($scope.items[i].url != "" && $scope.items[i].url!=null) {
                urlArray = urlArray.concat($scope.items[i].url)
            }            
            //$scope.items[i].time = $scope.items[i].time.substr(0,10)
            // if ($scope.items[i].url != ""&&$scope.items[i].url!=null)
            // {
            //   $scope.items[i].url = [$scope.items[i].url]
            // }
          }
            for (i = 0; i < urlArray.length; i++) {
              $scope.Images[i] = CONFIG.imgLargeUrl+urlArray[i].slice(urlArray[i].lastIndexOf('/')+1).substr(7)
            }
        };
      },function(err)
      {
        console.log(err);
      }
    )
  }

  $scope.$on('$ionicView.enter', function() {
      load();
      imgModalInit ()
  })

  $scope.doRefresh = function(code){
      load(code);
      imgModalInit ()
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
  }
  
  /**
   * [对一条健康信息特定操作]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    ele(MouseEvent); editId(特定健康信息): object
   * @return   查看或删除特定健康信息
   */
  $scope.gotoHealthDetail=function(ele,editId){
    // console.log(ele)
    // console.log(editId)
    // console.log(ele.target.nodeName)
    if(ele.target.nodeName=="I"){
      var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '记录删除后将无法恢复，确认删除？',
      cancelText:'取消',
      okText:'删除'
      });

      confirmPopup.then(function(res) {
        if(res) 
          {
            Health.deleteHealth({patientId:patientId,insertTime:editId.acture}).then(
              function(data)
              {
                // console.log(data)
                load()
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (editId.acture == $scope.items[i].acture)
                    {
                      $scope.items.splice(i,1)
                      break;
                    }
                  }
                }
                // console.log($scope.items)
              },
              function(err)
              {
                console.log(err);
              }
            )
            //20140421 zxf
            // var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            // for(var i=0;i<healthinfotimes.length;i++){
            //   if(healthinfotimes[i].time==item.acture){
            //     healthinfotimes.splice(i, 1)
            //     break;
            //   }
            // }
            // Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
            // HealthInfo.remove(number);
            // $scope.items = HealthInfo.getall();
          } 
        });
    }else{
      $state.go('tab.HealthInfoDetail',{id:editId});
    }
    
  }

  // 新建健康信息
  $scope.newHealth = function(){
    $state.go('tab.HealthInfoDetail',{id:null});
  }

  $scope.gototestrecord=function(){
      // console.log(Storage.get('getpatientId'))
      $state.go('tab.TestRecord',{PatinetId:Storage.get('getpatientId')});
  }
  // $scope.EditHealth = function(editId){
  //   console.log("健康信息");
  //   console.log(editId);
  //   $state.go('tab.myHealthInfoDetail',{id:editId});
  // } 
  //---------点击显示大图------------
  //图片模块初始化
    function imgModalInit () {
    $scope.zoomMin = 1
    $scope.imageUrl = ''
    // $scope.imageIndex = -1 //当前展示的图片
    $scope.Images = []
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        // $scope.modal.show();
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    }); 
  }
  $scope.showbigger = function (path) {
    $scope.imageIndex = urlArray.indexOf(path)
    var originalfilepath = CONFIG.imgLargeUrl + path.slice(path.lastIndexOf('/') + 1).substr(7)
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
  //右划图片
  $scope.onSwipeRight = function () {
    if ($scope.imageIndex <= $scope.Images.length - 1 && $scope.imageIndex > 0)
      $scope.imageIndex = $scope.imageIndex - 1;
    else {
      //如果图片已经是第一张图片了，则取index = Images.length-1
      $scope.imageIndex = $scope.Images.length - 1;
    }
    $scope.imageUrl = $scope.Images[$scope.imageIndex];
  }
  //左划图片
  $scope.onSwipeLeft = function () {
    if ($scope.imageIndex < $scope.Images.length - 1 && $scope.imageIndex >= 0)
      $scope.imageIndex = $scope.imageIndex + 1;
    else {
      //如果图片已经是最后一张图片了，则取index = 0
      $scope.imageIndex = 0;
    }
    //替换url，展示图片
    $scope.imageUrl = $scope.Images[$scope.imageIndex];
  }  
}])


//健康详情-zy,zxf,pxy
.controller('HealthDetailCtrl', ['CONFIG','ionicDatePicker','$scope','$state','$ionicHistory','$ionicPopup','$stateParams','$ionicPopover','$ionicModal','$ionicScrollDelegate','$ionicLoading','$timeout','Dict','Health','Storage','Camera',function(CONFIG,ionicDatePicker,$scope, $state,$ionicHistory,$ionicPopup,$stateParams,$ionicPopover,$ionicModal,$ionicScrollDelegate,$ionicLoading,$timeout,Dict,Health,Storage,Camera) {
  $scope.barwidth="width:0%";
  var patientId = Storage.get('getpatientId')
  // console.log(patientId)
  // $scope.test = function(){
  //   console.log($scope.datepickerObject4);
  // }
  $scope.Images = [];
  $scope.Goback = function(){
    if($scope.canEdit==true){
      $scope.canEdit = false;
    }else{
      if($ionicHistory.backTitle()==null){
        $state.go('tab.HealthInfo');
      }else{
        $ionicHistory.goBack();
      }
        //console.log(123);
        //console.log($ionicHistory.backTitle());            
    }        
  }

  $scope.edit = function(){
      $scope.canEdit = true;
  }

  //从字典中搜索选中的对象。
  var searchObj = function(code,array){
    for (var i = 0; i < array.length; i++) {
      if(array[i].name == code) return array[i];
    };
    return "未填写";
  }

  // 获取标签类别
  $scope.labels = {}; // 初始化
    $scope.health={
    label:null,
    date:null,
    text:null,
    imgurl:null
  }
  $scope.health.imgurl=[]
  Dict.getHeathLabelInfo({category:"healthInfoType"}).then(function(data){
    $scope.labels = data.results.details
    //判断是修改还是新增
    if($stateParams.id!=null && $stateParams!=""){
      //修改
      $scope.canEdit = false;
      var info = $stateParams.id;
      //console.log(info)
      // 获取患者健康信息
      Health.getHealthDetail({patientId:patientId,insertTime:info.acture}).then(function(data){
        // console.log(data)
        if (data.results != "" && data.results != null)
        {
          $scope.health.label = data.results.label
          if ($scope.health.label != null && $scope.health.label != "")
          {
            $scope.health.label = searchObj($scope.health.label,$scope.labels);
            //console.log( $scope.health.label);
          }
          $scope.health.date = data.results.time
          $scope.health.text = data.results.description
          if (data.results.url != ""&&data.results.url!=null)
          {
            //console.log(data.results.url)
            $scope.health.imgurl = data.results.url
            // $scope.showflag=true;
            for (i = 0; i < data.results.url.length; i++) {
              $scope.Images[i] = CONFIG.imgLargeUrl+data.results.url[i].slice(data.results.url[i].lastIndexOf('/')+1).substr(7)
              //console.log($scope.Images)
            } 
          }
        }
        // console.log($scope.health);
      },function(err)
      {
        console.log(err);
      })
    }else{
      $scope.canEdit = true;
    }
    // console.log($scope.labels);
  },function(err)
  {
    console.log(err);
  })
  //angular.toJson fromJson()
  //2017419 zxf
  // var testtt=[];
  // testtt.push("http://121.43.107.106:8052/uploads/photos/")
  // testtt.push("http://121.43.107.10da6:8052/uploads/photos/")
  // Storage.set('test',angular.toJson(testtt))
  // console.log(testtt)
  // console.log(Storage.get('test'))
  // console.log(angular.fromJson(Storage.get('test')))
  // testtt=angular.fromJson(Storage.get('test'))

  // Storage.set('localhealthinfoimg',angular.toJson(testtt))
  //进入之后local有数据但是不显示
  // $scope.health.imgurl=[];
  // var tmpimgurl=Storage.get('localhealthinfoimg');
  // console.log(tmpimgurl)
  // if(tmpimgurl!=""&&tmpimgurl!=null){
  //   console.log(tmpimgurl)
  //   $scope.health.imgurl=angular.fromJson(tmpimgurl);
  //   console.log($scope.health.imgurl)
  //   $scope.showflag=true;
  // }

  // $scope.$on('$ionicView.beforeLeave',function(){
  //   $ionicLoading.hide();
  // })  
  // console.log($ionicHistory.backView())
  // 新增健康信息保存
  $scope.HealthInfoSetup = function(){
    if($scope.health.label!=""&&$scope.health.text!=""&&$scope.health.date!=""){
      //console.log($stateParams.id)
      $ionicLoading.show({
        template: '上传中...',
        duration:10000
      });      
        if($stateParams.id==null||$stateParams==""){
          // 新增健康信息
          Health.createHealth({patientId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:""}).then(function(data){
            // console.log(data.results);
            $scope.canEdit= false;
            var healthinfoToconsult=[]
            //从咨询过来的需要返回对应的健康信息
            // if($ionicHistory.backView()!=null&&$ionicHistory.backView().stateName=='tab.consultquestion2'){
            //   if(Storage.get('consulthealthinfo')==''||Storage.get('consulthealthinfo')==null||Storage.get('consulthealthinfo')=='undefined'){
            //     healthinfoToconsult.push({'time':data.results.insertTime})
            //   }else{
            //     healthinfoToconsult=angular.fromJson(Storage.get('consulthealthinfo'))
            //     healthinfoToconsult.push({'time':data.results.insertTime})
            //   }
            //   Storage.set('consulthealthinfo',angular.toJson(healthinfoToconsult))
            //   console.log(Storage.get('consulthealthinfo'))
            // }
            $ionicHistory.goBack()
          },function(err){
            console.log(err);
          })
        }
        else{
          var curdate=new Date();
          Health.modifyHealth({patientId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:"",insertTime:$stateParams.id.insertTime}).then(function(data){
            // console.log(data.data);
            $scope.canEdit= false;
            // $ionicHistory.goBack()
          },function(err)
          {
            console.log(err);
          })
        }
      $ionicLoading.hide();
    }
    else{
      $ionicLoading.show({
          template:'信息填写不完整',
          duration:1000
      });
    }
  }

  // 日期控件  
  var ipObj1 = {
      callback: function (val) {  //Mandatory
          // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
          var date=new Date(val)
          date.setHours(8)
          $scope.health.date = date.toUTCString();
          console.log($scope.health.date);
          console.log(date);       
      },
      titleLabel: '日期选择',
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

  $scope.openDatePicker = function(params){
      ionicDatePicker.openDatePicker(ipObj1);
  };

  // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function($event){
    $scope.openPopover($event);
  };
 
 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function(imgURI){
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get('getpatientId') + "_" + new Date().getTime() + "healthinfo.jpg";
    console.log(temp_photoaddress)
    Camera.uploadPicture(imgURI, temp_photoaddress)
    .then(function(res){
      var data=angular.fromJson(res)
      //图片路径
      $scope.health.imgurl.push(CONFIG.mediaUrl+String(data.path_resized))
      // $state.reload("tab.mine")
      // Storage.set('localhealthinfoimg',angular.toJson($scope.health.imgurl));
      console.log($scope.health.imgurl)
      // $scope.showflag=true;
    },function(err){
      console.log(err);
      reject(err);
    })
  };
//-----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        //--------------------------------------------
        // .fromTemplateUrl() method
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
  $scope.isShow=true;
  $scope.takePicture = function() {
   Camera.getPicture('cam',true).then(function(data) {
      var imgURI = data;
      photo_upload_display(imgURI);
    }, function(err) {
        // console.err(err);
        var imgURI = undefined;
    })// 照相结束
  }; // function结束

  //   $scope.openModal = function() {
  //     $scope.modal.show();
  //   };
  //   $scope.closeModal = function() {
  //     $scope.modal.hide();
  //   };
  //   //Cleanup the modal when we're done with it!
  //   $scope.$on('$destroy', function() {
  //     $scope.modal.remove();
  //   });
  //   // Execute action on hide modal
  //   $scope.$on('modal.hidden', function() {
  //     // Execute action
  //   });
  //   // Execute action on remove modal
  //   $scope.$on('modal.removed', function() {
  //     // Execute action
  //   });

  // //点击图片返回
  // $scope.imggoback = function(){
  //   $scope.modal.hide();
  // };

  //---------点击显示大图------------
  //图片模块初始化
  function imgModalInit () {
    $scope.zoomMin = 1;
    $scope.imageUrl = '';
    // $scope.imageIndex = -1;//当前展示的图片
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        // $scope.modal.show();
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    }); 
  }

  $scope.showoriginal=function(resizedpath){
        // $scope.openModal();
        //console.log(resizedpath)
        //console.log($scope.imageIndex)
        var originalfilepath=CONFIG.imgLargeUrl+resizedpath.slice(resizedpath.lastIndexOf('/')+1).substr(7)
        //console.log(originalfilepath)
        // $scope.doctorimgurl=originalfilepath;
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = originalfilepath;
        $scope.imageIndex = $scope.Images.indexOf($scope.imageUrl)
        $scope.modal.show();
    }
  //关掉图片
  $scope.closeModal = function() {
      $scope.imageHandle.zoomTo(1, true);
      $scope.modal.hide();
      // $scope.modal.remove()
  };
  //双击调整缩放
  $scope.switchZoomLevel = function() {
      if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
          $scope.imageHandle.zoomTo(1, true);
      else {
          $scope.imageHandle.zoomTo(5, true);
      }
  }
  //右划图片
  $scope.onSwipeRight = function () {
    if ($scope.imageIndex <= $scope.Images.length - 1 && $scope.imageIndex > 0)
      $scope.imageIndex = $scope.imageIndex - 1;
    else {
      //如果图片已经是第一张图片了，则取index = Images.length-1
      $scope.imageIndex = $scope.Images.length - 1;
    }
    $scope.imageUrl = $scope.Images[$scope.imageIndex];
  }

  //左划图片
  $scope.onSwipeLeft = function () {
    if ($scope.imageIndex < $scope.Images.length - 1 && $scope.imageIndex >= 0)
      $scope.imageIndex = $scope.imageIndex + 1;
    else {
      //如果图片已经是最后一张图片了，则取index = 0
      $scope.imageIndex = 0;
    }
    //替换url，展示图片
    $scope.imageUrl = $scope.Images[$scope.imageIndex];
  }  
  

  $scope.deleteimg=function(index){
    //somearray.removeByValue("tue");
    console.log($scope.health.imgurl)
    $scope.health.imgurl.splice(index, 1)
    // Storage.set('tempimgrul',angular.toJson($scope.images));
  }

  $scope.$on('$ionicView.enter', function() {
    imgModalInit ();
  })

  $scope.$on('$ionicView.leave', function() {
    $scope.modal.remove();
  })
  
}])


//消息中心--ZY
.controller('messageCtrl', ['$ionicPopup','$q','$scope','$state','$ionicHistory','New','Storage','Doctor','Patient2','Communication','Counsel',function($ionicPopup,$q,$scope, $state,$ionicHistory,New,Storage,Doctor,Patient2,Communication,Counsel) {
  $scope.barwidth="width:0%";
  
  /**
   * [获取患者姓名头像]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    sender: string; patient: object
   * @return   patient.Name; patient.Photo
   */
  var getPatNamePhoto = function(sender,patient){
    console.log(patient)
    Patient2.getPatientDetail({userId:sender}).then(function(data){
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

  /**
   * [获取医生姓名头像]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    sender: string; doctor: object
   * @return   doctor.Name; doctor.Photo
   */
  var getDocNamePhoto = function(sender,doctor){
    Doctor.doctor({userId:sender}).then(function(data){
      if(data.results){
        //console.log(data.results)
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

  /**
   * [获取团队姓名头像]
   * @Author   ZY
   * @DateTime 2017-07-05
   * @param    sender: string; team: object
   * @return   team.Name; team.Photo
   */
  var getTeamNamePhoto = function(sender,team){
    Communication.getTeam({teamId:sender}).then(function(data){
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

  // 病例讨论显示
  var getCaseNamePhoto = function(sender,pcase){
    pcase.Name = '病例讨论';
    pcase.Photo = 'img/DefaultAvatar.jpg';                                                
  }

  /**
   * [获取新消息]
   * @Author   ZY
   * @DateTime 2017-07-05
   */
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

    //获取所有类别聊天消息 type=chat  分类别type11患者-医生  type12医生-医生   type13团队消息 type15病例讨论
    New.getNewsByReadOrNot({userId:receiver,type:'chat',readOrNot:0,userRole:'doctor'}).then(function(data){
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
          if(data.results[i].type == 15){
              getCaseNamePhoto(data.results[i].sendBy,data.results[i]);                                                
          }  
        } 
        $scope.chats=data.results;
      }
    },function(err){
      console.log(err);
    });  

    // 获取未及时回复咨询推送
    New.getNewsByReadOrNot({type:'14',readOrNot:0}).then(function(data){
      $scope.noCounsels=data.results;
      //console.log($scope.noCounsels[0].readOrNot)
    },function(err){
      console.log(err);
    });   

     // 获取未及时修改患者方案的提醒列表
    New.getNewsByReadOrNot({type:'9',readOrNot:0}).then(function(data){
      $scope.changingTasks=data.results;
      console.log($scope.changingTasks)
    },function(err){
      console.log(err);
    });            

     // 获取警报消息
    New.getNewsByReadOrNot({type:'2',readOrNot:0}).then(function(data){
      $scope.patientAlerts=data.results;
      console.log($scope.patientAlerts)
    },function(err){
      console.log(err);
    });        

  }
           
  $scope.$on('$ionicView.enter', function() {
    Lastnews();
  })

  $scope.do_refresher = function(){
    Lastnews();
    $scope.$broadcast("scroll.refreshComplete");
  }

  $scope.Goback = function(){
    $state.go('tab.workplace')
  }

  //患者-医生  获取咨询状态 [status]：1进行中；0已完成  进入聊天：[type]:1=进行中;0=已结束;
  getPChatDetail = function(Pchat) {
    var patientId = Pchat.sendBy;
    Counsel.getStatus({doctorId:Storage.get('UID'),patientId:patientId}).then(function(data){
     $state.go('tab.detail', {chatId: patientId, type: data.result.status, counselId: data.result.counselId})
    })
  }

  //医生-医生 进入聊天：type：2
  getDChatDetail = function(Dchat) {
    console.log(Dchat.sendBy)
    $state.go("tab.detail",{chatId:Dchat.sendBy,type:2,consultId:'DoctorChat'});
  }

  //团队聊天
  getTChatDetail = function(Tchat) {
    var msg = JSON.parse(Tchat.url)
    var teamId = msg.teamId
    var groupId = msg.targetID
    $state.go("tab.group-chat",{type:0,teamId:teamId,groupId:groupId});
  }

  //病例讨论  获取交流状态 [status]：1进行中；0已完成  进入聊天：[type]:1=进行中;2=已结束;
  getCChatDetail = function(Cchat) {
    var msg = JSON.parse(Cchat.url)
    var teamId = msg.teamId
    var groupId = msg.targetID
    Communication.getConsultation({consultationId:msg.targetID}).then(function(data){
      if(data.result.status==1){
          $state.go("tab.group-chat",{type:1,teamId:teamId,groupId:groupId});
      }
      else if(data.result.status==0){
          $state.go("tab.group-chat",{type:2,teamId:teamId,groupId:groupId});
      }
    })
  }

  // 根据type进入不同聊天页面
  $scope.getChatDetail = function(mes){
    console.log(mes.type);
    if(mes.type==11){
        getPChatDetail(mes)
    }
    else if(mes.type==12){
        getDChatDetail(mes)
    }
    else if(mes.type==13){
        getTChatDetail(mes)
    } 
    else if(mes.type==14){
        $state.go('nocomess')
    }
    else if(mes.type==9){
        $state.go('changeTasks')
    }    
    else if(mes.type==2){
        $state.go('patientAlerts')
    }    
    else if(mes.type==15){
        getCChatDetail(mes)
    }         
  }
}])

// 未咨询报表推送消息-zy
.controller('nocomessCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'Message', function ($scope, $state, $interval, $rootScope, Storage, Message) {
  $scope.noCounsels = []
  var load = function () {
    Message.getMessages({
      type: 14 // 14是为及时咨询报告消息
    }).then(function (data) {
      console.log(data)
      // for (var i = 0; i < data.results.length; i++) {        
      //   if (data.results[i].readOrNot==0) {
      //     $scope.noCounsels.push(data.results[i])
      //     console.log($scope.noCounsels)
      //   }
      // }
     $scope.noCounsels=data.results  
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

// 未及时更新患者治疗方案
.controller('changeTasksCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'Message', function ($scope, $state, $interval, $rootScope, Storage, Message) {
  $scope.changingTasks = []
  var load = function () {
    Message.getMessages({
      type: 9
    }).then(function (data) {
      console.log(data)
     $scope.changingTasks=data.results  
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

 $scope.getPatientDetail = function (id) {
    console.log(id)
    Storage.set('getpatientId', id)
    $state.go('tab.patientDetail')
  }
}])

// 患者超标警戒提醒
.controller('patientAlertsCtrl', ['$scope', '$state', '$interval', '$rootScope', 'Storage', 'Message', function ($scope, $state, $interval, $rootScope, Storage, Message) {
  $scope.patientAlerts = []
  var load = function () {
    Message.getMessages({
      type: 2
    }).then(function (data) {
     $scope.patientAlerts=data.results 
     console.log($scope.patientAlerts) 
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

 $scope.getPatientDetail = function (id) {
    console.log(id)
    Storage.set('getpatientId', id)
    $state.go('tab.patientDetail')
  }
}])