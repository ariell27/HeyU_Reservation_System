import { Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import styles from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>HeyU·禾屿</h1>
          <p className={styles.address}>
            U1909 / 46 Walker St, Rhodes, NSW, 2138
            <br />
            Phone: 0422 422 422 | WeChat: HeyUbeauty27
          </p>
          <p className={styles.heroSubtitle}>
            Elevate your beauty with precision and style
            <br />
            以精湛技艺，点亮您的美丽
          </p>
        </div>
      </section>
      <section className={styles.welcomeSection}>
        <div className={styles.ctaContainer}>
          <Button variant="primary" to="/booking">
            立即预约 | Book Now
          </Button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
