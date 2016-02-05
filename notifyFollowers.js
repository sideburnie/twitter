"use strict"

var Twit = require('twit');
var Twitter = require('twitter');
var sendEmail = require('./email.js');
var config = require('./config.js');
var async = require('./async.js').async;

Array.prototype.subtract = function(a) {
    return this.filter(function(i) { return a.indexOf(i) === -1; });
};

function getFollowers(T) {
  return new Promise((resolve, reject) => {
    T.get('followers/ids', { screen_name: 'BernieRihn' },  function (err, data, response) {
      if (err) {
        console.log('err: ' + JSON.stringify(err));
        return reject(new Error(err));
      }
      if (data.ids) { 
        // console.log('ids: ' + data.ids);
        // console.log('ids: ' + JSON.stringify(data));
        // console.log('id0: ' + data.ids[0]);
        // console.log('response: ' + JSON.stringify(response));
        var b = response.body;
        var idStrings = b.substring(b.indexOf('[') + 1, b.indexOf(']')).split(',');
        //console.log('resonse.ids: ' + idStrings);
        resolve(idStrings);
      } else {
        return reject(new Error('returned null list of followers!'));
      }
    })
  })
}

function notify(emailOptions, message) {
  let localEmailOptions = JSON.parse(JSON.stringify(emailOptions));
  localEmailOptions.htmlMessage = message;
  sendEmail(localEmailOptions)
    .then(res => console.log('sent notification email! ' + res.response))
    .catch(err => console.log('failed to send notification email! ' + err.stack));
}

function getFollowerFromIds(T, ids) {
  return new Promise((resolve, reject) => { 
    console.log('looking up user ids: ' + ids);
    T.get('users/lookup', { user_id: ids },  function (err, data, response) {
      if (err) {
        console.log('err: ' + JSON.stringify(err));
        return reject(new Error(err));
      }
      if (data) {
        console.log('follower ' + JSON.stringify(data, null, 2) + ' from ids: ' + ids);
        resolve(data);
      } else {
        console.log('got null data from user lookup api');
        resolve([]);
      }
    });
  });
}

var checkNotify = async(function* (T, followersList, emailOptions) {
  try {
    let latestIds = yield getFollowers(T);
    //console.log('\r\ngot latestIds: ' + latestIds + '\r\nfollowersList: ' + followersList);
    let follows = latestIds.subtract(followersList);
    let unfollows = followersList.subtract(latestIds);
    // let follows = latestIds.filter(id => { return !followersList.has(id); });
    // let unfollows = followersList.filter(id => { return !latestIds.has(id); });
    console.log('\r\n got follows: ' + follows + '\r\nunfollows: ' + unfollows);
    console.log('typeof 1: ' + typeof(latestIds[0]) + ', ' + latestIds[0]);
    console.log('typeof 2: ' + typeof(followersList[0]) + ', ' + followersList[0]);
    // let follows = getNewFollows(followersList, latestIds);
    // let unfollows = getUnfollows(followersList, latestIds);
    let notificationMessage = {};
    if (follows && follows.length > 0) {
      console.log('found new follows' + follows);
      notificationMessage.followProfiles = yield getFollowerFromIds(T, follows);
    }
    if (unfollows && unfollows.length > 0) {
      console.log('found new unfollows' + unfollows);
      notificationMessage.unfollowProfiles = yield getFollowerFromIds(T, unfollows);
    }
    if (Object.keys(notificationMessage).length > 0) {
      console.log('found changes in followers list: ' + JSON.stringify(notificationMessage));
      notify(emailOptions, JSON.stringify(notificationMessage, null, 2));
    } else {
      console.log('no changes found in followers list: ' + 
        JSON.stringify(notificationMessage));
    }
  } catch (e) {
    console.log('failed in checkNotify: ' + JSON.stringify(e) + e.stack);
  }
});

function notificationLoop(T, followersList, emailOptions, checkIntervalSeconds) {
  console.log('setup to check api every ' + checkIntervalSeconds + ' seconds')
  setInterval(() => {
    console.log('checking followers');
    checkNotify(T, followersList, emailOptions);
  }, checkIntervalSeconds * 1000);
}

var testNotify = async(function* (T, ids, emailOptions) {
  try {
    console.log('emailing: ');
    var followerFromID = yield getFollowerFromIds(T, [1026, 160763]);
    console.log('follower from id: ' + JSON.stringify(followerFromID));
    var result = yield notify(emailOptions, JSON.stringify(followerFromID));
    console.log('notify result: ' + JSON.stringify(result));
  } catch(e) {
    console.log(e.stack);
  }
});

function main() {
 
  console.log('starting, using config: ' + JSON.stringify(config));
  // var followers1 = [1,2,3,4,5,6].subtract( [3,5,4] ); 
  // var followers2 = [1,2,3,4,5,6].subtract( [1,2,3,4,6,5] );
  // console.log('subtract: ' + followers1);
  // console.log('subtract: ' + followers2);

  // var T = new Twit({
  //     consumer_key:         config.twitOptions.consumer_key
  //   , consumer_secret:      config.twitOptions.consumer_secret
  //   , access_token:         config.twitOptions.access_token
  //   , access_token_secret:  config.twitOptions.access_token_secret
  // })
  var T = new Twitter({
      consumer_key:         config.twitOptions.consumer_key
    , consumer_secret:      config.twitOptions.consumer_secret
    , access_token_key:     config.twitOptions.access_token
    , access_token_secret:  config.twitOptions.access_token_secret
  });
  //testNotify(T, [1026, 160763], config.emailOptions);
  var initialFollowers = []
  getFollowers(T)
    .then(res => { 
      initialFollowers = res; 
      console.log('initial followers ids: ' + res); 
      return initialFollowers;
    })
    .then(res => {
      getFollowerFromIds(T, res[0])
        .then(res => console.log('res: ' + JSON.stringify(res)))
    })
    .catch(err => console.log('err: ' + err.stack));

  getFollowers(T)
    .then(initialFollowers => { 
      console.log('initial followers ids: ' + initialFollowers);
      if (initialFollowers && initialFollowers.length > 0) {
        return initialFollowers; 
      } else {
        throw new Error('failed to get initial followers list');
      }
    })
    .then(res => {
      notificationLoop(T, res, config.emailOptions, config.checkIntervalSeconds);
    })
    .catch(err => {
      console.log('failed in main: ' + err.stack);
    })

  // .then(res => followerIdList.push(res))
  // .then(() => {
  // .catch(err => console.log(err.stack))
  //   
  // })
  // var followerFromID = getFollowerFromIds(T, [1026, 15508941]);
  // var followerFromID = getFollowerFromId(T, '15508941');
}

if (require.main === module) {
  main();
}


