angular.module('jxlApp.controllers', [])

.controller('AppCtrl', function($scope) {
  console.log('enter in ');
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];

  console.log('init data');
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});