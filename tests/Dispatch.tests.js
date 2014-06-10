// should contain all unit tests on FlatJS.Dispatch.js


test("FlatJS.Dispatch existence & FlatJS.Classy.prototype extension tests", function() {

  equal(typeof FlatJS.Dispatch, 'object', "FlatJS.Dispatch exists, is an object");
  equal(typeof FlatJS.Classy.prototype.publish, 'function', "FlatJS.Classy.prototype.publish exists, extending properly");
  equal(typeof FlatJS.Classy.prototype.subscribe, 'function', "FlatJS.Classy.prototype.subscribe exists, extending properly");
  equal(typeof FlatJS.Classy.prototype.unsubscribe, 'function', "FlatJS.Classy.prototype.unsubscribe exists, extending properly");

});
