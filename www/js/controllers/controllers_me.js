angular.module('me.controllers', ['ionic','kidney.services'])

//"我”页
.controller('meCtrl', ['CONFIG','Camera','Doctor','$scope','$state','$interval','$rootScope', 'Storage','$ionicPopover','$http', function(CONFIG,Camera,Doctor,$scope, $state,$interval,$rootScope,Storage,$ionicPopover,$http) {
  $scope.barwidth="width:0%";
   
    //$scope.userid=Storage.get('userid');
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.doRefresh();
    // });
    


    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // alert(Storage.get('UID')+JSON.stringify(data))
          // console.log(data)
            $scope.doctor=data.results;
            if($scope.doctor.photoUrl==""||$scope.doctor.photoUrl==null||$scope.doctor.photoUrl==undefined){
                $scope.doctor.photoUrl='img/doctor.png'
                // if(Storage.get('wechatheadimgurl')!=undefined||Storage.get('wechatheadimgurl')!=""||Storage.get('wechatheadimgurl')!=null){
                //     $scope.doctor.photoUrl=Storage.get('wechatheadimgurl')
                // }
            }
        },
        function(err)
        {
            console.log(err)
        }
    )

    //$scope.loadData(); 
    $scope.params = {
        // groupId:$state.params.groupId
        userId:Storage.get('UID')
    }

    // 上传头像的点击事件----------------------------
    $scope.onClickCamera = function($event){
        $scope.openPopover($event);
    };
    $scope.reload=function(){
        var t=$scope.doctor.photoUrl; 
        $scope.doctor.photoUrl=''
        $scope.$apply(function(){
            $scope.doctor.photoUrl=t;
        })
    }
 
    // 上传照片并将照片读入页面-------------------------
    var photo_upload_display = function(imgURI){
    // 给照片的名字加上时间戳
        var temp_photoaddress = Storage.get("UID") + "_" +  "doctor.photoUrl.jpg";
        console.log(temp_photoaddress)
        Camera.uploadPicture(imgURI, temp_photoaddress)
        .then(function(res){
            var data=angular.fromJson(res)
            //res.path_resized
            //图片路径
            $scope.doctor.photoUrl=CONFIG.mediaUrl+String(data.path_resized)+'?'+new Date().getTime();
            console.log($scope.doctor.photoUrl)
            // $state.reload("tab.mine")
            // Storage.set('doctor.photoUrlpath',$scope.doctor.photoUrl);
            Doctor.editDoctorDetail({userId:Storage.get("UID"),photoUrl:$scope.doctor.photoUrl}).then(function(r){
                console.log(r);
            })
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
        Camera.getPictureFromPhotos('gallery').then(function(data) {
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
        Camera.getPicture('cam').then(function(data) {
            console.log(data)
            photo_upload_display(data);
      }, function(err) {
            // console.err(err);
            var imgURI = undefined;
        })// 照相结束
    }; // function结束

}])

//"我”二维码页
.controller('QRcodeCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage', 'Mywechat', function(Doctor,$scope, $state,$interval,$rootScope,Storage,Mywechat) {
        

    //$scope.hideTabs = true;
    //$scope.userid=Storage.get('userid');
    // $scope.doctor=meFactory.GetDoctorInfo($scope.userid);
  

    //  $scope.qrscan= function(){
    //   QRScan.getCode({
    //   userId:'doc01'
    // })
    //   .then(function(data){
    //     console.log(data);
    //   },function(err){
    //     console.log(err);
    //   })
    // };

    // $scope.params = {
    //     // groupId:$state.params.groupId
    //     userId:Storage.get('UID')
    // }

    // Doctor.getDoctorInfo({
    //     userId:Storage.get('UID')
    // })
    // .then(
    //     function(data)
    //     {
    //         // console.log(data)
    //         $scope.doctor=data.results;
    //     },
    //     function(err)
    //     {
    //         console.log(err)
    //     }
    // );

    $scope.doctor = "";
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            console.log(data)
            // console.log(data)
            $scope.doctor=data.results;
            if (angular.isDefined($scope.doctor.TDCticket) != true)
            {
                var params = {
                    "role":"doctor",
                    "userId":Storage.get('UID'),
                    "postdata":{
                        "action_name": "QR_LIMIT_STR_SCENE", 
                        "action_info": {
                            "scene": {
                                "scene_str": Storage.get('UID')
                            }
                        }
                    }
                }
                Mywechat.createTDCticket(params).then(function(data){
                    $scope.doctor.TDCticket = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + data.results.TDCticket
                },
                function(err)
                {
                    console.log(err)
                })
            }
            else{
                $scope.doctor.TDCticket = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + $scope.doctor.TDCticket
            }
        },
        function(err)
        {
            console.log(err)
        }
    );
}])


//我的个人资料页
.controller('myinfoCtrl', ['CONFIG','Dict','Camera','Doctor','$scope','Storage','$ionicPopover','$ionicModal','$ionicScrollDelegate', function(CONFIG,Dict,Camera,Doctor,$scope, Storage,$ionicPopover,$ionicModal,$ionicScrollDelegate) {
    $scope.hideTabs = true;
    $scope.updateDiv=false;
    $scope.myDiv=true;
    $scope.ProvinceObject={};
    $scope.CityObject={};
    $scope.HosObject={};
    $scope.Titles =
    [
        {Name:"主任医师",Type:1},
        {Name:"副主任医师",Type:2},
        {Name:"主治医师",Type:3},
        {Name:"住院医师",Type:4},
        {Name:"主任护师",Type:5},
        {Name:"副主任护师",Type:6},
        {Name:"主管护师",Type:7},
        {Name:"护师",Type:8},
        {Name:"护士",Type:9}
    ]
    console.log(Storage.get('UID'))
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // console.log(data)
            $scope.doctor=data.results;
        },
        function(err)
        {
            console.log(err)
        }
    )


    $scope.editinfo = function() {
        // $scope.ProvinceObject = $scope.doctor.province;
        // console.log("123"+$scope.ProvinceObject);
        $scope.doctor.title = $scope.doctor.title.Name
        Doctor.editDoctorDetail($scope.doctor)
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
        $scope.myDiv = !$scope.myDiv;
        $scope.updateDiv = !$scope.updateDiv;       
    };
    
    $scope.toggle = function() {
        $scope.myDiv = !$scope.myDiv;
        $scope.updateDiv = !$scope.updateDiv;
        //$scope.ProvinceObject = $scope.doctor.province;
        //console.log($scope.ProvinceObject);
        var searchObj = function(code,array){
            if(array && array.length){
                for (var i = 0; i < array.length; i++) {
                    if(array[i].name == code || array[i].hospitalName == code|| array[i].Name == code) return array[i];
                };
            }
            return "未填写";           
        }
        //读职称
        if ($scope.doctor.title != null){
            console.log($scope.doctor.title)
            console.log($scope.Titles)
            $scope.doctor.title = searchObj($scope.doctor.title,$scope.Titles)
        } 
        //-------------点击编辑省市医院读字典表--------------
        if ($scope.doctor.province != null){
            //console.log($scope.doctor.province)
            //console.log($scope.Provinces)
            $scope.ProvinceObject = searchObj($scope.doctor.province,$scope.Provinces)

        }
        if ($scope.doctor.city != null){
            //console.log($scope.ProvinceObject.province)
            Dict.getDistrict({level:"2",province:$scope.ProvinceObject.province,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    //console.log($scope.Cities);
                    $scope.CityObject = searchObj($scope.doctor.city,$scope.Cities)
                    console.log($scope.CityObject)
                    console.log($scope.CityObject.name)
                    if ($scope.doctor.workUnit != null){
                        //console.log($scope.Hospitals)
                        console.log($scope.doctor.workUnit)
                        console.log($scope.CityObject)
                        console.log($scope.CityObject.name)
                        Dict.getHospital({city:$scope.CityObject.name})
                        .then(
                            function(data)
                            {
                                $scope.Hospitals = data.results;
                                //console.log($scope.Hospitals);
                                $scope.HosObject = searchObj($scope.doctor.workUnit,$scope.Hospitals)
                            },
                            function(err)
                            {
                                console.log(err);
                            }
                        )                   
                    }
                },
                function(err)
                {
                    console.log(err);
                }
            );                       
        }
        //-------------点击编辑省市医院读字典表--------------

    };

    //--------------省市医院读字典表---------------------
    Dict.getDistrict({level:"1",province:"",city:"",district:""})
    .then(
        function(data)
        {
            $scope.Provinces = data.results;
            //$scope.Province.province = "";
            //console.log($scope.Provinces)
        },
        function(err)
        {
            console.log(err);
        }
    )    

    $scope.getCity = function (pro) {
        console.log(pro)
        if(pro!=null){
            Dict.getDistrict({level:"2",province:pro,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    console.log($scope.Cities);            
                },
                function(err)
                {
                    console.log(err);
                }
            );
        }else{
            $scope.Cities = {};
            $scope.Hospitals = {};
        }
    }

    $scope.getHospital = function (city) {
            console.log(city)
        if(city!=null){
            //var locationCode = district.province + district.city + district.district
            //console.log(locationCode)

            Dict.getHospital({city:city})
            .then(
                function(data)
                {
                    $scope.Hospitals = data.results;
                    console.log($scope.Hospitals);
                },
                function(err)
                {
                    console.log(err);
                }
            )
        }else{
            $scope.Hospitals = {};
        }
    }

    $scope.trans = function(docinfo){
        console.log(docinfo)
        if (docinfo !=null)
        {
            $scope.doctor.province = docinfo.province;
            $scope.doctor.city = docinfo.city;
            $scope.doctor.workUnit = docinfo.hospitalName;    
        }
      
    }

    //执照照片



    $scope.zoomMin = 1;
    $scope.imageUrl = '';
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        // $scope.modal.show();
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    });
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
        // $scope.modal.remove()
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    }
    //0516 zxf
    $scope.flag=0;//判断是给谁传图片 默认是资格证书
    //点击显示大图
    $scope.doctorimgurl="";
    // $ionicModal.fromTemplateUrl('partials/others/doctorimag.html', {
    //     scope: $scope,
    //     animation: 'slide-in-up'
    // }).then(function(modal) {
    //     console.log(2222)
    //     $scope.modal = modal;
    // });

    $scope.onClickCamera = function($event,index){
        $scope.openPopover($event);
        $scope.flag=index;
    };
     // 上传照片并将照片读入页面-------------------------
    var photo_upload_display = function(imgURI){
        var temp_photoaddress;
        if($scope.flag==0){
            temp_photoaddress=Storage.get("UID") + "_" + new Date().getTime() + "certificate.jpg";
        }else{
            temp_photoaddress=Storage.get("UID") + "_" + new Date().getTime() + "practising.jpg";
        }
        Camera.uploadPicture(imgURI, temp_photoaddress)
        .then(function(res){
            var data=angular.fromJson(res)
            //图片路径
            if($scope.flag==0){
                $scope.doctor.certificatePhotoUrl=CONFIG.mediaUrl+String(data.path_resized)
            }
            else{
                $scope.doctor.practisingPhotoUrl=CONFIG.mediaUrl+String(data.path_resized)
            }
        },function(err){
            console.log(err);
            reject(err);
        })
    };
    ////-----------------------上传头像---------------------
    // ionicPopover functions 弹出框的预定义
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



    // $scope.openModal = function() {
    //   $scope.modal.show();
    // };
    // $scope.closeModal = function() {
    //   $scope.modal.hide();
    // };
    // //Cleanup the modal when we're done with it!
    // $scope.$on('$destroy', function() {
    //   $scope.modal.remove();
    // });
    // // Execute action on hide modal
    // $scope.$on('modal.hidden', function() {
    //   // Execute action
    // });
    // // Execute action on remove modal
    // $scope.$on('modal.removed', function() {
    //   // Execute action
    // });

    // //点击图片返回
    // $scope.imggoback = function(){
    //     $scope.modal.hide();
    // };
    $scope.showoriginal=function(resizedpath){
        // $scope.openModal();
        // console.log(resizedpath)
        var originalfilepath=CONFIG.imgLargeUrl+resizedpath.slice(resizedpath.lastIndexOf('/')+1).substr(7)
        // console.log(originalfilepath)
        // $scope.doctorimgurl=originalfilepath;

        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = originalfilepath;
        $scope.modal.show();
    }
    // $scope.deleteimg=function(index){
    //     //somearray.removeByValue("tue");
    //     console.log($scope.health.imgurl)
    //     $scope.health.imgurl.splice(index, 1)
    //     // Storage.set('tempimgrul',angular.toJson($scope.images));
    // }
    //------------省市医院读字典表--------------------

}])

//"我”个人收费页
.controller('myfeeCtrl', ['Account','Doctor','$scope','$ionicPopup','$state','Storage','User' ,function(Account,Doctor,$scope, $ionicPopup,$state,Storage,User) {
    $scope.hideTabs = true;
    $scope.alipay="";
    $scope.alipayIcon="img/alipay.png";
    $scope.wechat="";
    $scope.wechatIcon="img/wechat.png";
    var load = function(){
        Doctor.getDoctorInfo({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
            // console.log(data)
                $scope.doctor=data.results;
            },
            function(err)
            {
                console.log(err)
            }
        )

        Account.getAccountInfo({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                console.log(data)
                //console.log(data.results[0].money)
                $scope.account={money:data.results.length==0?0:data.results[0].money};
                // if (data.results.length!=0)
                // {
                //     $scope.account=data.results
                // }
                // else
                // {
                //     $scope.account={money:0}
                // }
            },
            function(err)
            {
                console.log(err)
            }
        )        

        //获取用户的支付宝账号
        Doctor.getAliPayAccount({
            userId:Storage.get('UID')
        })
        .then(function(data){
            // console.log(data)
            if(data.hasOwnProperty("results")&&data.results!="")
            {
                $scope.alipay=data.results;
                $scope.alipayIcon='img/alipay_2.jpg';
            }
        },function(err){
            console.log(err)
        })
        //获取用户的微信unionId
        User.getUserId({username:Storage.get('UID')})
        .then(function(data){
            // console.log(data);
            // console.log(Storage.get('UID'))
            if(data.hasOwnProperty('openId'))
            {
                $scope.wechat='ok';
                $scope.wechatIcon='img/wechat_2.png';
            }
        },function(err){
            console.log(err);
        })
        
    }
    $scope.$on('$ionicView.enter', function() {
        load();
    })
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }   

    $scope.savefee = function() {
        if($scope.doctor.charge2<=$scope.doctor.charge1){
            $scope.SaveStatus="问诊收费应高于咨询收费，请重新设置"
            return;
        }
        Doctor.editDoctorDetail($scope.doctor)
        .then(
            function(data)
            {
                // console.log(data)
                // $scope.doctor=data.result;
            },
            function(err)
            {
                console.log(err)
            }
        )
        $state.go('tab.me');              

    };

    $scope.getBill=function()
    {
        // console.log("bill");
        $state.go("tab.bill")
    }

    $scope.bindAliPay = function()
    {
        // console.log("bind alipay");
        $scope.ap={a:$scope.alipay};
        var cm = $ionicPopup.show({   
            title: '修改支付宝账号',
            cssClass:'popupWithKeyboard',
            template:'<input type=text ng-model="ap.a">',
            scope:$scope,
            buttons: [
                {
                    text: '確定',
                    type: 'button-positive',
                    onTap: function(event) {
                        var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
                        var emailReg=/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                        //手机正则表达式验证
                        if(!phoneReg.test($scope.ap.a) && !emailReg.test($scope.ap.a))
                        {
                            $ionicPopup.alert({
                                cssClass:'popupWithKeyboard',
                                title: '支付宝账号为邮箱或者手机号',
                                okText: '确定'
                            });
                            return;
                        }
                        $scope.alipay=$scope.ap.a;
                        Doctor.editAliPayAccount({userId:Storage.get('UID'),aliPayAccount:$scope.ap.a})
                        .then(function(succ){
                            // console.log(succ)
                            $scope.alipay=$scope.ap.a;
                            $scope.alipayIcon='img/alipay_2.jpg';
                        },function(err){
                            console.log(err)
                        })
                        // console.log($scope.alipay);
                    }
                },
                {
                    text: '取消',
                    type: 'button-assert',
                    onTap: function(){
                        // console.log("cancle")
                    }
                }
            ]
        });
    }

  
}])


//"我”的评价
.controller('feedbackCtrl', ['Patient','Doctor','$scope','$ionicPopup','$state', 'Storage',function(Patient,Doctor,$scope, $ionicPopup,$state,Storage) {
    $scope.hideTabs = true;
    var commentlength='';
    //var commentlist=[];
    var load = function(){
        Doctor.getDoctorInfo({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                // console.log(data)
                $scope.feedbacks=data.comments;
                $scope.doctor=data.results;
                //console.log($scope.feedbacks.length)
                //commentlength=data.comments.length;
                //   for (var i=0; i<commentlength; i++){
                //       commentlist[i]=$scope.feedbacks[i].pateintId.userId;
            },
            function(err)
            {
                console.log(err)
            }
        );

        // for (var i=0; i<commentlength; i++){
        //     Patient.getPatientDetail({
        //     userId:$scope.feedbacks[i].pateintId.userId
        // })
        //     .then(
        //         function(data)
        //         {
        //         // console.log(data)
        //             $scope.feedbacks[i].photoUrl=data.results.photoUrl;
        //         },
        //         function(err)
        //         {
        //             console.log(err)
        //         }
        //     );
        // }
    }
    $scope.$on('$ionicView.enter', function() {
        load();
    })

    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }
    $scope.gocommentdetail=function(score,content){
        console.log(score+content)
        $state.go('tab.commentdetail',{rating:score,content:content})
    }

}])
//"我”的评价详情
.controller('SetCommentCtrl', ['$scope','$state', '$stateParams','$ionicHistory','Storage',function($scope,$state,$stateParams,$ionicHistory,Storage) {
      $scope.comment={score:$stateParams.rating, commentContent:$stateParams.content};
      // console.log($stateParams.rating+$stateParams.content)
      $scope.editable=true;
       
      // //  //评论星星初始化
      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: '#FFD700',//rgb(200, 200, 100)
        iconOffColor: 'rgb(200, 100, 100)',
        rating: $scope.comment.score/2, 
        minRating: 1,
        readOnly:true
        // callback: function(rating) {
        //   $scope.ratingsCallback(rating);
        // }
      };
      //$stateParams.counselId
       //获取历史评论
      // if($stateParams.counselId!=undefined&&$stateParams.counselId!=""&&$stateParams.counselId!=null){
      //   console.log($stateParams.counselId)
      //   Comment.getCommentsByC({counselId:$stateParams.counselId}).then(function(data){
      //     if(data.results.length!=0){
      //       // //初始化
      //       $scope.comment.score=data.results[0].totalScore/2
      //       $scope.comment.commentContent=data.results[0].content
      //        //评论星星初始化
      //        $scope.$broadcast('changeratingstar',$scope.comment.score,true);
      //        $scope.editable=true;
      //     }
      //   }, function(err){
      //     console.log(err)
      //   })
      // }

      $scope.Goback=function(){
        $ionicHistory.goBack();
      }

      
}])

//"我”设置页
.controller('setCtrl', ['$scope','$ionicPopup','$state','$timeout','$stateParams', 'Storage','$sce','socket','mySocket',function($scope, $ionicPopup,$state,$timeout,$stateParams,Storage,$sce,socket,mySocket) {
    $scope.hideTabs = true; 
    $scope.logout = function() {
        socket.emit('disconnect');
        //Storage.set('IsSignIn','NO');
        $state.logStatus="用户已注销";
        //清除登陆信息
        Storage.rm('password');
        // Storage.rm('UID');
        Storage.rm('doctorunionid');
        Storage.rm('IsSignIn');
        //Storage.rm('USERNAME');
        Storage.rm('PASSWORD');
        Storage.rm('userid');
        console.log($state);
        mySocket.cancelAll();
        socket.emit('disconnect');
        socket.disconnect();
        $scope.navigation_login=$sce.trustAsResourceUrl("http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx");
        $timeout(function(){$state.go('signin');},500);
    };
  
}])


//"我”设置内容修改密码页
.controller('set-contentCtrl', ['$timeout','$scope','$ionicPopup','$state','$stateParams','Storage','User', function($timeout,$scope, $ionicPopup,$state,$stateParams,Storage,User) {
    $scope.hideTabs = true; 
    $scope.type = $stateParams.type;
    $scope.resetPassword=function(oldPW,newPW,confirmPW)
    {
        // console.log("resetpw")
        // console.log(oldPW)
        // console.log(newPW)
        // console.log(confirmPW)
        if(oldPW==undefined)
        {
            $scope.changePasswordStatus="请输入旧密码"
            return;
        }
        if(oldPW==newPW)
        {
            $scope.changePasswordStatus="不能重置为之前的密码"
            return;
        }
        if(newPW==undefined||newPW.length<6)
        {
            $scope.changePasswordStatus="新密码不能为空且必须大于6位"
            return;
        }
        if(newPW!=confirmPW)
        {
            $scope.changePasswordStatus="两次输入不一致"
            return;
        }
        User.logIn({username:Storage.get('USERNAME'),password:oldPW,role:'doctor'})
        .then(function(succ)
        {
            // console.log(Storage.get('USERNAME'))
            if(succ.results.mesg=="login success!")
            {
                User.changePassword({phoneNo:Storage.get('USERNAME'),password:newPW})
                .then(function(succ)
                {
                    // console.log(succ)
                    var phoneNo=Storage.get('USERNAME')
                    //Storage.clear();
                    Storage.set('USERNAME',phoneNo)
                    $scope.changePasswordStatus = "修改成功！";
                    //$state.go('signin');
                    $timeout(function(){$state.go('tab.set');},500);
                },function(err)
                {
                    console.log(err)
                })
            }
            else
            { 
                $scope.changePasswordStatus="旧密码不正确"
            }
        },function(err)
        {
            console.log(err)
        })
    }
  
}])
//“我”设置内容查看协议页
.controller('viewAgreeCtrl', ['$scope','$state','Storage','$ionicHistory', function($scope,$state,Storage,$ionicHistory) {
     
}])

//"我”排班页
.controller('schedualCtrl', ['$scope','ionicDatePicker','$ionicPopup','Doctor','Storage','$interval', function($scope,ionicDatePicker,$ionicPopup,Doctor,Storage,$interval) {
    $scope.dateC=new Date();
    var getSchedual=function()
    {
        Doctor.getSchedules({userId:Storage.get('UID')})
        .then(function(data)
        {
            // console.log(data)
            angular.forEach(data.results.schedules,function(value,key)
            {
                // console.log(value)
                var index=value.day-'0';
                if(value.time==1)
                    index+=7;
                $scope.workStatus[index].status=1;
                $scope.workStatus[index].style={'background-color':'red'};
            })
        },function(err)
        {
            console.log(err)
        })
        Doctor.getSuspendTime({userId:Storage.get('UID')})
        .then(function(data)
        {
            console.log(data.results.suspendTime)
            if(data.results.suspendTime.length==0)
            {
                $scope.stausText="接诊中..."
                $scope.stausButtontText="设置停诊"
            }
            else
            {
                var date=new Date();
                var dateNow=''+date.getFullYear();
                (date.getMonth()+1)<10?dateNow+='0'+(date.getMonth()+1):dateNow+=(date.getMonth()+1)
                date.getDate()<10?dateNow+='0'+date.getDate():dateNow+=date.getDate();
                console.log(dateNow)

                $scope.begin=data.results.suspendTime[0].start;
                $scope.end=data.results.suspendTime[0].end;

                date=new Date($scope.begin);
                var dateB=''+date.getFullYear();
                (date.getMonth()+1)<10?dateB+='0'+(date.getMonth()+1):dateB+=(date.getMonth()+1)
                date.getDate()<10?dateB+='0'+date.getDate():dateB+=date.getDate();
                date=new Date($scope.end);
                var dateE=''+date.getFullYear();
                (date.getMonth()+1)<10?dateE+='0'+(date.getMonth()+1):dateE+=(date.getMonth()+1)
                date.getDate()<10?dateE+='0'+date.getDate():dateE+=date.getDate();

                if(dateNow>=dateB&&dateNow<=dateE)
                {
                    $scope.stausText="停诊中..."
                }
                else
                {
                    $scope.stausText="接诊中..."
                }
                $scope.stausButtontText="取消停诊"
            }
        },function(err)
        {
            console.log(err)
        })
    }
    $scope.workStatus=[
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
    ]
    $scope.stausButtontText="停诊"
    $scope.stausText="接诊中..."
    $scope.showSchedual=true;
    getSchedual();
    $interval(function(){
        var getD=new Date();
        if(getD.getDate()!=$scope.dateC.getDate())
        {
            $scope.dateC=new Date();
            getSchedual();
        }
    },1000);
    var ipObj1 = {
        callback: function (val) {  //Mandatory
            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            if($scope.flag==1)
            {
                $scope.begin=val;
                if($scope.end==undefined||$scope.begin>new Date($scope.end))
                        $scope.end=$scope.begin;
            }
            else
            {
                $scope.end=val;
                if($scope.begin!=undefined&&$scope.begin>new Date($scope.end))
                    $scope.begin=$scope.end;
            }
        },
        titleLabel: '',
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
        monthsList:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
        from:new Date()
    };

    $scope.openDatePicker = function(params){
        ipObj1.titleLabel=params==1?'停诊开始日期':'停诊结束日期';
        if(params==1)
        {
            if($scope.begin!=undefined)
                ipObj1.inputDate=new Date($scope.begin);
        }
        else
        {
            if($scope.end!=undefined)
                ipObj1.inputDate=new Date($scope.end);
        }
        ionicDatePicker.openDatePicker(ipObj1);
        $scope.flag=params;//标识选定时间用于开始时间还是结束时间
    };

    $scope.showSch=function()
    {
        if($scope.stausButtontText=="设置停诊")
        {
            $scope.showSchedual=false;
        }
        else
        {
            var param={
                userId:Storage.get('UID'),
                start:$scope.begin,
                end:$scope.end
            }
            // console.log(param)
            Doctor.deleteSuspendTime(param)
            .then(function(data)
            {
                console.log(data)
                $scope.stausButtontText="设置停诊"
                $scope.stausText="接诊中..."
            },function(err)
            {
                console.log(err)
            })
        }
    }
    $scope.stopWork=function(cancel)
    {
        if(cancel)
        {
            $scope.showSchedual=true;
            return;
        }
        if($scope.begin!=undefined&&$scope.end!=undefined)
        {
            var param={
                userId:Storage.get('UID'),
                start:$scope.begin,
                end:$scope.end
            }
            // console.log(param)
            Doctor.insertSuspendTime(param)
            .then(function(data)
            {
                $scope.showSchedual=true;
                getSchedual();
            },function(err)
            {
                console.log(err)
            })
        }
    }
    $scope.changeWorkStatus=function(index)
    {
        // console.log("changeWorkStatus"+index)
        var text=''
        if($scope.workStatus[index].status==0)
        {
            text = '此时间段将更改为工作状态！'
        }
        else
        {
            text = '此时间段将更改为空闲状态！'
        }
        var confirmPopup = $ionicPopup.confirm({
            title: '修改工作状态',
            template: text,
            cancelText:'取消',
            okText:'确定'
        });

        confirmPopup.then(function(res) {
            if(res) {
                // console.log('You are sure');
                var param={
                    userId:Storage.get('UID'),
                    day:index.toString(),
                    time:'0'
                }
                if(index>6)
                {
                    param.time='1';
                    param.day=(index-7).toString();
                }
                // console.log(param)
                if($scope.workStatus[index].status==0)
                {
                    Doctor.insertSchedule(param)
                    .then(function(data)
                    {
                        // console.log(data)
                        $scope.workStatus[index].status=1;
                        $scope.workStatus[index].style={'background-color':'red'};
                    },function(err)
                    {
                        console.log(err)
                    })
                }
                else
                {
                    Doctor.deleteSchedule(param)
                    .then(function(data)
                    {
                        // console.log(data)
                        $scope.workStatus[index].status=0;
                        $scope.workStatus[index].style={'background-color':'white'};
                    },function(err)
                    {
                        console.log(err)
                    })
                }
            }
            else {
                // console.log('You are not sure');
            }
        });
    }

}])

//意见反馈
.controller('adviceCtrl', ['$scope','$state','$ionicLoading', 'Advice','Storage','$timeout', function ($scope,$state,$ionicLoading,Advice,Storage,$timeout) {
    $scope.deliverAdvice = function(advice){        
        Advice.postAdvice({userId:Storage.get('UID'),role:"doctor",topic:advice.topic,content:advice.content}).then(
            function(data){
                console.log(data)
                if(data.result == "新建成功"){
                    $ionicLoading.show({
                        template: '提交成功',
                        noBackdrop: false,
                        duration: 1000,
                        hideOnStateChange: true
                    });
                    $timeout(function(){$state.go('tab.me');},900);
                }
            },function(err){
                $ionicLoading.show({
                    template: '提交失败',
                    noBackdrop: false,
                    duration: 1000,
                    hideOnStateChange: true
                });
            })
        
    }
}])

.controller('aboutCtrl', ['$scope','$state','Storage','$ionicHistory', function($scope,$state,Storage,$ionicHistory) {
     
}])
.controller('billCtrl', ['$scope','Storage','$http','$ionicScrollDelegate','Expense',function($scope,Storage,$http,$ionicScrollDelegate,Expense) {
    var doc={
        doctorId:Storage.get('UID'),
        skip:0,
        limit:10
    }
    $scope.doc={
        bills:[],
        hasMore:false
    }
    $scope.doRefresh=function()
    {
        doc.skip=0;
        $scope.doc.hasMore=false
        Expense.getDocRecords(doc)
        .then(function(data)
        {
            $scope.doc.bills=data.results;
            doc.skip+=data.results.length;
            data.results.length==doc.limit?$scope.doc.hasMore=true:$scope.doc.hasMore=false;
            $scope.$broadcast('scroll.refreshComplete');
        },function(err)
        {
            console.log(err)
            $scope.$broadcast('scroll.refreshComplete');
        })
    }
    $scope.doRefresh();
    $scope.loadMore=function()
    {
        Expense.getDocRecords(doc)
        .then(function(data)
        {
            $scope.doc.bills=$scope.doc.bills.concat(data.results);
            doc.skip+=data.results.length;
            data.results.length==doc.limit?$scope.doc.hasMore=true:$scope.doc.hasMore=false;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        },function(err)
        {
            console.log(err)
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.scroll2Top=function()
    {
        $ionicScrollDelegate.scrollTop(true);
    }
}])