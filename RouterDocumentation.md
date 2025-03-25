# Router Class Documentation

## Overview

The `Router` class is a modern, scalable client-side router designed for single-page applications (SPAs). It leverages the latest ECMAScript features to provide a robust solution for managing navigation, rendering content, and handling dynamic routes. Key features include support for query parameters, navigation hooks, history state management, and both programmatic and DOM-driven navigation.

## Purpose

This router enables seamless navigation within a web application without full page reloads. It integrates with the browser's History API to maintain URL state, supports dynamic route parameters (e.g., `/users/:id`), and provides hooks for custom navigation logic.

## Installation

To use the router, include the `router.js` file in your project and ensure your HTML has a container element (default ID: `app`).

```html
<div id="app"></div>
<script src="router.js"></script>
```

## Class Structure

### Constructor

#### Signature:

```javascript
new Router([rootElement]);
```

### Internal Methods

The following methods are internal to the router implementation and not intended for direct use:

#### #initialize

Sets up event listeners for navigation and initializes the router.

#### #buildPath

Constructs URLs with query parameters.

#### #handleNavigationClick

Processes clicks on elements with `data-navigate` or `data-nav` attributes.

#### #matchRoute

Matches the current path to a registered route.

#### #parseRoute

Extracts parameters from dynamic routes (e.g., `/users/:id`).

#### #processRouteChange

Handles route changes and content rendering.

#### #renderContent

Renders content to the DOM.

#### #getNotFoundContent

Returns default 404 content when no matching route is found.

#### #getErrorContent

Returns error content with a message when an error occurs during route processing.

- **Signature**: `new Router([rootElement])`
- **Parameters**:
  - `rootElement` (HTMLElement, optional): The DOM element where route content is rendered. Defaults to `document.getElementById('app')`.
- **Throws**: Error if `rootElement` is not an HTMLElement.
- **Description**: Initializes the router, sets up event listeners, and binds to the specified root element.
- **Example**:
  ```javascript
  const router = new Router(document.getElementById("app"));
  ```

Returns error content with a message when an error occurs during route processing.

- **Signature**: `new Router([rootElement])`
- **Parameters**:
  - `rootElement` (HTMLElement, optional): The DOM element where route content is rendered. Defaults to `document.getElementById('app')`.
- **Throws**: Error if `rootElement` is not an HTMLElement.
- **Description**: Initializes the router, sets up event listeners, and binds to the specified root element.
- **Example**:
  ```javascript
  const router = new Router(document.getElementById("app"));
  ```

## Public Methods

### navigateTo

#### Signature:

```javascript
navigateTo(path, [options]);
```

- **Parameters**:
  - `path` (string): The target path to navigate to.
  - `options` (Object, optional):
    - `state` (Object): Data to store in the browser's history state.
    - `force` (boolean): Forces navigation even if the path matches the current one.
    - `guard` (Function): A function returning a boolean to allow or block navigation.
    - `query` (Object): Query parameters to append to the URL.
- **Returns**: The Router instance for method chaining.
- **Description**: Navigates to the specified path, updating the URL and rendering the associated content.
- **Examples**:

  ```javascript
  // Basic navigation
  router.navigateTo("/about");

  // With query parameters and state
  router.navigateTo("/about", {
    query: { tab: "info" },
    state: { source: "button" },
  });

  // With navigation guard
  router.navigateTo("/users/123", {
    guard: (from, to) => confirm(`Navigate to ${to}?`),
  });
  ```

### Private Properties

- `#routes`: A Map storing route paths mapped to their handlers and parameters.
- `#currentPath:` A string tracking the current active path, including query parameters.
- `#rootElement:` The HTMLElement where content is rendered.
- `#hooks:` An object containing beforeEach and afterEach navigation hooks.
