angular.module('jxlApp.controllers', [])

.controller('AppCtrl', function($scope,$http,$ionicLoading,$timeout,$rootScope,$state) {
  var vm =  $scope.vm = {};
  var root =  $rootScope.root = {};

  vm.btnLoading = false;
  vm.supportDatasources = [];
  vm.applyInfo = {
    selected_website:[],
    basic_info:{
      name:'董发鹏',
      id_card_num:'622301199002040315',
      cell_phone_num:'18693152204'
    }
  }
  vm.loadding = true;

  vm.showLoading = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> 正在获取'
    });
  };

  vm.hideLoading = function(){
    $ionicLoading.hide();
  };


  //初始化 数据源列表
  var  url = 'https://www.juxinli.com/orgApi/rest/orgs/demo1/datasources';
  vm.showLoading();
  $http.get(url)
    .success(function(data){
        vm.supportDatasources = data.data;
        console.log(vm.supportDatasources);

         $timeout(function(){
          vm.loadding = false;
          $ionicLoading.hide();
         },1000)
    })
    .error(function(){

    });


    // 提交申请
    vm.applyAuth = function(){
      var applyUrl = "https://www.juxinli.com/orgApi/rest/applications/demo1";

      var selectedWebsite = [];
      angular.forEach(vm.supportDatasources, function(datasource){

        if(datasource.checked){
          var website = {
            name:datasource.website,
            category:datasource.category
          }
          selectedWebsite.push(website);
        }
      })

      vm.applyInfo.selected_website = selectedWebsite;

      vm.btnLoading = true;

      $http.post(applyUrl,vm.applyInfo)
        .success(function(data){
          console.log(data);
          root.reciptInfo = data.data;


          //根据回执信息跳转页面

          root.currentDatasource = data.data.datasource;

          console.log('当前网站为' + data.data.datasource.name);

          $state.go('collect');
          
          $timeout(function(){
            vm.btnLoading = false;
          },4000)

          console.log($rootScope)
        })
        .error(function(data){
          console.log('apply error');
        })
    }
})

.controller('CollectCtrl', function($scope,$ionicPopup,$timeout,$rootScope,$q,$http,$state) {


  var vm = $scope.vm = {};
  var root = $rootScope.root;

  vm.btnLoading = false;

  vm.reqMsg = {
    token:root.reciptInfo.token,
    website:root.currentDatasource.website,
    account:root.reciptInfo.cell_phone_num,
    password:''
  }


  

  //登陆
  vm.auth = function(){
    vm.btnLoading = true;

    vm.sendCollectReq()
      .then(function(data){
        vm.getCollectResp(60);
      },function(){
        console.log('submit apply info faild');
      })
  }




  /////////////////////////////////////////////
    
  vm.sendCollectReq = function(){
      var deferred = $q.defer();
      var url = "https://www.juxinli.com/orgApi/rest/messages/collect/req";
      
      console.log("# 请求URL为" + url, " 请求内容为 ", vm.reqMsg);
      $http.post(url, vm.reqMsg)
      .success(function(data, status) {
          if (data.data) {
              console.log("# 发送交互请求成功！");
              deferred.resolve(data);
          } else {
              console.log("# 发送交互请求失败！");
              deferred.reject(data);
          }
      })
      .error(function(data, status) {
          deferred.reject(data);
          //return deferred.promise;
      })
      
      return deferred.promise;
  }

  // 采集响应
  vm.getCollectResp = function(times){

    vm.collectInProcess = true;

    var initNextDatasource = function(nextDatasource){
      
      //清空 @vm.reqMsg.captcha @vm.reqMsg.account @vm.reqMsg.password
      //设置 @vm.reqMsg.website
      vm.reqMsg.captcha = '';
      vm.reqMsg.account = '';
      vm.reqMsg.password = '';
      vm.reqMsg.type = '';

      vm.reqMsg.website = nextDatasource.website;
      root.currentDatasource = nextDatasource;
    }

    var url ="https://www.juxinli.com/orgApi/rest/messages/collect/resp";

    $http.post(url, vm.reqMsg)
        .success(function(data, status) {
            console.log(data);
            
            if (data.data) {
                vm.respMsg = data.data;
                console.log("# log === >" + data.data.content);
                if (vm.respMsg.type == 'CONTROL' || data.data.type == 'ERROR' ) {
                  //TODO 将process_code 换成 枚举
                  if(vm.respMsg.process_code === 10002){
                      //设置 未验证码验证
                      vm.showCaptchaPopup('请输入动态密码!');
                      console.log(root.currentDatasource.name + '请输入动态密码');
                  }
                  else if(vm.respMsg.process_code === 10003){
                      if(root.currentDatasource.category == 'mobile'){
                        vm.showCollectAlert(title,root.currentDatasource.name + '服务密码错误,请重新输入');
                      }else{
                        vm.showCollectAlert(title,root.currentDatasource.name + '网站密码错误,请重新输入');
                      }
                      console.log(root.currentDatasource.name + '密码错误');
                  }
                  else if(vm.respMsg.process_code === 10004){
                      vm.showCaptchaPopup('动态密码错误,请重新输入!');
                      //设置 未验证码验证
                      console.log(root.currentDatasource.name + '动态密码错误');
                  }
                  else if(vm.respMsg.process_code === 10008){
                       //提示下一个收集的数据源
                      if(vm.respMsg.finish != true){
                        var title = root.currentDatasource.name +'收集完成';
                        var message = '下一个授权网站为:'+  vm.respMsg.next_datasource.name;
                        vm.showCollectAlert(title,message);

                        initNextDatasource(vm.respMsg.next_datasource);
                      }else{
                        $state.go('success');
                      }
                      //设置 验证码验证成功
                      root.currentDatasource.captchaValid = true;
                      console.log(root.currentDatasource.name + '开始采集行为数据，前端交互流程结束');
                  }

                  //结束轮询
                  times = 0;
                  vm.collectInProcess = false;
                }
            }
            
            if (--times > 0) {
                console.log('当前第' + times + '次获取采集服务响应信息：', data.data)
                vm.getCollectResp(times);
            }
        })
        .error(function(error) {
            console.log(error);
        })
}
  /////////////////////////////////////////////


  vm.showCollectAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
           title: title,
           template:'<div class="text-center"> '
                    + message 
                    +'</div>',
           okText:'确定',
           okType:'button-balanced'
         });

     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
  };

  vm.showCaptchaPopup = function(message) {
    $scope.data = {};
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="vm.reqMsg.captcha" style="padding-left:10px;">',
      title: message,
      subTitle: '如果长时间没有收到短信请点击重发',
      scope: $scope,
      buttons: [
        {
          text: '<b>重发</b>',
          type: 'button',
          onTap: function(e) {

            window.alert('重发成功');
            if (!$scope.data.wifi) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.wifi;
            }
          }
        },
        {
          text: '<b>确认</b>',
          type: 'button button-balanced',
          onTap: function(e) {
            console.log('==========================');
            console.log(vm.reqMsg);
            console.log('==========================');
            if (!vm.reqMsg.captcha) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              vm.reqMsg.type = 'SUBMIT_CAPTCHA';
              vm.sendCollectReq()
              .then(function(data){
                vm.getCollectResp(60);
              },function(){
                console.log('submit apply info faild');
              })
              return $scope.data.wifi;
            }
          }
        }
      ]
    });
    
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });

    // $timeout(function() {
    //    myPopup.close(); //close the popup after 3 seconds for some reason
    // }, 3000);
   };

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
