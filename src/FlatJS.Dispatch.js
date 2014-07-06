/**
 * # FlatJS.Dispatch
 *
 * Object containing three public functions. Largely based on a pubsub implementation
 * written by Peter Higgins, see https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
 *
 * Extended to store callbacks relative to the instance ("this") it is called under.
 * Also extends FlatJS.Classy & FlatJS.Widget patterns to add pubsub related methods to their prototypes.
 *
 * @namespace
 * @public
 */
FlatJS.Dispatch = (function() {

  // cache is the private static store of all callbacks
  var cache       = {};

  // api is the public object returned at the end of the closure which represents FlatJS.Dispatch
  var  api         = {

    /**
     * ## FlatJS.Dispatch.publish
     *
     * Publish an event, all listeners be called with the current context
     * used in an apply wrapper.
     *
     * @function FlatJS.Dispatch.publish
     * @public
     * @param {String} topic The event to be published
     * @param {Array} args   Array of arguments to be passed to all callback functions
     */
    publish: function(topic, args) {
      if (cache[topic]) {
        for (var i = 0; i < cache[topic].length; i++) {
          if (cache[topic][i]) {
            cache[topic][i].fn.apply(this, args);
          }
        }
      }
    },

    /**
     * ## FlatJS.Dispatch.subscribe
     *
     * Subscribes a callback function to an event to be published within the application.
     * Instance and callback are stored in an object in the array.
     *
     * @function FlatJS.Dispatch.subscribe
     * @public
     * @param {String} topic The event to be published
     * @param {Function} callback Callback function to be triggered when event occurs
     */
    subscribe: function(topic, callback) {
      if(!cache[topic]){
        cache[topic] = [];
      }
      cache[topic].push({
        instance: this,
        fn:       callback
      });
    },

    /**
     * ## FlatJS.Dispatch.unsubscribe
     *
     * Unsubscribes callbacks from handlers. If no callback is passed, all callbacks
     * of that topic are dropped. If no topic && no callback are passed, all callbacks
     * related to that object ("this") are dropped.
     *
     * @function FlatJS.Dispatch.unsubscribe
     * @public
     * @param {String} topic The event to be published
     * @param {Function} callback Callback function to be unsubscribed
     */
    unsubscribe: function(topic, callback){
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
  }

  // checking to see if classy exists. not sure if this is really necessary, but maybe sometime down the road having
  // a custom builder would be cool to not include modules you don't need.
  //
  // anyway, if it exists, some functions are added to the prototype of FlatJS.Classy to assist in instance based
  // pubsubin'.
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
    }
  }

  return api;

}());
