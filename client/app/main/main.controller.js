'use strict';

angular.module('rollMeanApp')
  .controller('MainCtrl', function ($scope, Auth, $http, $window, $sce, socket, lodash) {
    var TYPING_TIMER_LENGTH = 400;
    
    $scope.remotes = [];
    
    $scope.glued = true;
    $scope.username = Auth.getCurrentUser().name;
    if (lodash.isEmpty(Auth.getCurrentUser())) {
      $scope.username = 'Some guy';
    }
    
    console.log($scope.username);
    $scope.typeUser = "";

    $scope.awesomeThings = [];
    $scope.messages = [];

    $scope.result = 0;
    $scope.type = false;

    $http.get('/api/messages').success(function(data) {
      $scope.messages = data;
      console.log($scope.messages);
      socket.syncUpdates('messages', $scope.messages);
    });
    
    // dice roller, could probably be improved
    function dice(num, die, mod, modNum) {
      var sum = 0;
      for (var i = 0; i < num; i++) {
	var curr = parseInt(Math.random() * (die + 1 - 1) + 1);
	sum = sum + curr;
      }
      console.log(sum);
      if (mod == "+") {
	return sum + modNum;
      } else if (mod == "-") {
	return sum - modNum;
      } else {
	return sum;
      }
    };
    
    $scope.rollDie = function(num, die, mod, modNum) {
      console.log(num, die, mod, modNum);
      $scope.result = dice(num, die, mod, modNum);
    };
    
    $scope.addMessage = function() {
      var roll = false;
      var dieCheck = new String($scope.newThing).substr(1, 4);
      
      if ((dieCheck == 'roll') && ($scope.newThing.indexOf('d') > 0)) {
	roll = true;
	var nums = [];
	var mod = "";
	var modNum = "";

	// if there is a modifier to the roll find it
	var modCheck = $scope.newThing.substr(5);

	if (((modCheck.indexOf("+")) > 0) || ((modCheck.indexOf("-")) > 0)) {
	  if (modCheck.indexOf("+") > 0) {
	    mod = modCheck[modCheck.indexOf("+")];
	    modNum = parseInt(modCheck.substr(modCheck.indexOf("+")+1));
	    modCheck = modCheck.substr(0, modCheck.indexOf("+"));
	  } else {
	    mod = modCheck[modCheck.indexOf("-")];
	    modNum = parseInt(modCheck.substr(modCheck.indexOf("-")+1));
	    modCheck = modCheck.substr(0, modCheck.indexOf("-"));
	  }
	}
	console.log(modCheck);
	nums = modCheck.split("d");

	console.log("dice roll", nums, mod, modNum);
	if (mod != "") {
	  console.log("mod");
	  if (nums[0] == ' ') {
	    $scope.rollDie(1, parseInt(nums[1]), mod, parseInt(modNum));
	  } else {
	    $scope.rollDie(parseInt(nums[0]), parseInt(nums[1]), mod, parseInt(modNum));
	  }
	} else {
	  if (nums[0] == ' ') {
	    $scope.rollDie(1, parseInt(nums[1]));
	  } else {
	    $scope.rollDie(parseInt(nums[0]), parseInt(nums[1]));
	  }
	}  

	$scope.type = false;
	if (mod == "") {
	  $scope.newThing = " rolled " + nums[0] + "d" + nums[1] +". " + $scope.result;
	} else {
	  $scope.newThing = " rolled " + nums[0] + "d" + nums[1] + mod + modNum + ". " + $scope.result;
	}
      } else if ($scope.newThing.substr(0, 4) == 'roll') {
	$scope.newThing = "...you forgot the slash.";
      }
      
      if($scope.newThing === '') {
	return;
      }

      $http.post('/api/messages', { user: $scope.username, text: $scope.newThing });
      $scope.newThing = '';
      $scope.type = false;
    };

    $scope.deleteMessage = function(thing) {
      $http.delete('/api/messages/' + thing._id);
    };

    $scope.typing = function(event) {
      socket.socket.emit('typing', {user: $scope.username});
      $scope.type = true;
    };
    
    socket.socket.on("typing:user", function(data) {
      $scope.type = true;

      $scope.typeUser = data.user;
      console.log($scope.typeUser);
      var lastTypingTime = (new Date()).getTime();
      setTimeout(function () {
	var typingTimer = (new Date()).getTime();
	var timeDiff = typingTimer - lastTypingTime;
	if (timeDiff >= TYPING_TIMER_LENGTH) {
	  console.log('emit');
	  socket.socket.emit('stop:typing');
	  $scope.typeUser = null;
	}
      }, TYPING_TIMER_LENGTH);
    });
    
    socket.socket.on("thing:save", function() {
      console.log("saved");
    });

    socket.socket.on("connection", function() {
      console.log("connection");
    });
    
    socket.socket.on("stop", function() {
      console.log("stopped typing");
      $scope.typeUser = null;
    });
    
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

    var webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: 'localVideo',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: '', //remotesVideos',
      // immediately ask for camera access
      autoRequestMedia: true
    });

    // we have to wait until it's ready
    webrtc.on('readyToCall', function () {
      webrtc.joinRoom('heresy');
    });

    // a peer video has been added
    webrtc.on('videoAdded', function (video, peer) {
      console.log('video added', peer);

      // added to scope.remotes
      var remotes = document.getElementById('remotes');
      if (remotes) {
      	var container = document.createElement('li');
      	container.className = 'videoContainer';
      	container.id = 'container_' + webrtc.getDomId(peer);
      	container.appendChild(video);
      	// suppress contextmenu
      	video.oncontextmenu = function () { return true; };
      	remotes.appendChild(container);
      }
      
    });
    
    // a peer video was removed
    webrtc.on('videoRemoved', function (video, peer) {
      console.log('video removed ', peer);

      var remotes = document.getElementById('remotes');
      var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
      if (remotes && el) {
	remotes.removeChild(el);
      }
    });
    
    
  });


