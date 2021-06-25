# Starry Docs

## 安装

```console
yarn setup
```

## 本地开发

```console
yarn start
```

该命令会启动一个本地服务并打开浏览器窗口

## 构建

```console
yarn build
```

该命令会在 `build` 目录下生成网站静态页面

## 发布

待补充

## 文档搜索

**注意**: 文档搜索功能需要在 `build` 模式下才能生效，直接执行 `yarn start` 将无法搜索到结果，正确步骤如下：

第一步：

```base
yarn build
```

第二步

```base
yarn serve
```
