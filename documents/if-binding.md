# If binding

This binding expression works on a attribute level.
You can add and remove attributes or set attribute values depending on a expression.

The binding expression is standard javascript expression.  
There are three scenarios:

## Scenario 1
If the condition passes, add this attribute. If it fails, remove the attribute.
```html
<div hidden.if="isVisible != true"></div>
<div diabled.if="allow != true"></div>
```

## Scenario 2
Set the attribute value depending on the passing of the expression.
The expression here is a standard if statement.
```html
<div data-busy.if("isBusy == true ? 'yes' : 'no'")></div>
``` 

## Scenario 3
Set the attribute value if the condition passes else remove the attribute.
If you do not define a else, it will remove the attribute if the expression fails.
```html
<div data-busy.if("isBusy == true ? 'yes'")></div>
```