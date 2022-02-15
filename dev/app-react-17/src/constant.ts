export const prefixCls = 'sub-app-react17';

export const backToMainStr = `
\`\`\`javascript
// window.history.replaceState(null, '', '/examples/main/index');
window.Garfish.router.push({ path: '/main' })
\`\`\`
`;

export const channelWithMainStr = `
\`\`\`javascript
window?.Garfish.channel.emit('event', 'hello, 我是 react17 子应用');
\`\`\`
`;

export const increaseStr = `
\`\`\`javascript
props.store.increment();
\`\`\`
`;

export const hmrStr = `
\`\`\`javascript

\`\`\`
`;

export const toVue3Str = `
\`\`\`javascript
// 子应用间跳转推荐使用 window.history.replaceState 或 Garfish.router.push
// 若使用框架自身路由 api 会默认带上basename

// 方式一：
window.history.replaceState(null, '', '/examples/vue3/home');

// 方式二：Garfish.router.push
Garfish.router.push({ path: '/vue3/home' });
\`\`\`
`;
