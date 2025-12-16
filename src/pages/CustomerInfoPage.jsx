import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import { sendConfirmationEmail } from "../utils/emailService";
import styles from "./CustomerInfoPage.module.css";

function CustomerInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wechat, setWechat] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 从location state获取预约数据
    if (
      location.state?.service &&
      location.state?.selectedDate &&
      location.state?.selectedTime
    ) {
      setBookingData(location.state);
    } else {
      // 如果没有预约数据，返回预约页面
      navigate("/booking");
    }
  }, [location, navigate]);

  const validatePhone = (phone) => {
    // 简单的电话验证：支持多种格式
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 8;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "请输入姓名 | Please enter your name";
    }

    if (!phone.trim()) {
      newErrors.phone = "请输入电话号码 | Please enter your phone number";
    } else if (!validatePhone(phone)) {
      newErrors.phone =
        "请输入有效的电话号码 | Please enter a valid phone number";
    }

    if (!email.trim()) {
      newErrors.email = "请输入邮箱地址 | Please enter your email address";
    } else if (!validateEmail(email)) {
      newErrors.email =
        "请输入有效的邮箱地址 | Please enter a valid email address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      try {
        // 准备完整的预约数据
        const completeBookingData = {
          service: bookingData.service,
          selectedDate: bookingData.selectedDate,
          selectedTime: bookingData.selectedTime,
          name: name,
          email: email,
          phone: phone,
          wechat: wechat,
        };

        // 发送确认邮件
        await sendConfirmationEmail(completeBookingData);

        // 导航到成功页面，传递预约数据
        navigate("/booking/success", {
          state: {
            bookingData: completeBookingData,
          },
        });
      } catch (error) {
        console.error("提交失败:", error);
        alert(
          "提交失败，请稍后重试。 | Submission failed, please try again later."
        );
        setIsSubmitting(false);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!bookingData) {
    return null;
  }

  const { service, selectedDate, selectedTime } = bookingData;

  return (
    <div className={styles.customerInfoPage}>
      <Header />

      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* 左侧：顾客信息表单 */}
          <div className={styles.formPanel}>
            <div className={styles.breadcrumbs}>
              <Link to="/booking" className={styles.breadcrumbLink}>
                服务 | Service
              </Link>
              <span className={styles.separator}>›</span>
              <Link
                to="/booking/time"
                className={styles.breadcrumbLink}
                state={{
                  service: bookingData?.service,
                }}
              >
                时间 | Time
              </Link>
              <span className={styles.separator}>›</span>
              <span className={styles.active}>确认 | Confirm</span>
            </div>

            <h1 className={styles.pageTitle}>确认信息 | Confirm Information</h1>
            <p className={styles.pageSubtitle}>
              请填写您的联系方式，以便我们与您确认预约
              <br />
              Please provide your contact information so we can confirm your
              appointment
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  姓名 | Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className={`${styles.input} ${
                    errors.name ? styles.inputError : ""
                  }`}
                  placeholder="请输入您的姓名 | Please enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                />
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  电话号码 | Phone Number{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`${styles.input} ${
                    errors.phone ? styles.inputError : ""
                  }`}
                  placeholder="请输入您的电话号码 | Please enter your phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors({ ...errors, phone: "" });
                    }
                  }}
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  邮箱地址 | Email Address{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`${styles.input} ${
                    errors.email ? styles.inputError : ""
                  }`}
                  placeholder="请输入您的邮箱地址 | Please enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                  }}
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="wechat" className={styles.label}>
                  微信号/微信名 | WeChat ID/Name
                </label>
                <input
                  type="text"
                  id="wechat"
                  className={styles.input}
                  placeholder="请输入您的微信号或微信名（可选）| Please enter your WeChat ID or name (optional)"
                  value={wechat}
                  onChange={(e) => {
                    setWechat(e.target.value);
                  }}
                />
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  返回 | Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting
                    ? "提交中... | Submitting..."
                    : "确认预约 | Confirm Booking"}
                </Button>
              </div>
            </form>
          </div>

          {/* 右侧：预约摘要 */}
          <div className={styles.summaryPanel}>
            <div className={styles.businessInfo}>
              <div className={styles.businessName}>HeyU禾屿</div>
              <div className={styles.businessAddress}>
                专业美甲服务 | Professional Nail Services
              </div>
            </div>

            <div className={styles.bookingSummary}>
              <div className={styles.summaryTitle}>
                预约详情 | Booking Details
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>服务 | Service</div>
                <div className={styles.summaryValue}>
                  {service.nameCn} | {service.nameEn}
                </div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>日期 | Date</div>
                <div className={styles.summaryValue}>
                  {formatDate(selectedDate)}
                </div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>时间 | Time</div>
                <div className={styles.summaryValue}>
                  {formatTime(selectedTime)}
                </div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>时长 | Duration</div>
                <div className={styles.summaryValue}>{service.duration}</div>
              </div>
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalLabel}>总计 | Total</div>
              <div className={styles.totalPrice}>{service.price}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerInfoPage;
