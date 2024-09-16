import { getTranslations } from "next-intl/server";
import styles from "./Footer.module.scss";

export default async () => {
  const t = await getTranslations("Footer");

  return (
    <footer
      className="govie-footer"
      role="contentinfo"
      style={{ width: "100%", marginTop: "auto" }}
    >
      <div className={`${styles.footerContainer} govie-width-container`}>
        <div className="custom-footer govie-footer__meta">
          <div className="govie-footer__meta-item">
            <a
              className="govie-footer__link govie-footer__copyright-logo"
              href="#"
            >
              <span className="govie-visually-hidden">Copyright logo</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
