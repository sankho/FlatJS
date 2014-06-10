// should contain all unit tests on FlatJS.Classy.js


test("FlatJS.Classy existence tests", function() {

  equal(typeof FlatJS.Classy, 'function', "FlatJS.Classy exists, is a function");

  equal(typeof FlatJS.Classy.extend, 'function', 'FlatJS.Classy.extend exists, is a function');

});

test("FlatJS.Classy OOP tests - class extension, basic functionality", function() {

  var Shape = FlatJS.Classy.extend({

    area: 0,

    init: function(area) {
      this.area = area;
    },

    getArea: function() {
      return this.area;
    }

  });

  var Rect = Shape.extend({

    init: function(width, height) {
      this.width  = width;
      this.height = height;

      this._super(width * height);
    },

    width:  0,
    height: 0,

  });

  var Square = Rect.extend({

    init: function(side) {
      this._super(side, side);
    }

  });

  var exRect   = new Rect(5, 2);
  var exSquare = new Square(5);

  ok(typeof Rect === 'function', "Rect is a class")
  ok(typeof Rect.extend === 'function', "Rect is extendable")

  ok(exRect instanceof Rect, "exRect identified as an instance of class Rect")
  ok(exRect instanceof Shape, "exRect identified as an instance of class Shape")

  equal(exRect.width, 5, "Rectangle width should be 5")
  equal(exRect.height, 2, "Rectangle height should be 2")
  equal(exRect.getArea(), 10, "Rectangle area should be 10");

  ok(exSquare instanceof Rect, "exSquare identified as an instance of class Rect")
  ok(exSquare instanceof Square, "exSquare identified as an instance of class Square")
  ok(exSquare instanceof Shape, "exSquare identified as an instance of class Shape")

  equal(exSquare.width, 5, "Square width should be 5")
  equal(exSquare.height, 5, "Square height should be 5")
  equal(exSquare.getArea(), 25, "Square area should be 25")

});

test("FlatJS.Classy OOP tests - private member functions & psuedo private storage", function(assert) {

  var exClass = (function() {
    var exClass = FlatJS.Classy.extend({

      init: function(string) {
        this._('string', string);
      },

      callPrivateFunction: function() {
        return this._(privateFunction)();
      }

    });

    function privateFunction() {
      return this._('string');
    }

    return exClass;

  }());

  var exClass = new exClass("boosh");

  equal(exClass.callPrivateFunction(), "boosh", "exClass can call a private function form a public function")
  equal(exClass._('string'), "boosh", "psuedo private storage working on object")
  equal(typeof privateFunction, 'undefined', "Private function should be out of this scope");

});
