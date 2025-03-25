// router.js
class Router {
  #routes = new Map();
  #currentPath = "";
  #rootElement;
  #hooks = {
    beforeEach: null,
    afterEach: null,
  };

  /**
   * @param {HTMLElement} rootElement - The container element for route content
   */
  constructor(rootElement = document.getElementById("app")) {
    if (!(rootElement instanceof HTMLElement)) {
      throw new Error("Root element must be an HTMLElement");
    }
    this.#rootElement = rootElement;
    this.#initialize();
  }

  // Initialize event listeners
  #initialize() {
    window.addEventListener("popstate", () => this.#processRouteChange());
    document.addEventListener("click", (e) => this.#handleNavigationClick(e));
    window.addEventListener("DOMContentLoaded", () =>
      this.#processRouteChange()
    );
  }

  /**
   * Register a new route
   * @param {string} path - Route path (e.g., '/about', '/users/:id')
   * @param {Function} handler - Async function returning content
   * @param {Object} [params] - Additional route parameters
   * @returns {Router} - For method chaining
   */
  addRoute(path, handler, params = {}) {
    if (typeof handler !== "function") {
      throw new Error("Route handler must be a function");
    }
    this.#routes.set(path, { handler, params });
    return this;
  }

  /**
   * Navigate to a specific path
   * @param {string} path - Target path
   * @param {Object} [options] - Navigation options
   * @param {Object} [options.state] - History state object
   * @param {boolean} [options.force] - Force navigation even if same path
   * @param {Function} [options.guard] - Guard function returning boolean
   * @param {Object} [options.query] - Query parameters
   * @returns {Router} - For method chaining
   */
  navigateTo(path, options = {}) {
    const { state = {}, force = false, guard, query } = options;

    if (guard && !guard(this.#currentPath, path)) return this;
    if (
      this.#hooks.beforeEach &&
      !this.#hooks.beforeEach(this.#currentPath, path)
    )
      return this;
    if (path === this.#currentPath && !force) return this;

    const finalPath = this.#buildPath(path, query);
    window.history.pushState(state, "", finalPath);
    this.#currentPath = finalPath;
    this.#processRouteChange().then(() => {
      if (this.#hooks.afterEach) this.#hooks.afterEach(this.#currentPath);
    });
    return this;
  }

  // Build path with query parameters
  #buildPath(path, query) {
    if (!query) return path;
    const url = new URL(window.location.origin + path);
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.pathname + url.search;
  }

  // Handle navigation clicks (links and buttons)
  #handleNavigationClick(event) {
    const element = event.target.closest("[data-navigate], a[data-nav]");
    if (!element) return;

    event.preventDefault();
    const path =
      element.getAttribute("data-navigate") || element.getAttribute("href");
    if (path) this.navigateTo(path);
  }

  // Match route and extract parameters
  #matchRoute(path) {
    const cleanPath = path.split("?")[0]; // Remove query params for matching
    for (const [routePath, route] of this.#routes) {
      const { params, isMatch } = this.#parseRoute(routePath, cleanPath);
      if (isMatch) return { ...route, params: { ...route.params, ...params } };
    }
    return null;
  }

  // Parse route and extract parameters
  #parseRoute(routePath, actualPath) {
    const routeSegments = routePath.split("/").filter(Boolean);
    const pathSegments = actualPath.split("/").filter(Boolean);

    if (routeSegments.length !== pathSegments.length) {
      return { isMatch: false, params: {} };
    }

    const params = {};
    const isMatch = routeSegments.every((segment, i) => {
      if (segment.startsWith(":")) {
        params[segment.slice(1)] = pathSegments[i];
        return true;
      }
      return segment === pathSegments[i];
    });

    return { isMatch, params };
  }

  // Process route changes
  async #processRouteChange() {
    const path = window.location.pathname + window.location.search;
    const matchedRoute = this.#matchRoute(path);
    try {
      const content = matchedRoute
        ? await matchedRoute.handler(matchedRoute.params)
        : this.#getNotFoundContent();
      this.#renderContent(content);
    } catch (error) {
      this.#renderContent(this.#getErrorContent(error));
      console.error("Route processing error:", error);
    }
  }

  // Render content to DOM
  #renderContent(content) {
    if (typeof content === "string") {
      this.#rootElement.innerHTML = content;
    } else if (content instanceof Node) {
      this.#rootElement.innerHTML = "";
      this.#rootElement.appendChild(content);
    } else {
      throw new Error("Invalid content type for rendering");
    }
  }

  #getNotFoundContent() {
    return "<h1>404 - Page Not Found</h1>";
  }

  #getErrorContent(error) {
    return `<h1>Error: ${error.message}</h1>`;
  }

  /**
   * Set navigation hooks
   * @param {'beforeEach' | 'afterEach'} hookName
   * @param {Function} callback
   * @returns {Router}
   */
  setHook(hookName, callback) {
    if (hookName in this.#hooks && typeof callback === "function") {
      this.#hooks[hookName] = callback;
    }
    return this;
  }
}

// Usage example
const router = new Router();

const pages = {
  "/": async () => `
      <h1>Home</h1>
      <button data-navigate="/about">Go to About</button>
      <button data-navigate="/contact">Contact Us</button>
      <a href="/about" data-nav>About Link</a>
    `,
  "/about": async () => `
      <h1>About</h1>
      <button data-navigate="/">Home</button>
      <button data-navigate="/contact">Contact</button>
    `,
  "/contact": async () => `
      <h1>Contact</h1>
      <button data-navigate="/">Home</button>
      <button data-navigate="/about">About</button>
    `,
  "/users/:id": async (params) => `
      <h1>User Profile</h1>
      <p>User ID: ${params.id}</p>
      <button data-navigate="/">Home</button>
    `,
};

// Register routes and hooks
router
  .addRoute("/", pages["/"])
  .addRoute("/about", pages["/about"])
  .addRoute("/contact", pages["/contact"])
  .addRoute("/users/:id", pages["/users/:id"])
  .setHook("beforeEach", (from, to) => {
    console.log(`Navigating from ${from} to ${to}`);
    return true; // Return false to cancel navigation
  })
  .setHook("afterEach", (to) => {
    console.log(`Arrived at ${to}`);
  });

// Styles
const styles = `
    button[data-navigate], a[data-nav] {
      padding: 0.5em 1em;
      margin: 0.5em;
      cursor: pointer;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      display: inline-block;
    }
    button[data-navigate]:hover, a[data-nav]:hover {
      background: #0056b3;
    }
  `;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Programmatic navigation

// router.navigateTo('/about', {
//   query: { tab: 'info' },
//   state: { source: 'button' }
// });

//  router.navigateTo('/users/123', { query: { view: 'profile' } });

// With guard
// router.navigateTo('/about', {
//   guard: (from, to) => confirm(`Move from ${from} to ${to}?`)
// });

// From HTML
// <button data-navigate="/about">Go to About</button>
// <a href="/contact" data-nav>About Link</a>
