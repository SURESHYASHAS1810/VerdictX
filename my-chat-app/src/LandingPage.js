import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Scale, 
  FileText, 
  Brain, 
  Search, 
  MessageSquare,
  Gavel,
  ChevronRight,
  X,
  Sparkles,
  ArrowUp
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      // Scroll to show the features section higher up
      const windowHeight = window.innerHeight;
      const targetPosition = Math.max(0, featuresSection.offsetTop - windowHeight * 0.15);
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const features = [
    {
      icon: <Scale size={32} />,
      title: 'Judgement Prediction',
      shortDesc: 'AI-powered verdict forecasting',
      fullDesc: 'Leverage advanced machine learning algorithms to predict case outcomes with high accuracy. Our AI analyzes historical case data, judge patterns, and legal precedents to provide data-driven insights into potential verdicts. This feature helps legal professionals make informed decisions and prepare more effective strategies for their cases.',
      color: '#8b5cf6'
    },
    {
      icon: <Gavel size={32} />,
      title: 'Bail Analysis',
      shortDesc: 'Comprehensive bail eligibility assessment',
      fullDesc: 'Get instant, comprehensive bail eligibility assessments powered by AI. Our system evaluates case details, criminal history, flight risk factors, and judicial precedents to provide detailed bail recommendations. This tool helps lawyers and defendants understand bail prospects and prepare stronger bail applications with data-backed arguments.',
      color: '#ec4899'
    },
    {
      icon: <FileText size={32} />,
      title: 'Case Summarization',
      shortDesc: 'Intelligent document summarization',
      fullDesc: 'Transform lengthy legal documents into concise, actionable summaries in seconds. Our AI extracts key facts, legal issues, arguments, and conclusions from complex case files, judgments, and legal documents. Save hours of reading time while ensuring you capture all critical information needed for case preparation.',
      color: '#f59e0b'
    },
    {
      icon: <Search size={32} />,
      title: 'Information Extraction',
      shortDesc: 'Automated legal data extraction',
      fullDesc: 'Automatically extract and organize critical information from legal documents. Our AI identifies and categorizes dates, names, case numbers, legal provisions, citations, and other key data points. This feature streamlines document review, enables faster case analysis, and ensures no important detail is overlooked.',
      color: '#10b981'
    },
    {
      icon: <Brain size={32} />,
      title: 'Document Drafting',
      shortDesc: 'AI-assisted legal document creation',
      fullDesc: 'Create professional legal documents with AI assistance. From petitions and affidavits to contracts and notices, our system helps draft legally sound documents tailored to your specific needs. The AI suggests appropriate legal language, ensures proper formatting, and incorporates relevant legal provisions, significantly reducing drafting time.',
      color: '#3b82f6'
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'VerdictX QAI',
      shortDesc: 'Interactive legal AI assistant',
      fullDesc: 'Engage with our intelligent legal assistant for instant answers to your legal questions. VerdictX QAI understands complex legal queries, provides relevant case law references, explains legal concepts, and offers guidance on legal procedures. It\'s like having a legal expert available 24/7 to support your research and decision-making.',
      color: '#ef4444'
    }
  ];

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    setShowFeatureModal(true);
  };

  // Features grid container style
  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px'
  };

  const closeModal = () => {
    setShowFeatureModal(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      fontFamily: 'Poppins, sans-serif',
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: (100 + i * 50) + 'px',
              height: (100 + i * 50) + 'px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              top: (Math.random() * 100) + '%',
              left: (Math.random() * 100) + '%',
              animation: `float ${10 + i * 2}s ease-in-out infinite`,
              animationDelay: (i * 0.5) + 's'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(20px); }
          50% { transform: translateY(-60px) translateX(-20px); }
          75% { transform: translateY(-30px) translateX(20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        /* Media query for responsive grid */
        @media (max-width: 1024px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div className="fade-in-up" style={{ 
            marginBottom: '32px',
            animationDelay: '0.1s',
            opacity: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '300px',
            height: '120px',
            margin: '0 auto 32px',
            backgroundColor: 'transparent'
          }}
          ref={(el) => {
            if (el) {
              setTimeout(() => {
                el.style.opacity = '1';
              }, 100);
            }
          }}>
            <img 
              src="/VerdictX4.png"
              alt="VerdictX"
              style={{
                width: '100%',
                height: '100%',
                margin: '0 auto',
                display: 'block',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.target.onerror = null;
                e.target.src = '/VerdictX2.png';
              }}
              onLoad={(e) => {
                console.log('Image loaded successfully');
              }}
            />
          </div>

          {/* Tagline */}
          <h1 className="fade-in-up" style={{
            fontSize: '72px',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 24px 0',
            letterSpacing: '-2px',
            lineHeight: '1.1',
            animationDelay: '0.2s',
            opacity: 0,
            fontFamily: 'Alata, sans-serif'
          }}>
            Into the Legal Unknown
          </h1>

          {/* Description */}
          <p className="fade-in-up" style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px auto',
            lineHeight: '1.6',
            animationDelay: '0.3s',
            opacity: 0,
            fontFamily: 'Alata, sans-serif'
          }}>
            Harness the power of AI to predict judgements, analyze bail applications, 
            and navigate the complexities of the Indian legal system with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="fade-in-up" style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animationDelay: '0.4s',
            opacity: 0
          }}>
            <button
              onClick={() => navigate('/signin')}
              style={{
                padding: '18px 48px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#667eea',
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                fontFamily: 'Alata, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
            >
              Start Now
              <ArrowRight size={20} />
            </button>

            <button
              onClick={scrollToFeatures}
              style={{
                padding: '18px 48px',
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid white',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                fontFamily: 'Alata, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Learn More
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="fade-in-up" style={{
            marginTop: '80px',
            animationDelay: '0.5s',
            opacity: 0
          }}>
            <div style={{
              width: '2px',
              height: '60px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
              margin: '0 auto',
              animation: 'float 2s ease-in-out infinite'
            }} />
          </div>
        </div>
      </div>

      {/* Features Section - Optimized for better visibility */}
      <div id="features" style={{
        position: 'relative',
        zIndex: 1,
        padding: '0',
        background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2))',
        width: '100%',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: '-120px'
      }}>
        <div style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '-30px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 20px',
              borderRadius: '20px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)'
            }}>
              <Sparkles size={20} color="white" />
              <span style={{ color: 'white', fontWeight: '600', fontFamily: 'Alata, sans-serif' }}>
                Powerful Features
              </span>
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: 'white',
              margin: '0 0 10px 0',
              fontFamily: 'Alata, sans-serif'
            }}>
              Everything You Need
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              fontFamily: 'Alata, sans-serif'
            }}>
              Comprehensive AI-powered tools designed for modern legal professionals
            </p>
          </div>

          {/* Feature Grid - UPDATED with better responsive design */}
          <div 
            className="feature-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              width: '100%',
              margin: '-20px auto 0',
              paddingBottom: '40px',
              alignContent: 'start'
            }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="slide-in"
                onClick={() => handleFeatureClick(feature)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animationDelay: (index * 0.1) + 's',
                  opacity: 0,
                  height: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: feature.color,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'white',
                  boxShadow: `0 10px 30px ${feature.color}40`,
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>

                {/* Content Container */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Title */}
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '12px',
                    fontFamily: 'Alata, sans-serif',
                    lineHeight: '1.3'
                  }}>
                    {feature.title}
                  </h3>

                  {/* Short Description */}
                  <p style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    fontFamily: 'Alata, sans-serif',
                    flex: 1
                  }}>
                    {feature.shortDesc}
                  </p>

                  {/* Learn More Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'Alata, sans-serif',
                    marginTop: 'auto'
                  }}>
                    Learn More
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Detail Modal */}
      {showFeatureModal && selectedFeature && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              maxWidth: '600px',
              width: '100%',
              padding: '48px',
              position: 'relative',
              boxShadow: '0 40px 80px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <X size={24} color="white" />
            </button>

            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: selectedFeature.color,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              color: 'white',
              boxShadow: `0 15px 40px ${selectedFeature.color}60`
            }}>
              {selectedFeature.icon}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: 'white',
              marginBottom: '20px',
              fontFamily: 'Alata, sans-serif'
            }}>
              {selectedFeature.title}
            </h2>

            {/* Full Description */}
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.8',
              marginBottom: '32px',
              fontFamily: 'Alata, sans-serif'
            }}>
              {selectedFeature.fullDesc}
            </p>

            {/* Get Started Button */}
            <button
              onClick={() => navigate('/signin')}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: selectedFeature.color,
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                fontFamily: 'Alata, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: 0.9
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
          }}
        >
          <ArrowUp size={24} color="#764ba2" />
        </button>
      )}

      {/* Footer */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          fontFamily: 'Alata, sans-serif'
        }}>
          © 2025 VerdictX. Empowering legal professionals with AI.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;