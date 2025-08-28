import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import Home from './pages/Home';
import Search from './pages/Search';
import Product from './pages/Products';
import Category from './pages/Category';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Dashboard from './pages/DashBoard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

function App() {

  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/search' element={<Search />}/>
            <Route path='/product/:key' element={<Product />} />
            <Route path='/category/:key' element={<Category />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/dashboard' element={<Dashboard />}/>
            <Route path='/dashboard/add-product' element={<AddProduct />}/>
            <Route path='/dashboard/edit-product/:id' element={<EditProduct />}/>
            <Route path='/*' element={<NotFound />}/>
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
