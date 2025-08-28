import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 逻辑取自 Category.jsx 所以此页面只有少量注释

import Navbar from '../components/Navbar';
import FloatBtn from '../components/FloatBtn';

import { Card } from 'antd';
import { Flex } from 'antd';
const { Meta } = Card;

import { Pagination } from "antd";

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

  // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // 因为后端设置了接收分页变量，所以直接通过一个useEffect副作用钩子(检查[]里面的内容是否更新，更新就执行)
  // 就可以完成分页，这就是最好的方法，没有比这个更笨的方法了，其他笨方法不会使得项目易懂。比如说两个(多个)副作用钩子
  // 只会使得原本容易理解，思路清晰的代码变得更混乱。有时候更笨反倒没用，不要死守kiss原则
  const fetchData = async () => {
    const response = await fetch(`http://localhost:3000/?page=${currentPage}&limit=${pageSize}`);
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

  // 监听 currentPage(页面) 和 pageSize(数据条数) 是否变化，变化就执行
  }, [currentPage, pageSize]);

  // Pagination 组件的 onChange 回调函数
  const onPageChange = (currentPage, pageSize) => {
    setCurrentPage(currentPage);
    setPageSize(pageSize);
    // 当状态更新时，useEffect 会自动重新获取数据
  };

  return (
    <>
      <Navbar />

      <Flex wrap gap="small" style={boxStyle} justify="space-evenly" align="flex-start">
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div>加载中...</div>
        ) : products.rows?.length > 0 ? (
          <ul>
            <Flex wrap gap="small" align="center">
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

            <Flex wrap gap="small" style={{'margin-top': '1em'}} justify="center" align="center">
              <Pagination
                align="center"
                defaultCurrent={1}
                current={currentPage}
                pageSize={pageSize}
                total={products.count}
                onChange={onPageChange}
              />
            </Flex>
          </ul>
        ) : (
          <div>没有找到相关商品。</div>
        )}
      </div>
      </Flex>

      <FloatBtn />
    </>
  );
};

export default Home;