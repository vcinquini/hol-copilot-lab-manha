# The Daily Harvest

The Daily Harvest is a React + TypeScript e-commerce storefront built with Vite. It includes a product catalog, cart functionality, checkout flow, login/admin routes, and a small test suite for UI behavior.

## Overview

This app is designed to mimic a simple online shopping experience for a fruit and grocery brand. Users can:

- browse the homepage and product listings
- view product details and stock status through the catalog
- add items to a shopping cart
- review cart contents
- complete checkout
- access separate login and admin views

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router DOM
- Vitest + Testing Library
- ESLint

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or newer
- npm (included with Node.js)

## Quick Start

1. Open a terminal in the repository root.
2. Change to the app directory:

   ```bash
   cd eCommApp
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at:

   ```text
   http://localhost:3000
   ```

## Project Structure

```text
eCommApp/
├── public/
│   └── products/
│       ├── apple.json
│       ├── grapes.json
│       ├── orange.json
│       ├── pear.json
│       └── productImages/
├── src/
│   ├── components/
│   │   ├── AdminPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ProductsPage.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── test/
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── public/
```

## Key Files to Know

- `src/App.tsx` — defines the app routes and wraps the app in `CartProvider`
- `src/context/CartContext.tsx` — manages shopping cart state and item additions
- `src/components/CartPage.tsx` — displays cart items and handles checkout flow
- `src/components/ProductsPage.tsx` — product catalog UI
- `public/products/*.json` — product data used by the app
- `package.json` — scripts and dependencies

## Available Scripts

```bash
npm run dev
```
Starts the Vite development server.

```bash
npm run build
```
Builds the app for production.

```bash
npm run preview
```
Serves the production build locally.

```bash
npm run lint
```
Runs ESLint checks.

```bash
npm run test
```
Starts Vitest in watch mode.

```bash
npm run test:run
```
Runs the test suite once.

```bash
npm run test:ui
```
Opens the Vitest UI dashboard.

```bash
npm run test:coverage
```
Runs tests with coverage reporting for the project.

## Testing

This project uses Vitest with React Testing Library. Tests live alongside components, such as:

- `src/components/CartPage.test.tsx`

To run tests once:

```bash
npm run test:run
```

To generate a coverage report:

```bash
npm run test:coverage
```

## Checkout and Cart Behavior

The cart state is controlled by the global context in `CartContext`. It supports:

- adding products to the cart
- incrementing quantity when the same product is added again
- clearing the cart after confirming checkout
- preserving processed items on the post-checkout confirmation screen

## Common Troubleshooting

### Port 3000 is already in use
If the Vite dev server cannot start because the port is occupied, stop the process using that port or change the port in your Vite config.

### Dependency install issues
Delete the `node_modules` folder and lock file if the install becomes inconsistent, then run:

```bash
npm install
```

### Node version mismatch
Use Node.js 18 or newer. If you are on an older version, upgrade Node before running the project.

## Notes for Contributors

- Keep component logic separated from global cart state.
- Prefer small UI tests for route, modal, and cart behavior.
- Update tests anytime a user flow or state transition changes.
- Use the production build and linting checks before merging changes.

## License

This project is for learning and workshop use within the repository context.
