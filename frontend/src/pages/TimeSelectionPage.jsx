import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import Calendar from "../components/Calendar";
import { getBookings } from "../utils/api";
import styles from "./TimeSelectionPage.module.css";

// 从服务时长字符串中提取小时数
const parseDuration = (duration) => {
  if (!duration) return 3; // 默认3小时
  const match = duration.match(/(\d+)\s*小时/);
  return match ? parseInt(match[1], 10) : 3;
};

// 根据日期获取营业结束时间
const getEndHour = (date) => {
  if (!date) return 19; // 默认19:00
  const dayOfWeek = date.getDay(); // 0 = 周日, 1 = 周一, 2 = 周二, 3 = 周三, 4 = 周四, 5 = 周五, 6 = 周六
  // 周二和周四：22:00，其他日期：19:00
  return dayOfWeek === 2 || dayOfWeek === 4 ? 22 : 19;
};

// 检查时间段是否有足够的时长完成服务
const isTimeSlotValid = (time, serviceDuration, endHour) => {
  const [hours] = time.split(":").map(Number);
  // 检查开始时间加上服务时长是否超过营业结束时间
  return hours + serviceDuration <= endHour;
};

// 判断是否为周二/周四18:00之后
const isEveningTime = (time, date) => {
  if (!date) return false;
  const dayOfWeek = date.getDay();
  if (dayOfWeek !== 2 && dayOfWeek !== 4) return false; // 不是周二或周四
  const [hours] = time.split(":").map(Number);
  return hours >= 18; // 18:00及之后
};

// 检查时间槽是否与已预订冲突
const isTimeSlotBooked = (time, bookings, serviceDuration) => {
  if (!bookings || bookings.length === 0) return false;

  const [timeHours] = time.split(":").map(Number);
  const timeEnd = timeHours + serviceDuration;

  return bookings.some((booking) => {
    // 从后端返回的预订数据中获取时间：selectedTime 或 time 或 startTime
    const bookingTime =
      booking.selectedTime || booking.time || booking.startTime;
    if (!bookingTime) return false;

    const [bookingStartHours] = bookingTime.split(":").map(Number);
    // 从服务对象中获取时长，如果没有则使用默认值
    const bookingDuration = booking.service?.duration
      ? parseDuration(booking.service.duration)
      : booking.serviceDuration || parseDuration(booking.duration) || 3;
    const bookingEnd = bookingStartHours + bookingDuration;

    // 冲突条件：时间槽开始时间 < 预订结束时间 且 时间槽开始时间 + 服务时长 > 预订开始时间
    return timeHours < bookingEnd && timeEnd > bookingStartHours;
  });
};

// 获取指定日期的预订数据
const fetchBookingsForDate = async (date) => {
  if (!date) return [];

  try {
    const dateStr = date.toISOString().split("T")[0];
    // 使用 api.js 中的 getBookings 函数
    const bookings = await getBookings({ date: dateStr });

    // 确保返回的数据格式正确，映射字段以便后续使用
    return bookings.map((booking) => ({
      ...booking,
      // 统一时间字段：使用 selectedTime（后端返回的字段）
      time: booking.selectedTime || booking.time || booking.startTime,
      // 从服务对象中提取时长
      serviceDuration: booking.service?.duration
        ? parseDuration(booking.service.duration)
        : booking.serviceDuration || parseDuration(booking.duration) || 3,
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return []; // 出错时返回空数组
  }
};

// 生成可用时间槽
const generateTimeSlots = (date, service, bookings = []) => {
  const slotsSet = new Set(); // 使用Set去重
  const endHour = getEndHour(date); // 根据日期获取结束时间

  if (!service) {
    // 如果没有选择服务，返回空数组
    return [];
  }

  const serviceDuration = parseDuration(service.duration);
  const defaultSlots = ["09:00", "12:00", "15:00"];

  // 1. 如果没有预订，返回默认时间槽
  if (!bookings || bookings.length === 0) {
    defaultSlots.forEach((time) => {
      if (isTimeSlotValid(time, serviceDuration, endHour)) {
        slotsSet.add(time);
      }
    });

    // 周二/周四添加18:00（如果服务是3小时）
    if (date) {
      const dayOfWeek = date.getDay();
      if ((dayOfWeek === 2 || dayOfWeek === 4) && serviceDuration === 3) {
        if (isTimeSlotValid("18:00", serviceDuration, endHour)) {
          slotsSet.add("18:00");
        }
      }
    }

    const slots = Array.from(slotsSet).sort();
    return slots;
  }

  // 2. 如果有预订，动态计算可用时间槽
  // 2.1 添加默认时间槽（如果有效且不与预订冲突）
  defaultSlots.forEach((time) => {
    if (
      isTimeSlotValid(time, serviceDuration, endHour) &&
      !isTimeSlotBooked(time, bookings, serviceDuration)
    ) {
      slotsSet.add(time);
    }
  });

  // 2.2 周二/周四添加18:00（如果服务是3小时且不与预订冲突）
  if (date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      if (
        serviceDuration === 3 &&
        isTimeSlotValid("18:00", serviceDuration, endHour) &&
        !isTimeSlotBooked("18:00", bookings, serviceDuration)
      ) {
        slotsSet.add("18:00");
      }
    }
  }

  // 2.3 对于每个预订，计算上一个和下一个可用时间
  bookings.forEach((booking) => {
    // 从后端返回的预订数据中获取时间：selectedTime 或 time 或 startTime
    const bookingTime =
      booking.selectedTime || booking.time || booking.startTime;
    if (!bookingTime) return; // 如果没有时间，跳过这个预订

    const [bookingStartHours] = bookingTime.split(":").map(Number);
    // 从服务对象中获取时长，如果没有则使用默认值
    const bookingDuration = booking.service?.duration
      ? parseDuration(booking.service.duration)
      : booking.serviceDuration || parseDuration(booking.duration) || 3;
    const bookingEnd = bookingStartHours + bookingDuration;

    // 计算上一个可用时间：从默认时间槽中找到满足条件的
    defaultSlots.forEach((defaultTime) => {
      const [defaultHours] = defaultTime.split(":").map(Number);
      // 上一个可用时间条件：defaultTime + serviceDuration <= bookingStartHours
      if (defaultHours + serviceDuration <= bookingStartHours) {
        if (
          isTimeSlotValid(defaultTime, serviceDuration, endHour) &&
          !isTimeSlotBooked(defaultTime, bookings, serviceDuration)
        ) {
          slotsSet.add(defaultTime);
        }
      }
    });

    // 计算下一个可用时间：预订结束时间
    const nextAvailableTime = `${bookingEnd.toString().padStart(2, "0")}:00`;
    if (
      isTimeSlotValid(nextAvailableTime, serviceDuration, endHour) &&
      !isTimeSlotBooked(nextAvailableTime, bookings, serviceDuration)
    ) {
      // 检查是否为周二/周四晚上（18:00之后），如果是且服务是5小时，则不添加
      if (!(isEveningTime(nextAvailableTime, date) && serviceDuration === 5)) {
        slotsSet.add(nextAvailableTime);
      }
    }

    // 也检查默认时间槽中是否有在预订结束后的
    defaultSlots.forEach((defaultTime) => {
      const [defaultHours] = defaultTime.split(":").map(Number);
      // 下一个可用时间条件：defaultTime >= bookingEnd
      if (defaultHours >= bookingEnd) {
        if (
          isTimeSlotValid(defaultTime, serviceDuration, endHour) &&
          !isTimeSlotBooked(defaultTime, bookings, serviceDuration)
        ) {
          slotsSet.add(defaultTime);
        }
      }
    });
  });

  // 2.4 过滤冲突：移除与预订冲突的时间槽
  const finalSlots = Array.from(slotsSet).filter((time) => {
    // 检查是否与预订冲突
    if (isTimeSlotBooked(time, bookings, serviceDuration)) {
      return false;
    }

    // 检查是否为周二/周四晚上（18:00之后），如果是且服务是5小时，则不显示
    if (isEveningTime(time, date) && serviceDuration === 5) {
      return false;
    }

    // 检查是否有足够的时长
    return isTimeSlotValid(time, serviceDuration, endHour);
  });

  // 转换为数组并排序
  return finalSlots.sort();
};

function TimeSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedService] = useState(() => location.state?.service || null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // 如果没有服务信息，返回预约页面
    if (!location.state?.service) {
      navigate("/booking");
    }
  }, [location, navigate]);

  // 当日期变化时，获取该日期的预订数据
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate)
        .then((data) => {
          setBookings(data);
        })
        .catch((error) => {
          console.error("Error loading bookings:", error);
          setBookings([]);
        });
    }
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(date);
      setSelectedTime(null); // 重置时间选择
    }
  };

  const formatTime = (time) => {
    return time; // 24小时制显示，直接返回时间字符串
  };

  // 检查时间段是否有足够的时长完成服务
  const checkTimeSlotValid = (time) => {
    if (!selectedService) return false;
    const serviceDuration = parseDuration(selectedService.duration);
    const endHour = getEndHour(selectedDate); // 根据日期获取营业结束时间

    // 检查是否有足够的时长
    if (!isTimeSlotValid(time, serviceDuration, endHour)) {
      return false;
    }

    // 检查是否为周二/周四晚上（18:00之后），如果是且服务是5小时，则不允许
    if (isEveningTime(time, selectedDate) && serviceDuration === 5) {
      return false;
    }

    // 检查是否与已预订冲突
    if (isTimeSlotBooked(time, bookings, serviceDuration)) {
      return false;
    }

    return true;
  };

  const handleTimeSelect = (time) => {
    // 检查时间段是否有足够的时长
    if (!checkTimeSlotValid(time)) {
      alert(
        `该时间段不足以完成服务（需要${
          selectedService.duration
        }）| This time slot is not long enough for the service (requires ${
          selectedService.durationEn || selectedService.duration
        })`
      );
      return;
    }
    setSelectedTime(time);
  };

  const timeSlots = generateTimeSlots(selectedDate, selectedService, bookings);

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
                  {timeSlots.map((time) => {
                    const isValid = checkTimeSlotValid(time);
                    return (
                      <button
                        key={time}
                        className={`${styles.timeSlot} ${
                          selectedTime === time ? styles.selected : ""
                        } ${!isValid ? styles.disabled : ""}`}
                        onClick={() => handleTimeSelect(time)}
                        disabled={!isValid}
                      >
                        {formatTime(time)}
                      </button>
                    );
                  })}
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
