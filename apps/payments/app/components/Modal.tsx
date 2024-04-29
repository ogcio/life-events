import { getTranslations } from "next-intl/server";

export type ModalProps = {
  title: string;
  body: React.ReactNode;
  confirmActionLabel: string;
  confirmAction: (formData: FormData) => any;
  cancelActionLabel?: string;
  cancelAction?: (formData: FormData) => any;
};

export default async function Modal({
  title,
  body,
  confirmActionLabel,
  cancelAction,
  cancelActionLabel,
  confirmAction,
}: ModalProps) {
  const t = await getTranslations("Modal");

  return (
    <div className="govie-modal">
      <div className="govie-modal--overlay"></div>
      <div className="govie-modal--content" style={{ position: "absolute" }}>
        <form>
          <div className="govie-modal--close-button-container">
            <span data-module="govie-tooltip">
              <button
                data-module="govie-icon-button"
                className="govie-icon-button"
                formAction={cancelAction}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                    fill="#505A5F"
                  ></path>
                </svg>
              </button>
              <span className="govie-tooltip govie-tooltip--undefined">
                {t("close")}
              </span>
            </span>
          </div>
          <h1 className="govie-heading-s">{title}</h1>
          <div className="govie-body">{body}</div>
          <div
            className="govie-modal--buttons"
            style={{
              justifyContent: !cancelAction ? "right" : "space-between",
            }}
          >
            {cancelAction && (
              <button
                data-module="govie-button"
                className="govie-button govie-button--medium govie-button--outlined"
                formAction={cancelAction}
              >
                {cancelActionLabel ?? t("cancel")}
              </button>
            )}

            {confirmAction && (
              <button
                data-module="govie-button"
                className="govie-button govie-button--medium"
                formAction={confirmAction}
              >
                {confirmActionLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
