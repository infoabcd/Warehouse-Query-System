import React, { useState, useEffect } from 'react';
// import css from './Navbar.module.css'

import { MacCommandOutlined, ShoppingOutlined, TagOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, Typography } from 'antd';
const { Title } = Typography;

const fetchData = async (menuKey) => {
    let category = '';

    // 根据菜单的 key 决定请求哪个分类的数据
    switch (menuKey) {
        case 'All':
            category = '0';
            break;
        case 'Tableware':
            category = '1';
            break;
        case 'Kitchenware':
            category = '2';
            break;
        case 'DailyUtensils':
            category = '3';
            break;
        case 'RubberProducts':
            category = '4';
            break;
        case 'IronProducts':
            category = '5';
            break;
        case 'AgriculturalTools':
            category = '6';
            break;
        case 'SpecialOffers':
            category = '7';
            break;
        default:
            category = '0'; // 默认获取所有数据
    }
    console.log(`正在获取分类ID为 "${category}" 的数据...`);

    try {
        // 使用 fetch 向后端发送请求，并添加查询参数。如果category为0，就直接往 / 获取数据(所有商品)
        // 但是有一些小问题和插曲。问题本质是 /(所有数据) 和 /assort(分区数据)，不在一个路由下，所以书写
        // 习惯(return)未能统一，导致的问题。目前已经修改了 /assort(分区数据) 的 return。
        // 把 searchData 本应该和 / 一样在 rows集合 的数据改回。(或者修改rows为searchData)
        if (category == '0') {
            const response = await fetch(`http://localhost:3000/`);
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
            const response = await fetch(`http://localhost:3000/search/assort/${category}`);
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
};

const items = [
  {
    label: '所有商品',
    key: 'All',
    icon: <MacCommandOutlined />
},
{
    label: '碗筷',
    key: 'Tableware',
    icon: <TagOutlined />
},
{
    label: '厨房用具',
    key: 'Kitchenware',
    icon: <TagOutlined />
},
{
    label: '日常用具',
    key: 'DailyUtensils',
    icon: <TagOutlined />
},
{
    label: '胶制品',
    key: 'RubberProducts',
    icon: <TagOutlined />
},
{
    label: '铁制品',
    key: 'IronProducts',
    icon: <TagOutlined />
},
{
    label: '农业工具',
    key: 'AgriculturalTools',
    icon: <TagOutlined />
  },
  {
    label: '特价商品',
    key: 'SpecialOffers',
    icon: <DollarOutlined />
  },
  
  {
    key: 'login',
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        -会员登陆-
      </a>
    ),
    icon: <UserOutlined />
  },
];

function Navbar() {
    // 1. 管理当前选中项的状态
    const [current, setCurrent] = useState('');
    // 2. 管理从后端获取的数据
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // 3. 使用 useEffect 监听 `current` 的变化
    useEffect(() => {
        setLoading(true);
        const getData = async () => {
            const fetchedProducts = await fetchData(current);
            setProducts(fetchedProducts);
            setLoading(false);
        };
        getData();
    }, [current]); // 将 `current` 作为依赖项，当它改变时 useEffect 重新运行

    const onClick = (e) => {
        console.log('点击了 ', e.key);
        setCurrent(e.key);
    };

    return (
        <>
            <div>
                {/* 渲染 Ant Design 导航菜单 */}
                <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />

                <div style={{ padding: '20px' }}>
                    {/* <Title level={3}>已获得该分区下的数据</Title> */}
                    {/* 4. 根据 loading 状态和 products 数据渲染内容 */}
                    {/* 这里的products.xxx.lenth是导致报错的原因，因为 / 和 /assort 返回的数据所在集合不相同*/}
                    {/* 记得products.rows?.length。有问号有问号有问号，不然偶尔(大部份时间)会抽风报错，这是良好的JavaScript书写习惯 */}
                    {loading ? (
                        <div>加载中...</div>
                    ) : products.rows?.length > 0 ? (
                        <ul>
                            {products.rows?.map(product => (
                                <li key={product.id}>{product.title} - ¥{product.price}</li>
                            ))}
                        </ul>
                    ) : (
                        <div>没有找到相关商品。</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;

// 记得products.rows?.length。有问号有问号有问号，不然偶尔(大部份时间)会抽风报错，这是良好的JavaScript书写习惯
// 为什么？
// ?. 叫做可选链操作符（Optional Chaining）。避免处理到 null 或 undefined 的数据时报错。
// 在代码中，products 的初始状态是一个空数组 []。当第一次渲染时，products.rows 是 undefined，因为空数组没有 rows 这个属性。
// 没有可选链：如果写 products.rows.length，在第一次渲染时，JavaScript 会尝试访问 undefined 的 rows 属性，然后就会抛出 TypeError: Cannot read properties of undefined (reading 'length') 错误。
// 有了可选链：如果写 products.rows?.length，JavaScript 会先检查 products.rows 是否为 null 或 undefined。如果它是，整个表达式会立即停止求值，并返回 undefined，而不是报错。
// 因此，使用可选链操作符可以确保你的代码在任何时候都不会因为数据未就绪而崩溃，这是一种非常好的防御性编程习惯～～