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

    Array.prototype.unique = function() {
      var o = {},
        i, l = this.length,
        r = [];
      for (i = 0; i < l; i += 1) o[this[i]] = this[i];
      for (i in o) r.push(o[i]);
      return r;
    };

    $rootScope.getLatestMessages = function() {
      var messageObject = Parse.Object.extend("Message");
      var messageCollectionDef = Parse.Collection.extend({
        model: messageObject,
        query: (new Parse.Query(messageObject).descending("createdAt").equalTo('fromUser', $rootScope.currentUser).limit(100))
      });
      var messageCollection = new messageCollectionDef();

      messageCollection.fetch({
        success: function(messageCollection) {
          var arr = $.map(messageCollection.models, function(o) {
            return o.attributes.message;
          })
          arr = arr.unique();
          var currentUserLatestMessages = [{
            message: 'Working'
          }, {
            message: 'Excited'
          }, {
            message: 'Night Out'
          }, {
            message: 'Gobble Gobble'
          }, {
            message: 'Evincible'
          }];

          arr.forEach(function(message) {
            var _message = {
              message: message
            };
            currentUserLatestMessages.unshift(_message);
          });
          $rootScope.currentUser.latestMessages = currentUserLatestMessages;
          $rootScope.$broadcast('fetched:latestMessages');
        },
        error: function(userCollection, error) {
          console.log("Problem fetching message database.");
        }
      });
    }

    $rootScope.getCurrentUser = function() {
      $rootScope.currentUser = Parse.User.current();

      if ($rootScope.currentUser !== null) {
        $state.go('home');

        if (!$rootScope.currentUser.friends) {
          $rootScope.getCurrentUserFriends();
          $rootScope.getLatestMessages();
        }
      }
    }

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
    }
    Parse.initialize("uzc2fQIZzhFY1GasSyx85TjTPki4lxi5Gt9cDQTi", "K0NlKEQo69SYJE1XIrUWd17o4MjTEsLqdiFEdzC7");

    $rootScope.getCurrentUser();

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

.controller('HomeCtrl', function($scope, $state, $rootScope, $cordovaPush, $cordovaDevice, $ionicPopup) {
  $('body').addClass('hide-nav');

  $scope.friends = [];
  $scope.evinceMessage = '';

  $scope.$on('fetched:currentFriends', function(event) {
    $scope.friends = $rootScope.currentUser.friendsObjects;
  });

  $scope.$on('fetched:latestMessages', function(event) {
    $scope.latestMessages = $rootScope.currentUser.latestMessages;
    setTimeout(function() {
      $scope.$apply();
    });
    $('#messageList').removeClass('hidden');
  });

  if ($rootScope.currentUser) {
    $rootScope.getCurrentUserFriends();
    $rootScope.getLatestMessages();
  }

  ionic.DomUtil.ready(function() {
    $('.friends-page-content').css('top', $('.friends-page-header').outerHeight());
    $('.evince-list-content').css('top', $('.friends-page-header').outerHeight());
    cordova.plugins.Keyboard.disableScroll(false);
  });

  $scope.evince = function(evinceMessage) {
    if (!evinceMessage) {
      return;
    }
    $rootScope.evinceMessage = evinceMessage;
    $state.go('sendevince');
  }

  // In App Notification HAndler
  onNotificationAPN = function(event) {
    if (event.alert) {
      var alertPopup = $ionicPopup.alert({
        title: event.alert
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

  var iosConfig = {
    "badge": "true",
    "sound": "true",
    "alert": "true",
    "ecb": "onNotificationAPN"
  };

  if (window.cordova) {
    $cordovaPush.register(iosConfig).then(function(result) {
      var installationObject = Parse.Object.extend("_Installation");
      var installation = new installationObject();
      installation.set('deviceToken', result);
      installation.set('deviceType', 'ios');
      installation.set('model', $cordovaDevice.getModel());
      installation.set('osVersion', $cordovaDevice.getVersion());
      installation.set('userID', $rootScope.currentUser.id);
      installation.set('username', $rootScope.currentUser.attributes.username);
      installation.set('appName', 'Evince');
      installation.set('version', '1.0');

      console.log('Saving installation file');
      console.log(installation);
      installation.save(null, {
        success: function(object) {
          console.log(object);
        },
        error: function(error) {
          console.log(error);
        }
      });
    }, function(err) {
      console.log(err);
    });
  }

})

.controller('SplashCtrl', function($scope, $state, $cordovaFacebook, $rootScope, $ionicPopup) {
  $('body').addClass('hide-nav');

  var permissions = ["public_profile", "email", "user_friends"];

  $scope.data = {
    username: "",
    error: ""
  }

  $scope.facebookLogIn = function() {

    $cordovaFacebook.getLoginStatus()
      .then(function(result) {
        if (result.status === 'connected') {

          // User already connected with facebook, log in with parse as existing user
          $scope.parseFacebookLogIn(result, false);
        } else {

          // User has not authenticated app with facebook, request permission then create parse user
          $scope.facebookRequestPermission();
        }
      }, function(error) {
        console.log(error);
      });
  }

  $scope.facebookRequestPermission = function() {
    $cordovaFacebook.login(permissions)
      .then(function(result) {
        if (result.status === 'connected') {
          $scope.parseFacebookLogIn(result, true);
        }
      }, function(error) {
        console.log(error);
      });
  }

  $scope.parseFacebookLogIn = function(result, newUser) {

    var now = moment();
    now.add(result.authResponse.expiresIn, 'seconds');
    var expiration_date = now.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

    var facebookAuthData = {
      "id": result.authResponse.userID + "",
      "access_token": result.authResponse.accessToken,
      "expiration_date": expiration_date
    }

    Parse.FacebookUtils.logIn(facebookAuthData, {
      success: function(_user) {
        console.log(_user);

        if (newUser) {

          var myPopup = $ionicPopup.show({
            template: '<input autocorrect="off" autocomplete="off" autocapitalize="off" type="text" ng-model="data.username">{{data.error}}',
            title: 'Enter your username',
            scope: $scope,
            buttons: [{
              text: '<b>Save</b>',
              type: 'button-positive',
              onTap: function(e) {
                $scope.data.error = '';
                console.log('tapped');
                console.log($scope.data.username);
                if (!$scope.data.username) {
                  e.preventDefault();
                } else {
                  console.log('checking for ' + $scope.data.username);
                  // Check if username exists
                  var userObject = Parse.Object.extend("User");
                  var query = new Parse.Query(userObject);
                  query.equalTo("username", $scope.data.username.toLowerCase());
                  query.count({
                    success: function(count) {
                      if (count) {
                        e.preventDefault();
                        console.log('username exists');
                        $scope.data.error = 'Username already exists';
                      } else {
                        console.log('username unique');
                        // username is unique
                        _user.set('username', $scope.data.username.toLowerCase());
                        _user.save(null, {
                          success: function(object) {
                            console.log('username saved');
                            $rootScope.getCurrentUser();
                          },
                          error: function(error) {
                            console.log(error);
                          }
                        });
                      }
                    },
                    error: function(error) {
                      console.log(error);
                    }
                  });
                }
              }
            }, ]
          });
        } else {
          $rootScope.getCurrentUser();
        }

      },
      error: function(error) {
        console.log(error);
      }
    });
  }

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

    if (toSend.length) {
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

  }
})

.controller('AddFriendsCtrl', function($scope, $state, $rootScope, $ionicPopup) {
  $('body').removeClass('hide-nav');

  if ($rootScope.currentUser) {
    $rootScope.getCurrentUserFriends();
  }

  $scope.searchResults = [];
  $scope.othersAdded = [];

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

  $scope.getOthersAdded = function() {

    $scope.othersAdded = [];
    var friendshipObject = Parse.Object.extend("Friendship");
    var friendshipCollectionDef = Parse.Collection.extend({
      model: friendshipObject,
      query: (new Parse.Query(friendshipObject).equalTo('toUser', $rootScope.currentUser))
    });
    var friendshipCollection = new friendshipCollectionDef();

    friendshipCollection.fetch({
      success: function(friendshipCollection) {
        friendshipCollection.each(function(friendship) {
          var _user = {
            id: friendship.attributes.fromUser.id,
            username: friendship.attributes.fromUserUsername
          };
          $scope.othersAdded.push(_user);
          setTimeout(function() {
            $scope.$apply();
          });
        });
      },
      error: function(userCollection, error) {
        console.log("Problem fetching friendship database.", error);
      }
    });
  }

  $scope.onTabSelected = function(tab) {
    switch (tab) {
      case 'othersAdded':
        $scope.getOthersAdded();
        break;
    }

    ionic.DomUtil.ready(function() {
      $('.addfriends .tabs').css('top', $('#nav-bar').outerHeight());
      $('.addfriends .pane').css('top', $('#nav-bar').outerHeight() + $('.addfriends .tabs').outerHeight());
      $('.search-friends-content').css('bottom', $('#nav-bar').outerHeight() + $('.addfriends .tabs').outerHeight());
    });
  }
})
