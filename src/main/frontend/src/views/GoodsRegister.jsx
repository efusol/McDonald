import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../assets/css/goods/GoodsRegister.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLogin, userLogin } from '../store/member';

const GoodsRegister = () => {
  const [formData, setFormData] = useState({
    g_category: 'burger',
    g_type: 'single', // 기본값 설정
    g_name: '',
    g_english_name: '',
    g_content: '',
    g_sale_time: '',
    g_price: '',
    g_photo: null,
  });

  const [options, setOptions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const storedMember = sessionStorage.getItem('loginedMemberVo');
    const isAdmin = sessionStorage.getItem('isAdmin');

    if (storedMember) {
      const memberData = JSON.parse(storedMember);
      dispatch(userLogin(memberData));
      dispatch(adminLogin(isAdmin === 'true'));
    }

    if (!storedMember) {
      alert('로그인이 필요합니다.');
      navigate('/member/login', { replace: true });
      return;
    }

    updateOptions('burger');
  }, []);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    updateOptions(category);
  };

  const updateOptions = (category) => {
    let updatedOptions = [];
    if (category === 'burger' || category === 'mcmorning') {
      updatedOptions = [
        { value: 'single', label: '단품 메뉴' },
        { value: 'set', label: '세트 메뉴' },
      ];
    } else if (category === 'sidedessert') {
      updatedOptions = [
        { value: 'side', label: '사이드' },
        { value: 'dessert', label: '디저트' },
      ];
    } else if (category === 'mccafedrink') {
      updatedOptions = [
        { value: 'cafe', label: '맥카페' },
        { value: 'drink', label: '음료' },
      ];
    } else if (category === 'mclunch') {
      updatedOptions = [
        { value: 'mclunch', label: '맥런치' },
      ];
    } else if (category === 'happysnack') {
      updatedOptions = [
        { value: 'happysnack', label: '해피 스낵' },
      ];
    }

    setOptions(updatedOptions);

    // 옵션 리스트가 변경될 때마다 첫 번째 옵션을 자동 선택
    setFormData((prevData) => ({
      ...prevData,
      g_category: category,
      g_type: updatedOptions.length > 0 ? updatedOptions[0].value : '',
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.g_name || !formData.g_english_name || !formData.g_content || !formData.g_sale_time || !formData.g_price) {
      alert('모든 필수 항목을 입력하세요.');
      return;
    }
  
    if (!formData.g_photo) {
      alert('이미지를 업로드하세요.');
      return;
    }
  
    const submitData = new FormData();
    // JSON 데이터를 문자열로 변환하여 Blob 형태로 추가
    submitData.append('item', new Blob([JSON.stringify({
      g_category: formData.g_category,
      g_type: formData.g_type,
      g_name: formData.g_name,
      g_english_name: formData.g_english_name,
      g_content: formData.g_content,
      g_sale_time: formData.g_sale_time,
      g_price: formData.g_price,
    })], { type: 'application/json' }));
  
    // 파일 추가
    submitData.append('file', formData.g_photo);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/goods/registerGoodsConfirm`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data === '성공' || response.data === '부분성공') {
        alert('상품이 등록되었습니다.');
        setFormData({
          g_category: 'burger',
          g_type: 'single',
          g_name: '',
          g_english_name: '',
          g_content: '',
          g_sale_time: '',
          g_price: '',
          g_photo: null,
        });
        updateOptions('burger');
      } else {
        alert('상품등록이 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };
  

  return (
    <section id="register">
      <div className="inner">
        <div className="title">
          <h2>상품등록</h2>
        </div>
        <div className="goods-regi">
          <form onSubmit={handleSubmit}>
            <select name="g_category" value={formData.g_category} onChange={handleCategoryChange}>
              <option value="burger">버거</option>
              <option value="mclunch">맥런치</option>
              <option value="mcmorning">맥모닝</option>
              <option value="happysnack">해피스낵</option>
              <option value="sidedessert">사이드 & 디저트</option>
              <option value="mccafedrink">맥카페 & 음료</option>
            </select>
            <br />
            <select name="g_type" value={formData.g_type} onChange={handleChange}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input type="text" name="g_name" placeholder="상품명" value={formData.g_name} onChange={handleChange} />
            <input type="text" name="g_english_name" placeholder="상품영문명" value={formData.g_english_name} onChange={handleChange} />
            <input type="text" name="g_content" placeholder="상품설명" value={formData.g_content} onChange={handleChange} />
            <input type="text" name="g_sale_time" placeholder="판매시간" value={formData.g_sale_time} onChange={handleChange} />
            <input type="text" name="g_price" placeholder="가격" value={formData.g_price} onChange={handleChange} />
            <input type="file" name="g_photo" onChange={handleChange} />
            <div>
              <button className="btn top" type="submit">전송</button>
              <button
                className="btn"
                type="reset"
                onClick={() => {
                  setFormData({
                    g_category: 'burger',
                    g_type: 'single',
                    g_name: '',
                    g_english_name: '',
                    g_content: '',
                    g_sale_time: '',
                    g_price: '',
                    g_photo: null,
                  });
                  updateOptions('burger');
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GoodsRegister;
