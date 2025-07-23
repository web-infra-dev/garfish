import * as path from 'node:path';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from 'rspress/config';
import { pluginLlms } from '@rspress/plugin-llms';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Garfish',
  description:
    '包含构建微前端系统时所需要的基本能力，任意前端框架均可使用。接入简单，可轻松将多个前端应用组合成内聚的单个产品',
  icon: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/icon.png',
  logo: {
    light:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/garfish-icon.png',
    dark: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/garfish-icon.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/bytedance/garfish',
      },
    ],
  },
  builderConfig: {
    plugins: [pluginSass()],
    resolve: {
      alias: {
        '@components': path.join(__dirname, 'src/components'),
      },
    },
  },
  plugins: [
    pluginLlms(),
  ],
});
