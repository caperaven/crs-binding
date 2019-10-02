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

### Defining a event

```js
const obj = observer(model);
obj.when("property1 == 'a'", (newValue, oldValue) => console.log(`${newValue} - ${oldValue}`));
```

## dom

attribute.two-way   // two way binding  
attribute.one-way   // one way binding  
attribute.once      // once off binding - inflate  
attribute.when      // conditional binding  
event.call          // delegate  


