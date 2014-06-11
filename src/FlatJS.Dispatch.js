/**
 * taken from https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js 
 */
FlatJS.Dispatch = (function() {

  var api         = {},
      cache       = {};

  api.publish = function(topic, args) {
    if (cache[topic]) {
      for (var i = 0; i < cache[topic].length; i++) {
        if (cache[topic][i]) {
          cache[topic][i].fn.apply(this, args);
        }
      }
    }
  }

  api.subscribe = function(topic, callback) {
    if(!cache[topic]){
      cache[topic] = [];
    }
    cache[topic].push({
      instance: this,
      fn:       callback
    });
    // return [topic, callback]; // Array
  };

  // TODO: Make shorter / separate into private functions.
  api.unsubscribe = function(topic, callback){
    if (cache[topic]) {
      if (callback) {
        for (var i = 0; i < cache[topic].length; i++) {
          var obj = cache[topic][i];
          if(obj && obj.fn && obj.fn === callback){
            cache[topic].splice(obj, 1);
          }
        }
      } else {
        if (this !== api) {
          for (var i = 0; i < cache[topic].length; i++) {
            var obj = cache[topic][i];
            if (obj && obj.instance && obj.instance === this) {
              cache[topic].splice(obj, 1)
            }
          }
        } else {
          cache[topic] = [];
        }
      }
    } else if (!topic && !callback && this !== api) {
      for (var topicKey in cache) {
        var topic = cache[topicKey];
        for (var cb in topic) {
          var obj = topic[cb];

          if (typeof obj.fn === 'function' && obj.instance === this) {
            topic.splice(obj, 1);
          }
        }
      }
    }
  }

  if (FlatJS.Classy) {

    FlatJS.Classy.prototype.publish = function(topic, args) {
      this._(api.publish)(topic, args);
    }

    FlatJS.Classy.prototype.subscribe = function(topic, callback) {
      this._(api.subscribe)(topic, callback);
    }
    
    FlatJS.Classy.prototype.unsubscribe = function(topic, callback) {
      this._(api.unsubscribe)(topic, callback);
    }
  }

  if (FlatJS.Widget) {
    FlatJS.Widget.prototype.destroy = function () {
      this.unsubscribe();
    };
  }

  return api;

}());