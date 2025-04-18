import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

interface Props {
  children: React.ReactNode;
}

const Layout = ({children}: Props) => {

  
  return (
    <div className='flex flex-col min-h-screen'>
      <Header></Header>
      <Hero></Hero>
      <div className='container mx-auto'>
        <SearchBar />
      </div>
      <div className="container mx-auto py-10 flex-1">{children}</div>
      <Footer></Footer>
    </div>
  );
}

export default Layout;
