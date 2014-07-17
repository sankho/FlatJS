[![Stories in Ready](https://badge.waffle.io/sankho/flatjs.png?label=ready&title=Ready)](https://waffle.io/sankho/flatjs)

# Why FlatJS

## Another JS Framework? Really?

In 2014, it seems you have to be using a JS Framework, and in theory, this isn't a bad thing. In practice, this can often mean more work, and usually means re-arranging traditional server side approaches to web application development in the name of a framework.

I wanted to make a JS Framework that would help me write less code, provide conventions and abstractions I could always make use of, but not necessarily force me to change the way I think about web applications from the server side. And, I wanted it to organize my code in a fashion similiar to the popular MV* frameworks out there.

## What does it do?

### MV* + Two Way Bindings + Progressive Enhancement

FlatJS Components (the "V" or view in MV) read your markup and infers a data model based on the values in your markup on DOM ready, all while creating dependable two way bindings. This means your server side can generate code in a template fashion as normal, and you can still manipulate the markup in a fashion related to the data model setup at the start via JS.

Don't have SEO worries about your JS apps - just rely on your server side to print the correct markup given a URL. This allows you to have the power of JS templating + SEO, all without repeating your template markup.

### Simple Syntax, Limited Boilerplate Code

Really. Check out the todomvc example.

### Not All JS is MV* Oriented

Chances are your application / website has some behavoir, maybe a lot, that doesn't require fancy MV** * type stuff. FlatJS features a few sane, simple ways to manage your javascript that may not require MV* type behaviors.

## What does it NOT do?

### HTML5 Routing

Routing's tough, weird, and often dependent on custom logic. So FlatJS isn't built with routing in mind, but works with any JS routers out there; just re-init your app's instance of FlatJS.Runner on updated DOM content.

### Dependency Injection

FlatJS assumes you've added all relevant files to the browser before running. Works fine with either RequireJS or just a single minified file.




# Getting Started

### Instantiate a runner and init your app

Somewhere in your app, after you've loaded all your JS files and the DOM is ready, run this code:

```javascript
// assumes an APP namespace object has been setup

APP.runner = new FlatJS.Runner({
  // below are the default values
  attr:    'fjs-component',
  context: window,
  callFn:  function(fn, node) {
    return new fn(node);
  }
});
```

This looks through the `document` object for all nodes with the attribute `fjs-component`, or of course whatever you set it to. The value of that attribute should be mapped to a JS function accessible via a given context, `window` by default.

If you load content via AJAX later on, you can call `runner.init(DOMNode)` passing the node containing the freshly loaded markup.

```html
<div id="container" fjs-component="APP.example-component">
  <input type="text" fjs-key="text" />
  <h3 fjs-key="text">Initial Value</h3>
  <button id="clear">Clear Text</button>
</div>
```

The markup above should trigger an instantiation of the component defined below. Since it extends `FlatJS.Component`, it will look for `fjs-key` attributes in the markup to form a JSON object `fjsData` which will represent the component's data model. It will use all values given in the markup.

```javascript
APP.exampleComponent = FlatJS.Component.extend(function() {

  var publicAPI = {
    bindUI : function() {
      // this.obj === document.getElementById(container)
      var clearBtn = this.obj.getElementById('clear');

      // note this._() wrapper on callback maintains "this"
      // within private FNs & event listener callbacks
      clearBtn.addEventListener('click', this._(clearText));
    }
  }

  function clearText() {
    // this.fjsData references data model of component as derided from template
    this.fjsData.set('text', '');
  }

  return publicAPI;
})
```
