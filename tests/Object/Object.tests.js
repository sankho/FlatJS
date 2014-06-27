// should contain all tests for FlatJS.Object

QUnit.test("FlatJS.Object existence tests", function(assert) {

  QUnit.equal(typeof FlatJS.Object, 'function', 'FlatJS.Object exists and is a function');
  QUnit.equal(typeof FlatJS.Object.extend, 'function', 'FlatJS.Object exists and has an inherited extend function');
  QUnit.ok(FlatJS.Object.prototype instanceof FlatJS.Classy, 'FlatJS.Object inherits FlatJS.Classy');

});

QUnit.asyncTest("FlatJS.Object construction, setter, watch, and unwatch functionality", function(assert) {

  // adds an object with an ID to ensure
  // object X does some work
  var y = new FlatJS.Object({
    id: 1
  });
  var x      = new FlatJS.Object();

  function watchCallback(name, oldVal, val, obj) {
    QUnit.ok(true, "callback on watch function successful");
    QUnit.equal(val, 3, "callback on watch function successfully returns changed new value");
    QUnit.equal(typeof x.id, "number", "temporary ID created");
    QUnit.equal(oldVal, undefined, "callback on watch function successfully retains old value");
    QUnit.equal(name, 'g', "callback on watch function successfully retains name of property");
    QUnit.equal(obj, x, "initial object passed through callback");
  }

  function watchNumArrayCallback(name, oldVal, val, obj) {
    QUnit.ok(true, "Pushing an object triggers the callback");
    QUnit.deepEqual(val, [2,3,5], "FlatJS.Object.prototype.push function works as expected");
    QUnit.deepEqual(oldVal, [2,3], "Old value retained on push");
    QUnit.start();
  }

  x.watch('g', watchCallback);

  x.set('g', 3);

  QUnit.equal(x.g, 3, "x.set() sets a variable on the object, successfully mutes actual object");

  x.unwatch('g', watchCallback);

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);

  x.watch('g', watchCallback);

  // check to see if all handlers get deleted by key
  x.unwatch('g');

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);

  x.set('numArray', [2,3]);

  x.watch('numArray', watchNumArrayCallback);

  x.push('numArray', 5);
});

QUnit.test("FlatJS.Object static query functions", function(assert) {

  var exClass = FlatJS.Object.extend();

  for (var id = 0; id < 10; id++) {
    new exClass({
      id: id
    });
  }

  QUnit.equal(exClass.find(1), exClass.objects[1], "Objects have static find method which looks in class' objects variable for matching ID values");

});
