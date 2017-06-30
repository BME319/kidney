angular.module('doctor.controllers', ['ionic', 'kidney.services'])

//医生查找
.controller('DoctorSearchCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG','Storage', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG, Storage) {
    $scope.searchStyle={'margin-top':'44px'}
    if(ionic.Platform.isIOS()){
        $scope.searchStyle={'margin-top':'64px'}
        $scope.docStyle={'margin-top':'20px'}
    }
    $scope.docStyle={'margin-top':'0px'}
   
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
    $scope.loadMore = function() {
        // $scope.$apply(function() {
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
            })
            // });
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
    //directive <button-clear-input>新建了scope， 导致clearSearch不能正确bind，不能触发
    //影响使用体验
    $scope.clearSearch = function() {
        $scope.search.name = '';
        $scope.issearching = true;
        $scope.isnotsearching = false;
        $scope.moredata = true;
        $scope.doctors = $scope.alldoctors;
    }
    $scope.doctorClick = function(doc) {
        if(doc == Storage.get('UID')) $state.go('tab.me');
        else $state.go('tab.detail', { type: '2', chatId:doc });
    }
}])