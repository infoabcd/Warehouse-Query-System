import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Form, Input, Button, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import style from './Login.module.css';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const LoginPage = () => {
  // Ant Design Message 官方文档写法
  // {contextHolder} 写入到 return 中，是MessageApi的前端UI挂载点
  const [messageApi, contextHolder] = message.useMessage();

  // 使用编程式导航
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // // 获得存在浏览器的令牌，判断是否已经登陆(如果后端返回json，详见下方笔记)
    // const token = localStorage.getItem('authToken');

    // if (token) {
    //   // 写错了。Alert 是一个 React 组件，不能像函数一样直接在 useEffect 或 onFinish 中调用。
    //   // 在 React 中，你需要在组件的 return 语句中渲染组件。
    //   // 但在事件处理函数中，我们通常使用 Ant Design 提供的 message API 来显示短暂的提示信息。
    //   //   <Alert message="已登陆，正在跳转到后台" type="success" />
    //   // message.success('已登陆，正在跳转到后台');     // 错误写法
    //   messageApi.open({
    //     type: 'success',
    //     content: '已登陆，正在跳转到后台',
    //   });
    //   navigate('/dashboard');
    // }

    // 上面的版本，跳转太过快，而且useEffect无法使用await，无法用我们定义的sleep函数
    // 所以可以这样写

    const CheckLogin = async() => {
      // const token = localStorage.getItem('authToken');
      // 上面代码是无法定义(获取)到token的，因为我们并没有使用 json 返回 token 到前端来操作。
      // 详见下方的笔记。

      // ？ 那么我们如何得知是否已经登陆呢？
      // 「让后端来告诉你」。还记得那个中间件吧。

      // 所以下面代码不可再用
      // if (token) {
      //   messageApi.open({
      //     type: 'success',
      //     content: '已登陆，正在跳转到后台',
      //   });
      //   await sleep(2000);    // await已可用
      //   navigate('/dashboard');
      // }

      // =============================================

      // 后端写了一个 GET /login 接口来判断用户是否已经登陆
      const response = await fetch('http://localhost:3000/admin/login',
        {
          credentials: 'include'
        }
      );
      if (response.ok) {
        messageApi.open({
          type: 'success',
          content: '已登陆，正在跳转到后台',
        });
        await sleep(2000);
        navigate('/dashboard');
      };
    };

    CheckLogin();   // 记得调用，否则无反应

  },[navigate]);

  const onFinish = async (values) => {
    //onFinish 函数接收 values 是 Ant Design Form 组件的核心机制。
    // 我们不需要手动获取表单元素的值，组件已经为我们做好了这件事。
    // 工作原理见最后
    try {
      setLoading(true);
      // fetch POST 要这样写
      const response = await fetch('http://localhost:3000/admin/login', {
        method: "POST",
        mode: "cors",                         // 这个属性通常是可选的，因为 fetch 默认就会处理跨域请求
        headers: {
          'Content-Type': 'application/json', // 告诉服务器，发送的是 JSON 数据
        },
        body: JSON.stringify(values),
        credentials: 'include',       // 这行有关于下面的 localStorage.setItem('authToken', data.token);
        // 详见下面的笔记。关于设置 Cookies(让浏览器托管行为)
        // 在有需要验证的接口也记得带上这个参数
        // 因为上面的参数会告诉浏览器，这个fetch带上token
        // 否则后端是无法收到token的，会被视为未登陆
      });
      
      if (response.ok) {
        const data = await response.json();
        // localStorage.setItem('authToken', data.token);
        // 上面的代码试图从服务器返回的 JSON 数据体中找到一个名为 token 的字段。
        // 但是我们服务器返回的 console.log(data) 只是简单的「登陆成功」。
        // 而 Cookie 通过 res.cookie 的方法发送。所以无效，设置到的只会是undefined(因为data找不到这个字段)。
        
        // 记得服务器的 httpOnly: true 吗。
        // 这样，Cookie就无法储存到localStorage，也就无法 get 出来。
        // res.cookie 是让浏览器接管行为，你无须做任何事，包括写保存Cookie逻辑
        // 而 httpOnly: true 更加严格，会使得JavaScript无法访问和操作Token
        
        // <Alert message="登陆成功，正在跳转到后台" type="success" />
        messageApi.open({
          type: 'success',
          content: '登陆成功，正在跳转到后台',
        });
        navigate('/dashboard');
        setLoading(false);
      } else {
        // <Alert message="账号或密码错误" type="error" />
        console.error('账号或密码错误');
        messageApi.open({
          type: 'error',
          content: '账号或密码错误',
        });
        setLoading(false);
      }
    } catch (error) {
        console.error('网络请求出错:', error);
        messageApi.open({
          type: 'error',
          content: '网络请求失败，请稍后重试',
        });
        return [];
    } finally {
        // 无论成功或失败，都将加载状态设置为 false
        // 不然可能会导致登录失败后按钮仍然显示为加载状态，无法再次点击
        setLoading(false);
    }
  };

  return (
    <>
    {contextHolder}
    {/* 上面是 Message API 的 前端UI挂载点 */}
    <div className={style.container}>
      <div className={style.card}>
        <div className={style.header}>
          <h1 className={style.title}>
            登录
          </h1>
        </div>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          //onFinish 函数接收 values 是 Ant Design Form 组件的核心机制。
          // 我们不需要手动获取表单元素的值，组件已经为我们做好了这件事。
          // 工作原理见最后
          onFinish={onFinish}
          className={style.form}
        >
          {/* 用户名 */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入你的用户名或邮箱!' }
            ]}
          >
            <Input
              prefix={<UserOutlined className={style.icon} />}
              placeholder="用户名 / 邮箱"
            />
          </Form.Item>

          {/* 密码输入 */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入你的密码!' }]}
          >
            <Input
              prefix={<LockOutlined className={style.icon} />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div className={style.actions}>
              {/* 记住我 */}
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={style.checkbox}>记住我</Checkbox>
              </Form.Item>
              {/* 忘记密码 */}
              <a className={style.link} href="#">
                忘记密码?
              </a>
            </div>
          </Form.Item>

          {/* 登陆按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={style.button}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
    </>
  );
};

export default LoginPage;

// onFinish 的工作原理如下：

// 绑定字段：你在每个 Form.Item 上都设置了 name 属性，例如 name="username" 和 name="password"。这个 name 属性就像一个唯一的标识符，将表单项与数据模型中的键名绑定在一起。

// 自动收集：当你点击带有 htmlType="submit" 属性的按钮时，Form 组件会触发 onFinish 事件。在触发这个事件之前，它会自动遍历整个表单，找到所有带有 name 属性的 Form.Item。

// 聚合数据：Form 组件会把这些表单项的值收集起来，并打包成一个普通的 JavaScript 对象。这个对象的键就是你设置的 name，值就是用户在输入框中输入的内容。

// 传递参数：最后，这个打包好的对象 (values) 会作为参数传递给 onFinish 函数。