import { Link } from '@arco-design/web-react';
import { LinkProps } from '@arco-design/web-react/es/Link/interface';

interface IAppLink extends LinkProps {}
const AppLink = (props: IAppLink) => {
  return (
    <Link
      onClick={props.onClick ? props.onClick : (e) => e.stopPropagation()}
      className="website-link"
      icon
      target="_blank"
      {...props}
    />
  );
};

export default AppLink;
