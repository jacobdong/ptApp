angular.module('jxlApp.controllers', [])

.controller('AppCtrl', function($scope,$http,$ionicLoading,$timeout) {
  var vm =  $scope.vm = {};
  vm.supportDatasources = [];
  vm.applyInfo = {
    selected_website:[],
    basic_info:{
      name:'董发鹏',
      id_card_num:'18693152204',
      cell_phone_num:'622301199002040315'
    }
  }
  vm.loadding = true;

  vm.showLoading = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> 正在获取数据源列表...'
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

        // $timeout(function(){
          vm.loadding = false;
          $ionicLoading.hide();
        // },2000)
    })
    .error(function(){

    });


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

      console.log(vm.selectedWebsite);
      vm.applyInfo.selected_website = selectedWebsite;

      $http.post(applyUrl,vm.applyInfo)
        .success(function(data){
          console.log(data);
        })
        .error(function(data){
          console.log('apply error');
        })
    }
})

.controller('CollectCtrl', function($scope,$ionicPopup,$timeout) {


  var vm = $scope.vm = {};

  vm.auth = function(){

    $timeout(function(){
      console.log('要弹框了');
      
      $scope.showPopup();
    },3000)
  }


  $scope.showPopup = function() {
    $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.wifi" style="padding-left:10px;">',
      title: '请输入收到的短信验证码',
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
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.data.wifi) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
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
