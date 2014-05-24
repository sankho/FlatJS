/**
 * taken from https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js 
 */
FlatJS.Dispatch = (function() {

  var api         = {},
      pubSubCache = {};

  api.publish = function(topic, args) {
    if (pubSubCache[topic]) {
      for (var i = 0; i < pubSubCache[topic].length; i++) {
        pubSubCache[topic][i].apply(this, args);
      }
    }
  }

  api.subscribe = function(topic, callback) {
    if(!pubSubCache[topic]){
      pubSubCache[topic] = [];
    }
    pubSubCache[topic].push(callback);
    return [topic, callback]; // Array
  };

  api.unsubscribe = function(topic, callback){
    if (pubSubCache[topic]) {
      if (callback) {
        for (var i = 0; i < pubSubCache[topic].length; i++) {
          var fn = pubSubCache[topic][i];
          if(fn && fn === callback){
            pubSubCache[topic].splice(fn, 1);
          }
        }
      } else {
        pubSubCache[topic] = [];
      }
    }
  }

  if (FlatJS.Classy) {
    FlatJS.Classy.prototype.publish = function() {}
    FlatJS.Classy.prototype.subscribe = function() {}
    FlatJS.Classy.prototype.unsubscribe = function() {}
  }

  return api;

}());