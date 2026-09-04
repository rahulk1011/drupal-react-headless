import React, { useState, useEffect } from "react";
import { getTestimonials } from "../../api/client";
import "../../css/index.css";

const stripHtml = (html) => {
  if (typeof window === "undefined") return html.replace(/<[^>]*>?/gm, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getTestimonials()
      .then((response) => setTestimonials(response.data?.result || []))
      .catch((err) => console.error("Error fetching testimonials:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  if (loading) return <div className="testimonials-container"><p>Loading...</p></div>;
  if (!testimonials.length) return null;

  return (
    <div className="testimonials-container">
      <h2>Client Testimonials</h2>

      <div className="slider-wrapper">
        <button className="nav-btn prev-btn" onClick={handlePrev} aria-label="Previous Slide">
          &#10094;
        </button>

        <div className="slider-track-container">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-item">
                <div className="testimonial-content">
                  <h3>{testimonial.title}</h3>
                  <p>{stripHtml(testimonial.description)}</p>
                  <p><strong>{testimonial.client_name}</strong></p>
                </div>
                <div className="testimonial-image">
                  <img src={testimonial.testimonial_img} alt={testimonial.title} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="nav-btn next-btn" onClick={handleNext} aria-label="Next Slide">
          &#10095;
        </button>
      </div>

      <div className="t-dots-container">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`t-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
