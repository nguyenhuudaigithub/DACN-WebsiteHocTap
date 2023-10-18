'use client'
import React, { FC, useState } from 'react';
import Heading from './utils/Heading';
import Header from './components/Header';
import Hero from './components/Route/Hero'
import Statiѕtic from './components/Statiѕtic'
import Footer from './components/Footer'

interface Props {}

const Page: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");

  return (
    <div>
      <Heading
        title='NETSKILLD'
        description='NETSKILLD là một nền tảng để học sinh học hỏi và nhận được sự giúp đỡ từ giáo viên'
        keywords='Học Lập Trình,MERN,Redux,Học Máy'/>
        <Header open={open} setOpen={setOpen} activeItem={activeItem} setRoute={setRoute} route={route}/>
        <div className="container mt-24 mx-auto px-12 py-4">
        <Hero/>
        <Statiѕtic/>   
      </div>
      <Footer/>
    </div>
  );
};

export default Page;