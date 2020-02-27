Currently as BETA
----------------------------------------------------
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

It is important to note that the binding expressions above sets the properties on the elements and not the attributes directly.

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

### Conditional attribute binding

We can use the `if` binding expression on attributes to affect the behaviour of those attributes based on a condition.  
Here are some examples:

```html
<div hidden.if="isVisible != true">Hello World</div>
```
In this example the presence of the attribute is determined by the condition
If isVisible is true, the hidden attribute is removed. 
if isVisible is false, the hidden attribute is added.

```html
<div data-title.if="isVisible == true ? true">Hello World</div>
```
Here we are setting the data-title attribute's value too true if the condition passes.
If the condition fails the attribute is removed.

```html
<div data-title.if="isVisible == true ? true : false">Hello World</div>
```
Now we are not removing the attribute, instead we are setting the attribute value depending on the condition

### Repeat behaviours - binding to arrays

We can bind to arrays and create elements on the UI based on those arrays using `for`.

```html
<div>
    <template for="person of persons">
        <div>
            <h2>Personal</h2>
    
            <input value.bind="person.firstName" />
            <input value.bind="person.lastName" />
    
            <h2>Contacts</h2>
            <div>
                <template for="contact of person.contacts">
                    <input value.bind="contact.cell">
                    <span>${contact.cell}</span>
                </template>
            </div>
            <hr />
        </div>
    </template>
</div>
```

The context object has a observed array called people.  
The above example repeats this template for each person in that array.  
Note that the binding expression has changed a little where we now use the person as the path to start our expressions.

Each person has 0 to N contacts so here we want to print the contacts list for each person also.
This means that we have a `for` operating in another `for`.

The div elements the templates are in is important.
If the collection is cleared this container is emptied and the new array drawn.  
Don't put content you want to keep in this container along with the template.

The array must also be an observed item.  
You can use `crsbinding.observation.observe` to observe the array.

When you add new items or remove items, the UI will be updated.  

```js
this.persons = crsbinding.observation.observe([
    {
        firstName: "First Name 1",
        lastName: "Last Name 1",
        contacts: crsbinding.observation.observe([
            {
                cell: "Cell 1"
            },
            {
                cell: "Cell 2"
            }
        ])
    }
]);
``` 
##Bindable Element
Bindable element is a web component base class that is event enabled.  
That means you can listen to events on the element as you would with a normal class and use it as a binding context.  

Important aspect to remember with bindable element is that it provides two functions.  
One for getting property values in a property and another to set a property value.  
These functions will take care of notifying property change for those properties when set.  
See the following examples.

```js
get items() {
    return this.getProperty("items");
}

set items(newValue) {
    this.setProperty("items", newValue);
}
```

If you don't use setProperty to get the property value, the events will not fire and you will need to call notifyPropertyChanged yourself.

The bindable element class can be found in the file "crs-bindable-element.js";  
It uses standard ES6 modules.

```js
import {BindableElement} from"./../../node_modules/crs-binding/crs-bindable-element.js";
```

In bindable element you must also populate the properties static getter with the property names available for updateUI.

```js
static get properties() {
    return ["items"];
}
```

When unsure when to use it, just add any property name that you are binding too.

Bindable element will try and load the HTML from a external file. You need to tell it where to find that file using the html property.

```js
get html() {
    return import.meta.url.replace(".js", ".html");
}
```

If you do override the connectedCallback, do not add the super but remember to add the following code after you are done.

```js
crsbinding.parsers.parseElements(this.children, this);
crsbinding.expression.updateUI(this);
this.dispatchEvent(new CustomEvent("ready"));
```

As you can see from the above await the connected  callback needs to be async.
If you want to prevent this, you need to override the connectedCallback function.

You can register dom events in a bindable element so that you don't need to manage the addEventListener.

You use the registerEvent and unregisterEvent and unregisterEvent to add and remove dom events.

```js
this.registerEvent("click", this.click.bind(this))
```

On the disconnected callback of the bindable element it will release all these events for you.
This means that if you have events that live for the lifespan of the element you can register them when you want and the system will clean them up for you when the component is done.

##View base
View base is much like bindable element in that it provides you with base features.  
This class is used when you want to create a view that can be a bindable context.

It comes with two properties too take note of:

1. title
1. element

It is also event enabled and provides the getProperty and setProperty functions to use in your property getters and setters.

The "ViewBase" can be found in the crs-view-base.js file.

Though the view base is not technically a component it does also have:

1. connectedCallback
1. disconnectedCallback

You can use them in the same way as you would a custom element.

When using view base and creating a new instance you must provide the element it will represent.
ViewBase is used by systems like crs-router.
You will need to mange the connected and disconnected callbacks manually if you are not using crs-router.
These lifecycle events are important for getting the parsing of the element underway.

When you create a view using viewbase the element style will be set to hidden.
When you call the connectedCallback function it will set that back to visible again.

Remember to set the properties static property

If viewbase is not a custom element you will need to add a dummy function getAttribute that returns null or what value you require.

```js
static get properties() {
    return ["items"];
}
```

```js
const view = new ClassUsingViewBase(document.body);
```

##Old value vs New value
Sometimes you want to know what the old value was.  
Crs binding does not track what the previous values was.  
If you want that kind of feature use the setter of your property to mange that for you.
For example:

```js
class Test {
    get name() {
        return this._name;
    }
    
    set name(newValue) {
        this._oldName = this._name;
        this._name = newValue;
    }   
}
```

This way you can track the old value of only the items you care about.

## Property changed on context
Notify property changed will check on the context if a function maching a convention exists and if it exists that function will be called.
This is used to be notified simply when a property changes value;  
The convention is `${propertyName}Changed`;  

If i had a property called name and in my binding context i wanted a function to be called each time that property changes, 
create a function with the name "nameChanged". If that function exists it will be called each time the "name" property changes and is notified
using notifyPropertyChanged

## Binding to class of element
There are two ways to deal with style classes on a element.

1. Set the class attribute
2. Add and remove classes from the classList property.

This example shows how we can bind to the classList and use the class attribute at the same time.

```html
<div class="italic" classlist.one-way="myClasses">Is Active Status</div>
```

myClass on the binding context can be a string value or a array of strings.  
italic will be there regardless of what you set myClasses too.

```js
this.myClasses = this.isActive == true ? "blue": ["red", "bold"];
```

You can also perform conditional binding on the class list.  
This is done using the "if" syntax.

```html
<div classlist.if="isActive == true ? ['green', 'italic'] : 'red'">Is Active Status</div>
<div classlist.if="isActive == true ? 'green'">Is Active Status</div>
```

These two examples show the conditional binding with

1. if / else scenario
1. truthy only. if condition fails it will not contain those classes.

## Binding to style property
If you don't want to use classes, you can also set a single style property.

```html
<div style.background.one-way="background">Test</div>
```

This behaves the same way as if you wrote the following javascript:

```js
element.style.background = value
```

When you set the background property on the binding context the value will style property will be set accordingly.

You can also use conditional binding here to set the style property.

```html
<div style.background.if="isActive == true ? 'blue' : 'red'">Is Active Status</div>
<div style.background.if="isActive == true ? 'blue'">Is Active Status</div>
```

There are cases where the style property is capitalized.
A example of that would be something like paddingLeft.
Sine the dom makes all that lowercase you need to dash seperate new words in these cases.

```html
<div style.padding-left.one-way="paddingProperty">Is Active Status</div>
```

## Attr one way binding
In some cases you want to do a one way binding on an attribute.
Lets say you want to bind to an attribute "data-name".
One way of doing that would be `data-name.one-way="name"` but you can also use a shortcut syntax of
`data-name="${name}"`. This is the same expression you would use as the innerText of a element.

## Setting inner text once
```html
<h2 inner-text.once="title"></h2>
```

This is a bit different to having the expression between the tags in that there is no listener for this.
Once the value is copied over that is it, it does not change again.

# Inflating UI
Let me start by describing what this is and where you would use it before we get into the details.
Binding engines operate on ui and data and creating a relationship between the two.
Sometimes you need to keep the connection alive so that updates on one reflects on the other.

Inflation is the opposite of this.
Using a template as a reference we want to populate the template with data from the model and forget about it.
This sounds very much like populating data with the once operation except this applies to the entire template and all the binding expressions are evaluated once only.
To this end you can also use an array of data and ask for all the items back, populated with it's data and decorated according to it's attribute, style and classlist expressions.

The result is static so any changes you make to the data has no effect.
This is a great way to generate UI for virtualized lists or static information.

So here is a list of usable expression types.

1. Attributes ```data-id="${id}"```
1. Conditional Attributes ```hidden.if="isActive == false"```
1. Conditional ClassList ```classlist.if="isReady == true ? ['ready', 'italic'] : 'notReady'"```
1. Conditional Styles ```style.background.if="isActive == true ? 'green' : 'red'"```

How to use this?

<strong>Step 1</strong>: create an template and register it with the inflation manager giving a unique id for later use

```html
<template id="my-template">
    <li data-id="${id}" classlist.if="isReady == true ? ['ready', 'italic'] : 'notReady'">
        <div class="icon" style.background.if="isActive == true ? 'green' : 'red'"></div>
        <div>${caption}</div>
        <div hidden.if="isActive == false" data-hidden.if="isActive == false ? 'yes' : 'no'" data-description.if="isActive == false ? 'this not is active'">I am active</div>
    </li>
</template>
```

```js
const template = this._element.querySelector("#my-template");
crsbinding.inflationManager.register("list-item", template);
```

<strong>Step 2:</strong> when you have your data you can use the get function.

```js
const fragment = crsbinding.inflationManager.get("list-item", template);
```

<strong>Finally</strong> When you are done clean up after yourself by un-registering the template

```js
crsbinding.inflationManager.unregister("list-item");
```

In some cases you may want to reuse a element and add it to a element store.
Doing this prevents it from being picked up by the garbage collection.
You don't want to store it with all the inflated information though so there are two functions that allow you too use it this way.

1. deflate: clean up the element for storgate
1. inflate: populate a given element with the information on the model.

```js
store.add(crsbinding.inflationManager.deflate("list-item", element));
```

```js
const element = store.getElement();
crsbinding.inflationManager.deflate("list-item", element, model);
```

For performance reasons the function generated to perform this task does not do checks on the model or element.
Thus, please keep this min mind:

1. Only use elements you got origionally from the inflation manager.
1. The models you use as part of the inflation process must have the paths structures as defined in your expression.
1. The expressions you define in the template is relative with the model being the root. So if you have a property called isActive on the item you can start the expression with isActive.

## Clone
When you need to clone an object, it may have binding events registered for it.
The binding engine provides a object clone feature that will retain the binding events of the object.

```js
this.model2 = crsbinding.utils.clone(this.model, this.model2);
```

You will note that there are two parameters.
The first is the object to make a copy of and the second is the object to inherit it's binding from.
This is often used in observation were you do the same thing.

If you don't provide the second parameter it will still clone the object but the binding events will not be maintained.

