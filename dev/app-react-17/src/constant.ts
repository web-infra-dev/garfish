export const prefixCls = 'sub-app-react17';

export const backToMainStr = `
\`\`\`javascript
window.history.replaceState(null, '', '/examples/main/home');
window.Garfish.router.replace({ path: '/main/home' });
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
import { hot, setConfig } from 'react-hot-loader';

const App = () => {
  return <div> App Component. </div>
}
export default hot(module)(App);
\`\`\`
`;
