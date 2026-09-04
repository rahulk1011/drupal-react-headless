import { useEffect, useState } from "react";
import { getTopics } from "../../api/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

// Helper to strip HTML tags for accurate character counting
const stripHtml = (html) => {
  if (typeof window === "undefined") return html.replace(/<[^>]*>?/gm, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

function TopicList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const { t, i18n } = useTranslation();

  const CHARACTER_LIMIT = 250;

  useEffect(() => {
    getTopics(i18n.language)
      .then((response) => setTopics(response.data.result))
      .catch((error) => console.error("Error fetching topics:", error))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="skeleton-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return <div className="no-topics">{t("dashboard.noTopicsFound")}</div>;
  }

  return (
    <div className="topic-list-container">
      <h2 className="topic-list-heading">{t("topic.topicList")}</h2>
      <Swiper
				modules={[Pagination, Navigation]}
				spaceBetween={24}
				slidesPerView={1}
				loop={true}
				centeredSlides={true}
				navigation
				pagination={{ clickable: true }}
				breakpoints={{
					1440: {
						slidesPerView: 3,
						spaceBetween: 32,
					},
				}}
				className="topic-slider"
			>
        {topics.map((topic, index) => {
          const rawDescription = topic.description || "";
          const plainText = stripHtml(rawDescription);
          const isLongText = plainText.length > CHARACTER_LIMIT;

          const truncatedText = isLongText
            ? plainText.substring(0, CHARACTER_LIMIT) + "..."
            : plainText;

          return (
            <SwiperSlide key={topic.id || index}>
              <div
                className={`topic-card${topic.trending === "yes" ? " topic-card--trending" : ""}`}
              >
                <h3 className="topic-title">{topic.title}</h3>
                <h4 className="topic-subheading">{topic.subheading}</h4>
                <div className="topic-body">
                  <p className="topic-description-text">{truncatedText}</p>
                  {topic.topic_img && (
                    <img className="topic-image" src={topic.topic_img} alt={topic.title} />
                  )}
                  {isLongText && (
                    <button
                      onClick={() => setSelectedTopic(topic)}
                      className="read-more-btn"
                    >
                      {t("dashboard.readMore")}
                    </button>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* --- MODAL --- */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
          >
            <button
              onClick={() => setSelectedTopic(null)}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="modal-title">{selectedTopic.title}</h2>
            {selectedTopic.subheading && (
              <h3 className="modal-subheading">{selectedTopic.subheading}</h3>
            )}
            <hr className="modal-divider" />
            <div
              className="modal-body"
              dangerouslySetInnerHTML={{ __html: selectedTopic.description }}
            />
            <div className="modal-footer">
              <button
                onClick={() => setSelectedTopic(null)}
                className="modal-action-btn"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicList;
