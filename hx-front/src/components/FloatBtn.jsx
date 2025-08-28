import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

function FloatBtn() {
    return (
      <>
        {/* 右下角搜索图标，点击触发输出 onClick */}
        {/* <FloatButton onClick={() => console.log('onClick')} /> */}
        <FloatButton.Group>
            <FloatButton
            icon={<SearchOutlined />}
            description='搜索'
            onClick={() => window.open("/search", "Search")} />

            <FloatButton
            icon={<HomeOutlined />}
            description='主页'
            onClick={() => window.location.replace("/", "Home")} />
            
            <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
      </>
    );
}

export default FloatBtn;