'use strict';

angular.module('rollMeanApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/chat', {
        templateUrl: 'app/chat/chat.html',
        controller: 'ChatCtrl'
      });
  });
