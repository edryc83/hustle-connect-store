import React from 'react';

export interface FlyerData {
  productImage: string | null;
  productName: string;
  headline: string;
  tagline: string;
  price: string;
  storeName: string;
  storeSlug: string;
  whatsappNumber?: string;
  accentColor?: string;
}

export interface HTMLTemplate {
  id: string;
  name: string;
  category: 'tech' | 'fashion' | 'beauty' | 'general';
  render: (data: FlyerData, format: 'square' | 'story') => React.ReactNode;
}

// Template 1: Tech Blue - Professional gadget store style
const TechBlueTemplate: HTMLTemplate = {
  id: 'tech-blue',
  name: 'Tech Blue',
  category: 'tech',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;
    const accent = data.accentColor || '#FFD700';

    return (
      <div style={{
        width: 1080,
        height,
        background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Decorative diagonal lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%)',
        }} />

        {/* Store name badge */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 24,
            color: '#0052D4',
          }}>
            {data.storeName.charAt(0).toUpperCase()}
          </div>
          <div style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 28,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {data.storeName}
          </div>
        </div>

        {/* Tag badge */}
        <div style={{
          position: 'absolute',
          top: 45,
          right: 40,
          background: 'rgba(255,255,255,0.15)',
          padding: '10px 20px',
          borderRadius: 4,
          fontSize: 14,
          color: '#fff',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          Premium Quality
        </div>

        {/* Main headline */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 140 : 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 40px',
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: format === 'square' ? 72 : 80,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {data.headline}
          </div>
          <div style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 20,
            fontWeight: 400,
          }}>
            {data.tagline}
          </div>
        </div>

        {/* Product image */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '35%' : '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: format === 'square' ? '40%' : '35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
              }}
            />
          )}
        </div>

        {/* Category strip */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 180 : 280,
          left: 0,
          right: 0,
          background: 'rgba(255,50,50,0.9)',
          padding: '12px 0',
          textAlign: 'center',
        }}>
          <span style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}>
            ★ Quality Products • Best Prices • Fast Delivery ★
          </span>
        </div>

        {/* Price */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 100 : 180,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            color: accent,
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {data.price}
          </span>
        </div>

        {/* Contact footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            background: '#E63946',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 25,
            fontWeight: 600,
            fontSize: 14,
          }}>
            Contact us today!
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#333',
            fontSize: 16,
            fontWeight: 500,
          }}>
            <span style={{ color: '#25D366' }}>📞</span>
            {data.whatsappNumber || 'WhatsApp'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#333',
            fontSize: 14,
          }}>
            <span>📍</span>
            afristall.com/{data.storeSlug}
          </div>
        </div>
      </div>
    );
  },
};

// Template 2: Premium White - Clean modern style like Flame Gizmo
const PremiumWhiteTemplate: HTMLTemplate = {
  id: 'premium-white',
  name: 'Premium White',
  category: 'tech',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;
    const accent = data.accentColor || '#00A86B';

    return (
      <div style={{
        width: 1080,
        height,
        background: '#FAFAFA',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Corner decoration */}
        <div style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${accent}22 0%, transparent 70%)`,
        }} />

        {/* Store logo */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#fff',
            padding: '12px 24px',
            borderRadius: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 20,
            }}>
              {data.storeName.charAt(0)}
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: 24,
              color: '#1a1a1a',
            }}>
              {data.storeName}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 140 : 180,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 60px',
        }}>
          <div style={{
            fontSize: 20,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: 6,
            marginBottom: 10,
          }}>
            BUY ALL YOUR
          </div>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: format === 'square' ? 80 : 90,
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}>
            {data.headline.split(' ').slice(0, 2).join(' ')}
          </div>
          <div style={{
            display: 'inline-block',
            background: accent,
            color: '#fff',
            padding: '8px 30px',
            borderRadius: 30,
            fontSize: 24,
            fontWeight: 700,
            marginTop: 15,
            textTransform: 'uppercase',
          }}>
            {data.tagline || 'TODAY'}
          </div>
        </div>

        {/* Product image */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '38%' : '32%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          height: format === 'square' ? '38%' : '35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.15))',
              }}
            />
          )}
        </div>

        {/* Tagline */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 140 : 220,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 18,
          color: '#666',
        }}>
          {data.tagline || 'Quality products at the best prices'}
        </div>

        {/* Price badge */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 200 : 280,
          right: 60,
          background: '#fff',
          padding: '15px 25px',
          borderRadius: 15,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontSize: 14, color: '#666' }}>Starting from</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: accent }}>{data.price}</div>
        </div>

        {/* WhatsApp footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: accent,
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
          }}>
            <span style={{ fontSize: 24 }}>📱</span>
            {data.whatsappNumber || 'WhatsApp'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#fff',
            fontSize: 16,
          }}>
            <span style={{ fontSize: 20 }}>📍</span>
            afristall.com/{data.storeSlug}
          </div>
        </div>
      </div>
    );
  },
};

// Template 3: Classy Beige - Elegant fashion style
const ClassyBeigeTemplate: HTMLTemplate = {
  id: 'classy-beige',
  name: 'Classy Style',
  category: 'fashion',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;
    const accent = data.accentColor || '#8B4513';

    return (
      <div style={{
        width: 1080,
        height,
        background: 'linear-gradient(180deg, #E8E0D5 0%, #D4C5B5 100%)',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Headline - Top Left */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: 50,
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 90,
            fontWeight: 700,
            color: '#2C2C2C',
            lineHeight: 0.9,
            letterSpacing: -2,
          }}>
            CLASSY
          </div>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 110,
            fontWeight: 700,
            color: '#2C2C2C',
            lineHeight: 0.85,
            letterSpacing: -2,
          }}>
            STYLE
          </div>
          <div style={{
            fontFamily: 'Dancing Script, cursive',
            fontStyle: 'italic',
            fontSize: 24,
            color: '#5C4033',
            marginTop: 20,
            lineHeight: 1.4,
          }}>
            {data.tagline || 'Crafted from premium,\nearth-friendly materials'}
          </div>
        </div>

        {/* New Collection badge */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 240 : 280,
          right: 180,
          transform: 'rotate(-15deg)',
        }}>
          <span style={{
            fontFamily: 'Dancing Script, cursive',
            fontSize: 32,
            color: accent,
          }}>
            New Collection
          </span>
          <div style={{
            width: 40,
            height: 2,
            background: accent,
            marginTop: 5,
          }} />
        </div>

        {/* Product image - right side */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '30%' : '25%',
          right: 0,
          width: '70%',
          height: format === 'square' ? '45%' : '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
              }}
            />
          )}
        </div>

        {/* Price badge - left side */}
        <div style={{
          position: 'absolute',
          left: 50,
          bottom: format === 'square' ? 200 : 300,
        }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#2C2C2C',
            lineHeight: 1,
          }}>
            {data.price.replace(/[^0-9]/g, '').length > 0 ? (
              <>
                <span style={{ fontSize: 48 }}>{data.price.match(/[^0-9]*/)?.[0]}</span>
                {data.price.replace(/[^0-9.,]/g, '')}
              </>
            ) : data.price}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#2C2C2C',
            marginTop: -5,
          }}>
            OFF
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 50,
          right: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: 16,
            color: '#5C4033',
            lineHeight: 1.5,
          }}>
            To place an order,<br/>
            <strong>Visit our website.</strong>
          </div>
          <div style={{
            background: '#fff',
            padding: '15px 30px',
            borderRadius: 5,
            border: '2px solid #2C2C2C',
          }}>
            <span style={{
              fontWeight: 600,
              fontSize: 16,
              color: '#2C2C2C',
            }}>
              afristall.com/{data.storeSlug}
            </span>
          </div>
        </div>

        {/* Store name watermark */}
        <div style={{
          position: 'absolute',
          bottom: 50,
          right: 50,
          fontSize: 12,
          color: '#8B7355',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}>
          {data.storeName}
        </div>
      </div>
    );
  },
};

// Template 4: Royal Gold - Premium feel like Biggie Gadgets
const RoyalGoldTemplate: HTMLTemplate = {
  id: 'royal-gold',
  name: 'Royal Gold',
  category: 'general',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;
    const accent = data.accentColor || '#C9A227';

    return (
      <div style={{
        width: 1080,
        height,
        background: 'linear-gradient(180deg, #F5E6D3 0%, #E8D5C4 50%, #DCC8B5 100%)',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Store badge */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: '#1B365D',
            padding: '15px 30px',
            borderRadius: 10,
          }}>
            <span style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
            }}>
              {data.storeName}
            </span>
          </div>
          <div style={{
            fontSize: 12,
            color: '#1B365D',
            marginTop: 8,
            letterSpacing: 1,
          }}>
            Quality Products Guaranteed
          </div>
        </div>

        {/* Main headline */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 160 : 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 40px',
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: format === 'square' ? 60 : 70,
            fontWeight: 600,
            color: '#1B365D',
            lineHeight: 1.1,
          }}>
            Get <span style={{ color: accent, fontStyle: 'italic' }}>{data.headline.split(' ')[0]}</span>
            <br />
            That Match
            <br />
            Your <span style={{ color: accent, fontStyle: 'italic' }}>Vibe</span>
          </div>

          {/* Month badge */}
          <div style={{
            display: 'inline-block',
            background: accent,
            color: '#fff',
            padding: '8px 25px',
            borderRadius: 25,
            fontSize: 18,
            fontWeight: 600,
            marginTop: 20,
          }}>
            This Month!
          </div>
        </div>

        {/* Product image */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '42%' : '38%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: format === 'square' ? '35%' : '30%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.2))',
              }}
            />
          )}
        </div>

        {/* Price section */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 130 : 200,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 32,
            color: '#1B365D',
          }}>
            {data.productName}
          </div>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 56,
            fontWeight: 700,
            color: '#1B365D',
            marginTop: 10,
          }}>
            {data.price}
          </div>
        </div>

        {/* Contact footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: accent,
          padding: '18px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            background: '#1B365D',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
          }}>
            {data.storeName} is ACTIVE!
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 16 }}>
            <span>📱</span> {data.whatsappNumber || 'WhatsApp'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 14 }}>
            <span>🌐</span> @{data.storeSlug}
          </div>
        </div>
      </div>
    );
  },
};

// Template 5: Deep Purple - Vibrant tech style
const DeepPurpleTemplate: HTMLTemplate = {
  id: 'deep-purple',
  name: 'Deep Purple',
  category: 'tech',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;
    const accent = data.accentColor || '#E040FB';

    return (
      <div style={{
        width: 1080,
        height,
        background: 'linear-gradient(135deg, #1A0033 0%, #4A0072 50%, #7B1FA2 100%)',
        position: 'relative',
        fontFamily: 'Poppins, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }} />

        {/* Store name */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 15,
        }}>
          <div style={{
            width: 55,
            height: 55,
            borderRadius: 15,
            background: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
          }}>
            {data.storeName.charAt(0)}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>{data.storeName}</div>
            <div style={{ color: accent, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Premium Store</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 160 : 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 50px',
        }}>
          <div style={{
            fontSize: format === 'square' ? 64 : 72,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            textShadow: `0 0 40px ${accent}66`,
          }}>
            {data.headline}
          </div>
          <div style={{
            fontSize: 22,
            color: '#E0B0FF',
            marginTop: 15,
          }}>
            {data.tagline}
          </div>
        </div>

        {/* Product image */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '35%' : '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          height: format === 'square' ? '40%' : '35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 30px ${accent}66)`,
              }}
            />
          )}
        </div>

        {/* Price */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 120 : 200,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 80,
            fontWeight: 400,
            color: '#fff',
            textShadow: `0 0 30px ${accent}`,
          }}>
            {data.price}
          </span>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          padding: '20px 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 16 }}>📱 {data.whatsappNumber || 'WhatsApp'}</span>
          <span style={{ color: accent, fontSize: 14 }}>🌐 afristall.com/{data.storeSlug}</span>
        </div>
      </div>
    );
  },
};

// Template 6: Coral Beauty - For beauty/cosmetics
const CoralBeautyTemplate: HTMLTemplate = {
  id: 'coral-beauty',
  name: 'Coral Beauty',
  category: 'beauty',
  render: (data, format) => {
    const height = format === 'square' ? 1080 : 1920;

    return (
      <div style={{
        width: 1080,
        height,
        background: 'linear-gradient(180deg, #FFB4A2 0%, #E5989B 50%, #FFCDB2 100%)',
        position: 'relative',
        fontFamily: 'Raleway, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 200,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }} />

        {/* Store name */}
        <div style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 36,
            fontWeight: 600,
            color: '#6D4C41',
            letterSpacing: 3,
          }}>
            {data.storeName.toUpperCase()}
          </span>
        </div>

        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? 130 : 160,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 60px',
        }}>
          <div style={{
            fontFamily: 'Dancing Script, cursive',
            fontSize: 50,
            color: '#6D4C41',
          }}>
            {data.headline.split(' ')[0]}
          </div>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: format === 'square' ? 72 : 80,
            fontWeight: 700,
            color: '#4E342E',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: 5,
          }}>
            {data.headline.split(' ').slice(1).join(' ') || 'BEAUTY'}
          </div>
          <div style={{
            fontSize: 18,
            color: '#6D4C41',
            marginTop: 20,
            fontWeight: 300,
            letterSpacing: 1,
          }}>
            {data.tagline}
          </div>
        </div>

        {/* Product */}
        <div style={{
          position: 'absolute',
          top: format === 'square' ? '38%' : '32%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '65%',
          height: format === 'square' ? '38%' : '35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.productImage && (
            <img
              src={data.productImage}
              alt={data.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(109,76,65,0.3))',
              }}
            />
          )}
        </div>

        {/* Price badge */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 180 : 260,
          right: 80,
          textAlign: 'right',
        }}>
          <div style={{
            fontSize: 72,
            fontWeight: 300,
            color: '#4E342E',
            lineHeight: 1,
          }}>
            {data.price}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          position: 'absolute',
          bottom: format === 'square' ? 100 : 160,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: '#4E342E',
            color: '#fff',
            padding: '15px 50px',
            borderRadius: 50,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
          }}>
            ORDER NOW
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 14,
          color: '#6D4C41',
        }}>
          afristall.com/{data.storeSlug} • {data.whatsappNumber || 'WhatsApp'}
        </div>
      </div>
    );
  },
};

// Export all templates
export const htmlTemplates: HTMLTemplate[] = [
  TechBlueTemplate,
  PremiumWhiteTemplate,
  ClassyBeigeTemplate,
  RoyalGoldTemplate,
  DeepPurpleTemplate,
  CoralBeautyTemplate,
];

// Get random templates
export function getRandomHTMLTemplates(count: number = 3): HTMLTemplate[] {
  const shuffled = [...htmlTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
