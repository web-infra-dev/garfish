import { useState, useCallback, useEffect } from 'react';
import { Modal, Grid, Button, Message } from '@arco-design/web-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { basename } from '../../constant';
import { observer } from 'mobx-react';
import { loadAppFunc } from '../../loadApp';
import './index.css';
import logo from '../../static/img/undraw_docusaurus_mountain.svg';

const Row = Grid.Row;
const Col = Grid.Col;

const HomePage = observer(({ store }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [app, setApp] = useState<any>(null);

  const loadApplication = useCallback(async () => {
    console.log('loadApplication');

    const app = await loadAppFunc({
      id: 'loadApp_vite',
      domID: 'submodule',
      appName: 'dev/vite',
    });

    // const app = await loadAppFunc({
    //   id: 'loadApp_vite',
    //   domID: 'submodule',
    //   appName: 'dev/react16',
    // });

    setApp(app);
  }, [app]);

  useEffect(() => {
    return () => {
      app && app.hide();
    };
  }, [app]);

  return (
    <Row
      className="grid-demo"
      gutter={[24, 12]}
      style={{
        marginBottom: 16,
        backgroundColor: 'var(--color-fill-2)',
      }}
    >
      <Col span={8} className="col-btn">
        <Button onClick={() => setVisible(true)} type="primary">
          【主应用】测试 Modal
        </Button>

        <Button onClick={loadApplication} type="primary">
          【主应用】手动挂载应用
        </Button>
        {app && (
          <div>
            <Button onClick={() => (app.display ? app.hide() : app.show())}>
              display toggle
            </Button>

            {/* <Button
              onClick={() => {
                app.unmount();
                setApp(undefined);
              }}
            >
              {app ? '销毁' : '挂载'}
            </Button> */}
          </div>
        )}

        <Button
          type="primary"
          onClick={() => navigate(`/${basename}/react17/home`)}
        >
          【主应用】跳转子应用 react17
        </Button>
      </Col>
      <Col span={16}>
        {!app && <img style={{ width: '400px' }} src={logo} alt="" />}
        <div id="submodule"></div>
      </Col>
      <Modal
        title="Modal Title"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <p>
          You can customize modal body text by the current situation. This modal
          will be closed immediately once you press the OK button.
        </p>
      </Modal>
    </Row>
  );
});

export default HomePage;
