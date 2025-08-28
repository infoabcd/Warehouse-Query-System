import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 逻辑取自 Category.jsx 所以此页面无注释

import Navbar from '../components/Navbar';
import FloatBtn from '../components/FloatBtn';

import { Card } from 'antd';
import { Flex } from 'antd';
const { Meta } = Card;

const boxStyle = {
  width: '100%',
  height: 120,
};

const cardStyle = {
  width: 240,
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const response = await fetch('http://localhost:3000/');
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    const data = await response.json();
    return data;
  }

  useEffect(() => {
        setLoading(true);
        const getData = async () => {
            const fetchedProducts = await fetchData();
            setProducts(fetchedProducts);
            setLoading(false);
        };
        getData();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div>加载中...</div>
        ) : products.rows?.length > 0 ? (
          <ul>
            <Flex wrap gap="small" style={boxStyle} justify="space-evenly" align="flex-start">
              {products.rows?.map(product => (

              // Link 包裹 Card 做到无缝跳转
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card
                  key={product.id}
                  hoverable
                  style={cardStyle}
                  title={product.title} 
                  // extra={<a href="#">商品详细</a>}
                  cover={<img alt={product.key} src={`http://localhost:3000/media/images/${product.image_url}`} />}
                >
                  <Meta title={
                    product.is_on_promotion ? (
                      `正在促销：${product.promotion_price}¥`
                    ) : (
                      `售价：${product.price}¥`
                    )
                    } description="" />
                </Card>
              </Link>
              ))}
            </Flex>
          </ul>
        ) : (
          <div>没有找到相关商品。</div>
        )}
      </div>

      <FloatBtn />
    </>
  );
};

export default Home;