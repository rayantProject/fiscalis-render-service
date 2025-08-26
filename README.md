# 🚀FastyMini: Fastify TypeScript Starter

<p align="center">
  <img src="./public/pixel-cat.png" alt="Astronaute" width="200"/>
</p>

<p align="center">
  <a href="https://nodejs.org/en" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen.svg" alt="Node.js">
  </a>
  <a href="https://www.npmjs.com" target="_blank">
    <img src="https://img.shields.io/badge/npm-10.x-red.svg" alt="npm">
  </a>
  <a href="https://www.npmjs.com/package/fastify" target="_blank">
    <img src="https://img.shields.io/npm/v/fastify.svg" alt="Fastify">
  </a>
  <a href="https://github.com/esbuild/esbuild" target="_blank">
    <img src="https://img.shields.io/badge/bundler-esbuild-ffcf00.svg" alt="esbuild">
  </a>
  <a href="https://eslint.org/" target="_blank">
    <img src="https://img.shields.io/badge/code%20style-ESLint-purple.svg" alt="ESLint">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
</p>

A modern, lightweight setup for a **Fastify** project with **TypeScript**, optimized for fast development and efficient builds using **esbuild**.

## 📦 Tech Stack

- **Fastify** v5.4.0 – Ultra-fast HTTP framework with static file serving
- **TypeScript** v5.8.3 – Static typing for Node.js
- **MongoDB** + **Mongoose** v8.16.5 – Database and ODM
- **Vitest** v3.2.4 – Fast testing framework with MongoDB Memory Server
- **esbuild** v0.25.6 – Lightning-fast bundler for build and watch
- **nodemon** + **wait-on** + **concurrently** – Automatic reloading during development
- **ESLint** v9.31.0 – Modern code linting with flat config
- **Typebox** v0.34.37 – TypeScript schema validation
- **dotenv** v17.2.0 – Environment variable management

## 📁 Project Structure

```ini
.
├── src/
│   ├── index.ts         # Fastify application entry point
│   ├── server.ts        # Server configuration
│   ├── controllers/     # Route controllers (business logic)
│   ├── helpers/         # Helper functions and utilities
│   ├── interfaces/      # TypeScript interfaces
│   ├── models/          # Database models
│   ├── plugins/         # Fastify plugins (config, mongodb)
│   ├── routes/          # Route handlers
│   └── utils/           # Utility functions (test server setup)
├── tests/               # Test files
│   ├── *.test.ts        # Individual test files
│   └── setup/           # Test setup configuration
├── dist/                # Compiled files (esbuild output)
├── public/              # Static assets
├── settings/            # Build and project settings
├── esbuild.config.ts    # esbuild configuration (build & dev)
├── eslint.config.mjs    # ESLint configuration
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Vitest testing configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies and scripts
├── .env.template        # Environment variables template
└── .env                 # Environment variables (copy from .env.template)
```

## ⚙️ Scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run build:tsc`     | Compiles the project with TypeScript (tsc)   |
| `npm run build:esbuild` | Compiles the project with esbuild            |
| `npm run dev`           | Development mode with watch and hot-reload   |
| `npm start`             | Runs the built application (`dist/index.js`) |
| `npm test`              | Runs tests with Vitest                       |

## 🚀 Getting Started

### Prerequisites

- Node.js (version >= 18.x recommended)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   
   **On macOS/Linux:**
   ```bash
   cp .env.template .env
   ```
   
   **On Windows:**
   ```cmd
   copy .env.template .env
   ```
   
   > **Important:** Make sure to copy `.env.template` to `.env` and configure your environment variables as needed.

### Development

Start development mode with automatic reloading:

```bash
npm run dev
```

This script:

- Compiles TypeScript code with esbuild in watch mode,
- Waits for `dist/index.js` to be generated,
- Runs the application with nodemon for hot-reload.

### Production

Build and run the application for production:

```bash
npm run build:esbuild
npm start
```

### Testing

Run the test suite with Vitest:

```bash
npm test
```

The testing setup includes:
- **Vitest** for fast unit and integration testing
- **MongoDB Memory Server** for isolated database testing
- Pre-configured test utilities in `src/utils/testServer.ts`

```bash
npm run build:esbuild
npm run start
```

## 🔧 Configuration

- **Environment**: Uses `dotenv` to load environment variables from a `.env` file.
- **Linting**: Configured with `@eslint/js` and `typescript-eslint` for strict rules.
- **Typebox**: Enables typed schema validation for Fastify.

## 🛠️ Customization

- Modify `esbuild.config.ts` to tweak build options (e.g., minification, sourcemaps).
- Adjust `tsconfig.json` for specific TypeScript settings.
- Add Fastify plugins using `fastify-plugin` for modularity.

## 📝 Notes

- The esbuild configuration supports both development and production builds.
- `pino-pretty` is included for clean log output in development.
- The setup is optimized for lightweight projects but can be extended with additional ESLint plugins for CSS, JSON, and Markdown files.
- External dependencies like Fastify core modules are excluded from the bundle for better performance.

## 📜 License

MIT
