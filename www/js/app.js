angular.module('starter', ['ionic'])

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

.run(function($ionicPlatform, $rootScope, $state) {

  $ionicPlatform.ready(function() {
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

      var friendshipObject = Parse.Object.extend("Friendship");
      var friendshipCollectionDef = Parse.Collection.extend({
        model: friendshipObject,
        query: (new Parse.Query(friendshipObject).equalTo('fromUser', $rootScope.currentUser))
      });
      var friendshipCollection = new friendshipCollectionDef();

      friendshipCollection.fetch({
        success: function(friendshipCollection) {
          var currentUserFriends = [];
          friendshipCollection.each(function(friendship) {
            currentUserFriends.push(friendship.attributes.toUser.id);
          });
          $rootScope.currentUser.friends = currentUserFriends;
        },
        error: function(userCollection, error) {
          console.log("Problem fetching friendship database.");
        }
      });
    }

    cordova.plugins.Keyboard.disableScroll(true);

  });

})

.controller('SignInCtrl', function($scope, $state, $rootScope) {
  $('body').removeClass('hide-nav');

  $scope.signIn = function(user) {
    $('#signInError').addClass('hidden');

    if (user === undefined || !user.username || !user.password) {
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

    if (user === undefined || !user.email || !user.username || !user.password) {
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

.controller('HomeCtrl', function($scope, $state) {
  $('body').addClass('hide-nav');

  $scope.friends = [];

  $scope.evince = function(evinceMessage) {
    if (evinceMessage === undefined) {
      return;
    }
    $state.go('sendevince');
  }
})

.controller('SplashCtrl', function($scope, $state) {
  $('body').addClass('hide-nav');
})

.controller('SendEvinceCtrl', function($scope, $state) {
  $('body').removeClass('hide-nav');
})

.controller('AddFriendsCtrl', function($scope, $state, $rootScope) {
  $('body').removeClass('hide-nav');

  $scope.searchResults = [];

  $scope.searchUsers = function(username) {
    if(username === undefined || username === ''){
      return;
    }

    $scope.searchResults = [];
    var userObject = Parse.Object.extend("User");
    var userCollectionDef = Parse.Collection.extend({
      model: userObject,
      query: (new Parse.Query(userObject).contains('username', username))
    });
    var userCollection = new userCollectionDef();

    userCollection.fetch({
      success: function(userCollection) {

        if (userCollection.length === 0) {
          alert('No users found.');
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
      },
      error: function(userCollection, error) {
        console.log("Problem fetching users database.");
      }
    });
  }

  $scope.isFriends = function(user) {
    return $rootScope.currentUser.friends.indexOf(user.id) > -1;
  }

  $scope.addUser = function(user) {
    console.log('adding friend', user);
    var friendshipObject = Parse.Object.extend("Friendship");
    var friendship = new friendshipObject();
    var userObject = Parse.Object.extend("User");
    var toUser = new userObject();

    toUser.id = user.id;
    friendship.set('fromUser', $rootScope.currentUser);
    friendship.set('toUser', toUser);
    friendship.save(null, {
      success: function(object) {
        $rootScope.currentUser.friends.push(toUser.id);
        setTimeout(function() { $rootScope.$apply(); });
      },
      error: function(error) {},
    });
  }
})
