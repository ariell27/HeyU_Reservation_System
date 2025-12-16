import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import Calendar from "../components/Calendar";
import styles from "./TimeSelectionPage.module.css";

// 生成可用时间槽
const generateTimeSlots = (date) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const interval = 30; // 15分钟间隔

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

function TimeSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    // 从location state获取选中的服务
    if (location.state?.service) {
      setSelectedService(location.state.service);
    } else {
      // 如果没有服务信息，返回预约页面
      navigate("/booking");
    }
  }, [location, navigate]);

  const handleDateSelect = (date) => {
    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(date);
      setSelectedTime(null); // 重置时间选择
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeSlots = generateTimeSlots(selectedDate);

  if (!selectedService) {
    return null;
  }

  return (
    <div className={styles.timeSelectionPage}>
      <Header />

      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* 左侧：时间选择 */}
          <div className={styles.selectionPanel}>
            <div className={styles.breadcrumbs}>
              <Link to="/booking" className={styles.breadcrumbLink}>
                服务 | Service
              </Link>
              <span className={styles.separator}>›</span>
              <span className={styles.active}>时间 | Time</span>
              <span className={styles.separator}>›</span>
              <Link
                to="/booking/confirm"
                className={styles.breadcrumbLink}
                onClick={(e) => {
                  if (!selectedTime) {
                    e.preventDefault();
                    alert("请先选择时间 | Please select a time first");
                  }
                }}
                state={
                  selectedTime
                    ? {
                        service: selectedService,
                        selectedDate: selectedDate,
                        selectedTime: selectedTime,
                      }
                    : undefined
                }
              >
                确认 | Confirm
              </Link>
            </div>

            <h1 className={styles.pageTitle}>选择时间 | Select Time</h1>

            {/* 日历 */}
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />

            {/* 时间选择 */}
            {selectedDate && (
              <div className={styles.timeSection}>
                <label className={styles.label}>
                  可用时间 | Available Times
                </label>
                <div className={styles.timeSlots}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`${styles.timeSlot} ${
                        selectedTime === time ? styles.selected : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* <div className={styles.waitlistLink}>
              <a href="#">找不到合适的时间？加入候补名单</a>
            </div> */}
          </div>

          {/* 右侧：预约摘要 */}
          <div className={styles.summaryPanel}>
            <div className={styles.businessInfo}>
              <div className={styles.businessName}>HeyU禾屿</div>
              <div className={styles.businessAddress}>
                专业美甲服务 | Professional Nail Services
              </div>
            </div>

            <div className={styles.serviceSummary}>
              <div className={styles.summaryTitle}>
                服务详情 | Service Details
              </div>
              <div className={styles.serviceItem}>
                <div className={styles.serviceName}>
                  {selectedService.nameCn} | {selectedService.nameEn}
                </div>
                <div className={styles.servicePrice}>
                  {selectedService.price}
                </div>
              </div>
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalLabel}>总计 | Total</div>
              <div className={styles.totalPrice}>{selectedService.price}</div>
            </div>

            <Button
              variant="primary"
              className={styles.continueButton}
              onClick={() => {
                navigate("/booking/confirm", {
                  state: {
                    service: selectedService,
                    selectedDate: selectedDate,
                    selectedTime: selectedTime,
                  },
                });
              }}
              disabled={!selectedTime}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeSelectionPage;
