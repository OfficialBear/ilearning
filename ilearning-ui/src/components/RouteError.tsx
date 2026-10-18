import { Button, Result } from 'antd';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export default function RouteError() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : '页面加载失败';

  return (
    <Result
      status="error"
      title={title}
      subTitle={isRouteErrorResponse(error) ? undefined : '请刷新页面或返回首页重试'}
      extra={
        <Link to="/">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  );
}
