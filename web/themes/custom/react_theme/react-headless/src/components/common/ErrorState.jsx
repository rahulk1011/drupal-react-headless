import { useTranslation } from "react-i18next";
import "../../css/index.css";

/**
 * Shared error block for data components.
 * Use it whenever a request FAILED, so the user never mistakes an outage for an empty list.
 *
 * @param {{ message?: string, compact?: boolean }} props
 */
export default function ErrorState({ message, compact = false }) {
  const { t } = useTranslation();

  return (
    <div
      className={`error-state${compact ? " error-state--compact" : ""}`}
      role="alert"
    >
      <p className="error-state__text">{message || t("backend.genericError")}</p>
    </div>
  );
}
