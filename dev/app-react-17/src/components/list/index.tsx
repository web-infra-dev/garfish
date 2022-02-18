import { Table, Button } from '@arco-design/web-react';
import { SubAppContext } from '../root';
import { IProps } from '../App';
import { useNavigate } from 'react-router-dom';
import { data } from '../constant';

const List = () => {
  const navigate = useNavigate();
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Operation',
      dataIndex: 'op',
      render: (col, record) => (
        <Button
          onClick={() => {
            // window.Garfish.router.push({ path: '/detail/${record.id}' });
            navigate({ pathname: `/detail?id=${record.id}` });
            // navigate({ pathname: `/detail/${record.id}` });
          }}
          type="primary"
          size="mini"
          disabled={record.id !== '001' && record.id !== '002'}
        >
          Detail
        </Button>
      ),
    },
  ];
  return (
    <SubAppContext.Consumer>
      {({ basename, store }: IProps) => {
        return (
          <Table
            size="small"
            columns={columns}
            data={data}
            pagination={false}
          />
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default List;
