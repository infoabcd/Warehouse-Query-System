import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Flex, Divider, List, Tag } from 'antd';
import { Typography, Spin, Alert, Image, Button } from 'antd';
import { ArrowLeftOutlined, PoundCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

function Product() {
  const navigate = useNavigate();
  // useParams 钩子用于从 URL 中获取动态参数。
  // 在这里，它获取 URL 路径中的 'key' 参数，例如 /products/123 中的 '123'。
  const { key } = useParams();

  // 1. 使用 useState 钩子来管理组件的状态。
  // productData 存储从 API 获取的商品数据。
  // loading 跟踪数据是否正在加载中，用于显示加载提示。
  // error 存储请求失败时的错误信息。
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useEffect 钩子用于处理“副作用”，比如数据获取。
  // useEffect 确保 fetchData 函数只在组件挂载时或 key 变化时执行。
  // 依赖项数组 [key] 是关键：当 key 的值改变时，useEffect 会重新执行。
  // 这可以防止无限循环。
  useEffect(() => {
    // 异步函数 fetchData 用于发起网络请求。
    const fetchData = async () => {
      try {
        // 请求开始，设置 loading 为 true
        setLoading(true);

        // 使用 await 等待 API 响应
        const response = await fetch(`http://localhost:3000/products/${key}`,
          {
            credentials: 'include'
            // 上面的参数是告诉浏览器，这个fetch带上token
            // 否则后端是无法收到token的，会被视为未登陆
          }
        );
        
        // 检查响应状态码。如果不是 2xx，则抛出错误。
        if (!response.ok) {
          throw new Error('网络请求失败');
        }
        
        // 解析响应数据为 JSON 格式
        const data = await response.json();
        
        // 请求成功，更新商品数据和错误状态
        setProductData(data);
        setError(null);
      } catch (err) {
        // 捕获请求过程中发生的任何错误，并更新错误状态
        setError(err.message);
      } finally {
        // finally 块总会执行，无论请求成功还是失败。
        // 这是设置 loading 状态为 false 的最佳位置。
        setLoading(false);
      }
    };

    // 只有当 key 存在时才执行数据获取
    if (key) {
      fetchData();
    }
  }, [key]);

  // 3. 基于不同的状态进行条件渲染，为用户提供清晰的反馈。
  // 如果正在加载，显示加载提示
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" tip="正在加载..." /></div>;
  }

  // 如果有错误，显示错误信息
  if (error) {
    return <div style={{ padding: '20px' }}><Alert message="错误" description={error} type="error" showIcon /></div>;
  }

  // 如果数据为空（例如，API 返回空），或者后端返回了特定的消息，显示找不到商品的提示
  if (!productData || productData.message === '没有找到对应的商品.') {
    return <div style={{ padding: '20px' }}><Alert message="未找到商品" description="找不到该商品信息。" type="warning" showIcon /></div>;
  }

  // 4. 如果所有条件都通过，渲染完整的商品数据
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 返回上一页按钮，使用 navigate(-1) 实现 */}
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px' }}
      >
        返回上一页
      </Button>

      <Divider>商品详细</Divider>

      <Card
        hoverable
        // 确保你的 Product.css 文件中定义了 .product-card 类
        className="product-card"
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Flex justify="center" align="center" gap={32}>
          <Image
            width={350}
            alt={productData.title}
            src={`http://localhost:3000/media/images/${productData.image_url}`}
            style={{ borderRadius: 8 }}
          />
          <List
            header={<Title level={3} style={{ margin: 0 }}>{productData.title}</Title>}
            style={{ width: '100%' }}
          >
            {/* 1. 使用三元表达式判断字段是否存在，并美化价格样式 */}
            {productData.price ? (
              <List.Item>
                <List.Item.Meta
                  title="价格"
                  description={<Text strong style={{ fontSize: 20, color: '#52c41a' }}>{productData.price}¥</Text>}
                />
              </List.Item>
            ) : null}

            {productData.original_price ? (
              <List.Item>
                <List.Item.Meta title="进货价格" description={`${productData.original_price}¥`} />
              </List.Item>
            ) : null}

            {productData.promotion_price ? (
              <List.Item>
                <List.Item.Meta title="促销价格" description={`${productData.promotion_price}¥`} />
              </List.Item>
            ) : null}

            {productData.is_on_promotion ? (
              <List.Item>
                <List.Item.Meta
                  title="正在促销"
                  description={<Tag color="green">{productData.is_on_promotion ? '是' : '否'}</Tag>}
                />
              </List.Item>
            ) : null}

            {productData.discount_amount ? (
              <List.Item>
                <List.Item.Meta title="折扣金额" description={`${productData.discount_amount}¥`} />
              </List.Item>
            ) : null}

            {productData.stock ? (
              <List.Item>
                <List.Item.Meta title="库存" description={`${productData.stock}`} />
              </List.Item>
            ) : null}

            {productData.description ? (
              <List.Item>
                <List.Item.Meta
                  title="描述"
                  description={<Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '更多' }}>{productData.description}</Paragraph>}
                />
              </List.Item>
            ) : null}

            {productData.created_at ? (
              <List.Item>
                <List.Item.Meta title="创建时间" description={new Date(productData.created_at).toLocaleString()} />
              </List.Item>
            ) : null}
            
            {productData.updated_at ? (
              <List.Item>
                <List.Item.Meta title="更新时间" description={new Date(productData.updated_at).toLocaleString()} />
              </List.Item>
            ) : null}
          </List>
        </Flex>
      </Card>
    </div>
  );
}

export default Product;
