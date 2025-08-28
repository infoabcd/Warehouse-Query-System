import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from "antd";
import { message, Typography, Table, Space, Tag } from 'antd';
const { Title } = Typography;

const boxStyle = {
  width: '100%',
  margin: '0.76em 0',
};

const columns = [
  {
    title: '商品标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '价格 (¥)',
    dataIndex: 'price',
    key: 'price',
    // 渲染函数可以自定义列的显示内容
    render: (text) => `¥ ${text}`,
  },
  {
    title: '库存',
    dataIndex: 'stock',
    key: 'stock',
  },
  {
    title: '是否促销',
    dataIndex: 'is_on_promotion',
    key: 'is_on_promotion',
    render: (is_on_promotion) => (
      <Tag color={is_on_promotion ? 'volcano' : 'green'}>
        {is_on_promotion ? '是' : '否'}
      </Tag>
    ),
  },
  {
    title: '分类',
    dataIndex: 'categories',
    key: 'categories',
    render: (categories) => (
      <Space>
        {categories.map((category) => (
          // 使用唯一的 key 来避免 React 警告
          <Tag color="blue" key={category.id}>
            {category.name}
          </Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '创建日期',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text) => {
      // 将 ISO 字符串转换为更易读的本地日期和时间
      const date = new Date(text);
      return date.toLocaleString();
    },
  },
];

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await fetch('http://localhost:3000/admin/login', {
          credentials: 'include'
        });
        
        // 如果响应不是 200 OK，说明认证失败
        if (!authResponse.ok) {
          if (authResponse.status === 403) {
            navigate('/404');
          }
          throw new Error('未找到此页面');
        }

        // 如果登录检查成功，再请求仪表盘数据
        if (authResponse.ok) {
          const response = await fetch('http://localhost:3000/', {
            credentials: 'include'
          });
          const data = await response.json();
          setData(data);
          messageApi.success('欢迎回来。')
          setLoading(false);
        }

      } catch (error) {
          setError(error.message);
          setLoading(false);
        
          // 任何错误都可能意味着未登录，可以选择跳转到 404
          // navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 空的依赖数组确保 useEffect 只在组件挂载时运行一次
  }, []); 

  // 根据加载状态、错误状态和数据进行条件渲染
  if (loading) {
    return <h1>正在加载...</h1>;
  }

  if (error) {
    return <h1>错误: {error}</h1>;
  }

  return (
    <>
      {contextHolder}

      <Flex gap="middle" align="center" vertical>

        <Flex style={boxStyle} justify="center" align="flex-start">
          <Title>仪表盘</Title>
        </Flex>
      
        <Flex justify="center" align="flex-start">
          {/* 这里的 rowKey="id" ,组件会自动识别dataSource里面的json里面的id作为key，所以直接是"id"即可 */}
          <Table rowKey="id" dataSource={data.rows} columns={columns} />
        </Flex>

      </Flex>
    </>
  );
};

export default Dashboard;
