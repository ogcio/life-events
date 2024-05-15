import HamburgerMenu from "./HamburgerMenu";
import styles from "./HamburgerMenu.module.scss";

type Props = {
  userName: string;
  menuOpen: boolean;
  handleClick: () => void;
};

export default ({ userName, menuOpen, handleClick }: Props) => (
  <div
    className={`${styles.hamburgerMenuWrapper} ${menuOpen ? styles.visible : ""}`}
  >
    {menuOpen && <div className={styles.backdrop} onClick={handleClick} />}
    <div className={`${styles.sidebar} ${menuOpen ? styles.visible : ""}`}>
      <HamburgerMenu userName={userName} handleClick={handleClick} />
    </div>
  </div>
);
