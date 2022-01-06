const path = require('path');

module.exports = {
  title: 'Garfish',
  tagline: '微前端解决方案',
  url: 'https://garfish.top',
  baseUrl: '/',
  organizationName: 'bytedance',
  projectName: 'garfish',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon:
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/icon.png',
  organizationName: 'ByteDance',
  projectName: 'Garfish Docs',
  customFields: {
    slogan: 'Garfish 微前端框架',
    summary:
      '包含构建微前端系统时所需要的基本能力，任意前端框架均可使用。接入简单，可轻松将多个前端应用组合成内聚的单个产品',
  },
  themeConfig: {
    // sidebarCollapsible: true,
    hideableSidebar: true,
    colorMode: {
      // defaultMode: 'dark',
      disableSwitch: true,
    },
    navbar: {
      logo: {
        alt: 'Garfish',
        src: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/garfish-icon.png',
        srcDark:
          'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/garfish-icon.png',
      },
      items: [
        // left
        {
          to: 'guide/',
          label: '文档',
          position: 'left',
        },
        // {
        //   to: 'api/',
        //   label: 'API',
        //   position: 'left',
        // },
        {
          to: 'issues/',
          label: '常见问题',
          position: 'left',
        },
        // {
        //   href:
        //     'https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=601jeae5-250c-48b4-a3bd-7e6211cd4471',
        //   position: 'right',
        //   className: 'header-feishu-link',
        // },
        {
          href: 'https://github.com/bytedance/garfish',
          className: 'header-github-link',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} ByteDance, Inc. Powered By Garfish Team`,
    },
  },
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        language: ['zh'],
        docsRouteBasePath: ['/guide/', '/issues'],
        docsDir: ['docs'],
        // ```
        // When applying `zh` in language, please install `nodejieba` in your project.
      },
    ],
    [
      '@docusaurus/plugin-ideal-image',
      {
        name: 'ideal-img/[name].[hash:hex:7].[width].[ext]',
      },
    ],
  ],
  scripts: [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/script/slardar-garfish.js',
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/bytedance/garfish/tree/master/website',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        pages: {
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/bytedance/garfish',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} ByteDance, Inc.`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
    localeConfigs: {
      // en: {
      //   label: 'English (Auto)',
      //   direction: 'ltr',
      // },
      // 'zh-CN': {
      //   label: '简体中文（中国）',
      //   direction: 'ltr',
      // },
    },
  },
};
