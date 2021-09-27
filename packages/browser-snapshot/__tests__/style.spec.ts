import { PatchStyle } from '../src/patchers/style';

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    document.head.innerHTML = '<style>body{color: "yellow";}</style>';

    expect(document.querySelector('head')).toMatchSnapshot();
    const sty = new PatchStyle();
    sty.activate();

    document.head.removeChild(document.head.firstChild!);
    const st = document.createElement('style');
    st.innerHTML = 'div{background: "red";}';
    document.head.appendChild(st);

    const link = document.createElement('link');
    link.href = 'www.baidu.com';
    document.head.append(link);

    sty.deactivate();

    expect(document.querySelector('head')).toMatchSnapshot();
    sty.activate();
    expect(document.querySelector('head')).toMatchSnapshot();
  });
});
