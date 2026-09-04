import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addTestimonial } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function AddTestimonial() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
		client_name: "",
    description: "",
    image: null,
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
				client_name: formData.client_name.trim(),
        description: formData.description.trim(),
        image: base64Image,
        image_name: formData.image.name,
      };

      await addTestimonial(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create testimonial:", err);
      alert(err.message || "Failed to save testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-testimonial-container">
      <div className="add-testimonial-card">
        <div className="add-testimonial-header">
          <div>
            <h2>{t("testimonial.addTestimonial")}</h2>
            <p className="add-testimonial-subtitle">
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
              placeholder={t("testimonial.enterTestimonial")}
              disabled={isSubmitting}
            />
          </div>

					{/* Client name */}
          <div className="form-group">
            <label htmlFor="client_name">
              Client Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="client_name"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              required
              placeholder="Enter client name"
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

          {/* Form Actions */}
          <div className="form-actions">
						<button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("common.saving") : t("testimonial.saveTestimonial")}
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
