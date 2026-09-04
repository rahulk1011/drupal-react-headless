import React, { useEffect, useState } from "react";
import { getTopics } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

// Helper to strip HTML tags safely
const stripHtml = (html) => {
  if (typeof window === "undefined") return html.replace(/<[^>]*>?/gm, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Sub-component to manage individual card expansion state
function TopicCard({ topic }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanDescription = stripHtml(topic.description);
  
  const shouldTruncate = cleanDescription.length > 150;
  const displayedDescription = isExpanded || !shouldTruncate
    ? cleanDescription
    : cleanDescription.slice(0, 225) + "...";

  return (
    <div className={`trending-topic-cards ${isExpanded ? "expanded" : ""}`}>
			<img className="trending-topic-image" src={topic.topic_img} alt={topic.title} />
			<div className="trending-topics-content">
				<h3 className="trending-title">{topic.title}</h3>
				<h4 className="trending-subheading">{topic.subheading}</h4>
				<p className="trending-description">{displayedDescription}</p>
				{shouldTruncate && (
					<button 
						className="trending-read-more" 
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? "Read Less" : "Read More"}
					</button>
				)}
			</div>
    </div>
  );
}

function TrendingTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    getTopics(i18n.language)
      .then((response) => {
        const rawData = response.data.result || [];
        const trendingTopics = rawData.filter((topic) => {
          const isTrending = String(
            topic.trending ?? topic.field_trending ?? ""
          ).toLowerCase();
          return (
            isTrending === "yes" ||
            isTrending === "true" ||
            topic.trending === true
          );
        });
        setTopics(trendingTopics);
      })
      .catch((err) => {
        console.error("Error fetching topics:", err);
        setError("Failed to load trending topics.");
      })
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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (topics.length === 0) {
    return <div className="no-topics">{t("dashboard.noTopicsFound")}</div>;
  }

  return (
    <div className="trending-topics-container">
      <h2 className="trending-topics-heading">Trending Topics</h2>
      <div className="topics-wrapper">
        {topics.map((topic, index) => (
          <TopicCard key={topic.id || index} topic={topic} />
        ))}
      </div>
    </div>
  );
}

export default TrendingTopics;
