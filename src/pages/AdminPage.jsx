import { useState } from "react";
import Header from "../components/Header";
import Calendar from "../components/Calendar";
import { services as initialServices } from "../data/services";
import styles from "./AdminPage.module.css";

// 生成可用时间槽
const generateTimeSlots = (date) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const interval = 30; // 60分钟间隔

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

function AdminPage() {
  const [services, setServices] = useState(initialServices);
  const [editingService, setEditingService] = useState(null);
  // blockedDates 现在存储 { date: "2024-12-20", times: ["10:00", "14:30"] } 格式
  // 如果 times 为空数组，表示整个日期被屏蔽
  const [blockedDates, setBlockedDates] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings"); // services, dates, bookings
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBlockDate, setSelectedBlockDate] = useState(null);
  const [bookings, setBookings] = useState([
    // 示例预约数据
    {
      id: 1,
      customerName: "张小姐",
      phone: "0412345678",
      email: "zhang@example.com",
      service: {
        nameCn: "纯色/跳色",
        nameEn: "Solid Color/Accent Color",
        price: "$55",
      },
      date: new Date("2025-12-20"),
      time: "14:00",
      status: "confirmed", // confirmed, pending, cancelled
      createdAt: new Date("2025-12-15"),
    },
    {
      id: 2,
      customerName: "李女士",
      phone: "0423456789",
      email: "li@example.com",
      service: {
        nameCn: "猫眼",
        nameEn: "Cat Eye",
        price: "$60",
      },
      date: new Date("2025-12-21"),
      time: "15:30",
      status: "pending",
      createdAt: new Date("2025-12-16"),
    },
  ]);

  const handleEditService = (service) => {
    setEditingService({ ...service });
  };

  const handleSaveService = () => {
    if (editingService.id) {
      // 更新现有服务
      setServices(
        services.map((s) => (s.id === editingService.id ? editingService : s))
      );
    } else {
      // 添加新服务
      const newId = Math.max(...services.map((s) => s.id)) + 1;
      setServices([...services, { ...editingService, id: newId }]);
      setShowAddService(false);
    }
    setEditingService(null);
  };

  const handleDeleteService = (id) => {
    if (
      window.confirm(
        "确定要删除这个服务吗？| Are you sure you want to delete this service?"
      )
    ) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleAddService = () => {
    setEditingService({
      id: null,
      nameCn: "",
      nameEn: "",
      duration: "",
      durationEn: "",
      price: "",
      category: "本甲",
      description: "",
      descriptionCn: "",
      isAddOn: false,
    });
    setShowAddService(true);
  };

  const handleUnblockDate = (dateStr) => {
    setBlockedDates(blockedDates.filter((d) => d.date !== dateStr));
  };

  const handleUnblockTime = (dateStr, time) => {
    setBlockedDates(
      blockedDates
        .map((blocked) => {
          if (blocked.date === dateStr) {
            const newTimes = blocked.times.filter((t) => t !== time);
            // 如果没有时间段了，删除整个日期记录
            if (newTimes.length === 0) {
              return null;
            }
            return { ...blocked, times: newTimes };
          }
          return blocked;
        })
        .filter(Boolean)
    );
  };

  const handleBlockTime = (dateStr, time) => {
    const existingBlock = blockedDates.find((b) => b.date === dateStr);
    if (existingBlock) {
      // 如果日期已存在，添加时间段
      if (!existingBlock.times.includes(time)) {
        setBlockedDates(
          blockedDates.map((b) =>
            b.date === dateStr ? { ...b, times: [...b.times, time] } : b
          )
        );
      }
    } else {
      // 如果日期不存在，创建新记录
      setBlockedDates([...blockedDates, { date: dateStr, times: [time] }]);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getBlockedTimesForDate = (dateStr) => {
    const blocked = blockedDates.find((b) => b.date === dateStr);
    return blocked ? blocked.times : [];
  };

  const isDateFullyBlocked = (dateStr) => {
    const blocked = blockedDates.find((b) => b.date === dateStr);
    return blocked && blocked.times.length === 0;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => {
      const bookingDateStr = booking.date.toISOString().split("T")[0];
      return bookingDateStr === dateStr;
    });
  };

  const handleBlockDateSelect = (date) => {
    if (date) {
      setSelectedBlockDate(date);
    }
  };

  const handleBlockFullDate = (dateStr) => {
    // 屏蔽整个日期（times 为空数组表示整个日期被屏蔽）
    const existingBlock = blockedDates.find((b) => b.date === dateStr);
    if (!existingBlock) {
      setBlockedDates([...blockedDates, { date: dateStr, times: [] }]);
    }
  };

  const handleBookingDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className={styles.adminPage}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>管理面板 | Admin Panel</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "bookings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            预约管理 | Booking Management
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "dates" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("dates")}
          >
            日期管理 | Date Management
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "services" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("services")}
          >
            服务管理 | Service Management
          </button>
        </div>

        {activeTab === "services" && (
          <div className={styles.servicesSection}>
            <div className={styles.sectionHeader}>
              <h2>服务列表 | Service List</h2>
              <button
                className={styles.addServiceButton}
                onClick={handleAddService}
              >
                + 添加服务 | Add Service
              </button>
            </div>

            {/* 按分类组织服务 */}
            {(() => {
              const servicesByCategory = {
                本甲: services.filter((s) => s.category === "本甲"),
                延长: services.filter((s) => s.category === "延长"),
                卸甲: services.filter((s) => s.category === "卸甲"),
              };

              const categoryNames = {
                本甲: { cn: "本甲", en: "Basic Nails" },
                延长: { cn: "延长", en: "Extension" },
                卸甲: { cn: "卸甲", en: "Removal" },
              };

              return Object.entries(servicesByCategory).map(
                ([category, categoryServices]) => (
                  <div key={category} className={styles.categorySection}>
                    <h3 className={styles.categoryTitle}>
                      {categoryNames[category].cn} |{" "}
                      {categoryNames[category].en}
                    </h3>
                    <div className={styles.servicesGrid}>
                      {categoryServices.map((service) => (
                        <div key={service.id} className={styles.serviceCard}>
                          <div className={styles.serviceHeader}>
                            <h3 className={styles.serviceName}>
                              {service.nameCn} | {service.nameEn}
                            </h3>
                            <div className={styles.serviceActions}>
                              <button
                                className={styles.editButton}
                                onClick={() => handleEditService(service)}
                                title="编辑 | Edit"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteService(service.id)}
                                title="删除 | Delete"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className={styles.serviceInfo}>
                            <div className={styles.serviceMeta}>
                              <span className={styles.duration}>
                                {service.duration} | {service.durationEn}
                              </span>
                              <span
                                className={`${styles.price} ${
                                  service.isAddOn ? styles.addOnPrice : ""
                                }`}
                              >
                                {service.price}
                              </span>
                            </div>

                            <p className={styles.serviceDescription}>
                              {service.description}
                              <br />
                              {service.descriptionCn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              );
            })()}
          </div>
        )}

        {activeTab === "dates" && (
                  <div className={styles.datesSection}>
                      
            <div className={styles.sectionHeader}>
              <h2>屏蔽日期和时间 | Block Dates & Times</h2>
            </div>

            <Calendar
              selectedDate={selectedBlockDate}
              onDateSelect={handleBlockDateSelect}
              blockedDates={blockedDates.map((b) => b.date)}
            />

            {/* 选中日期的时间段管理 */}
            {selectedBlockDate && (
              <div className={styles.timeBlockSection}>
                <h3 className={styles.timeBlockTitle}>
                  {formatDate(selectedBlockDate.toISOString().split("T")[0])}{" "}
                  的时间段 | Time Slots
                </h3>

                <div className={styles.timeBlockActions}>
                  <button
                    className={styles.blockFullDateButton}
                    onClick={() =>
                      handleBlockFullDate(
                        selectedBlockDate.toISOString().split("T")[0]
                      )
                    }
                  >
                    屏蔽整个日期 | Block Full Date
                  </button>
                </div>

                <div className={styles.timeSlotsGrid}>
                  {generateTimeSlots(selectedBlockDate).map((time) => {
                    const dateStr = selectedBlockDate
                      .toISOString()
                      .split("T")[0];
                    const blockedTimes = getBlockedTimesForDate(dateStr);
                    const isBlocked = blockedTimes.includes(time);
                    const isFullyBlocked = isDateFullyBlocked(dateStr);

                    return (
                      <button
                        key={time}
                        className={`${styles.timeSlotButton} ${
                          isBlocked || isFullyBlocked ? styles.blocked : ""
                        }`}
                        onClick={() => {
                          if (isFullyBlocked) return;
                          if (isBlocked) {
                            handleUnblockTime(dateStr, time);
                          } else {
                            handleBlockTime(dateStr, time);
                          }
                        }}
                        disabled={isFullyBlocked}
                        title={
                          isFullyBlocked
                            ? "整个日期已被屏蔽 | Full date is blocked"
                            : isBlocked
                            ? "点击取消屏蔽 | Click to unblock"
                            : "点击屏蔽此时间段 | Click to block"
                        }
                      >
                        {formatTime(time)}
                        {isBlocked && (
                          <span className={styles.blockedIcon}>✕</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.blockedDatesList}>
              <h3 className={styles.listTitle}>
                已屏蔽日期和时间列表 | Blocked Dates & Times List
              </h3>
              {blockedDates.length === 0 ? (
                <p className={styles.emptyMessage}>
                  暂无屏蔽日期 | No blocked dates
                </p>
              ) : (
                blockedDates.map((blocked) => {
                  const isFull = blocked.times.length === 0;
                  return (
                    <div key={blocked.date} className={styles.blockedDateItem}>
                      <div className={styles.blockedDateInfo}>
                        <span className={styles.blockedDateText}>
                          {formatDate(blocked.date)}
                        </span>
                        {isFull || (
                          <div className={styles.blockedTimesList}>
                            {blocked.times.map((time) => (
                              <span
                                key={time}
                                className={styles.blockedTimeTag}
                              >
                                {formatTime(time)}
                                <button
                                  className={styles.removeTimeButton}
                                  onClick={() =>
                                    handleUnblockTime(blocked.date, time)
                                  }
                                  title="取消屏蔽 | Unblock"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        className={styles.unblockButton}
                        onClick={() => handleUnblockDate(blocked.date)}
                      >
                        取消屏蔽 | Unblock
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className={styles.bookingsSection}>
            <div className={styles.sectionHeader}>
              <h2>预约日历 | Booking Calendar</h2>
            </div>

            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleBookingDateSelect}
              bookingDates={bookings.map((booking) => ({
                date: booking.date,
              }))}
              showBookingCount={true}
            />

            {/* 选中日期的预约列表 */}
            {selectedDate && (
              <div className={styles.selectedDateBookings}>
                <h3 className={styles.selectedDateTitle}>
                  {formatDate(selectedDate.toISOString())} 的预约 | Bookings
                </h3>
                {getBookingsForDate(selectedDate).length === 0 ? (
                  <p className={styles.emptyMessage}>
                    该日期暂无预约 | No bookings for this date
                  </p>
                ) : (
                  <div className={styles.bookingsList}>
                    {getBookingsForDate(selectedDate).map((booking) => (
                      <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.bookingHeader}>
                          <div className={styles.bookingId}># {booking.id}</div>
                          {/* <span
                            className={`${styles.statusBadge} ${
                              styles[booking.status]
                            }`}
                          >
                            {booking.status === "confirmed"
                              ? "已确认 | Confirmed"
                              : booking.status === "pending"
                              ? "待确认 | Pending"
                              : "已取消 | Cancelled"}
                          </span> */}
                        </div>

                        <div className={styles.bookingContent}>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              时间 | Time:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.time}
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              客户信息 | Customer:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.customerName}
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              电话 | Phone:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.phone}
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              邮箱 | Email:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.email}
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              服务 | Service:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.service.nameCn} |{" "}
                              {booking.service.nameEn}
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingLabel}>
                              价格 | Price:
                            </div>
                            <div className={styles.bookingValue}>
                              {booking.service.price}
                            </div>
                          </div>
                        </div>

                        {/* <div className={styles.bookingActions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => {
                              alert(
                                "编辑功能开发中 | Edit feature coming soon"
                              );
                            }}
                          >
                            编辑 | Edit
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "确定要取消这个预约吗？| Are you sure you want to cancel this booking?"
                                )
                              ) {
                                setBookings(
                                  bookings.map((b) =>
                                    b.id === booking.id
                                      ? { ...b, status: "cancelled" }
                                      : b
                                  )
                                );
                              }
                            }}
                          >
                            取消 | Cancel
                          </button>
                        </div> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 编辑/添加服务模态框 */}
        {editingService && (
          <div
            className={styles.modalOverlay}
            onClick={() => setEditingService(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingService.id
                  ? "编辑服务 | Edit Service"
                  : "添加服务 | Add Service"}
              </h2>
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>中文名称 | Chinese Name *</label>
                  <input
                    type="text"
                    value={editingService.nameCn}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        nameCn: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>英文名称 | English Name *</label>
                  <input
                    type="text"
                    value={editingService.nameEn}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        nameEn: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>分类 | Category *</label>
                  <select
                    value={editingService.category}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="本甲">本甲 | Basic Nails</option>
                    <option value="延长">延长 | Extension</option>
                    <option value="卸甲">卸甲 | Removal</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>价格 | Price *</label>
                  <input
                    type="text"
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        price: e.target.value,
                      })
                    }
                    placeholder="$55 or +$40"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>时长（中文）| Duration (CN) *</label>
                  <input
                    type="text"
                    value={editingService.duration}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        duration: e.target.value,
                      })
                    }
                    placeholder="1.5小时"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>时长（英文）| Duration (EN) *</label>
                  <input
                    type="text"
                    value={editingService.durationEn}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        durationEn: e.target.value,
                      })
                    }
                    placeholder="1.5 hrs"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>描述（中文）| Description (CN)</label>
                  <textarea
                    value={editingService.descriptionCn}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        descriptionCn: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>描述（英文）| Description (EN)</label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingService.isAddOn || false}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          isAddOn: e.target.checked,
                        })
                      }
                    />
                    附加服务 | Add-on Service
                  </label>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setEditingService(null);
                      setShowAddService(false);
                    }}
                  >
                    取消 | Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveService}
                  >
                    保存 | Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
