"use strict";(self.webpackChunkgarfish_docs=self.webpackChunkgarfish_docs||[]).push([[671],{5850:function(e,n,a){var t=a(7711);n.Z=function(e){var n=e.children,a=e.hidden,r=e.className;return t.createElement("div",{role:"tabpanel",hidden:a,className:r},n)}},446:function(e,n,a){a.d(n,{Z:function(){return d}});var t=a(5086),r=a(7711),o=a(6427),l=a(4644);var u=function(){var e=(0,r.useContext)(l.Z);if(null==e)throw new Error('"useUserPreferencesContext" is used outside of "Layout" component.');return e},i=a(3982),s=a(1506),p="tabItem_vXLl";function m(e){var n,a,t,o=e.lazy,l=e.block,m=e.defaultValue,d=e.values,c=e.groupId,h=e.className,v=r.Children.map(e.children,(function(e){if((0,r.isValidElement)(e)&&void 0!==e.props.value)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})),f=null!=d?d:v.map((function(e){var n=e.props;return{value:n.value,label:n.label}})),b=(0,i.lx)(f,(function(e,n){return e.value===n.value}));if(b.length>0)throw new Error('Docusaurus error: Duplicate values "'+b.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.');var k=null===m?m:null!=(n=null!=m?m:null==(a=v.find((function(e){return e.props.default})))?void 0:a.props.value)?n:null==(t=v[0])?void 0:t.props.value;if(null!==k&&!f.some((function(e){return e.value===k})))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+k+'" but none of its children has the corresponding value. Available values are: '+f.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");var g=u(),N=g.tabGroupChoices,y=g.setTabGroupChoices,T=(0,r.useState)(k),w=T[0],x=T[1],R=[],I=(0,i.o5)().blockElementScrollPositionUntilNextRender;if(null!=c){var C=N[c];null!=C&&C!==w&&f.some((function(e){return e.value===C}))&&x(C)}var A=function(e){var n=e.currentTarget,a=R.indexOf(n),t=f[a].value;t!==w&&(I(n),x(t),null!=c&&y(c,t))},S=function(e){var n,a=null;switch(e.key){case"ArrowRight":var t=R.indexOf(e.currentTarget)+1;a=R[t]||R[0];break;case"ArrowLeft":var r=R.indexOf(e.currentTarget)-1;a=R[r]||R[R.length-1]}null==(n=a)||n.focus()};return r.createElement("div",{className:"tabs-container"},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.Z)("tabs",{"tabs--block":l},h)},f.map((function(e){var n=e.value,a=e.label;return r.createElement("li",{role:"tab",tabIndex:w===n?0:-1,"aria-selected":w===n,className:(0,s.Z)("tabs__item",p,{"tabs__item--active":w===n}),key:n,ref:function(e){return R.push(e)},onKeyDown:S,onFocus:A,onClick:A},null!=a?a:n)}))),o?(0,r.cloneElement)(v.filter((function(e){return e.props.value===w}))[0],{className:"margin-vert--md"}):r.createElement("div",{className:"margin-vert--md"},v.map((function(e,n){return(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==w})}))))}function d(e){var n=(0,o.Z)();return r.createElement(m,(0,t.Z)({key:String(n)},e))}},353:function(e,n,a){a.r(n),a.d(n,{frontMatter:function(){return s},contentTitle:function(){return p},metadata:function(){return m},toc:function(){return d},default:function(){return h}});var t=a(5086),r=a(9126),o=(a(7711),a(4635)),l=a(446),u=a(5850),i=["components"],s={title:"\u5feb\u901f\u5f00\u59cb",slug:"/quickStart",order:2},p=void 0,m={unversionedId:"guide/quickStart",id:"guide/quickStart",isDocsHomePage:!1,title:"\u5feb\u901f\u5f00\u59cb",description:"\u672c\u8282\u4e3b\u8981\u4ece\u4e3b\u5e94\u7528\u89c6\u89d2\u51fa\u53d1\uff0c\u901a\u8fc7 Garfish API \u7684\u52a0\u8f7d\u65b9\u5f0f\u6982\u89c8\u6027\u63cf\u8ff0\u4e3b\u5e94\u7528\u5982\u4f55\u63a5\u5165\u5fae\u524d\u7aef\u5b50\u5e94\u7528\uff0c",source:"@site/docs/guide/quickStart.md",sourceDirName:"guide",slug:"/quickStart",permalink:"/quickStart",editUrl:"https://github.com/bytedance/garfish/tree/main/website/docs/guide/quickStart.md",tags:[],version:"current",lastUpdatedBy:"Arthur",lastUpdatedAt:1646631813,formattedLastUpdatedAt:"2022/3/7",frontMatter:{title:"\u5feb\u901f\u5f00\u59cb",slug:"/quickStart",order:2},sidebar:"guide",previous:{title:"Garfish \u4ecb\u7ecd",permalink:"/guide"},next:{title:"\u6982\u89c8",permalink:"/api"}},d=[{value:"\u4e3b\u5e94\u7528",id:"\u4e3b\u5e94\u7528",children:[{value:"\u5b89\u88c5\u4f9d\u8d56",id:"\u5b89\u88c5\u4f9d\u8d56",children:[],level:3},{value:"\u6ce8\u518c\u5b50\u5e94\u7528\u5e76\u542f\u52a8 Garfish",id:"\u6ce8\u518c\u5b50\u5e94\u7528\u5e76\u542f\u52a8-garfish",children:[],level:3}],level:2},{value:"\u5b50\u5e94\u7528",id:"\u5b50\u5e94\u7528",children:[{value:"\u5b89\u88c5\u4f9d\u8d56",id:"\u5b89\u88c5\u4f9d\u8d56-1",children:[],level:3},{value:"\u8c03\u6574\u5b50\u5e94\u7528\u7684\u6784\u5efa\u914d\u7f6e",id:"\u8c03\u6574\u5b50\u5e94\u7528\u7684\u6784\u5efa\u914d\u7f6e",children:[],level:3},{value:"\u901a\u8fc7\u5bfc\u51fa\u5b50\u5e94\u7528\u751f\u547d\u5468\u671f",id:"\u901a\u8fc7\u5bfc\u51fa\u5b50\u5e94\u7528\u751f\u547d\u5468\u671f",children:[],level:3}],level:2},{value:"\u603b\u7ed3",id:"\u603b\u7ed3",children:[],level:2}],c={toc:d};function h(e){var n=e.components,a=(0,r.Z)(e,i);return(0,o.kt)("wrapper",(0,t.Z)({},c,a,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"\u672c\u8282\u4e3b\u8981\u4ece\u4e3b\u5e94\u7528\u89c6\u89d2\u51fa\u53d1\uff0c\u901a\u8fc7 ",(0,o.kt)("a",{parentName:"p",href:"/api"},"Garfish API")," \u7684\u52a0\u8f7d\u65b9\u5f0f\u6982\u89c8\u6027\u63cf\u8ff0\u4e3b\u5e94\u7528\u5982\u4f55\u63a5\u5165\u5fae\u524d\u7aef\u5b50\u5e94\u7528\uff0c"),(0,o.kt)("p",null,"\u901a\u8fc7 Garfish API \u63a5\u5165\u5b50\u5e94\u7528\u6574\u4f53\u6d41\u7a0b\u6982\u8ff0\u4e3a\uff1a"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"\u6dfb\u52a0 ",(0,o.kt)("inlineCode",{parentName:"li"},"garfish")," \u4f9d\u8d56\u5305\uff08\u5b57\u8282\u5185\u90e8\u7814\u53d1\u8bf7\u4f7f\u7528 ",(0,o.kt)("inlineCode",{parentName:"li"},"@byted/garfish")," \u4ee3\u66ff ",(0,o.kt)("inlineCode",{parentName:"li"},"garfish"),"\uff09"),(0,o.kt)("li",{parentName:"ol"},"\u901a\u8fc7 ",(0,o.kt)("inlineCode",{parentName:"li"},"Garfish.run"),"\uff0c\u63d0\u4f9b\u6302\u8f7d\u70b9\u3001basename\u3001\u5b50\u5e94\u7528\u5217\u8868")),(0,o.kt)("h2",{id:"\u4e3b\u5e94\u7528"},"\u4e3b\u5e94\u7528"),(0,o.kt)("h3",{id:"\u5b89\u88c5\u4f9d\u8d56"},"\u5b89\u88c5\u4f9d\u8d56"),(0,o.kt)(l.Z,{defaultValue:"npm",groupId:"npm2yarn",values:[{label:"npm",value:"npm"},{label:"Yarn",value:"yarn"}],mdxType:"Tabs"},(0,o.kt)(u.Z,{value:"npm",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm install garfish --save\n"))),(0,o.kt)(u.Z,{value:"yarn",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add garfish\n")))),(0,o.kt)("h3",{id:"\u6ce8\u518c\u5b50\u5e94\u7528\u5e76\u542f\u52a8-garfish"},"\u6ce8\u518c\u5b50\u5e94\u7528\u5e76\u542f\u52a8 Garfish"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"// index.js\uff08\u4e3b\u5e94\u7528\u5165\u53e3\u5904\uff09\nimport Garfish from 'garfish';\n\n// \u5f53\u6267\u884c `Garfish.run` \u540e\uff0c\u6b64\u65f6 `Garfish` \u6846\u67b6\u5c06\u4f1a\u542f\u52a8\u8def\u7531\u52ab\u6301\u80fd\u529b\n// \u5f53\u6d4f\u89c8\u5668\u7684\u5730\u5740\u53d1\u751f\u53d8\u5316\u65f6\uff0c`Garfish` \u6846\u67b6\u5185\u90e8\u4fbf\u4f1a\u7acb\u5373\u89e6\u53d1\u5339\u914d\u903b\u8f91\u5f53\u5e94\u7528\u7b26\u5408\u5339\u914d\u903b\u8f91\u65f6\u5c06\u4f1a\u81ea\u52a8\u5c06\u5e94\u7528\u6302\u8f7d\u81f3\u9875\u9762\u4e2d\n// \u5e76\u4f9d\u6b21\u89e6\u53d1\u5b50\u5e94\u7528\u52a0\u8f7d\u3001\u6e32\u67d3\u8fc7\u7a0b\u4e2d\u7684\u751f\u547d\u5468\u671f\n// \u8df3\u8f6c\u81f3: /react \u65f6\uff0c\u81ea\u52a8\u6302\u8f7d react \u5e94\u7528\n// \u8df3\u8f6c\u81f3: /vue \u65f6\uff0c\u81ea\u52a8\u6302\u8f7d vue \u5e94\u7528\nGarfish.run({\n  basename: '/',\n  domGetter: '#subApp',\n  apps: [\n    {\n      // \u6bcf\u4e2a\u5e94\u7528\u7684 name \u9700\u8981\u4fdd\u6301\u552f\u4e00\n      name: 'react',\n      // \u53ef\u4e3a\u51fd\u6570\uff0c\u5f53\u51fd\u6570\u8fd4\u56de\u503c\u4e3a true \u65f6\uff0c\u6807\u8bc6\u6ee1\u8db3\u6fc0\u6d3b\u6761\u4ef6\uff0c\u8be5\u5e94\u7528\u5c06\u4f1a\u81ea\u52a8\u6302\u8f7d\u81f3\u9875\u9762\u4e2d\uff0c\u624b\u52a8\u6302\u5728\u65f6\u53ef\u4e0d\u586b\u5199\u8be5\u53c2\u6570\n      activeWhen: '/react',\n      // \u5b50\u5e94\u7528\u7684\u5165\u53e3\u5730\u5740\uff0c\u53ef\u4ee5\u4e3a HTML \u5730\u5740\u548c JS \u5730\u5740\n      // \u6ce8\u610f\uff1aentry \u5730\u5740\u4e0d\u53ef\u4ee5\u4e0e\u4e3b\u5e94\u7528+\u5b50\u5e94\u7528\u6fc0\u6d3b\u5730\u5740\u76f8\u540c\uff0c\u5426\u5219\u5237\u65b0\u65f6\u5c06\u4f1a\u76f4\u63a5\u8fd4\u56de\u5b50\u5e94\u7528\u5185\u5bb9\n      entry: 'http://localhost:3000',\n    },\n    {\n      name: 'vue',\n      activeWhen: '/vue',\n      entry: 'http://localhost:8080',\n    },\n  ],\n});\n")),(0,o.kt)("h2",{id:"\u5b50\u5e94\u7528"},"\u5b50\u5e94\u7528"),(0,o.kt)("h3",{id:"\u5b89\u88c5\u4f9d\u8d56-1"},"\u5b89\u88c5\u4f9d\u8d56"),(0,o.kt)(l.Z,{defaultValue:"npm",groupId:"npm2yarn",values:[{label:"npm",value:"npm"},{label:"Yarn",value:"yarn"}],mdxType:"Tabs"},(0,o.kt)(u.Z,{value:"npm",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @garfish/bridge --save\n"))),(0,o.kt)(u.Z,{value:"yarn",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @garfish/bridge\n")))),(0,o.kt)("h3",{id:"\u8c03\u6574\u5b50\u5e94\u7528\u7684\u6784\u5efa\u914d\u7f6e"},"\u8c03\u6574\u5b50\u5e94\u7528\u7684\u6784\u5efa\u914d\u7f6e"),(0,o.kt)(l.Z,{mdxType:"Tabs"},(0,o.kt)(u.Z,{value:"Webpack",label:"Webpack",default:!0,mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"module.exports = {\n  output: {\n    // \u9700\u8981\u914d\u7f6e\u6210 umd \u89c4\u8303\n    libraryTarget: 'umd',\n    // \u4fee\u6539\u4e0d\u89c4\u8303\u7684\u4ee3\u7801\u683c\u5f0f\uff0c\u907f\u514d\u9003\u9038\u6c99\u7bb1\n    globalObject: 'window',\n    // \u8bf7\u6c42\u786e\u4fdd\u6bcf\u4e2a\u5b50\u5e94\u7528\u8be5\u503c\u90fd\u4e0d\u76f8\u540c\uff0c\u5426\u5219\u53ef\u80fd\u51fa\u73b0 webpack chunk \u4e92\u76f8\u5f71\u54cd\u7684\u53ef\u80fd\n    // webpack 5 \u4f7f\u7528 chunkLoadingGlobal \u4ee3\u66ff\uff0c\u82e5\u4e0d\u586b webpack 5 \u5c06\u4f1a\u76f4\u63a5\u4f7f\u7528 package.json name \u4f5c\u4e3a\u552f\u4e00\u503c\uff0c\u8bf7\u786e\u4fdd\u5e94\u7528\u95f4\u7684 name \u5404\u4e0d\u76f8\u540c\n    jsonpFunction: 'vue-app-jsonpFunction',\n    // \u4fdd\u8bc1\u5b50\u5e94\u7528\u7684\u8d44\u6e90\u8def\u5f84\u53d8\u4e3a\u7edd\u5bf9\u8def\u5f84\uff0c\u907f\u514d\u5b50\u5e94\u7528\u7684\u76f8\u5bf9\u8d44\u6e90\u5728\u53d8\u4e3a\u4e3b\u5e94\u7528\u4e0a\u7684\u76f8\u5bf9\u8d44\u6e90\uff0c\u56e0\u4e3a\u5b50\u5e94\u7528\u548c\u4e3b\u5e94\u7528\u5728\u540c\u4e00\u4e2a\u6587\u6863\u6d41\uff0c\u76f8\u5bf9\u8def\u5f84\u662f\u76f8\u5bf9\u4e8e\u4e3b\u5e94\u7528\u800c\u8a00\u7684\n    publicPath: 'http://localhost:8000',\n  },\n  devServer: {\n    // \u4fdd\u8bc1\u5728\u5f00\u53d1\u6a21\u5f0f\u4e0b\u5e94\u7528\u7aef\u53e3\u4e0d\u4e00\u6837\n    port: '8000',\n    headers: {\n      // \u4fdd\u8bc1\u5b50\u5e94\u7528\u7684\u8d44\u6e90\u652f\u6301\u8de8\u57df\uff0c\u5728\u4e0a\u7ebf\u540e\u9700\u8981\u4fdd\u8bc1\u5b50\u5e94\u7528\u7684\u8d44\u6e90\u5728\u4e3b\u5e94\u7528\u7684\u73af\u5883\u4e2d\u52a0\u8f7d\u4e0d\u4f1a\u5b58\u5728\u8de8\u57df\u95ee\u9898\uff08**\u4e5f\u9700\u8981\u9650\u5236\u8303\u56f4\u6ce8\u610f\u5b89\u5168\u95ee\u9898**\uff09\n      'Access-Control-Allow-Origin': '*',\n    },\n  },\n};\n"))),(0,o.kt)(u.Z,{value:"vite",label:"Vite",default:!0,mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"// \u4f7f\u7528 Vite \u5e94\u7528\u4f5c\u4e3a\u5b50\u5e94\u7528\u65f6\uff08\u672a\u4f7f\u7528 @garfish/es-module \u63d2\u4ef6\uff09\u9700\u8981\u6ce8\u610f\uff1a\n// 1. \u9700\u8981\u5c06\u5b50\u5e94\u7528\u6c99\u7bb1\u5173\u95ed Garfish.run({ apps: [{ ..., sandbox: false }] })\n// 2. \u5b50\u5e94\u7528\u7684\u526f\u4f5c\u7528\u5c06\u4f1a\u53d1\u751f\u9003\u9038\uff0c\u5728\u5b50\u5e94\u7528\u5378\u8f7d\u540e\u9700\u8981\u5c06\u5bf9\u5e94\u5168\u5c40\u7684\u526f\u4f5c\u7528\u6e05\u9664\nexport default defineConfig({\n  // \u63d0\u4f9b\u8d44\u6e90\u7edd\u5bf9\u8def\u5f84\uff0c\u7aef\u53e3\u53ef\u81ea\u5b9a\u4e49\n  base: 'http://localhost:3000/',\n  server: {\n    port: 3000,\n    cors: true,\n    // \u63d0\u4f9b\u8d44\u6e90\u7edd\u5bf9\u8def\u5f84\uff0c\u7aef\u53e3\u53ef\u81ea\u5b9a\u4e49\n    origin: 'http://localhost:3000',\n  },\n});\n")))),(0,o.kt)("h3",{id:"\u901a\u8fc7\u5bfc\u51fa\u5b50\u5e94\u7528\u751f\u547d\u5468\u671f"},"\u901a\u8fc7\u5bfc\u51fa\u5b50\u5e94\u7528\u751f\u547d\u5468\u671f"),(0,o.kt)(l.Z,{groupId:"framework",mdxType:"Tabs"},(0,o.kt)(u.Z,{value:"React",label:"React",default:!0,mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"import React from 'react';\nimport ReactDOM from 'react-dom';\nimport { reactBridge } from '@garfish/bridge';\nimport { BrowserRouter, Switch, Route, Link } from 'react-router-dom';\n\nfunction App({ basename, dom, appName, props }) {\n  return (\n    <BrowserRouter basename={basename}>\n      <Link to=\"/\">Home</Link>\n      <Switch>\n        <Route exact path=\"/\">\n          <HelloGarfish />\n        </Route>\n      </Switch>\n    </BrowserRouter>\n  );\n}\n\nexport const provider = reactBridge({\n  // required\n  React,\n  // required\n  ReactDOM,\n  // \u975e\u5fc5\u586b\u3002\u82e5\u6307\u5b9ael\u9009\u9879\uff0c\u8bf7\u4fdd\u8bc1 el\u8282\u70b9\u5b58\u5728\u4e8e\u5f53\u524d document \u5bf9\u8c61\u4e2d\n  // \u6ce8\u610f: el \u8282\u70b9\u662f\u9488\u5bf9\u5165\u53e3\u6a21\u5f0f\u4e3a HTML \u6a21\u5f0f\u7684\u3002\u5728 JS \u5165\u53e3\u6a21\u5f0f\u4e0b\u662f\u4e0d\u5b58\u5728 el \u6982\u5ff5\u7684\uff0c\u5728\u6b64\u6a21\u5f0f\u4e0b\u53ef\u4ee5\u4e0d\u7528\u4f20 el\n  el: '#root',\n  // \u6839\u7ec4\u4ef6\n  rootComponent: App,\n  // \u8fd4\u56de\u4e00\u4e2a promise, \u53ef\u5728 mounting \u524d\u6267\u884c\u5f02\u6b65\u64cd\u4f5c\n  loadRootComponent: ({ basename, dom, appName, props }) => {\n    return Promise.resolve(App);\n  },\n});\n"))),(0,o.kt)(u.Z,{value:"Vue",label:"Vue",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"import Vue from 'vue';\nimport App from './App.vue';\nimport { vueBridge } from '@garfish/bridge';\n\nfunction newRouter(basename) {\n  const router = new VueRouter({\n    mode: 'history',\n    base: basename,\n    router,\n    routes: [{ path: '/', component: HelloGarfish }],\n  });\n  return router;\n}\n\nexport const provider = vueBridge({\n  // required\n  Vue,\n  // \u6839\u7ec4\u4ef6\n  rootComponent: App,\n\n  // \u8fd4\u56de\u4e00\u4e2a promise, \u53ef\u5728 mounting \u524d\u6267\u884c\u5f02\u6b65\u64cd\u4f5c\n  loadRootComponent: ({ basename, dom, appName, props }) => {\n    return Promise.resolve(App);\n  },\n\n  appOptions: ({ basename, dom, appName, props }) => ({\n    // \u82e5\u6307\u5b9ael\u9009\u9879\uff0c\u8bf7\u4fdd\u8bc1 el\u8282\u70b9\u5b58\u5728\u4e8e\u5f53\u524d document \u5bf9\u8c61\u4e2d\n    el: '#app',\n    router: newRouter(basename),\n  }),\n\n  handleInstance: (vueInstance, { basename }) => {\n    // received vueInstance, do something\n  },\n});\n"))),(0,o.kt)(u.Z,{value:"Vue3",label:"Vue3",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"import { h, createApp } from 'vue';\nimport { createRouter, createWebHistory } from 'vue-router';\nimport App from './App.vue';\nimport { vueBridge } from '@garfish/bridge';\n\nexport const provider = vueBridge({\n  // required\n  createApp,\n  // \u6839\u7ec4\u4ef6\n  rootComponent: App,\n\n  // \u8fd4\u56de\u4e00\u4e2a promise, \u53ef\u5728 mounting \u524d\u6267\u884c\u5f02\u6b65\u64cd\u4f5c\n  loadRootComponent: ({ basename, dom, appName, props }) => {\n    return Promise.resolve(App);\n  },\n\n  appOptions: ({ basename, dom, appName, props }) => ({\n    // \u82e5\u6307\u5b9ael\u9009\u9879\uff0c\u8bf7\u4fdd\u8bc1el\u8282\u70b9\u5b58\u5728\u4e8e\u5f53\u524ddocument\u5bf9\u8c61\u4e2d\n    el: '#app',\n    render: () => h(App),\n  }),\n\n  // received vueInstance, do something\n  handleInstance: (vueInstance, { basename }) => {\n    const routes = [\n      { path: '/index', component: Index },\n      { path: '/home', component: Home },\n    ];\n    const router = createRouter({\n      history: createWebHistory(basename),\n      base: basename,\n      routes,\n    });\n    vueInstance.use(router);\n    vueInstance.provide(stateSymbol, createState());\n  },\n});\n"))),(0,o.kt)(u.Z,{value:"custom",label:"custom",default:!0,mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"import React from 'react';\nimport ReactDOM from 'react-dom';\nimport { BrowserRouter, Switch, Route, Link } from 'react-router-dom';\n\nfunction App({ basename }) {\n  return (\n    <BrowserRouter basename={basename}>\n      <Link to=\"/\">Home</Link>\n      <Switch>\n        <Route exact path=\"/\">\n          <HelloGarfish />\n        </Route>\n      </Switch>\n    </BrowserRouter>\n  );\n}\n\nexport const provider = () => ({\n  render: ({ dom, basename }) => {\n    // \u548c\u5b50\u5e94\u7528\u72ec\u7acb\u8fd0\u884c\u65f6\u4e00\u6837\uff0c\u5c06\u5b50\u5e94\u7528\u6e32\u67d3\u81f3\u5bf9\u5e94\u7684\u5bb9\u5668\u8282\u70b9\uff0c\u6839\u636e\u4e0d\u540c\u7684\u6846\u67b6\u4f7f\u7528\u4e0d\u540c\u7684\u6e32\u67d3\u65b9\u5f0f\n    ReactDOM.render(\n      <React.StrictMode>\n        <App basename={basename} />\n      </React.StrictMode>,\n      // \u9700\u8981\u6ce8\u610f\u7684\u4e00\u70b9\u662f\uff0c\u5b50\u5e94\u7528\u7684\u5165\u53e3\u662f\u5426\u4e3a HTML \u7c7b\u578b\uff08\u5373\u5728\u4e3b\u5e94\u7528\u7684\u4e2d\u914d\u7f6e\u5b50\u5e94\u7528\u7684 entry \u5730\u5740\u4e3a\u5b50\u5e94\u7528\u7684 html \u5730\u5740\uff09\uff0c\n      // \u5982\u679c\u4e3a HTML \u7c7b\u578b\uff0c\u9700\u8981\u5728 dom \u7684\u57fa\u7840\u4e0a\u9009\u4e2d\u5b50\u5e94\u7528\u7684\u6e32\u67d3\u8282\u70b9\n      // \u5982\u679c\u4e3a JS \u7c7b\u578b\uff0c\u5219\u76f4\u63a5\u5c06 dom \u4f5c\u4e3a\u6e32\u67d3\u8282\u70b9\u5373\u53ef\n      dom.querySelector('#root'),\n    );\n  },\n\n  destroy: ({ dom, basename }) => {\n    // \u4f7f\u7528\u6846\u67b6\u63d0\u4f9b\u7684\u9500\u6bc1\u51fd\u6570\u9500\u6bc1\u6574\u4e2a\u5e94\u7528\uff0c\u5df2\u8fbe\u5230\u9500\u6bc1\u6846\u67b6\u4e2d\u53ef\u80fd\u5b58\u5728\u5f97\u526f\u4f5c\u7528\uff0c\u5e76\u89e6\u53d1\u5e94\u7528\u4e2d\u7684\u4e00\u4e9b\u7ec4\u4ef6\u9500\u6bc1\u51fd\u6570\n    // \u9700\u8981\u6ce8\u610f\u7684\u65f6\u4e00\u5b9a\u8981\u4fdd\u8bc1\u5bf9\u5e94\u6846\u67b6\u5f97\u9500\u6bc1\u51fd\u6570\u4f7f\u7528\u6b63\u786e\uff0c\u5426\u5219\u53ef\u80fd\u5bfc\u81f4\u5b50\u5e94\u7528\u672a\u6b63\u5e38\u5378\u8f7d\u5f71\u54cd\u5176\u4ed6\u5b50\u5e94\u7528\n    ReactDOM.unmountComponentAtNode(\n      dom ? dom.querySelector('#root') : document.querySelector('#root'),\n    );\n  },\n});\n")))),(0,o.kt)("h2",{id:"\u603b\u7ed3"},"\u603b\u7ed3"),(0,o.kt)("p",null,"\u4f7f\u7528 Garfish API \u642d\u5efa\u4e00\u5957\u5fae\u524d\u7aef\u4e3b\u5b50\u5e94\u7528\u7684\u4e3b\u8981\u6210\u672c\u6765\u81ea\u4e24\u65b9\u9762"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"\u4e3b\u5e94\u7528\u7684\u642d\u5efa",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"\u6ce8\u518c\u5b50\u5e94\u7528\u7684\u57fa\u672c\u4fe1\u606f"),(0,o.kt)("li",{parentName:"ul"},"\u4f7f\u7528 Garfish \u5728\u4e3b\u5e94\u7528\u4e0a\u8c03\u5ea6\u7ba1\u7406\u5b50\u5e94\u7528"))),(0,o.kt)("li",{parentName:"ul"},"\u5b50\u5e94\u7528\u7684\u6539\u9020",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"\u589e\u52a0\u5bf9\u5e94\u7684\u6784\u5efa\u914d\u7f6e"),(0,o.kt)("li",{parentName:"ul"},"\u4f7f\u7528 ",(0,o.kt)("inlineCode",{parentName:"li"},"@garfish/bridge")," \u5305\u63d0\u4f9b\u7684\u51fd\u6570\u5305\u88c5\u5b50\u5e94\u7528\u540e\u8fd4\u56de ",(0,o.kt)("inlineCode",{parentName:"li"},"provider")," \u51fd\u6570\u5e76\u5bfc\u51fa"),(0,o.kt)("li",{parentName:"ul"},"\u5b50\u5e94\u7528\u9488\u5bf9\u4e0d\u540c\u7684\u6846\u67b6\u7c7b\u578b\uff0c\u6dfb\u52a0\u4e0d\u540c ",(0,o.kt)("inlineCode",{parentName:"li"},"basename")," \u7684\u8bbe\u7f6e\u65b9\u5f0f",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"React \u5728\u6839\u7ec4\u4ef6\u4e2d\u83b7\u53d6 ",(0,o.kt)("inlineCode",{parentName:"li"},"basename")," \u5c06\u5176\u4f20\u9012\u81f3 ",(0,o.kt)("inlineCode",{parentName:"li"},"BrowserRouter")," \u7684 ",(0,o.kt)("inlineCode",{parentName:"li"},"basename")," \u5c5e\u6027\u4e2d"),(0,o.kt)("li",{parentName:"ul"},"Vue \u5c06 ",(0,o.kt)("inlineCode",{parentName:"li"},"basename")," \u4f20\u9012\u81f3 ",(0,o.kt)("inlineCode",{parentName:"li"},"VueRouter")," \u7684 ",(0,o.kt)("inlineCode",{parentName:"li"},"basename")," \u5c5e\u6027\u4e2d")))))))}h.isMDXComponent=!0}}]);