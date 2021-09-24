## Contributing to Garfish

😁 Excited to hear that you are interested in contributing to this project! Thanks!

## Setup (locally)

This project uses pnpm to manage the dependencies, install it if you haven't via

```bash
npm i -g pnpm
```

Clone this repo to your local machine and install the dependencies.

```bash
pnpm install
```

## Development

To build all the packages at once, run the following command on the project root

```bash
pnpm build
```

Build with watch mode

```bash
pnpm dev
```

## Run Demo

To run Garfish locally, you can run

```bash
pnpm dev
```

The server will restart automatically every time the builds get updated.

## Project Structure

### Monorepo

We use monorepo to manage multiple packages

```js
website
packages
  runtime
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
# Debug core/garfish package
$ pnpm dev

# Debug core/sandbox package, and open the debug page in your browser
$ pnpm dev sandbox -o

# Separate packing core/garfish son packages, and the relevant dependent child bag inside, packing real-time monitoring file changes
$ pnpm build garfish -e -w

#  Separate packing core/garfish son packages, and the relevant dependent child bag in, after the merger packaging. Which s
$ pnpm build garfish -e -m

# Pack all the core below package
$ pnpm build:core

# The core and tool below all of the packages
$ pnpm build:all

# Under the core to create a new project
$ pnpm pkg <pkgName>

# Under the tool to create a new project
$ pnpm pkg <pkgName> -t=tool

# Release a latest package (beta, alpha in the same way)
$ pnpm release
```
