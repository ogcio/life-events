import styles from "./Banner.module.scss";

type BannerProps = {
  tag: string;
  text: string | React.ReactNode;
};

export default ({ tag, text }: BannerProps) => {
  return (
    <div className={`govie-phase-banner`}>
      <p className="govie-phase-banner__content">
        <strong className="govie-tag govie-phase-banner__content__tag">
          {tag}
        </strong>
        <span className="govie-phase-banner__text">{text}</span>
      </p>
    </div>
  );
};
