// should contain all unit tests on FlatJS.Dispatch.js

describe('All unit tests on FlatJS.Dispatch.js', function()
{

it("FlatJS.Dispatch existence & FlatJS.Classy.prototype extension tests", function() {

  assert.equal(typeof FlatJS.Dispatch, 'object', "FlatJS.Dispatch exists, is an object");
  assert.equal(typeof FlatJS.Classy.prototype.publish, 'function', "FlatJS.Classy.prototype.publish exists, extending properly");
  assert.equal(typeof FlatJS.Classy.prototype.subscribe, 'function', "FlatJS.Classy.prototype.subscribe exists, extending properly");
  assert.equal(typeof FlatJS.Classy.prototype.unsubscribe, 'function', "FlatJS.Classy.prototype.unsubscribe exists, extending properly");

});

it("FlatJS.Dispatch pubsub tests", function(done) {

  var calledOnce = false;

  function publishCallback(int1, int2) {
    if (calledOnce) {
      assert.ok(false, "Callback fired more than once, unsubscribe not working");
    } else {
      calledOnce = true;
      assert.ok(true, "Callback successfully fires after publish call is made");
      assert.equal(int1, 3, "Int1 passed back correctly as argument to callback");
      assert.equal(int2, 4, "Int2 passed back correctly as argument to callback");
      //QUnit.start();
      done();
    }
  }

  FlatJS.Dispatch.subscribe('test-publish', publishCallback);
  FlatJS.Dispatch.publish('test-publish', [3, 4]);

  FlatJS.Dispatch.unsubscribe('test-publish', publishCallback);

  //should throw an error if above unsubscribe call didn't work
  FlatJS.Dispatch.publish('test-publish', [2,3]);

  FlatJS.Dispatch.subscribe('test-publish', publishCallback);
  FlatJS.Dispatch.unsubscribe('test-publish');

  //should throw an error if above unsubscribe call didn't work
  FlatJS.Dispatch.publish('test-publish', [2,3]);

});

it("FlatJS.Dispatch pubsub contextual to 'this' using apply", function(done) {

  var calledOnce = false;

  var obj = {
    int1: 33,
    int2: 44
  };

  function publishCallback(int1, int2) {
    if (calledOnce) {
      assert.ok(false, "Callback fired more than once, unsubscribe not working");
    } else {
      calledOnce = true;
      assert.ok(true, "Callback successfully fires after publish call is made");
      assert.equal(int1, 3, "Int1 passed back correctly as argument to callback");
      assert.equal(int2, 4, "Int2 passed back correctly as argument to callback");
      assert.equal(this.int1, 33, "this.int1 verified, Dispatch successfully passes context to callback");
      assert.equal(this.int2, 44, "this.int2 verified, Dispatch successfully passes context to callback");
      done();
    }
  }

  FlatJS.Dispatch.subscribe.apply(obj, ['test-publish', publishCallback]);
  FlatJS.Dispatch.publish.apply(obj, ['test-publish', [3, 4]]);

  FlatJS.Dispatch.unsubscribe.apply(obj, ['test-publish', publishCallback]);

  //should throw an error if above unsubscribe call didn't work
  FlatJS.Dispatch.publish.apply(obj, ['test-publish', [2, 3]]);

  FlatJS.Dispatch.subscribe.apply(obj, ['test-publish', publishCallback]);
  FlatJS.Dispatch.unsubscribe.apply(obj, ['test-publish']);

  //should throw an error if above unsubscribe call didn't work
  FlatJS.Dispatch.publish.apply(obj, ['test-publish', [2, 3]]);

  FlatJS.Dispatch.subscribe.apply(obj, ['test-publish', publishCallback]);
  FlatJS.Dispatch.unsubscribe.apply(obj);

  //should throw an error if above unsubscribe call didn't work
  FlatJS.Dispatch.publish.apply(obj, ['test-publish', [2, 3]]);

});

it("FlatJS.Dispatch pubsub contextual to FlatJS.Classy objects", function() {

  var calledOnce = false;

  var objClass = FlatJS.Classy.extend({
    int1: 0,
    int2: 0,
    init: function(int1, int2) {
      this.int1 = int1;
      this.int2 = int2;
    }
  })

  var obj = new objClass(33, 44);

  function publishCallback(int1, int2) {
    if (calledOnce) {
      assert.ok(false, "Callback fired more than once, unsubscribe not working");
    } else {
      calledOnce = true;
      assert.ok(true, "Callback successfully fires after publish call is made");
      assert.equal(int1, 3, "Int1 passed back correctly as argument to callback");
      assert.equal(int2, 4, "Int2 passed back correctly as argument to callback");
      assert.equal(this.int1, 33, "this.int1 verified, Dispatch successfully passes context to callback");
      assert.equal(this.int2, 44, "this.int2 verified, Dispatch successfully passes context to callback");
    //  QUnit.start();
    }
  }

  obj.subscribe('test-publish', publishCallback);
  obj.publish('test-publish', [3, 4]);

  obj.unsubscribe('test-publish', publishCallback);

  //should throw an error if above unsubscribe call didn't work
  obj.publish('test-publish', [2, 3]);

  obj.subscribe('test-publish', publishCallback);
  obj.unsubscribe('test-publish');

  //should throw an error if above unsubscribe call didn't work
  obj.publish('test-publish', [2, 3]);

  obj.subscribe('test-publish', publishCallback);
  obj.unsubscribe();

  //should throw an error if above unsubscribe call didn't work
  obj.publish('test-publish', [2, 3]);

});
});