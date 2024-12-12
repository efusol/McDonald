import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import '../assets/css/pay/PayView.css';
import { updateUser, userLogin } from '../store/member';
import { useNavigate } from 'react-router-dom';

const PayView = () => {
  const [userInfo, setUserInfo] = useState({
    m_name: '',
    m_hp: '',
    m_zipcode: '',
    m_address: '',
    m_address_sub: '',
    point: '',
  });
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const zipCodeRef = useRef(null);
  const addressRef = useRef(null);
  const addressSubRef = useRef(null);
  const user = useSelector((state) => state.member.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pointsInputRef = useRef(null);
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
  }, [user]);
  

  useEffect(() => {
    if (user && user.m_no) {
      async function fetchUserInfo() {
        try {
          const userData = await axios.get(`${import.meta.env.VITE_API_URL}/member/memberInfo`, {
            params: { m_no: user.m_no },
          });
          setUserInfo(userData.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }

      async function fetchCartItems() {
        try {
          const cartData = await axios.get(`${import.meta.env.VITE_API_URL}/goods/cartList`, {
            params: { m_no: user.m_no },
          });
          setCartItems(cartData.data);
          calculateTotal(cartData.data);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchUserInfo();
      fetchCartItems();
    }
  }, [user, isLoading]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.g_price * item.c_quantity, 0);
    setTotalAmount(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handlePointsChange = (e) => {
    const value = Number(e.target.value);
    
    setPointsToUse(value);
  };
  
  const handlePointsBlur = () => {
    let value = pointsToUse;
  
    if (value > userInfo.point) {
      alert('사용 가능한 포인트를 초과했습니다.');
      value = Math.floor(userInfo.point / 100) * 100;
      pointsInputRef.current.focus();
    } else if (value < 0) {
      value = 0;
    } else {
      value = Math.floor(value / 100) * 100;
    }
  
    setPointsToUse(value);
  };
  
  const searchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        zipCodeRef.current.value = data.zonecode;
        addressRef.current.value = data.address;
        addressSubRef.current.focus();
      }
    }).open();
  };

  const createOrderNum = () => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };


  const requestPay = () => {

    if (pointsToUse % 100 !== 0) {
      alert('포인트는 100 단위로만 사용할 수 있습니다.');
      return;
    }

    const finalAmount = totalAmount - pointsToUse; // 포인트 차감 후 최종 결제 금액
    if (finalAmount < 0) {
      alert('결제 금액은 0원 이상이어야 합니다.');
      return;
    }

    const IMP = window.IMP;
    IMP.init("imp60306008");
    const orderNumber = createOrderNum();

    IMP.request_pay({
      pg: 'kakaopay.TC0ONETIME',
      merchant_uid: orderNumber,
      name: "테스트결제",
      amount: finalAmount,
      buyer_name: userInfo.m_name,
      buyer_tel: userInfo.m_hp,
      buyer_addr: `${userInfo.m_address} ${userInfo.m_address_sub}`,
      buyer_postcode: userInfo.m_zipcode
    }, async (rsp) => {
      if (rsp.success) {
        alert("결제가 완료되었습니다.");
        try {
          const orderData = {
            o_id: orderNumber,
            m_no: user.m_no,
            o_name: userInfo.m_name,
            o_total_price: finalAmount,
            o_d_phone: userInfo.m_hp,
            o_zipcode: userInfo.m_zipcode,
            o_address: `${userInfo.m_address} ${userInfo.m_address_sub}`,
            used_points: pointsToUse,
          };

          const orderDetails = cartItems.map(item => ({
            g_no: item.g_no,
            o_d_qty: item.c_quantity,
            g_name: item.g_name,
            g_price: item.g_price,
            img_url: item.img_url,
          }));

          await axios.post(`${import.meta.env.VITE_API_URL}/payment/orderRegister`, {
            order: orderData,
            checkOutList: orderDetails,
          });

          const updatedPoint = (user.point - pointsToUse) + (finalAmount / 100);
          console.log("업데이트 전 Redux 상태:", JSON.stringify(user));
          console.log("계산된 포인트:", updatedPoint);

          // const updatedUser = { point: updatedPoint };
          // console.log("액션 페이로드:", JSON.stringify(updatedUser));

          dispatch(updateUser({ ...user, point: updatedPoint }));


          alert("주문이 성공적으로 처리되었습니다.");
          window.location.href = "/";
        } catch (error) {
          console.error("주문 처리 중 오류 발생:", error);
          alert("주문 처리 중 오류가 발생했습니다.");
        }
      } else {
        alert("결제에 실패했습니다: " + rsp.error_msg);
      }
    });
  };

  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  return (
    <div className="checkout">
      <h1>결제하기</h1>

      <div className="order-info">
        <h2>배송 정보</h2>
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="m_name"
            value={userInfo.m_name}
            onChange={handleInputChange}
            readOnly
          />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input
            type="text"
            name="m_hp"
            value={userInfo.m_hp}
            onChange={handleInputChange}
            readOnly
          />
        </div>
        <div className="form-group">
          <label>우편번호</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button type="button" onClick={searchAddress} style={{ height: '40px', marginRight: '10px' }}>
              우편번호
            </button>
            <input
              type="text"
              name="m_zipcode"
              value={userInfo.m_zipcode}
              onChange={handleInputChange}
              required
              style={{ width: '100px', marginBottom: '0', textAlign: 'center' }}
            />
          </div>
        </div>
        <div className="form-group">
          <label>주소</label>
          <input
            type="text"
            name="m_address"
            value={userInfo.m_address}
            onChange={handleInputChange}
            required
            readOnly
          />
        </div>
        <div className="form-group">
          <label>상세주소</label>
          <input
            type="text"
            name="m_address_sub"
            value={userInfo.m_address_sub}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="product-list">
        <h2>주문 상품</h2>
        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.g_no} className="product-item">
              <img src={`${import.meta.env.VITE_API_URL}/goods/image/${item.img_url}`} alt={item.g_name} />
              <div>{item.g_name} (수량: {item.c_quantity})</div>
              <div>{item.g_price * item.c_quantity}원</div>
            </div>
          ))
        ) : (
          <p>장바구니에 상품이 없습니다.</p>
        )}
      </div>
      <div className="points">
        <h3>포인트 사용</h3>
        <p>사용 가능한 포인트: {userInfo.point}P</p>
        <label>
          사용할 포인트:
          <input
            ref={pointsInputRef}
            type="number"
            value={pointsToUse}
            onChange={handlePointsChange}
            onBlur={handlePointsBlur}
            min="0"
            max={user.point}
            step="100"
          />
        </label>
        <p className="points-info">※ 포인트는 100 단위로만 사용 가능합니다.</p>
      </div>

      <div className="total-price">총 합계: {totalAmount - pointsToUse}원</div>
      <button id="submitOrder" onClick={requestPay}>결제하기</button>
    </div>
  );
};

export default PayView;
