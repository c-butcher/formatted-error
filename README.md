# Formatted Errors

[![Build Status](https://travis-ci.com/c-butcher/data-errors.svg?branch=master)](https://travis-ci.com/c-butcher/data-validators)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://travis-ci.com/c-butcher/data-validators)

This is a JavaScript Error object that lets you use placeholders in your error message, then
it replaces them with the values supplied in the parameters object.

## What is the purpose?
This project might seem silly or downright stupid at first, especially since you can already put values
directly into your error like this...

```javascript
throw new Error(`Error ${code} occurred.`)
```

That was pretty simple!

There is however this really annoying project where we can't hard-code our error messages because we don't
know what the error message is, or even what the parameters are, until after the configuration is loaded.

So that's why we created this error....

## Error Properties
| Argument | Type   | Description                                                       |
|----------|--------|-------------------------------------------------------------------|
| message  | string | The final error message with the placeholders replaced.           |
| original | object | The original error message with the placeholders intact.          |
| params   | object | Nested object containing the values for the placeholders.         |

## Creating a Formatted Error
Right now the formatted errors use curly braces `{` and `}` to encapsulate the placeholders.
The value inside the curly braces must map to a property on our parameters object. Below our
placeholder `{name}` is being mapped to the `param.name` property.

```javascript
const FormattedError = require('formatted-error');

try{
    
    let message = "{name}, we have a problem!";
    let params = {
        name: 'Houston'
    };
    
    throw new FormattedError(message, params);
    
} catch (error) {
    
    // Outputs "Houston, we have a problem!"
    console.log(error.message); 
}
```

## Using Nested Objects as Parameters
This time we are going to provide a nested object for the parameters. In order to get that value,
our placeholder will want to separate the object levels with a period `{user.profile.nickname}`.
Then our error knows the value can be found at `params['user']['profile']['nickname']`.

```javascript
const FormattedError = require('formatted-error');

try{
    
    throw new FormattedError("Hello {user.profile.nickname}!", {
        user: {
            profile: {
                nickname: 'Captain Awesome',
            }
        }
    });
    
} catch (error) {
    
    // Outputs "Hello Captain Awesome!"
    console.log(error.message); 
}
```

## Dealing with Arrays
Arrays can serve many purposes, which is why their contents don't always convert to string, but
when all the values are primitives (strings, numbers, booleans), then we know that we can join
them together...

```javascript
const FormattedError = require('formatted-error');

try{
    
    let message = "Here are a few of my favorite things {primitives}!";
    let params = {
        primitives: ['pizza', 42, true]
    };
    
    throw new FormattedError(message, params);
    
} catch (error) {
    
    // Outputs "Here are a few of my favorite things pizza, 42, true!"
    console.log(error.message); 
}
```

If a placeholder's value is an array of complex functions and objects then the placeholder will be ignored completed,
as we haven't decided how to handle dealing with those yet. Since these errors are meant to use messages and parameters
created by the end-user, we don't exactly want to execute any functions they supply.

```javascript
const FormattedError = require('formatted-error');

try{
    
    let message = "Here is my {ignore} placeholder!";
    let params = {
        ignore: [
            { name: 'Joseph' },
            { name: 'Jacob' },
            { name: 'Jingleheimer' },
            { name: 'Schmidt' },
        ]
    };
    
    throw new FormattedError(message, params);
    
} catch (error) {
    
    // Outputs "Here is my {ignore} placeholder!"
    console.log(error.message); 
}
```

