# Demo Script

## Intro (10 secs w/o optional stuff, 30 secs with)

- Another MV* based JS framework
  - MV* like code organization, automatic 2 way bindings between markup and JS objects
- Below are optional:
  - Server-side friendly, no required client side templating
    - Loads data from your markup for programatic manipulation via 2 way bindings
      - Ease of Angular.js using pre-rendered markup from the server
  - Minimal syntax, DSL, & bootstrap code requirements
  - OOP based
  - No client side URL routing, no client side templating, no event binding (use jquery!)

## Todo MVC App (20 sec)

- Demonstrate 90% of the app functionality using TodoMVC Example

* Download latest TodoMVC folder
* Open app folder in LightTable
* Open index page in browser in LightTable
* Open index.html in one tab, and app.js in another tab
* Add intial "Todo" namespace to top of file

### FlatJS.Runner (1 min)

- Bootstrap code revolves & grows around executing JS on the correct DOM elements - limit this to one line of code with the Runner
  - Execution is inferred via HTML attributes - just like CSS
  - All that's left is writing JS classes

* Instantiate the runner in app.js, namespace to Todo.Runner

- This will look through your dom for any elements with the attribute "fjs-component", and look for a JS Function that matches the value, converting dashes to camel case.
- If  function is found, then the following will execute:

* Code out what is happening with [new fnName(domNode)]

- What and how it is executed, the scope which you look for functions in, the attribute that it looks for on DOM nodes and more are extensible on instantiation via the Runner.
- When markup is inserted via AJAX, you can re-run your JS by targeting the container node and using the runner's `init` function.

* Code out [Todo.Runner.init(containerDomNode)], destroy after

### FlatJS.Component (2 min)

Components are declared on container elements using the `fjs-component` attribute (unless set to something else)

* Add attribute to #todo-app `<div id="todoapp" fjs-component="Todo.ListComponent">`
* Create Todo.ListComponent.js in js folder, maybe add Todo folder, add new component 
```javascript
Todo.ListComponent = FlatJS.Component.extend(function() { 
  var publicAPI = {}; 
  
  return publicAPI; 
  
})
```

Note the class extension syntax; this is how FlatJS Classes are extended providing OOP functionality. See FlatJS.Classy for details.

Two way bindings are setup in FlatJS Components by adding HTML attributes which represent your Component's data layer as a JS object.

* Add to #new-todo attribute `<input id="new-todo" fjs-key="new-todo" />`
* Add to #todo-list attribute `<ul id="todo-list" fjs-array="todo-list">`

Let's add an `initialize` method to our ListComponent, this method is invoked whenever a `FlatJS.Component` is constructed using `new`. 
```javascript
...
  var publicAPI = {
    initialize: function() { 
      this.$obj = $(this.fjsRootNode);
      debugger; // remove this when you're done poking around.
    }
...
```

Let's use chrome's debugger to poke around the object. Notice `this.fjsRootNode` refers to the `<section>` linked to the component. We're setting up a publicaly accessible jQuery version of that node for ease.

Also notice the object `this.fjsData` - it has one key value, and it matches the one we set earlier to the input, `this.fjsData.newTodo`. All component references are stored in `this.fjsData`, which is used to manage two way bindings.

Now let's add a `bindUI` function to our component. This method will run after our `initialize` method

The component execution pattern is outlined in it's super class `FlatJS.Widget`, which is also useful for JS that doesn't need 2 way bindings.

FlatJS is largely unopinionated about how you want to perform event bidnings - but does have an opinion on where the bindings should be made, and that is in `bindUI`. In this example we'll use jQuery to perform UI event bindings.
```javascript
Todo.ListComponent = FlatJS.Component.extend(function() { 
  
  var publicAPI = {
    ...
    bindUI: function() {
      this.$obj.on('keyup', '#new-todo', this._(handleKeyUpFn))
    }

  } // end public scope

  // begin private scope

  function handleKeyUpFn(e) {
    if (e.keyVal == '13') {
      var todoVal = this.fjsData.newTodo;
      this.fjsData.set('newTodo', ''); // resets frontend
      
      console.log('Create a new todo with title: ' + todoVal);
    }
  }

  return publicAPI;

});
```

So a few things happen. Within bindUI we delegate a simple `keyup` event on the `<input id="new-todo" />`, but notice that the function used as a callback is wrapped by `this._()` - this optional helper function serves as syntactical sugar which solves a huge JS headache: maintaining a single concept of `this` throughout your class definitions.

Add a `debugger` statement to `handleKeyUpFn` and investigate `this` to see that it matches our object. Note it doesn't work well with anonymous functions.

Now let's look at the guts of `handleKeyUpFn`. It checks if the keyup event was triggered by the `enter` key, and if so, uses `this.fjsData.newTodo` to get the Value of whatever the user has typed into `#new-todo`, then using `this.fjsData.set('newTodo', '');`, it resets the value of `newTodo` on that component and any linked nodes - such as `<input id="new-todo" />`. Simple 2 way bindings.

### FlatJS.Resource (1.5 min)

Our todo items will represent our `FlatJS.Resouce`. `Resouces` must be instantiated within our markup and declared within an `Component`, which luckily `<ul id="todo-list">` is in. On instantiation, `Components` read the inner markup for `Resources` and loads these into JS for programmatic consumtion, giving us "model" like behavoir with disregard to how the markup is generated - no need for client side templating to achieve this.

Let's adjust our markup to see some of this in action.

```html
<ul id="todo-list" fjs-array="todos-list">
  <li fjs-resource="Todo.TodoItem" fjs-id="1" fjs-class='["completed", true, "completed"]' class="completed">
    <div class="view">
      <input class="toggle" type="checkbox" fjs-key="completed" checked>
      <label fjs-key="text">Create a TodoMVC template</label>
      <button class="destroy"></button>
    </div>
    <input class="edit" fjs-key="text" value="Create a TodoMVC template">
  </li>

  ...

</ul>
```

And that's it - you don't even need to define a `Todo.TodoItem` class if you don't want - though we will later. Make thse changes to each `<li>`, pop open your console and run:

```javascript
// in the console
Todo.TodoItem.find(1).text // --> "Create a TodoMVC template"
```

Just by declaring a few simple attributes on our markup, we have Rails fashion model behavoir available to us in our javascript. This way the user gets to see content as quickly as possible with rendered server side markup, and us programmers still get to treat things programatically instead of declaritively. Try running `Todo.TodoItem.find(1).set('text', 'Changed!')` and see what happens on the frontend! Alternatively, there's `Todo.TodoItem.find(1).remove()`.

Also go ahead and check items on and off - since the input is set to the key `completed`, and our `<li>` has `fjs-class='["completed", true, "completed"]'`, the class on the `<li>` is bound to update when the input triggers the change on `completed`. `fjs-class` follows the format, in JSON, of `["{{ resource attribute to watch }}", {{ expected value }}, "{{ class to assign if match }}", "{{ optional class to assign if no mach }}]'`. This should be familiar to AngularJS users.

Now let's add a todo item.

```javascript
function handleKeyUpFn(e) {
  if (e.keyVal == '13') {
    var todoVal = this.fjsData.newTodo;
    this.fjsData.set('newTodo', '');

    var newTodo = new Todo.TodoItem({
      text:      todoVal,
      completed: false
    });

    this.fjsData.push('todoList', newTodo);
  }
}
```

And that's it - we create a `newTodo` item and give it some values following the keys we set in our markup. Then, we use the `push` function on `this.fjsData`, which is an instantiated `FlatJS.Resource`, which adds an object to an array. Remember when we marked the list `<ul id="todo-list" fjs-array="todos-list">`?






