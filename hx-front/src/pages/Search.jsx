import React, { useState } from 'react';
import { Input, Button, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import FloatBtn from '../components/FloatBtn';

// 模拟后端 API
const mockApi = async (keyword) => {
    // 假设这是你从后端获取数据的过程
    console.log(`正在搜索关键字: ${keyword}...`);
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟返回数据
    if (keyword && keyword.length > 0) {
        return [
            { id: 1, title: `搜索结果 1 for "${keyword}"` },
            { id: 2, title: `搜索结果 2 for "${keyword}"` },
            { id: 3, title: `搜索结果 3 for "${keyword}"` },
        ];
    }
    return [];
};

function Search() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        setLoading(true);
        const data = await mockApi(keyword);
        setResults(data);
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>商品搜索</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Input
                        placeholder="请输入商品名称..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: 300 }}
                    />
                    <Button 
                        type="primary" 
                        icon={<SearchOutlined />} 
                        onClick={handleSearch}
                        loading={loading}
                    >
                        搜索
                    </Button>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <Spin tip="加载中..." />
                    ) : (
                        <ul>
                            {results.length > 0 ? (
                                results.map(item => (
                                    <li key={item.id} style={{ listStyle: 'none', margin: '8px 0' }}>{item.title}</li>
                                ))
                            ) : (
                                <div>请输入关键字进行搜索。</div>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            <FloatBtn />
        </>
    );
};

export default Search;