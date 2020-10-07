# crs-binding

This is a dependency free binding engine for web client development.  
The focus is on web technology standards as far as possible.

1. Making use of ES6+ ish syntax
1. Using HTML5 templates
1. Web component support either vanilla or using bindable element.

A core focus of crs-binding is to manage binding or context data, responding to those context changes.  
There is a clear separation between component properties and binding data so that they can operate in isolation of each other.

## Documentation
Documentation comes in two main forms.

1. [Written Documentation](https://github.com/caperaven/crs-binding-documentation)
1. [Sample Application](https://crs-binding-examples.web.app/)

The sample application is [opensource](https://github.com/caperaven/crs-binding-examples) but also provides links per sample to source for you to review.

## Testing
Tests are written in both unit and puppeteer tests.
Unit testing are used for core mechanics but DOM features are tested using puppeteer.

## Getting Started

One of the easiest ways to get started is to create a sample application where everything is setup for you.

Here are two github templates you can use.

1. [spa starter](https://github.com/caperaven/crs-spa-starter)
1. [application starter](https://github.com/caperaven/crs-application-template)

The sample application uses the application starter.  
The difference between the two is that the application starter has a menu included.

Once on your hard drive, remember to run `npm install` in the commandline to install all the dependencies.

## Install and using

If you don't want to use an existing template, you can easily set up your own project.

1. install crs binding using npm `npm install crs-binding@latest`
1. include it in your project `<script type="module" src="./node_modules/crs-binding/crs-binding.js"></script>`

Once you have included the library, crsbinding is registered on globalThis for usage.  
You can look at the [sample application](https://github.com/caperaven/crs-binding-examples) for details.

## Other interesting opensource libraries

1. [crs router](https://github.com/caperaven/crs-router)
1. [crs schema](https://github.com/caperaven/crs-schema)