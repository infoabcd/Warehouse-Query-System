import React from 'react';
import style from './NotFound.module.css'; 
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
      navigate(-1);
  };

  const handleGoHome = () => {
      navigate('/');
  };

  return (
    <div className={style['not-found-container']}>
      <div className={style['not-found-content']}>
        <h1 className={style['not-found-title']}>404</h1>
        <h2 className={style['not-found-subtitle']}>页面找不到了</h2>
        <p className={style['not-found-text']}>
          抱歉，你访问的页面可能已被移除、名称已更改或暂时不可用。
        </p>
        <div className={style['not-found-actions']}>
          <button className={style['not-found-button']} onClick={handleGoBack}>
            返回上一页
          </button>
          <button className={`${style['not-found-button']} ${style['not-found-button-home']}`} onClick={handleGoHome}>
            返回首页
          </button>
        </div>
      </div>
    </div>
    );
};

export default NotFound;

