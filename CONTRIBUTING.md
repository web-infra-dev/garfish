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

## 打包介绍

### Core

Garfish runtime related packages use the rollup to build and use the same script to build each package, of course, also can be differentiated configuration, in a package under the add below, he has the following fields, the packaging file will be generated to the next, use can be packaged all the core package below

```json
  "buildOptions": {
    "name": "Garfish", // When packaged in umd or esm - browser, for example, will with Garfish namespace injection into the window. Is not specified, use the default name after the package folder to hump
    "devTemplate": "complete", // Choose the template need to debug, complete or module
    "formats": [ // Taking a packaging format
      "umd",
      "cjs",
      "esm-browser",
      "esm-bundler"
    ]
  }
```

We in this piece garfish package, for example to introduce packaging process

```shell
  $ pnpm build garfish -f=umd -n -s -m
```

- `-f`: formats，Specify the packaging format
- `-n`: nocheck，Do not check ts type error when packaging
- `-s`: sourcemap，Sourcemap is generated after packaging
- `-m`: mergetypes，After the completion of the packaging field is a combined type declaration documents
- `-e`: noExternal，garfish Used within the package into a file

#### 打包后的文件介绍

- `dist/garfish.cjs.js`: cjs Inside the bag, contain all the warning and prompt information
- `dist/garfish.cjs.prod.js`: cjs Package, all warning messages have been deleted
- `dist/garfish.esm-browser.js`: esm Package, package appears to rely on the son have been scored
- `dist/garfish.esm-bundler.js`: esm Package, the bag, the son of dependence has not been reached, for users with the help of the class webpack packaging tool use
- `dist/garfish.umd.js`: umd Package, compatible with a variety of formats, package dependence were scored
  `

## 常见的操作

```shell
# 调试 core/garfish 子包
$ pnpm dev

# 调试 core/sandbox 子包，并在浏览器中打开调试页面
$ pnpm dev sandbox -o

# 单独打包 core/garfish 子包，并把相关的依赖的子包打进去，实时监听文件的变动打包
$ pnpm build garfish -e -w

#  单独打包 core/garfish 子包，并把相关的依赖的子包打进去，合并打包后的 .d.ts
$ pnpm build garfish -e -m

# 打包所有的 core 下面的子包
$ pnpm build:core

# 打包 core 和 tool 下面所有的子包
$ pnpm build:all

# 在 core 下创建一个新的子包工程
$ pnpm pkg <pkgName>

# 在 tool 下创建一个新的子包工程
$ pnpm pkg <pkgName> -t=tool

# 发布一个 latest 的包（beta，alpha 同理）
$ pnpm release
```
