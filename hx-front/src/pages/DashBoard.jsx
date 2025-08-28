import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Modal, message, Typography, Table, Space, Tag, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const boxStyle = {
  width: '100%',
  margin: '0.76em 0',
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);      // 总数据量
    // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
  const [currentPage, setCurrentPage] = useState(0);    // 当前页码
  const [pageSize, setPageSize] = useState(15);         // 每页大小

  // 控制删除确认弹窗
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // 定义一个异步函数来获取数据
  const fetchData = async (page, limit) => {
    setLoading(true);
    try {
      // 检查登录状态(GET)，没有权限直接弹404更加安全(混淆目录)
      const authResponse = await fetch('http://localhost:3000/admin/login', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
        if (authResponse.status === 403) {
          navigate('/404');
        }
        throw new Error('未找到此页面');
      }

      // 获取仪表盘数据，带上分页参数
      const response = await fetch(`http://localhost:3000/?page=${page}&limit=${limit}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setData(data.rows);
      setTotalItems(data.count);  // 设置总数据量
      
      // messageApi.success('欢迎回来。');
    } catch (error) {
        setError(error.message);
        messageApi.error('获取数据失败。');
    } finally {
        setLoading(false);
    }
  };

  // 在组件加载和分页状态变化时获取数据
  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);  // 依赖数组，当页码或每页大小改变时触发

  // 处理删除操作的函数，现在只负责打开弹窗
  const handleDelete = (productId) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };
  
  // 处理弹窗“确认”按钮
  const handleOk = async () => {
    setIsDeleteModalOpen(false);
    setLoading(true);
    try {
      // 向后端发送 DELETE 请求
      const response = await fetch(`http://localhost:3000/admin/delete/${productToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`删除失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      messageApi.success('删除成功！');
      // 删除成功后，重新获取数据来刷新表格
      await fetchData(currentPage, pageSize);
    } catch (error) {
        messageApi.error('删除失败，请检查控制台以获取更多信息。');
        console.error('删除商品失败:', error);
    } finally {
        setLoading(false);
        setProductToDelete(null); // 清空待删除商品ID
    }
  };

  // 处理弹窗“取消”按钮
  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null); // 清空待删除商品ID
  };

  // Table 的列配置
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
        const date = new Date(text);
        return date.toLocaleString();
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/dashboard/edit-product/${record.id}`)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

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
          {/* 新增按钮 */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/dashboard/add-product')}
            style={{ marginBottom: 16 }}
          >
            新增商品
          </Button>
        </Flex>

        <Flex justify="center" align="flex-start">
          <Table 
            rowKey="id" 
            dataSource={data} 
            columns={columns} 
            loading={loading}

            // 分页配置
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: (page, limit) => {
                setCurrentPage(page);
                setPageSize(limit);
              },
            }}
          />
        </Flex>
      </Flex>

      {/* 手动控制的删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={isDeleteModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确认"
        cancelText="取消"
      >
        <p>你确定要删除这条商品数据吗？</p>
      </Modal>
    </>
  );
};

export default Dashboard;