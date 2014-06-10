// should contain all unit tests on FlatJS.Classy.js


test("FlatJS.Classy existence tests", function() {

  ok(typeof FlatJS.Classy === 'function', "FlatJS.Classy exists, is a function");

  ok(typeof FlatJS.Classy.extend === 'function', 'FlatJS.Classy.extend exists, is a function');

});

test("FlatJS.Classy OOP tests - class extension, basic functionality", function() {

  var Shape = FlatJS.Classy.extend({

    area: 0,

    setArea: function(area) {
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
      
      this.setArea(width * height);
    },

    width:  0,
    height: 0,

  });

  var Square = Rect.extend({

    init: function(side) {
      this._(this.init._super)(side, side);
    }

  });

  var exRect   = new Rect(5, 2);
  var exSquare = new Square(5);

  ok(typeof Rect === 'function', "Rect is a class")
  ok(typeof Rect.extend === 'function', "Rect is extendable")

  ok(exRect instanceof Rect, "exRect identified as an instance of class Rect")
  ok(exRect instanceof Shape, "exRect identified as an instance of class Shape")
  ok(exSquare instanceof Rect, "exSquare identified as an instance of class Rect")
  ok(exSquare instanceof Square, "exSquare identified as an instance of class Square")
  ok(exSquare instanceof Shape, "exSquare identified as an instance of class Shape")

  ok(exRect.width === 5, "Rectangle width should be 5")
  ok(exRect.height === 2, "Rectangle height should be 2")
  ok(exRect.getArea() === 10, "Rectangle area should be 10")

  ok(exSquare.width === 5, "Square width should be 5")
  ok(exSquare.height === 5, "Square height should be 5")
  ok(exSquare.getArea() === 25, "Square area should be 25")

});
