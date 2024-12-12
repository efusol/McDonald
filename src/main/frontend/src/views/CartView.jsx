import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import '../assets/css/pay/Cart.css'
import { useNavigate } from 'react-router-dom';
import { userLogin } from '../store/member';

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { user } = useSelector((state) => state.member);
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

    const fetchCartItems = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/goods/cartList`, {
          params: { m_no: user.m_no },
        });
        console.log(response.data);
        const items = Array.isArray(response.data) ? response.data : [];
        setCartItems(items);
        calculateTotal(items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/goods/updateCartQuantity`, {
        g_no: itemId,
        c_quantity: quantity,
        m_no: user.m_no,
      });
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.g_no === itemId ? { ...item, c_quantity: quantity } : item))
      );
      calculateTotal(cartItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/goods/removeFromCart`, {
        params: { g_no: itemId, m_no: user.m_no },
      });
      const updatedItems = cartItems.filter((item) => item.g_no !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.g_price * item.c_quantity, 0);
    setTotalAmount(total);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('장바구니에 상품이 없습니다. 장바구니를 확인해 주세요.');
      return;
    }
    navigate('/pay');
  };

  return (
    <div className="cart">
      <h1>장바구니</h1>
      {cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div className="cart-item" key={item.g_no}>
            <div className="product-info">
              <img src={`${import.meta.env.VITE_API_URL}/goods/image/${item.img_url}`} alt={item.g_name} style={{ width: '100px', height: 'auto' }} />
              <h2>{item.g_name}</h2>
              <div className="product-price">{item.g_price}원</div>
            </div>
            <div className="product-quantity">
              <button onClick={() => updateQuantity(item.g_no, item.c_quantity - 1)}>-</button>
              <input type="text" value={item.c_quantity} readOnly />
              <button onClick={() => updateQuantity(item.g_no, item.c_quantity + 1)}>+</button>
            </div>
            <div className="product-price">{item.g_price * item.c_quantity}원</div>
            <button className='cart-delete' onClick={() => removeItem(item.g_no)}>삭제</button>
          </div>
        ))
      ) : (
        <p>장바구니에 상품이 없습니다.</p>
      )}

      <div className="total-price">총 합계: {totalAmount}원</div>
      <button className='cart-order' onClick={handleCheckout}>주문하기</button>
    </div>
  );
};

export default CartView;
