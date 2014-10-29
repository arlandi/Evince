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
