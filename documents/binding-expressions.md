# Binding expressions

## javascript

Models have two types of triggers to notify value changes.

1. Triggers
1. Events

Triggers are each time a property changes.
Events trigger only when a condition expression is met.

### Defining a trigger
```js
const obj = observe(model);
obj.on("property1", (newValue, oldValue) => console.log(`${newValue} - ${oldValue}`));
```

### enableEvents vs observe

There are two ways to enable a object to use the on and when functions.
The first is using the "enableEvents" function in event-mixin.js.
The second is to use observe in crs-binding.js;

If you observe an object it will trigger property change side effects automatically.
If however you don't use observe but enableEvents instead, you will have to manually trigger the side effects using notifyPropertyChanged. 

#### enableEvents
```js
    const obj = {
        property: "value"
    };

    enableEvents(obj);
    obj.on("property", () => console.log("property changed"));

    obj.property = "value2";
    obj.notifyPropertyChanged("property");
```

#### observe
```js
    const obj = observe({
        property: "value"
    });

    obj.on("property", () => console.log("property changed"));
    obj.property = "value2";
```

The use cases between the two differ.
enableEvents is typically used inside a custom component where you want to leverage the binding capabilities.
observe is used in cases of data models.

## dom
attribute.bind      // same as two-way just a shorthand version
attribute.two-way   // two way binding  
attribute.one-way   // one way binding  
attribute.once      // once off binding - inflate  
event.call          // delegate  