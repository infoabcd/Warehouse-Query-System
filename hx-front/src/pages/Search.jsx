import React, { useState } from 'react';
import { Input, Button, Spin, message, Card, Typography, List, Divider, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FloatBtn from '../components/FloatBtn';

const { Meta } = Card;
const { Text } = Typography;

const Search = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);           // 接收到的数据
    const [currentPage, setCurrentPage] = useState(1);      // 当前页码
    const [totalItems, setTotalItems] = useState(0);        // 总条目数
    const [pageSize] = useState(15);                        // 每页条目数，与后端保持一致

    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    // 处理搜索和分页逻辑
    const handleSearch = async (page = 0) => {
        if (!keyword) {
            messageApi.warning('请输入商品名称!');
            return;
        }

        setLoading(true);
        // 如果是新的搜索，则清空结果并重置页码
        if (page === 0) {
            setResults(null);
        }

        try {
            // 发起网络请求，带上分页参数
            const response = await fetch(`http://localhost:3000/search/title/t?title=${keyword}&page=${page}&limit=${pageSize}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '网络请求失败');
            }
            const data = await response.json();
            
            if (data.rows && data.rows.length > 0) {
                setResults(data.rows);
                setTotalItems(data.count);      // 设置总条目数
                setCurrentPage(page);           // 更新当前页码
            } else {
                setResults([]);                 // 此处的空列表是为了和初始变量时候的null区分开
                setTotalItems(0);
            }

        } catch (error) {
            messageApi.error(`搜索失败: ${error.message}`);
            setResults([]);                     // 此处的空列表是为了和初始变量时候的null区分开
            setTotalItems(0);
            console.error("获取数据时出错:", error);

        } finally {
            setLoading(false);
        }
    };

    // 监听键盘事件，按下回车键时触发搜索
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 处理分页变化
    const handlePageChange = (page) => {
        handleSearch(page);
    };

    // 处理商品点击，跳转到商品详情页
    const handleCardClick = (key) => {
        navigate(`/product/${key}`); // 跳转到商品详情页
    };

    const renderResults = () => {
        if (loading) {
            return <Spin tip="加载中..." />;
        }

        if (results === null) {
            return <div>请输入关键字进行搜索。</div>;
        }

        if (results.length === 0) {
            return <div>未找到对应的商品。</div>;
        }

        return (
            <div style={{ padding: '0 20px' }}>
                <Divider orientation="left">搜索结果</Divider>
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 4,
                        xxl: 5,
                    }}
                    dataSource={results}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                hoverable
                                onClick={() => handleCardClick(item.id)}
                                cover={
                                    <img
                                        alt={item.title}
                                        src={`http://localhost:3000/media/images/${item.image_url}`}
                                        style={{ height: 200, objectFit: 'cover' }}
                                    />
                                }
                            >
                                <Meta 
                                    title={item.title} 
                                    description={
                                        <div>
                                            {item.is_on_promotion ? (
                                                <>
                                                    <Text type="danger" delete>¥{item.price}</Text>
                                                    <Text strong style={{ marginLeft: 8 }}>¥{item.promotion_price}</Text>
                                                </>
                                            ) : (
                                                <Text strong>¥{item.price}</Text>
                                            )}
                                            <div style={{ marginTop: '8px' }}>
                                                库存: {item.stock}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            {contextHolder}
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
                        onClick={() => handleSearch()}
                        loading={loading}
                    >
                        搜索
                    </Button>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    {renderResults()}
                </div>
            </div>
            <FloatBtn />
        </>
    );
};

export default Search;
