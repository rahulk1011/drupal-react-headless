import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addTopic } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function AddTopic() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentLang = i18n.language?.split("-")[0] || "en";

  const [formData, setFormData] = useState({
    title: "",
    subheading: "",
    description: "",
    trending: "no",
    image: null,
    language: currentLang,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] || null : value,
    }));
  };

  // Convert File object to Base64 string
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const base64Image = await fileToBase64(formData.image);
      const payload = {
        title: formData.title.trim(),
        subheading: formData.subheading.trim(),
        description: formData.description.trim(),
        trending: formData.trending,
        language: formData.language,
        image: base64Image,
        image_name: formData.image.name,
      };

      await addTopic(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create topic:", err);
      alert(err.message || "Failed to save topic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-task-container">
      <div className="create-task-card">
        <div className="create-task-header">
          <div>
            <h2>{t("topic.addNewTopic")}</h2>
            <p className="create-task-subtitle">
              <span className="required">*</span> {t("common.requiredFields")}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-back"
            onClick={() => navigate("/dashboard")}
            disabled={isSubmitting}
          >
            <span aria-hidden="true">&larr;</span> {t("common.backToDashboard")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              {t("common.title")} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder={t("topic.enterTitle")}
              disabled={isSubmitting}
            />
          </div>

          {/* Sub Heading */}
          <div className="form-group">
            <label htmlFor="subheading">
              {t("topic.subHeading")} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subheading"
              name="subheading"
              value={formData.subheading}
              onChange={handleInputChange}
              required
              placeholder={t("topic.enterSubHeading")}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="description">
                {t("topic.description")} <span className="required">*</span>
              </label>
              <span className="char-count">
                {formData.description.length} characters
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder={t("topic.enterDescription")}
              disabled={isSubmitting}
            />
          </div>

          {/* Topic Image */}
          <div className="form-group">
            <label htmlFor="image">
              {t("topic.image")} <span className="required">*</span>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Trending & Language */}
          <div className="form-group form-group-inline">
            <div>
              <label htmlFor="trending">
                {t("topic.trending")} <span className="required">*</span>
              </label>
              <select
                id="trending"
                name="trending"
                value={formData.trending}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="yes">{t("topic.yes")}</option>
                <option value="no">{t("topic.no")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="language">
                {t("topic.language")} <span className="required">*</span>
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="en">English</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
						<button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("common.saving") : t("topic.saveTopic")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
