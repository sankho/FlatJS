// should contain all tests for FlatJS.Object

QUnit.test("FlatJS.Object existence tests", function(assert) {

  QUnit.equal(typeof FlatJS.Object, 'function', 'FlatJS.Object exists and is a function');
  QUnit.equal(typeof FlatJS.Object.extend, 'function', 'FlatJS.Object exists and has an inherited extend function');
  QUnit.ok(FlatJS.Object.prototype instanceof FlatJS.Classy, 'FlatJS.Object inherits FlatJS.Classy');

});

QUnit.asyncTest("FlatJS.Object setter, watch, and unwatch functionality", function(assert) {

  var x      = new FlatJS.Object();

  function watchCallback(name, oldVal, val) {
    QUnit.ok(true, "callback on watch function successful");
    QUnit.equal(val, 3, "callback on watch function successfully returns changed new value");
    QUnit.equal(oldVal, undefined, "callback on watch function successfully retains old value");
    QUnit.equal(name, 'g', "callback on watch function successfully retains name of property");
    QUnit.start();
  }

  x.watch('g', watchCallback);

  x.set('g', 3);

  equal(x.g, 3, "x.set() sets a variable on the object, successfully mutes actual object");

  x.unwatch('g', watchCallback);

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);

  x.watch('g', watchCallback);

  // check to see if all handlers get deleted by key
  x.unwatch('g');

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);
});
