angular.module('patient.controllers', ['ionic','kidney.services'])

//"患者”页
.controller('patientCtrl', ['Doctor','$scope','$state','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover',  function(Doctor,$scope, $state,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover) {
    $scope.barwidth="width:0%";
    var patients=[];
    $scope.params={
        isPatients:true,
        updateTime:0
    }

    var load = function()
    {
        Doctor.getPatientList({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                console.log(data)
                if (data.results!='')
                {
                    $scope.allpatients=data.results.patients;
                    $scope.patients=$scope.allpatients;
                    //$scope.patients[1].patientId.VIP=0;
                    // $scope.patients.push(
                    //     {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
                    //     {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
                    // console.log($scope.patients)
                }
                else
                {
                    $scope.patients=''
                }
                angular.forEach($scope.patients,
                    function(value,key)
                    {
                        $scope.patients[key].show=true;
                    }
                )            
            },
            function(err)
            {
                console.log(err)
            }
        );

        Doctor.getPatientByDate({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                //console.log(data)
                $scope.Todays=data.results2;
                // $scope.Todays.push(
                //         {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
                //         {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
                //console.log($scope.Todays)            
                angular.forEach($scope.Todays,
                    function(value,key)
                    {
                        $scope.Todays[key].show=true;
                    }
                )
            },
            function(err)
            {
                console.log(err)
            }
        );
    }
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    $scope.goSearch = function() {
        //console.log(123)
        Doctor.getPatientList({ 
            userId:Storage.get('UID'),
            name: $scope.search.name 
        })
        .then(function(data) {
            //$scope.params.isPatients=true;
            //console.log(data.results)
            $scope.patients = data.results.patients;
            //console.log($scope.patients)
            //console.log($scope.allpatients)
            angular.forEach($scope.patients,
                function(value,key)
                {
                    $scope.patients[key].show=true;
                }
            )
            //console.log($scope.patients[0].patientId.name)
            if (data.results.patients.length == 0) {
                console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    $scope.clearSearch = function() {
        $scope.search.name = '';
        $scope.patients = $scope.allpatients;
    }
    //----------------结束搜索患者------------------
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
    $scope.ShowPatients = function(){
        $scope.params.isPatients=true;
    }
    $scope.ShowTodays = function(){
        $scope.params.isPatients=false;
    }

    $scope.getPatientDetail = function(id) {
        console.log(id)
        Storage.set('getpatientId',id);
        $state.go('tab.patientDetail');
    }
 
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.filter={
        propertyName:'-patientId.VIP',
        choose:{
            isChecked1:true,
            isChecked2:true,
            isChecked3:true,
            isChecked4:true,
            isChecked5:true,
            isChecked6:true,
            isChecked7:true,
            isChecked8:true,
            isChecked9:false,
        }
    }
    var filterReset=angular.copy($scope.filter);
    $scope.resetFilter=function()
    {
        // console.log("reset")
        $scope.filter=angular.copy(filterReset);
        $scope.filterShow();
    }
    $scope.filterShow=function () {
        angular.forEach($scope.patients,
            function(value,key)
            {
                $scope.patients[key].show=true;
                if(!$scope.filter.choose.isChecked1)
                {
                    if(value.patientId.class=='class_1')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked2)
                {
                    if(value.patientId.class=='class_5')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked3)
                {
                    if(value.patientId.class=='class_6')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked4)
                {
                    if(value.patientId.class=='class_2')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked5)
                {
                    if(value.patientId.class=='class_3')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked6)
                {
                    if(value.patientId.class=='class_4')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked7)
                {
                    if(value.patientId.gender==1)
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked8)
                {
                    if(value.patientId.gender==2)
                        $scope.patients[key].show=false;
                }
                if($scope.filter.choose.isChecked9)
                {
                    if(value.patientId.VIP==0)
                        $scope.patients[key].show=false;
                }
            }
        )
        angular.forEach($scope.Todays,
            function(value,key)
            {
                $scope.Todays[key].show=true;
                if(!$scope.filter.choose.isChecked1)
                {
                    if(value.patientId.class=='class_1')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked2)
                {
                    if(value.patientId.class=='class_5')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked3)
                {
                    if(value.patientId.class=='class_6')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked4)
                {
                    if(value.patientId.class=='class_2')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked5)
                {
                    if(value.patientId.class=='class_3')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked6)
                {
                    if(value.patientId.class=='class_4')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked7)
                {
                    if(value.patientId.gender==1)
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked8)
                {
                    if(value.patientId.gender==0)
                        $scope.Todays[key].show=false;
                }
                if($scope.filter.choose.isChecked9)
                {
                    if(value.patientId.VIP==0)
                        $scope.Todays[key].show=false;
                }
            }
        )
    }
}])

//"患者”详情子页
.controller('patientDetailCtrl', ['New','Insurance','Storage','Doctor','Patient','$scope','$ionicPopup','$ionicLoading','$ionicHistory','$state', function(New,Insurance,Storage,Doctor,Patient,$scope, $ionicPopup,$ionicLoading,$ionicHistory,$state) {
    $scope.hideTabs = true;
    $scope.barStyle={'margin-top':'40px'}
    if(ionic.Platform.isIOS()){
        $scope.barStyle={'margin-top':'60px'}
    }  
    $scope.backview=$ionicHistory.viewHistory().backView
        $scope.backstateId=null;
        if($scope.backview!=null){
            $scope.backstateId=$scope.backview.stateId
            //console.log($scope.backstateId)
            if($scope.backstateId=="tab.doing"){
                Storage.set('backId',$scope.backstateId);
            }else if($scope.backstateId=="tab.did"){
                Storage.set('backId',$scope.backstateId);
            }else if($scope.backstateId=="tab.patient"){
                Storage.set('backId',$scope.backstateId)
            }                   
        }
        console.log(Storage.get('backId'))
        $scope.goback = function() {           
            var backId = Storage.get('backId')
            console.log(backId)
            if(backId=="tab.doing"){
              $state.go("tab.doing")
            }
            else if(backId=="tab.did"){
                $state.go('tab.did');
            }else if(backId=='tab.group-chat'){
                var p = JSON.parse(Storage.get('groupChatParams'));
                $state.go('tab.group-chat',p);
            }else if(backId=='tab.detail'){
                var q = JSON.parse(Storage.get('singleChatParams'));
                $state.go('tab.detail',q);
            }else{
              $state.go('tab.patient');
            }
        }

    $scope.gototestrecord=function(){
        console.log(Storage.get('getpatientId'))
        $state.go('tab.TestRecord',{PatinetId:Storage.get('getpatientId')});
    }
    // console.log(Storage.get('getpatientId'))
    Patient.getPatientDetail({
         userId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            //console.log(data)
            Storage.set("latestDiagnose","");
            if(data.results.diagnosisInfo.length>0)
            {
                Storage.set("latestDiagnose",angular.toJson(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1]));
                // console.log(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1])
            }
            else if(data.results.diagnosisInfo.length==0)
            {
                var lD={
                    content:"",
                    hypertension:data.results.hypertension,
                    name:data.results.class,
                    operationTime:data.results.operationTime,
                    progress:data.results.class_info?data.results.class_info[0]:"",
                    time:""
                }
                Storage.set("latestDiagnose",angular.toJson(lD));
            }
            $scope.patient=data.results; 
            //console.log(data.recentDiagnosis)
            if (data.recentDiagnosis != null){
                $scope.RecentDiagnosis=data.recentDiagnosis[0];
                if($scope.RecentDiagnosis!= null) {
                    if ($scope.RecentDiagnosis.name == "class_4"){
                        $scope.RecentDiagnosis.time = null
                        $scope.RecentDiagnosis.progress = null
                    }else if ($scope.RecentDiagnosis.name == "class_2"|| $scope.RecentDiagnosis.name == "class_3"){
                        $scope.RecentDiagnosis.time = null
                    }else if ($scope.RecentDiagnosis.name == "class_5"|| $scope.RecentDiagnosis.name == "class_6" || $scope.RecentDiagnosis.name == "class_1"){
                        $scope.RecentDiagnosis.progress = null
                    }                      
                }
            }                      
        },
        function(err)
        {
            console.log(err)
        }
    );

    Insurance.getInsMsg({
        doctorId:Storage.get('UID'),
        patientId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            $scope.Ins=data.results||{count:0};                   
        },
        function(err)
        {
            console.log(err)
        }
    );

    $scope.SendInsMsg=function()
    {
        $ionicLoading.show({
            template: '推送成功',
            duration:1000
        });
        Insurance.updateInsuranceMsg({
            doctorId:Storage.get('UID'),
            patientId:Storage.get('getpatientId'),
            insuranceId:'ins01',
            description:'医生给您发送了一条保险消息'
            //type:5  //保险type=5
        })
        .then(
            function(data)
            {
                $scope.Ins.count=$scope.Ins.count + 1;
                console.log(data)
                Storage.set('MessId',data.newResults.message.messageId)
                New.insertNews({
                    sendBy:Storage.get('UID'),
                    userId:Storage.get('getpatientId'),
                    type:5,
                    readOrNot:'0',
                    description:'医生给您发送了一条保险消息',
                    messageId:Storage.get('MessId')                    
                })
                .then(
                    function(data)
                    {
                        console.log(data)                 
                    },
                    function(err)
                    {
                        console.log(err)
                    }
                );
            },
            function(err)
            {
                console.log(err)
            }
        );
    }

    $scope.goToDiagnose=function()
    {
        $state.go("tab.DoctorDiagnose");
    }      
}])