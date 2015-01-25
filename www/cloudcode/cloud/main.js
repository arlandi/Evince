// New Message Push Notification
Parse.Cloud.afterSave("Message", function(request) {

  // Build fromUser
  var fromUser = request.object.get('fromUser');

  // Build toUser
  var toUser = request.object.get('toUser');

  // The message
  var message = request.object.get('message');

  // Build the query
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('userID', toUser.id);

  Parse.Push.send({
    where: pushQuery, // Set our Installation query
    data: {
      alert: request.object.get('fromUserUsername') + ": * " + message + " *",
      sound: "default"
    }
  }, {
    success: function() {
      console.log('Evince Push Notification Success');
    },
    error: function(error) {
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});

// New Friend Push Notification
Parse.Cloud.afterSave("Friendship", function(request) {

  // Build fromUser
  var fromUser = request.object.get('fromUserUsername');

  // Build toUser
  var toUser = request.object.get('toUser');

  // Build the query
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('userID', toUser.id);

  Parse.Push.send({
    where: pushQuery, // Set our Installation query
    data: {
      alert: fromUser+' has added you!',
      sound: "default"
    }
  }, {
    success: function() {
      console.log('New Friend Push Notification Success');
    },
    error: function(error) {
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});


var Friendship = Parse.Object.extend("Friendship");

// Check if stopId is set, and enforce uniqueness based on the stopId column.
Parse.Cloud.beforeSave("Friendship", function(request, response) {

  // Build fromUser
  var fromUser = request.object.get('fromUser');

  // Build toUser
  var toUser = request.object.get('toUser');

  var query = new Parse.Query(Friendship);
  query.equalTo('fromUser', fromUser);
  query.equalTo('toUser', toUser);
  query.first({
    success: function(object) {
      if (object) {
        response.error('Friendship already exists.');
      } else {
        response.success();
      }
    },
    error: function(error) {
      response.error('Could not validate uniqueness for this Friendship object');
    }
  });
});
