import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { services } from "../data/services";
import styles from "./BookingPage.module.css";

function BookingPage() {
  const navigate = useNavigate();

  const handleServiceSelect = (service) => {
    navigate("/booking/time", { state: { service } });
  };

  // 按分类组织服务
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

  return (
    <div className={styles.bookingPage}>
      <Header />

      <div className={styles.container}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>
            手部美甲服务
            <br />
            <span className={styles.pageTitleEn}>Hand Manicure Services</span>
          </h1>
        </div>

        {Object.entries(servicesByCategory).map(
          ([category, categoryServices]) => (
            <div key={category} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>
                {categoryNames[category].cn} | {categoryNames[category].en}
              </h2>
              <div className={styles.servicesGrid}>
                {categoryServices.map((service) => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceHeader}>
                      <h3 className={styles.serviceName}>
                        {service.nameCn} | {service.nameEn}
                      </h3>
                      <button
                        className={styles.addButton}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
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
        )}
      </div>
    </div>
  );
}

export default BookingPage;
