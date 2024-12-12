import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/common/Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogin, userLogin, userLogout } from '../../store/member';
import { FaShoppingCart } from "react-icons/fa";

function Header() {
  const [headerHeight, setHeaderHeight] = useState('140px');
  const [borderBottom, setBorderBottom] = useState('none');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, admin } = useSelector((state) => state.member);

  const handleMouseEnter = () => {
    setHeaderHeight('500px');
    setBorderBottom('1px solid #FFBC0D');
  };

  const handleMouseLeave = () => {
    setHeaderHeight('140px');
    setBorderBottom('none');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loginedMemberVo');
    dispatch(userLogout());
    alert('로그아웃 되었습니다.')
    navigate('/');
  };

  useEffect(() => {
    const storedMember = sessionStorage.getItem('loginedMemberVo');
    const isAdmin = sessionStorage.getItem('isAdmin');

    if (storedMember) {
      const memberData = JSON.parse(storedMember);
      dispatch(userLogin(memberData));
      dispatch(adminLogin(isAdmin === 'true'));
    }
  }, [dispatch]);


  return (
    <header style={{ height: headerHeight, borderBottom, transition: 'height 0.5s ease' }}>
      <div className="inner">
        <h1>
          <Link to="/">
            <img alt="매그도나르도" src="/assets/image/common/logo.png" />
          </Link>
        </h1>
        <div className="content" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <ul className="depth">
            <li>
              <Link to="/goodslist?category=burger"><span>메뉴</span></Link>
              <ul className="detail">
                <li><Link to="/goodslist?category=burger">버거</Link></li>
                <li><Link to="/goodslist?category=mclunch">맥런치</Link></li>
                <li><Link to="/goodslist?category=mcmorning">맥모닝</Link></li>
                <li><Link to="/goodslist?category=happysnack">해피 스낵</Link></li>
                <li><Link to="/goodslist?category=sidedessert">사이드&디저트</Link></li>
                <li><Link to="/goodslist?category=mccafedrink">맥카페&음료</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/storeMap?category=storemap"><span>매장</span></Link>
              <ul className="detail">
                <li><Link to="/storeMap?category=storemap">매장찾기</Link></li>
                <li><Link to="/storeRent?category=store">임차문의</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/newsPro?category=pronews"><span>뉴스</span></Link>
              <ul className="detail">
                <li><Link to="/newsPro?category=pronews">프로모션</Link></li>
                <li><Link to="/newsNew?category=news">새로운 소식</Link></li>
                <li><Link to="/newsHappy?category=happynews">이달의 해피밀</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/story?category=story"><span>스토리</span></Link>
              <ul className="detail">
                <li><Link to="/storyBrand?category=brand">브랜드 소개</Link></li>
                <li><Link to="/storySocial?category=social">사회적 책임과 지원</Link></li>
                <li><Link to="/storyQuality?category=quality">맥도날드 품질 이야기</Link></li>
                <li><Link to="/storyPeople?category=people">맥도날드 사람들</Link></li>
              </ul>
            </li>
          </ul>
        </div>
        <ul className="user">
          {!user ? (
            <>
              <li><Link to="/member/login" className="member">로그인</Link></li>
              <li><Link to="/member/join" className="member">회원가입</Link></li>
            </>
          ) : (
            <>
              <li className='cart-icon'><Link to="/cart"><FaShoppingCart /></Link></li>
              {admin && (
                <li><Link to="/goodsregister">상품등록</Link></li>
              )}
              <li><Link to="/mypage">마이페이지</Link></li>
              <li><a onClick={handleLogout}>로그아웃</a></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;
