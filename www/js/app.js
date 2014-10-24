angular.module('starter', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('splash', {
      url: '/splash',
      templateUrl: 'templates/splash.html',
      controller: 'SplashCtrl'
    })
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('signup', {
      url: '/sign-up',
      templateUrl: 'templates/sign-up.html',
      controller: 'SignUpCtrl'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl'
    })
    .state('addfriends', {
      url: '/addfriends',
      templateUrl: 'templates/addfriends.html',
      controller: 'AddFriendsCtrl'
    })
    .state('sendevince', {
      url: '/sendevince',
      templateUrl: 'templates/send-evince.html',
      controller: 'SendEvinceCtrl'
    });

  $urlRouterProvider.otherwise('/splash');
})

.run(function($ionicPlatform, $rootScope, $state, $cordovaPush, $ionicPopup) {

  $ionicPlatform.ready(function() {

    $rootScope.getCurrentUserFriends = function() {
      var friendshipObject = Parse.Object.extend("Friendship");
      var friendshipCollectionDef = Parse.Collection.extend({
        model: friendshipObject,
        query: (new Parse.Query(friendshipObject).equalTo('fromUser', $rootScope.currentUser))
      });
      var friendshipCollection = new friendshipCollectionDef();

      friendshipCollection.fetch({
        success: function(friendshipCollection) {
          var currentUserFriends = [];
          var currentUserFriendsObjects = [];

          friendshipCollection.each(function(friendship) {
            var _user = {
              id: friendship.attributes.toUser.id,
              username: friendship.attributes.toUserUsername
            };
            currentUserFriendsObjects.push(_user);
            currentUserFriends.push(friendship.attributes.toUser.id);
          });
          $rootScope.currentUser.friends = currentUserFriends;
          $rootScope.currentUser.friendsObjects = currentUserFriendsObjects;
          $rootScope.$broadcast('fetched:currentFriends');
        },
        error: function(userCollection, error) {
          console.log("Problem fetching friendship database.");
        }
      });
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    Parse.initialize("uzc2fQIZzhFY1GasSyx85TjTPki4lxi5Gt9cDQTi", "K0NlKEQo69SYJE1XIrUWd17o4MjTEsLqdiFEdzC7");

    $rootScope.currentUser = Parse.User.current();

    if ($rootScope.currentUser !== null) {
      // $state.go('home');

      if (!$rootScope.currentUser.friends) {
        $rootScope.getCurrentUserFriends();
      }
    }

    // Disable Auto Scroll on Input tap
    cordova.plugins.Keyboard.disableScroll(true);

    // Push
    var pushNotification;
    pushNotification = window.plugins.pushNotification;
    pushNotification.register(
      tokenHandler,
      errorHandler, {
        "badge": "true",
        "sound": "true",
        "alert": "true",
        "ecb": "onNotificationAPN"
      });

    function tokenHandler(token) {
      var installationObject = Parse.Object.extend("_Installation");
      var installation = new installationObject();
      installation.set('deviceToken', token);
      installation.set('deviceType', 'ios');
      installation.set('userID', $rootScope.currentUser.id);
      installation.set('username', $rootScope.currentUser.attributes.username);
      installation.set('appName', 'Evince');
      installation.set('version', '1.0');
      console.log(installation);
      installation.save(null, {
        success: function(object) {
          console.log(object);
        },
        error: function(error) {}
      });
    }

    // iOS
    function onNotificationAPN(event) {
      if (event.alert) {
        var alertPopup = $ionicPopup.alert({
          title: 'No one with that username.'
        });
      }

      if (event.sound) {
        var snd = new Media(event.sound);
        snd.play();
      }

      if (event.badge) {
        // pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
      }
    }

  });
})

.controller('SignInCtrl', function($scope, $state, $rootScope) {
  $('body').removeClass('hide-nav');

  $scope.signIn = function(user) {
    $('#signInError').addClass('hidden');

    if (!user || !user.username || !user.password) {
      $scope.signInError = 'Please fill out all the fields.';
      $('#signInError').removeClass('hidden');
      return false;
    }

    $('#signInButton').attr('disabled', 'disabled').html('Signing In...');

    Parse.User.logIn(user.username.toLowerCase(), user.password, {
      success: function(thisUser) {
        console.log(thisUser);
        $rootScope.currentUser = thisUser;
        $rootScope.$apply();
        $('#signInButton').removeAttr('disabled').html('Sign In');
        $state.go('home');
      },
      error: function(user, error) {
        console.log(error);
        switch (error.code) {
          case 101:
            $scope.signInError = 'Wrong username or password.';
            break;
        }
        setTimeout(function() {
          $scope.$apply();
        });
        $('#signInError').removeClass('hidden');
        $('#signInButton').removeAttr('disabled').html('Sign In');
      }
    });
  };

})

.controller('SignUpCtrl', function($scope, $state, $rootScope) {
  $('body').removeClass('hide-nav');

  $scope.signUp = function(user) {
    $('#signUpError').addClass('hidden');

    if (!user || !user.email || !user.username || !user.password) {
      $scope.signUpError = 'Please fill out all the fields.';
      $('#signUpError').removeClass('hidden');
      return false;
    }

    $('#signUpButton').attr('disabled', 'disabled').html('Signing Up...');

    var parseUser = new Parse.User();
    parseUser.set("email", user.email.toLowerCase());
    parseUser.set("username", user.username.toLowerCase());
    parseUser.set("password", user.password);

    parseUser.signUp(null, {
      success: function(newUser) {
        $rootScope.currentUser = newUser;
        $rootScope.$apply();
        $('#signUpButton').removeAttr('disabled').html('Sign Up');
        $state.go('home');
      },
      error: function(newUser, error) {
        console.log(error);
        switch (error.code) {
          case 125:
            $scope.signUpError = 'Invalid email.';
            break;
          case 202:
            $scope.signUpError = 'That username is taken.';
            break;
          case 203:
            $scope.signUpError = 'That email is taken.';
            break;
        }
        setTimeout(function() {
          $scope.$apply();
        });
        $('#signUpError').removeClass('hidden');
        $('#signUpButton').removeAttr('disabled').html('Sign Up');
      }
    });
  }
})

.controller('HomeCtrl', function($scope, $state, $rootScope, $cordovaPush) {
  $('body').addClass('hide-nav');

  $scope.friends = [];

  $scope.$on('fetched:currentFriends', function(event) {
    $scope.friends = $rootScope.currentUser.friendsObjects;
    if ($scope.friends.length) {
      $('.friends-page .pane-title').css('display', 'none');
    }
  });

  ionic.DomUtil.ready(function() {
    $('.friends-page-content').css('top', $('.friends-page-header').outerHeight());
  });

  $scope.evince = function(evinceMessage) {
    if (!evinceMessage) {
      return;
    }
    $rootScope.evinceMessage = evinceMessage;
    $state.go('sendevince');
  }
})

.controller('SplashCtrl', function($scope, $state) {
  $('body').addClass('hide-nav');
})

.controller('SendEvinceCtrl', function($scope, $state, $rootScope, $ionicLoading) {
  $('body').removeClass('hide-nav');

  $scope.friends = $rootScope.currentUser.friendsObjects;

  $scope.sendEvince = function() {
    var messageObject = Parse.Object.extend("Message");
    var userObject = Parse.Object.extend("User");
    var toSend = [];
    $scope.friends.forEach(function(friend) {
      if (friend.selected) {
        // Save Message Array Build
        var message = new messageObject();
        var toUser = new userObject();
        toUser.id = friend.id;
        message.set('fromUser', $rootScope.currentUser);
        message.set('fromUserUsername', $rootScope.currentUser.attributes.username);
        message.set('toUser', toUser);
        message.set('message', $rootScope.evinceMessage);
        toSend.push(message);
      }
    });
    Parse.Object.saveAll(toSend, {
      success: function(objs) {
        $ionicLoading.show({
          template: 'Sent!',
          duration: 1000
        });
        $state.go('home');
      },
      error: function(error) {
        console.log(error);
      }
    });
  }
})

.controller('AddFriendsCtrl', function($scope, $state, $rootScope, $ionicPopup) {
  $('body').removeClass('hide-nav');

  if ($rootScope.currentUser && !$rootScope.currentUser.friends) {
    $rootScope.getCurrentUserFriends();
  }

  $scope.searchResults = [];

  $scope.searchUsers = function(username) {
    if (!username) {
      return;
    }

    $scope.searchResults = [];
    var userObject = Parse.Object.extend("User");
    var userCollectionDef = Parse.Collection.extend({
      model: userObject,
      query: (new Parse.Query(userObject).contains('username', username.toLowerCase()))
    });
    var userCollection = new userCollectionDef();

    userCollection.fetch({
      success: function(userCollection) {

        if (userCollection.length === 0) {
          var alertPopup = $ionicPopup.alert({
            title: 'No one with that username.'
          });
        }

        userCollection.each(function(user) {
          var _user = {
            id: user.id,
            username: user.attributes.username
          };
          if (_user.id !== $rootScope.currentUser.id) {
            $scope.searchResults.push(_user);
          }
        });
        setTimeout(function() {
          $scope.$apply();
        });
        cordova.plugins.Keyboard.close();
      },
      error: function(userCollection, error) {
        console.log("Problem fetching users database.");
      }
    });
  }

  $scope.isFriends = function(user) {
    return $rootScope.currentUser.friends.indexOf(user.id) > -1;
  }

  $scope.addOrRemove = function(user) {
    if ($scope.isFriends(user)) {
      $scope.removeFriend(user);
    } else {
      $scope.addFriend(user);
    }
  }

  $scope.addFriend = function(user) {
    console.log('adding friend', user);
    var friendshipObject = Parse.Object.extend("Friendship");
    var friendship = new friendshipObject();
    var userObject = Parse.Object.extend("User");
    var toUser = new userObject();

    toUser.id = user.id;
    friendship.set('fromUser', $rootScope.currentUser);
    friendship.set('toUser', toUser);

    friendship.set('toUserUsername', user.username);
    friendship.set('fromUserUsername', $rootScope.currentUser.attributes.username);
    friendship.save(null, {
      success: function(object) {
        $rootScope.currentUser.friends.push(toUser.id);
        setTimeout(function() {
          $rootScope.$apply();
        });
      },
      error: function(error) {}
    });
  }

  $scope.removeFriend = function(user) {
    console.log('removing friend', user);

    //Build toUser object
    var userObject = Parse.Object.extend("User");
    var toUser = new userObject();
    toUser.id = user.id;

    //Build Friendship Query
    var friendshipObject = Parse.Object.extend("Friendship");
    var query = new Parse.Query(friendshipObject);
    query.equalTo('fromUser', $rootScope.currentUser).equalTo('toUser', toUser);

    query.first({
      success: function(object) {
        object.destroy({
          success: function(object) {
            var index = $rootScope.currentUser.friends.indexOf(user.id);
            if (index > -1) {
              $rootScope.currentUser.friends.splice(index, 1);
              setTimeout(function() {
                $rootScope.$apply();
              });
            }
          },
          error: function(object, error) {
            console.log(error);
          }
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
  }

  $scope.onTabSelected = function() {
    ionic.DomUtil.ready(function() {
      $('.addfriends .tabs').css('top', $('#nav-bar').outerHeight());
      $('.addfriends .pane').css('top', $('#nav-bar').outerHeight() + $('.addfriends .tabs').outerHeight());
      $('.search-friends-content').css('bottom', $('#nav-bar').outerHeight() + $('.addfriends .tabs').outerHeight());
    });
  }
})
