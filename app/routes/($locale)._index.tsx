import {useEffect, useRef} from 'react';
import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [
    {title: 'Lumière Beauty Protein | 飲む美容液 美容プロテイン'},
    {
      name: 'description',
      content:
        'Lumière Beauty Protein - 内側から、キレイをつくる。飲む美容液 美容プロテイン',
    },
  ];
};

// No data fetching needed — this is a static LP
export async function loader() {
  return {};
}

export default function Homepage() {
  // Fade-up IntersectionObserver for .lum-section elements
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.lum-section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {threshold: 0.1},
    );
    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lum-page">
      <SvgSprite />
      <HeroSection />
      <ProblemSection />
      <FeatureSection />
      <IngredientsSection />
      <VoiceSection />
      <PriceSection />
      <ClosingSection />
      <FooterIconsSection />
      <StickyCta />
    </div>
  );
}

/* ==================
   SVG Sprite
   ================== */
function SvgSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{position: 'absolute'}}
      aria-hidden="true"
    >
      <defs>
        <symbol id="i-truck" viewBox="0 0 32 32">
          <path
            d="M3 8h14v12H3z M17 12h7l4 4v4h-11z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="9"
            cy="22"
            r="2.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle
            cx="22"
            cy="22"
            r="2.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </symbol>
        <symbol id="i-cal" viewBox="0 0 32 32">
          <rect
            x="5"
            y="7"
            width="22"
            height="20"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M5 13h22M11 4v6M21 4v6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-refund" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fontSize="11"
            fontFamily="serif"
            fontWeight="700"
            fill="currentColor"
          >
            ¥
          </text>
        </symbol>
        <symbol id="i-japan" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="16" cy="16" r="4" fill="currentColor" />
        </symbol>
        <symbol id="i-laurel-l" viewBox="0 0 40 80">
          <path
            d="M30 10 Q 8 20 8 40 Q 8 60 30 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <g fill="currentColor" opacity=".85">
            <ellipse
              cx="14"
              cy="22"
              rx="5"
              ry="2.2"
              transform="rotate(-30 14 22)"
            />
            <ellipse
              cx="11"
              cy="32"
              rx="5"
              ry="2.2"
              transform="rotate(-15 11 32)"
            />
            <ellipse cx="10" cy="42" rx="5" ry="2.2" />
            <ellipse
              cx="11"
              cy="52"
              rx="5"
              ry="2.2"
              transform="rotate(15 11 52)"
            />
            <ellipse
              cx="14"
              cy="62"
              rx="5"
              ry="2.2"
              transform="rotate(30 14 62)"
            />
          </g>
        </symbol>
        <symbol id="i-laurel-r" viewBox="0 0 40 80">
          <path
            d="M10 10 Q 32 20 32 40 Q 32 60 10 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <g fill="currentColor" opacity=".85">
            <ellipse
              cx="26"
              cy="22"
              rx="5"
              ry="2.2"
              transform="rotate(30 26 22)"
            />
            <ellipse
              cx="29"
              cy="32"
              rx="5"
              ry="2.2"
              transform="rotate(15 29 32)"
            />
            <ellipse cx="30" cy="42" rx="5" ry="2.2" />
            <ellipse
              cx="29"
              cy="52"
              rx="5"
              ry="2.2"
              transform="rotate(-15 29 52)"
            />
            <ellipse
              cx="26"
              cy="62"
              rx="5"
              ry="2.2"
              transform="rotate(-30 26 62)"
            />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

/* ==================
   Hero
   ================== */
function HeroSection() {
  return (
    <section className="lum-hero" id="hero">
      <div className="lum-hero-img" aria-hidden="true">
        <img
          className="lum-hero-photo"
          src="/images/hero.png"
          alt=""
        />
        <div className="lum-hero-laurel">
          <svg className="lum-laurel-svg" aria-hidden="true">
            <use href="#i-laurel-l" />
          </svg>
          <div className="lum-laurel-text-wrap">
            <span className="lum-laurel-text">累計販売数</span>
            <span className="lum-laurel-num">50万袋</span>
            <span className="lum-laurel-text">突破！</span>
            <span className="lum-laurel-stars">★★★</span>
          </div>
          <svg className="lum-laurel-svg" aria-hidden="true">
            <use href="#i-laurel-r" />
          </svg>
        </div>
      </div>
      <div className="container">
        <div className="lum-hero-inner">
          <div className="lum-hero-text">
            <p className="lum-hero-lead">内側から、キレイをつくる。</p>
            <h1 className="lum-hero-title">
              飲む美容液
              <br />
              <span>美容プロテイン</span>
            </h1>
            <ul className="lum-hero-badges">
              <li>
                <span className="lum-bcheck" aria-hidden="true">
                  ✓
                </span>
                美容成分
                <br />
                たっぷり配合
              </li>
              <li>
                <span className="lum-bcheck" aria-hidden="true">
                  ✓
                </span>
                低カロリー
                <br />
                低糖質
              </li>
              <li>
                <span className="lum-bcheck" aria-hidden="true">
                  ✓
                </span>
                国内製造
                <br />
                無添加処方
              </li>
            </ul>
            <div className="lum-hero-cta">
              <a href="#price" className="lum-btn">
                今すぐ試してみる
              </a>
              <p className="lum-hero-note">初回限定 40%OFF</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================
   Problem
   ================== */
function ProblemSection() {
  const problems = [
    {img: '/images/problem-1.png', text: '肌のハリや透明感が\n気になる'},
    {img: '/images/problem-2.png', text: 'ダイエットしても\nキレイに痩せない'},
    {img: '/images/problem-3.png', text: '髪や爪が弱く\nなってきた'},
    {img: '/images/problem-4.png', text: '食事だけで栄養を\n摂るのが大変'},
  ];

  return (
    <section className="lum-problem lum-section" id="problem">
      <div className="container">
        <h2 className="lum-title">こんなお悩みありませんか？</h2>
        <div className="lum-grid lum-grid-4 lum-problem-grid">
          {problems.map((p, i) => (
            <div key={i} className="lum-problem-card">
              <div className="lum-problem-illust">
                <img src={p.img} alt="" loading="lazy" />
              </div>
              <p>
                {p.text.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j === 0 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
        <div className="lum-problem-cause">
          <p>
            そのお悩み、
            <strong>たんぱく質不足</strong>が原因かもしれません。
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==================
   Feature
   ================== */
const FEATURES = [
  {
    num: '01',
    img: '/images/feature-1.jpg',
    title: '美容に特化した配合',
    desc: 'コラーゲンやヒアルロン酸など美容成分を贅沢に配合。内側からうるおいとハリをサポートします。',
  },
  {
    num: '02',
    img: '/images/feature-2.jpg',
    title: '低カロリー・低糖質',
    desc: '1食あたり約100kcal以下。ダイエット中や体型が気になる方も安心して続けられます。',
  },
  {
    num: '03',
    img: '/images/feature-3.jpg',
    title: '美味しく続けられる',
    desc: '甘すぎず、すっきりとした味わい。毎日飲みたくなる美味しさにこだわりました。',
  },
  {
    num: '04',
    img: '/images/feature-4.jpg',
    title: '国内製造・無添加処方',
    desc: '保存料・着色料・人工甘味料不使用。安心・安全の国内製造で品質にこだわっています。',
  },
] as const;

function FeatureSection() {
  return (
    <section className="lum-feature lum-section" id="feature">
      <div className="container">
        <p className="lum-title-en">FEATURE</p>
        <h2 className="lum-title">ルミエール美容プロテインの特徴</h2>
        <div className="lum-grid lum-grid-4 lum-feature-grid">
          {FEATURES.map((f) => (
            <article key={f.num} className="lum-feature-card">
              <span className="lum-feature-num">{f.num}</span>
              <div className="lum-card-img">
                <img src={f.img} alt="" loading="lazy" />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================
   Ingredients
   ================== */
const INGREDIENTS = [
  {
    img: '/images/ing-1.jpg',
    name: 'コラーゲンペプチド',
    desc: '肌の弾力やうるおいを保ち、ハリのある毎日をサポートします。',
  },
  {
    img: '/images/ing-2.jpg',
    name: 'ヒアルロン酸',
    desc: '高い保水力で、うるおいのあるみずみずしい肌へ導きます。',
  },
  {
    img: '/images/ing-3.jpg',
    name: 'ビタミンC',
    desc: '美容に欠かせない栄養素。キレイを内側からサポートします。',
  },
  {
    img: '/images/ing-4.jpg',
    name: 'ソイプロテイン',
    desc: '植物性たんぱく質で、女性の身体にやさしく引き締まったカラダへ。',
  },
  {
    img: '/images/ing-5.jpg',
    name: '乳酸菌',
    desc: '腸内環境を整え、毎日のスッキリとした健やかさをサポート。',
  },
] as const;

function IngredientsSection() {
  return (
    <section className="lum-ingredients lum-section" id="ingredients">
      <div className="container">
        <p className="lum-title-en">INGREDIENTS</p>
        <h2 className="lum-title">美容をサポートする厳選成分</h2>
        <div className="lum-grid lum-grid-5 lum-ingredient-grid">
          {INGREDIENTS.map((ing) => (
            <article key={ing.name} className="lum-ingredient-card">
              <div className="lum-ing-img">
                <img src={ing.img} alt="" loading="lazy" />
              </div>
              <h3>{ing.name}</h3>
              <p>{ing.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================
   Voice
   ================== */
const VOICES = [
  {
    img: '/images/voice-1.jpg',
    stars: '★★★★★',
    title: '肌の調子が明らかに良くなりました！',
    text: '飲み始めてから肌のハリや透明感がアップ！化粧ノリも良くなって、毎日鏡を見るのが楽しいです。',
    author: '30代 女性',
  },
  {
    img: '/images/voice-2.jpg',
    stars: '★★★★★',
    title: '美味しくて続けやすい！',
    text: 'プロテイン特有の粉っぽさがなく、毎朝のルーティンになっています。3ヶ月で体型も変わってきました。',
    author: '20代 女性',
  },
  {
    img: '/images/voice-3.jpg',
    stars: '★★★★★',
    title: '爪がキレイになってびっくり！',
    text: '以前は割れやすかった爪がしっかりしてきました。髪のツヤも出てきて美容費が節約できています。',
    author: '40代 女性',
  },
] as const;

function VoiceSection() {
  return (
    <section className="lum-voice lum-section" id="voice">
      <div className="container">
        <p className="lum-title-en">VOICE</p>
        <h2 className="lum-title">お客様から嬉しいお声をいただいています！</h2>
        <div className="lum-grid lum-grid-3 lum-voice-grid">
          {VOICES.map((v) => (
            <article key={v.title} className="lum-voice-card">
              <div className="lum-voice-body">
                <div className="lum-stars" aria-label="星5">
                  {v.stars}
                </div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
                <p className="lum-voice-author">{v.author}</p>
              </div>
              <div className="lum-voice-img">
                <img src={v.img} alt="" loading="lazy" />
              </div>
            </article>
          ))}
        </div>
        <p className="lum-voice-note">
          ※ 個人の感想です。効果・効能を保証するものではありません。
        </p>
      </div>
    </section>
  );
}

/* ==================
   Price
   ================== */
function PriceSection() {
  return (
    <section className="lum-price lum-section" id="price">
      <div className="container">
        <p className="lum-title-en">PRICE</p>
        <h2 className="lum-title">シンプルな料金プラン</h2>
        <div className="lum-price-box">
          {/* Regular */}
          <div className="lum-price-regular">
            <p className="lum-price-label">通常価格</p>
            <div className="lum-price-num">
              ¥<span>2,980</span>
              <small>（税込）</small>
            </div>
            <p className="lum-price-sub">送料 ¥650</p>
          </div>

          {/* Arrow */}
          <div className="lum-price-arrow">›</div>

          {/* Sale */}
          <div className="lum-price-sale">
            <p className="lum-price-label">初回限定価格</p>
            <span className="lum-price-tag">40% OFF</span>
            <div className="lum-price-num sale">
              ¥<span>1,780</span>
              <small>（税込）</small>
            </div>
            <p className="lum-price-free">送料無料</p>
            <p className="lum-price-sub">初回のみ適用</p>
          </div>

          {/* Bonus */}
          <div>
            <ul className="lum-price-bonus">
              <li>美容成分たっぷり配合</li>
              <li>国内製造・無添加処方</li>
              <li>30日間全額返金保証</li>
              <li>1日あたり約59円</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div style={{textAlign: 'center', marginTop: '40px'}}>
          <a href="/products" className="lum-btn large">
            今すぐ試してみる
          </a>
        </div>
      </div>
    </section>
  );
}

/* ==================
   Closing
   ================== */
function ClosingSection() {
  return (
    <section className="lum-closing">
      <div className="container">
        <div className="lum-closing-row">
          <div className="lum-closing-product">
            <img src="/images/product.png" alt="Lumière Beauty Protein" />
          </div>
          <div className="lum-closing-body">
            <p className="lum-closing-title">
              内側から輝く美しさへ。
              <br />
              まずは1袋、試してみませんか？
            </p>
            <a href="/products" className={`lum-btn lum-closing-btn`}>
              <span className="lum-closing-tag">
                <span>初回</span>
                <span className="lg">40%</span>
                <span>OFF</span>
              </span>
              今すぐ始める
            </a>
            <p className="lum-closing-guarantee">
              <span className="lum-closing-guarantee">
                30日間全額返金保証付き
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================
   Footer Icons
   ================== */
function FooterIconsSection() {
  return (
    <div className="lum-footer-icons">
      <div className="container">
        <ul>
          <li>
            <svg className="lum-ficon" aria-hidden="true" viewBox="0 0 32 32">
              <use href="#i-truck" />
            </svg>
            送料無料
            <br />
            (初回)
          </li>
          <li>
            <svg className="lum-ficon" aria-hidden="true" viewBox="0 0 32 32">
              <use href="#i-cal" />
            </svg>
            定期便
            <br />
            いつでも解約
          </li>
          <li>
            <svg className="lum-ficon" aria-hidden="true" viewBox="0 0 32 32">
              <use href="#i-refund" />
            </svg>
            30日間
            <br />
            返金保証
          </li>
          <li>
            <svg className="lum-ficon" aria-hidden="true" viewBox="0 0 32 32">
              <use href="#i-japan" />
            </svg>
            国内製造
            <br />
            無添加処方
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ==================
   Sticky CTA (mobile)
   ================== */
function StickyCta() {
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector('.lum-hero');
    if (!hero || !stickyRef.current) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (stickyRef.current) {
          stickyRef.current.style.display = entry.isIntersecting
            ? 'none'
            : '';
        }
      },
      {threshold: 0},
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lum-sticky-cta" ref={stickyRef} style={{display: 'none'}}>
      <a href="#price" className="lum-btn">
        今すぐ試してみる
      </a>
    </div>
  );
}
