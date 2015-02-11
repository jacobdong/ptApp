angular.module('jxlApp.controllers', [])

.controller('AppCtrl', function($scope) {
  console.log('enter in ');
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
