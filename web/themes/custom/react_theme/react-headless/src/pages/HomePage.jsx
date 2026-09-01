import TopicList from "../components/TopicList";
import ClientList from "../components/ClientList";
import Testimonials from "../components/Testimonials";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <h1 className="home-page-title">
        {t("app.welcomeHeading")}
      </h1>
      <TopicList />
			<ClientList />
			<Testimonials />
    </div>
  );
}
