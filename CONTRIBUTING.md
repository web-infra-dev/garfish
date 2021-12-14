## Contributing to Garfish

😁 Excited to hear that you are interested in contributing to this project! Thanks!

## Requirement

`Node.js >= 14.13.0`

## Setup (locally)

This project uses pnpm to manage the dependencies, install it if you haven't via

```bash
npm i -g pnpm
```

Clone this repo to your local machine and install the dependencies.

```bash
pnpm run setup
```

## Development

To build all the packages at once, run the following command on the project root

```bash
pnpm build
```

Build with watch mode

```bash
pnpm build:watch
```

## Run Demo

To run Garfish locally, you can run

```bash
pnpm dev
```

```bash
pnpm build:watch
```

The server will restart automatically every time the builds get updated.

## Project Structure

### Monorepo

We use monorepo to manage multiple packages

```js
website
packages
  browser-snapshot/          - snapshot sandbox
  browser-vm/                - vm sandbox
  core/                      - core module with sandbox、loader、hooks、router
  garfish/
  hooks/                     - hooks
  loader/                    - loader
  remote-module/
  router/                    - router
  utils/                     - common utils
```

## The operation of the common

```shell
# Debug dev package
$ pnpm dev

# Pack all package
$ pnpm build

# Build with watch mode
$ pnpm build:watch

# Run unit tests
$ pnpm test

# Release a latest package (beta, alpha in the same way)
$ pnpm release
```
