import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MacCommandOutlined, ShoppingOutlined, TagOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, Typography } from 'antd';
const { Title } = Typography;

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
      <a href="/login" target="_blank" rel="noopener noreferrer">
        -会员登陆-
      </a>
    ),
    icon: <UserOutlined />
  },
];

function Navbar() {
    const [current, setCurrent] = useState('');
    const navigate = useNavigate(); // 编程式导航 使用 useNavigate 的 hook

    const onClick = (e) => {
        console.log('点击了 ', e.key);
        setCurrent(e.key);
        
        // 根据菜单的 key 决定请求哪个分类的数据
        // 使用 switch case 逻辑来构建目标路由
        let category = '';
        switch (e.key) {
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
        
        // 执行导航，跳转到带参数的URL
        navigate(`/category/${category}`);
        // 不要使用 Link =>> <Link to={`/category/${category}`} />
        // 不要混淆了声明式 <Link> 和编程式 useNavigate(hook) 的用法
    };

    return (
        <>
            <div>
                {/* 渲染 Ant Design 导航菜单 */}
                <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
            </div>
        </>
    );
};

export default Navbar;