// 修改这个路由的根本原因是 - 分页。
// 后端在 / 路由支持分页的变量，所以直接修改useEffect状态钩子的访问就好
// 让其带上分页变量去get路由
import Reatct, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import FloatBtn from '../components/FloatBtn';

import { Card } from 'antd';
import { Flex } from 'antd';
const { Meta } = Card;

import { Pagination } from "antd";  // 分页组件

const boxStyle = {
  width: '100%',
  height: 120,
};

const cardStyle = {
  width: 240,
};

function Category() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);

    // 来自 App.js =>> <Route path='/category/:key' element={<Category />}/>
    // useParams() 会返回一个对象，其键就是路由中定义的参数名（如 key）
    const { key } = useParams();
    // 现在可以用 key 的值来请求数据了。例如：useEffect(() => { fetchCategory(key) }, [key]);
    
    const fetchData = async (key, currentPage, pageSize) => {
        try {
            setLoading(true)
            // 使用 fetch 向后端发送请求，并添加查询参数。如果category(key)为0，就直接往 / 获取数据(所有商品)
            // 但是有一些小问题和插曲。问题本质是 /(所有数据) 和 /assort(分区数据)，不在一个路由下，所以书写
            // 习惯(return)未能统一，导致的问题。目前已经修改了 /assort(分区数据) 的 return。
            // 把 searchData 本应该和 / 一样在 rows集合 的数据改回。(或者修改rows为searchData)

            // 实现分页功能
            if (key == '0') {
                const response = await fetch(`http://localhost:3000/?page=${currentPage}&limit=${pageSize}`);
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                const data = await response.json();
                // console.log(data.rows)
                // 后端测试，因为所有数据和分区数据不在一个路由
                // 目前已经修正，把分区的 searchData(数据所在集)换为和 / 一样的在 rows 中
                // return data.rows;
                // 直接返回 data 所以下面代码如果希望获得数据，就要 data.rows
                return data;
            } else {
                const response = await fetch(`http://localhost:3000/search/assort/${key}?page=${currentPage}&limit=${pageSize}`);
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                const data = await response.json();
                // console.log(data.searchData);
                // 后端测试，因为所有数据和分区数据不在一个路由
                // 目前已经修正，把 searchData 换为和 / 一样的 rows
                return data;
            }
        } catch (error) {
            console.error("获取数据时出错:", error);
            return [];
        }
    }

    // 使用 useEffect 监听 key 和(或者) currentPage, pageSize 的变化
    useEffect(() => {
        setLoading(true);
        const getData = async () => {
            const fetchedProducts = await fetchData(key, currentPage, pageSize);
            setProducts(fetchedProducts);
            setLoading(false);
        };
        getData();
    }, [key, currentPage, pageSize]); // 将 key, currentPage, pageSize 作为依赖项，当它改变时 useEffect 重新运行

    // Pagination 组件的 onChange 回调函数
    const onPageChange = (page, newPageSize) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
        // 当状态更新时，useEffect 会自动重新获取数据
    };

    return (
        <>
            <Navbar />

            <Flex wrap gap="small" style={boxStyle} justify="space-evenly" align="flex-start">
            <div style={{ padding: '20px' }}>
                {/* <Title level={3}>已获得该分区下的数据</Title> */}
                {/* 根据 loading 状态和 key 数据渲染内容 */}
                {/* 这里的products.xxx.lenth是导致报错的原因，因为 / 和 /assort 返回的数据所在集合不相同*/}
                {/* 记得products.rows?.length。有问号有问号有问号，不然偶尔(大部份时间)会抽风报错，这是良好的JavaScript书写习惯 */}
                {loading ? (
                    <div>加载中...</div>
                ) : products.rows?.length > 0 ? (
                    <ul>
                        <Flex wrap gap="small" align="center">
                            {products.rows?.map(product => (
                                // 展示数据测试是否正常
                                // <li key={product.id}>{product.title} - ¥{product.price} - {product.image_url}</li>

                                // Link 包裹 Card 做到无缝跳转
                                <Link key={product.id} to={`/product/${product.id}`}>
                                <Card
                                    key={product.id}
                                    hoverable
                                    style={cardStyle}
                                    title={product.title} 
                                    // extra={<a href={"#"}>商品详细</a>}
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

export default Category;

// 记得products.rows?.length。有问号有问号有问号，不然偶尔(大部份时间)会抽风报错，这是良好的JavaScript书写习惯
// 为什么？
// ?. 叫做可选链操作符（Optional Chaining）。避免处理到 null 或 undefined 的数据时报错。
// 在代码中，products 的初始状态是一个空数组 []。当第一次渲染时，products.rows 是 undefined，因为空数组没有 rows 这个属性。
// 没有可选链：如果写 products.rows.length，在第一次渲染时，JavaScript 会尝试访问 undefined 的 rows 属性，然后就会抛出 TypeError: Cannot read properties of undefined (reading 'length') 错误。
// 有了可选链：如果写 products.rows?.length，JavaScript 会先检查 products.rows 是否为 null 或 undefined。如果它是，整个表达式会立即停止求值，并返回 undefined，而不是报错。
// 因此，使用可选链操作符可以确保你的代码在任何时候都不会因为数据未就绪而崩溃，这是一种非常好的防御性编程习惯～～