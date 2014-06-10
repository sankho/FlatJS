// should contain all tests for FlatJS.Object

test("FlatJS.Object existence tests", function(assert) {

  equal(typeof FlatJS.Object, 'function', 'FlatJS.Object exists and is a function');
  equal(typeof FlatJS.Object.extend, 'function', 'FlatJS.Object exists and has an inherited extend function');
  ok(FlatJS.Object.prototype instanceof FlatJS.Classy, 'FlatJS.Object inherits FlatJS.Classy');

});

asyncTest("FlatJS.Object setter & watch functionality", function(assert) {

  var x = new FlatJS.Object();

  function watchCallback(name, oldVal, val) {
    ok(true, "callback on watch function successful");
    equal(val, 3, "callback on watch function successfully returns changed new value");
    equal(oldVal, undefined, "callback on watch function successfully retains old value");
    equal(name, 'g', "callback on watch function successfully retains name of property");
    QUnit.start();
  }

  x.watch('g', watchCallback);

  x.set('g', 3);

  equal(x.g, 3, "x.set() sets a variable on the object, successfully mutes actual object");

});
