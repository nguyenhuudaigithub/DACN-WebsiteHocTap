import Link from 'next/link';
import React, { FC } from 'react';

export const navItemsData = [
  {
    name: 'Trang Chủ',
    url: '/',
  },
  {
    name: 'Khóa Học',
    url: '/courses',
  },
  {
    name: 'Chi Tiết',
    url: '/about',
  },
  {
    name: 'Chính Sách',
    url: '/policy',
  },
  {
    name: 'Câu Hỏi',
    url: '/faq',
  },
];

type Props = {
  activeItem: number;
  isMobile: boolean;
};

const NavItems: FC<Props> = ({ activeItem, isMobile }) => {
  return (
    <>
      <div className='hidden 800px:flex'>
        {navItemsData &&
          navItemsData.map((item, index) => (
            <Link href={`${item.url}`} key={index} passHref>
              <span
                className={`${
                  activeItem === index
                    ? 'dark:text-[#25a25a] text-[crimson]'
                    : 'dark:text-white text-black'
                } text-[18px] px-6 font-Poppins font-[400]`}
              >
                {item.name}
              </span>
            </Link>
          ))}
      </div>
      {isMobile && (
        <div className='800px:hidden mt-5'>
          <div className="w-full text-center py-6">
            <Link
                href={'/'}
                className={`text-[25px] font-Poppins font-[500] text-black dark:text-white`}>
                NETSKILLD
            </Link>
          </div>
            {navItemsData &&
              navItemsData.map((item, index) => (
                <Link href={`${item.url}`} key={index} passHref>
                  <span
                    className={`${
                      activeItem === index
                        ? 'dark:text-[#25a25a] text-[crimson]'
                        : 'dark:text-white text-black'
                    } block py-5 text-[18px] px-6 font-Poppins font-[400]`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
          </div>
      )}
    </>
  );
};

export default NavItems;