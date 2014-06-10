// should contain all tests for FlatJS.Object

test("FlatJS.Object existence tests", function(assert) {

  equal(typeof FlatJS.Object, 'function', 'FlatJS.Object exists and is a function');
  equal(typeof FlatJS.Object.extend, 'function', 'FlatJS.Object exists and has an inherited extend function');
  ok(FlatJS.Object.prototype instanceof FlatJS.Classy, 'FlatJS.Object inherits FlatJS.Classy');

});
