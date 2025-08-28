import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Button, message, Typography, Switch, Upload, Spin, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const EditProduct = () => {
  const { id } = useParams();       // 获取 URL 中的商品ID
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFileName, setImageFileName] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 硬编码的分类数据 - 对应数据库
  const categoriesList = [
    { id: 1, name: '碗筷' },
    { id: 2, name: '厨房用具' },
    { id: 3, name: '日常用具' },
    { id: 4, name: '胶制品' },
    { id: 5, name: '铁制品' },
    { id: 6, name: '农业工具' },
    { id: 7, name: '特价商品' },
  ];

  // 获取商品数据并填充到待编辑表单
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('获取商品数据失败');
        }
        const product = await response.json();
        
        // 预填充表单，并从后端数据中提取分类ID
        const initialCategories = product.categories ? product.categories.map(cat => cat.id) : [];

        form.setFieldsValue({
          title: product.title,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          is_on_promotion: product.is_on_promotion,
          promotion_price: product.promotion_price,
          stock: product.stock,
          categories: initialCategories,              // 这里顺便预填充分类
        });

        // 设置图片信息
        if (product.image_url) {
          setImageFileName(product.image_url);
          setImageUrl(`http://localhost:3000/media/images/${product.image_url}`);
        }
      } catch (error) {
          messageApi.error('加载商品数据失败，请检查控制台。');
          console.error('加载商品数据出错:', error);
      } finally {
          setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, form, messageApi]);

  ///////////////////////////////
  //  处理自定义图片上传逻辑      //
  //  包含文件和上传进度回调      //
  //////////////////////////////
  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);
    setImageLoading(true);

    try {
      const response = await fetch('http://localhost:3000/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`图片上传失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      const data = await response.json();
      messageApi.success('图片上传成功！');
      setImageFileName(data.fileName);                                      // 保存新文件名到变量
      setImageUrl(`http://localhost:3000/media/images/${data.fileName}`);   // 保存新图片URL到变量
      onSuccess(data);
    } catch (error) {
        messageApi.error('图片上传失败，请检查控制台。');
        onError(error);
        console.error('图片上传出错:', error);
    } finally {
        setImageLoading(false);
    }
  };

  //////////////////////////////
  //  处理表单提交（更新商品）    //
  //  表单字段值                //
  //////////////////////////////
  const onFinish = async (values) => {
    if (!imageFileName) {
      messageApi.error('商品图片不能为空！');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        // 展开表达式
        ...values,
        imagePath: imageFileName, // 使用当前的文件名
        is_on_promotion: values.is_on_promotion || false,
        promotion_price: values.is_on_promotion ? values.promotion_price : null,
      };
      
      const response = await fetch(`http://localhost:3000/admin/update/${id}`, {
        method: 'PUT',   // 使用 PUT 方法进行更新
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`更新商品失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      navigate('/dashboard'); // 导航回仪表盘
      messageApi.success('商品更新成功！');
    } catch (error) {
        messageApi.error('更新商品失败，请检查控制台。');
        console.error('更新商品出错:', error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="add-product-container p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" tip="加载商品数据..." />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="add-product-container p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <Title level={2} className="text-center mb-6">编辑商品</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="title"
              label="商品名称"
              rules={[{ required: true, message: '请输入商品名称！' }]}
            >
              <Input placeholder="商品名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="商品描述"
            >
              <Input.TextArea rows={4} placeholder="商品详细描述" />
            </Form.Item>

            <Form.Item
              name="price"
              label="售卖价格 (¥)"
              rules={[{ required: true, message: '请输入售卖价格！' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
            </Form.Item>

            <Form.Item
              name="original_price"
              label="进货价格 (¥)"
              rules={[{ required: true, message: '请输入进货价格！' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
            </Form.Item>

            <Form.Item
              name="is_on_promotion"
              label="是否促销"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            {form.getFieldValue('is_on_promotion') && (
              <Form.Item
                name="promotion_price"
                label="促销价格 (¥)"
                rules={[{ required: true, message: '请输入促销价格！' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
              </Form.Item>
            )}

            <Form.Item
              name="stock"
              label="库存"
              rules={[{ required: true, message: '请输入库存量！' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>

            <Form.Item
              name="categories"
              label="商品分类"
              rules={[{ required: true, message: '请选择商品分类！' }]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="请选择分类"
              >
                {categoriesList.map(cat => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="商品图片"
            >
              <Dragger
                name="image"
                multiple={false}
                listType="picture-card"
                className="add-product-dragger"
                showUploadList={false}
                customRequest={handleImageUpload}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="商品图片预览" style={{ width: '100%' }} />
                ) : (
                  <div>
                    <p className="ant-upload-drag-icon">
                      <PlusOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  </div>
                )}
              </Dragger>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading || imageLoading}
                >
                  更新商品
                </Button>
                {/* 取消就返回到仪表盘 */}
                <Button 
                  onClick={() => navigate('/dashboard')}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditProduct;