import { useTranslation } from "react-i18next";
import { useBackendStatus } from "../../hooks/BackendStatusProvider";
import { LOGO_URL } from "../../utils/brand";
import "../../css/index.css";

/**
 * Full-screen state shown in place of the app while Drupal is in maintenance
 * mode or cannot be reached. The provider keeps polling in the background and
 * this page disappears automatically once the backend answers again.
 */
export default function MaintenancePage() {
  const { t } = useTranslation();
  const { state, message } = useBackendStatus();

  const isMaintenance = state === "maintenance";
  const title = isMaintenance
    ? t("backend.maintenanceTitle")
    : t("backend.unreachableTitle");
  // Drupal's own maintenance message is usually friendlier than our default.
  const body =
    isMaintenance && message
      ? message
      : t(
          isMaintenance ? "backend.maintenanceBody" : "backend.unreachableBody",
        );

  return (
    <div className="maintenance-page" role="status" aria-live="polite">
      <div className="maintenance-card">
        <img className="maintenance-logo" src={LOGO_URL} alt="" />
        <h1 className="maintenance-title">{title}</h1>
        <p className="maintenance-body">{body}</p>
        <div className="maintenance-icon" aria-hidden="true">
          {isMaintenance ? "🛠" : "⚡"}
        </div>
      </div>
    </div>
  );
}
