# CRS Binding Engine

This is a lightweight but powerful binding engine.  
There are two parts too the engine.

1. Object observation and events
1. UI Updates

In the examples folder you will find several examples of both but for a more complete example you can look at the crs binding example application.

## Object observation

### Expressions
The first place to start is expressions as this is how you define your intent to the engine.
There are two types of expressions.

1. Defining result text.
1. Defining conditions.

### Definint result text
Consider the following result expression.
```js
const exp = "${firstName} ${lastName} is ${age} years old and lives at \"${address.street}\"";
```

We have a context object with the following properties:

1. firstName: "John"
1. lastName: "Doe"
1. age: 20
1. address: street : "Somewhere"

The address property is actually a object with it's own properties, in the above example we want to use the street property.

When using the above expression with the context object it will give you the following string back.  

`John Doe is 20 years old and lives at "Somewhere"`

Consider the following code

```js
const exp = "${firstName} ${lastName} is ${age} old and lives at \"${address.street}\"";
document.querySelector("#result").innerText = crsbinding.expression.compile(exp).function({
    firstName: "John",
    lastName: "Doe",
    age: 20,
    address: {
        street: "No Where"
    }
});
crsbinding.expression.release(exp);
```

1. Define the expression
1. Compile the expression into a function using crsbinding.expression.compile
1. Call the function on the returned object
1. Release the expression

In the above example the result of this function is set to the innerText of a element.

One of the problems here is that we want to update the text if one of the properties changes.  
This can be done using events.

### Events
Events can be used on any object that events enabled.
To enable a object to be event enabled use `crsbinding.events.enableEvents(obj);`
This is useful when you create custom classes that you want to make events enabled.

```js
class Person {
    get firstName() {
        return this._firstName;
    }

    set firstName(newValue) {
        this._firstName = newValue;
        crsbinding.events.notifyPropertyChanged(this, "firstName");
    }

    get lastName() {
        return this._lastName;
    }

    set lastName(newValue) {
        this._lastName = newValue;
        crsbinding.events.notifyPropertyChanged(this, "lastName");
    }

    constructor() {
        crsbinding.events.enableEvents(this);
    }

    dispose() {
        crsbinding.events.disableEvents(this);
    }
}
```
Several things to note about the above example class.

1. constructor enables events on the instance
1. dispose disables events on the instance to prevent memory leaks.
1. use crsbinding.events.notifyPropertyChanged to trigger events.

So the above example is events enabled but we are not listening on any events yet.  
We can do that using `crsbinding.events.on`.  
This function takes three parameters:

1. The object to register the event on
1. The property you want to monitor
1. The callback to use when the property does change

```js
const john = new Person();
crsbinding.events.on(john, "firstName", () => document.querySelector("#name").innerText = john.firstName);
crsbinding.events.on(john, "lastName", () => document.querySelector("#lastName").innerText = john.lastName);

john.firstName = "John";
john.lastName = "Doe";
john.dispose();
```

When you no longer want to listen for changes you can remove the event listener using `crsbinding.events.removeOn`.  
On this function you need to provide the following parameters:

1. The object you had the event on
1. The property you no longer want to listen on
1. The callback you want removed

You can have multiple callbacks for a property change on a object for a given property.  
This is why you need to provide the callback as part of the un-registering process.
It is thus imperative that wne you perform you cleanup you unregister the functions.

When using `crsbinding.events.disableEvents`, all the events are automatically unregistered for you.  
See the dispose function of the above example class.

What if you don't want to declare a class but achieve the same thing using an object literal.  
The following code shows you how you can use observers to event enable a object literal, make changes and clean it up again.

```js
const obj = crsbinding.observation.observe({
    firstName: "name",
    lastName: "lastName"
});

crsbinding.events.on(obj, "firstName", () => document.querySelector("#name").innerText = obj.firstName);
crsbinding.events.on(obj, "lastName", () => document.querySelector("#lastName").innerText = obj.lastName);

obj.firstName = "John";
obj.lastName = "Doe";

crsbinding.observation.releaseObserved(obj);
```

It is important to note that proxies are used when observing objects.  
This means you have to assign it as observed as you will be working with the proxy from this point forward.
This often limits you from making custom elements event enabled but we also provide you with two classes that enables binding of elements.

1. BindableElement
1. ViewBase

We will look at these in more detail in the UI updates part.

We are not limited to simple property change events but can also use expressions.
What if you want to perform a action when certain condition is met, for this we can use `crsbinding.events.when`.   
The when function takes the following parameters:

1. Object to listen on
1. The condition that must be met before the callback is fired
1. The callback used when the condition is met.

```js
const obj = crsbinding.observation.observe({
    firstName: "name",
    lastName: "lastName"
});

crsbinding.events.when(obj, "firstName == 'John' && lastName == 'Doe'", () => alert("We found him!"));

obj.firstName = "John";
obj.lastName = "Doe";

crsbinding.observation.releaseObserved(obj);
```

It is important to note that the condition is a standard Javascript syntax and is relative the object.  
In the above example the context object has two properties, firstName and lastName.  
You will note that the expression does not use "this" but instead uses a path relative the the context.
The same was true for the very first expression where we had a composite object, address being a object property and the expression pathing was relative too the context.

If you are no longer interested in listening too the event you can un-register it again using `crsbinding.events.removeWhen`.
Again it requires the three unregister parameters.

1. The object the when was define don
1. The expression you are monitoring
1. The callback to remove callback

You can define multiple conditions on a object and multiple callbacks for the same condition.

## UI Updates
UI updates uses the object observation but brings defined changes to the UI.  
From this point forward we will be show examples of what that would look like.  

Before we look at specifics we need to understand some terms used.

1. Binding. Moving data to and from objects as specified by intent.
1. One way binding. Data only moves from the object to the UI but updates every time a property changes that affects the binding.
1. Two way binding. Data flows between the data object and input control. Data is updated during the change event of the input.
1. Once only binding. UI is updated once from the context object and never again. If the object changes no UI is updated.

### Once binding

```html
<input value.once="firstName" />
```

### One way binding

```html
<input value.one-way="firstName" />
```

### Two way binding
```html
<input value.two-way="firstName" />
<input value.bind="firstName" />
```

bind is just a shorthand for two way binding but they do the same thing.

### Updating the innerText

```html
<div>${firstName} ${lastName}</div>
```

This copies the template literal syntax you are use to in javascript.

### Binding to events

In some cases you want to bind to a event of a element and call a function when that event occurs.

```html
<button click.call="doSomething">Do Something</button>
<button click.delegate="doSomething">Do Something</button>
```

Again there are two syntax options. Some prefer call, others prefer delegate, we don't judge :) use what you are comfortable with.
In the above example no parameter is passed to the calling function, but there are times when you do want to provide parameters.

Here are some examples showing off parameters as part of the call.
```html
<!-- standard parameters -->
<button click.call="doSomething(10, 'hello world')">Do Something</button>

<!-- send the MouseEvent on --> 
<button click.call="doSomething($event)">Do Something</button>

<!-- send the MouseEvent on and a standard parameter--> 
<button click.call="doSomething(10, $event)">Do Something</button>
```
All the above examples work with delegate also.
