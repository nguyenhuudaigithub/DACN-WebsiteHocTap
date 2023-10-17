'use client';
import React, { FC, useState } from 'react';
import Heading from './utils/Heading';
import Header from './components/Header';

interface Props {}

const Page: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div>
      <Heading
        title='NETSKILLD'
        description='NETSKILLD là một nền tảng để học sinh học hỏi và nhận được sự giúp đỡ từ giáo viên'
        keywords='Học Lập Trình,MERN,Redux,Học Máy'
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} />
    </div>
  );
};

export default Page;