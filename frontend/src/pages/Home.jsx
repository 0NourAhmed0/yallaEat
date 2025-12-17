import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([
    {
      text: "The best shawarma I've ever had! YallaEat never disappoints.",
      author: "Ahmed K.",
      rating: 5
    },
    {
      text: "Fast delivery, amazing food quality. My go-to restaurant!",
      author: "Sara M.",
      rating: 5
    },
    {
      text: "The kofta is to die for! Authentic Egyptian flavors.",
      author: "Mohamed H.",
      rating: 5
    }
  ]);

  useEffect(() => {
    // Fetch real feedback from the backend
    const fetchFeedback = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/feedback/public');
        
        if (res.data.data && res.data.data.length > 0) {
          const feedbackList = res.data.data.map(fb => ({
            text: fb.comment || "Great experience!",
            author: fb.userId?.name || "Anonymous",
            rating: fb.rating || 5
          }));
          setTestimonials(feedbackList.slice(0, 10)); // Show max 10 reviews
        }
      } catch (err) {
        // If fetch fails, keep default testimonials
        console.log('Using default testimonials');
      }
    };

    fetchFeedback();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">🍽️ Authentic Egyptian Cuisine</div>
          <h1 className="hero-title">
            Fresh, Delicious Food
            <br />
            <span className="gradient-text">That Will Yenasik El Homom</span>
          </h1>
          <p className="hero-subtitle">
            Experience the authentic taste of Egypt with our carefully crafted dishes,
            delivered fresh to your doorstep.
          </p>
          <div className="hero-buttons">
            <button 
              className="cta-button primary"
              onClick={() => navigate('/menu')}
            >
              <span>Explore Menu</span>
              <span className="arrow">→</span>
            </button>
            {!user && (
              <button 
                className="cta-button secondary"
                onClick={() => navigate('/register')}
              >
                Sign Up Now
              </button>
            )}
          </div>
        </div>
        <div className="hero-decorations">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose YallaEat?</h2>
            <p className="section-subtitle">
              We're committed to delivering excellence in every order
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered hot and fresh within 30 minutes or less</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Expert Chefs</h3>
              <p>Our experienced chefs bring authentic Egyptian flavors to life</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🥗</div>
              <h3>Fresh Ingredients</h3>
              <p>We use only the freshest, highest quality ingredients daily</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payment</h3>
              <p>Multiple payment options including cash and online payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="menu-preview-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Dishes</h2>
            <p className="section-subtitle">
              Discover our most loved menu items
            </p>
          </div>
          <div className="menu-categories">
            <div className="category-card">
              <div className="category-icon">🌯</div>
              <h3>Shawarma</h3>
              <p>Tender marinated meat wrapped in fresh pita</p>
              <button 
                className="category-btn"
                onClick={() => navigate('/menu')}
              >
                View Menu
              </button>
            </div>
            <div className="category-card">
              <div className="category-icon">🍖</div>
              <h3>Grilled Meats</h3>
              <p>Perfectly grilled kofta, kebab, and more</p>
              <button 
                className="category-btn"
                onClick={() => navigate('/menu')}
              >
                View Menu
              </button>
            </div>
            <div className="category-card">
              <div className="category-icon">🥙</div>
              <h3>Falafel & Foul</h3>
              <p>Traditional vegetarian favorites</p>
              <button 
                className="category-btn"
                onClick={() => navigate('/menu')}
              >
                View Menu
              </button>
            </div>
            <div className="category-card">
              <div className="category-icon">🍰</div>
              <h3>Desserts</h3>
              <p>Sweet treats like kunafa and basbousa</p>
              <button 
                className="category-btn"
                onClick={() => navigate('/menu')}
              >
                View Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Order your favorite food in 3 easy steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📱</div>
              <h3>Browse Menu</h3>
              <p>Explore our delicious menu and add items to your cart</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🛒</div>
              <h3>Place Order</h3>
              <p>Choose delivery or pickup and complete your payment</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🎉</div>
              <h3>Enjoy!</h3>
              <p>Receive your hot, fresh food and enjoy every bite</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Real reviews from real food lovers
            </p>
          </div>
          <div className="testimonial-slider">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">
                {testimonials[currentTestimonial].text}
              </p>
              <div className="testimonial-rating">
                {'★'.repeat(testimonials[currentTestimonial].rating)}
              </div>
              <p className="testimonial-author">
                — {testimonials[currentTestimonial].author}
              </p>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>Join thousands of satisfied customers and experience the best Egyptian cuisine</p>
          <div className="cta-buttons">
            <button 
              className="cta-button primary large"
              onClick={() => navigate('/menu')}
            >
              Order Now
            </button>
            {user?.role === 'customer' && (
              <button 
                className="cta-button secondary large"
                onClick={() => navigate('/reservations')}
              >
                Make a Reservation
              </button>
            )}
          </div>
        </div>
        <div className="cta-decoration">
          <div className="pulse-circle"></div>
        </div>
      </section>

      {/* Footer Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Visit Us</h3>
              <p>123 Cairo Street<br />Downtown, Egypt</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⏰</div>
              <h3>Opening Hours</h3>
              <p>Daily: 11:00 AM - 11:00 PM<br />Friday: 12:00 PM - 12:00 AM</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Contact</h3>
              <p>Phone: +20 123 456 7890<br />Email: info@yallaeat.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
