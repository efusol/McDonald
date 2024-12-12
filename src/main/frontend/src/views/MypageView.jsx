import React, { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/mypage/Mypage.css';
import { useDispatch } from 'react-redux';
import { userLogin } from '../store/member';

const MypageView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const storedMember = sessionStorage.getItem('loginedMemberVo');

    if (!storedMember) {
      alert('로그인이 필요합니다.');
      navigate('/member/login', { replace: true });
      return;
    }

    const memberData = JSON.parse(storedMember);
    dispatch(userLogin(memberData));

    if (location.pathname === '/mypage') {
      navigate('/mypage/myinfo');
    }
  }, [location.pathname, navigate, dispatch]);

  return (
    <div id="mypage">
      <div className="mypage-category">
        <Link to="/mypage/myinfo">
          <button className={location.pathname.startsWith('/mypage/myinfo') ? 'active' : ''}>내 정보</button>
        </Link>
        <Link to="/mypage/order">
          <button className={location.pathname.startsWith('/mypage/order') ? 'active' : ''}>주문내역</button>
        </Link>
        <Link to="/mypage/receipt">
          <button className={location.pathname.startsWith('/mypage/receipt') ? 'active' : ''}>영수증 조회</button>
        </Link>
        <Link to="/mypage/userModify">
          <button className={location.pathname === '/mypage/userModify' ? 'active' : ''}>정보수정</button>
        </Link>
        <Link to="/mypage/point">
          <button className={location.pathname.startsWith('/mypage/point') ? 'active' : ''}>포인트 사용내역</button>
        </Link>
      </div>
      <div className="mypage-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MypageView;
