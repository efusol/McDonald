import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GiAchievement, GiHamburger, GiAbstract007 } from "react-icons/gi";
import axios from "axios";
import "../../assets/css/mypage/MyInfo.css";
import { userLogin } from "../../store/member";

const MyInfo = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.member.user);
  const [userState, setUserState] = useState(user || null);
  const [orderCount, setOrderCount] = useState(0);

  // Redux 상태 복원 및 sessionStorage를 활용한 로그인 정보 복구
  useEffect(() => {
    if (!user) {
      const storedMember = sessionStorage.getItem("loginedMemberVo");
      if (storedMember) {
        const memberData = JSON.parse(storedMember);
        dispatch(userLogin(memberData)); // Redux 상태 복구
        setUserState(memberData); // 로컬 상태 복구
      }
    } else {
      setUserState(user); // Redux에서 가져온 유저 설정
    }
  }, [user, dispatch]);

  // 주문 및 포인트 정보 가져오기
  useEffect(() => {
    const fetchOrdersAndPoint = async () => {
      if (userState?.m_no) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/order/total-orders-and-point`,
            { params: { m_no: userState.m_no } }
          );
          console.log("주문 수와 포인트:", response.data);
          setOrderCount(response.data.totalOrders);
          setUserState((prevState) => ({
            ...prevState,
            point: response.data.point,
          }));
        } catch (error) {
          console.error("데이터 가져오기 실패:", error);
        }
      }
    };

    fetchOrdersAndPoint();
  }, [userState?.m_no]);

  // 유저 정보 렌더링 조건 설정
  if (!userState) {
    return <div className="myinfo-container">로그인 정보를 불러오는 중...</div>;
  }

  return (
    <div className="myinfo-container">
      <h1 className="myinfo-header">내 정보</h1>
      <div className="myinfo-details">
        <div className="myinfo-name">{userState?.m_name || "이름 없음"}</div>
        <div className="myinfo-point">
          포인트: <span>{userState?.point || 0}</span>P
        </div>
      </div>
      <div className="myinfo-achievements">
        <div className="achievement-item">
          <GiAchievement className="icon" />
          <span>{orderCount >= 1 ? "첫걸음을 땐 자" : "미달성"}</span>
        </div>
        <div className="achievement-item">
          <GiHamburger className="icon" />
          <span>{orderCount >= 10 ? "당신은 맥도날드 매니아!" : "미달성"}</span>
        </div>
        <div className="achievement-item">
          <GiAbstract007 className="icon" />
          <span>{orderCount >= 20 ? "맥도날드 정복자" : "미달성"}</span>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
