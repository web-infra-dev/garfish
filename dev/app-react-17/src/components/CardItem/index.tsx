import { Button, Card, Divider } from '@arco-design/web-react';
import MDEditor from '@uiw/react-md-editor';
import AppLink from '../Link';

interface ICardItemProps {
  title: string;
  onClick?: () => any;
  href?: string;
  content?: any;
  markdownStr?: string;
}

const CardItem = (props: ICardItemProps) => {
  const { title, onClick, href, markdownStr, content } = props;
  return (
    <Card
      hoverable
      title={
        <>
          {onClick ? (
            <Button size="mini" type={'text'} onClick={onClick}>
              {title}
            </Button>
          ) : (
            <span className="title">{title}</span>
          )}

          <Divider type="vertical" />
          <AppLink href={href}>details </AppLink>
        </>
      }
      className="card-custom-hover-style"
    >
      {content ? (
        content
      ) : (
        <MDEditor.Markdown
          style={{ overflow: 'scroll' }}
          source={markdownStr}
          linkTarget="_blank"
        />
      )}
    </Card>
  );
};

export default CardItem;
