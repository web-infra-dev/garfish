import { SubAppContext } from '../root';
import { IProps } from '../App';
import { useSearchParams } from 'react-router-dom';
import { detail } from '../constant';
import { Descriptions } from '@arco-design/web-react';
import { Breadcrumb } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import './index.less';

const BreadcrumbItem = Breadcrumb.Item;

const Detail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const content = searchParams.get('id') && detail[searchParams.get('id')!];

  return (
    <SubAppContext.Consumer>
      {({ basename, store }: IProps) => {
        return (
          <div>
            <Breadcrumb>
              <BreadcrumbItem style={{ cursor: 'pointer' }}>
                <a onClick={() => navigate({ pathname: '/list' })}>List</a>
              </BreadcrumbItem>
              <BreadcrumbItem>{searchParams.get('id')}</BreadcrumbItem>
            </Breadcrumb>

            <Descriptions
              column={1}
              title="User Info"
              data={content}
              style={{ marginBottom: 20 }}
              labelStyle={{ paddingRight: 36 }}
            />
          </div>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default Detail;
