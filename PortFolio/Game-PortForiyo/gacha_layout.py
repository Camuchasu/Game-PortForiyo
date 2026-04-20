import re

def update_carousel_to_gacha_style():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    new_js = """function updateCarouselDisplay() {
    const grid = document.getElementById('works-grid');
    if (!grid || m_IsEditMode || m_CarouselCards.length === 0) return;

    const numCards = m_CarouselCards.length;

    m_CarouselCards.forEach((card, index) => {
        let diff = (index - m_CarouselIndex) % numCards;
        if (diff < 0) diff += numCards;

        // クラスの付け外し（フロントのみアクティブ化）
        if (diff === 0) {
            card.classList.add('carousel-active');
        } else {
            card.classList.remove('carousel-active');
        }
        
        // --- ユーザーの指定画像（手前・両隣・一番後ろ）に基づく立体ビルボード配置 ---
        // 常に正面（rotateY(0deg)）を向けつつ、Z軸とスケールで遠近感を出す
        if (diff === 0) {
            // 0: 一番手前（明るく、大きい）
            card.style.transform = `translateX(0px) translateZ(0px) scale(1)`;
            card.style.opacity = '1';
            card.style.zIndex = '10';
            card.style.filter = 'brightness(1)';
        } else if (diff === 1) {
            // 1: 右隣（少し遠く、暗め）
            // カードが600px幅になることを考慮し、X軸を大きくずらす
            card.style.transform = `translateX(380px) translateZ(-150px) scale(0.8)`;
            card.style.opacity = '0.6';
            card.style.zIndex = '5';
            card.style.filter = 'brightness(0.5)';
        } else if (diff === numCards - 1) {
            // 3(最後の要素): 左隣（少し遠く、暗め）
            card.style.transform = `translateX(-380px) translateZ(-150px) scale(0.8)`;
            card.style.opacity = '0.6';
            card.style.zIndex = '5';
            card.style.filter = 'brightness(0.5)';
        } else {
            // 2(それ以外): 一番後ろ（さらに暗く、遠目）
            card.style.transform = `translateX(0px) translateZ(-300px) scale(0.5)`;
            card.style.opacity = '0.3';
            card.style.zIndex = '1';
            card.style.filter = 'brightness(0.3)';
        }
    });

    // コンテナ自体の回転は行わない（カードが常に前を向くように）
    grid.style.transform = `translateZ(0px) rotateY(0deg)`;
}"""

    pattern = r"function updateCarouselDisplay\(\) \{[\s\S]*?grid\.style\.transform = `.*?`;\n\}"
    if re.search(pattern, js):
        js = re.sub(pattern, new_js, js)
    else:
        # If my previous restore broke the regex, I'll find the function properly
        js = re.sub(r"function updateCarouselDisplay\(\) \{[\s\S]*?\}\n\nfunction rotateCarousel", new_js + "\n\nfunction rotateCarousel", js)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)
    
    # Update CSS to ensure absolute positioning and transition works properly
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Make sure we don't have conflicting transforms in CSS
    # Remove old inline CSS modifications if they interfere.
    # The active card should just respect its CSS sizes, while transform is handled by JS.
    
    # We will append the necessary CSS to enforce this view securely.
    clean_css = """
/* ==================================
   ガシャ画面風 スマホビュー 3D立体配置カルーセル
================================== */
body:not(.editing) #works-grid {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 600px !important;
    max-width: 100vw !important;
    height: auto !important;
    min-height: 550px !important;
    margin: 0 auto !important;
    transform-style: preserve-3d;
    perspective: 1200px;
}

body:not(.editing) #works-grid .glass-card {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    margin-top: -25px !important; /* height 50px / 2 */
    margin-left: -25px !important; /* width 50px / 2 */
    transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    
    /* 星のデフォルトサイズ */
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 0 10px #FFF, 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6) !important;
}

/* 選ばれたアクティブなカードへの展開 */
body:not(.editing) #works-grid .glass-card.carousel-active {
    width: 600px !important;
    max-width: 85vw !important;
    height: auto !important;
    min-height: 480px !important;
    border-radius: 15px !important;
    
    /* Center offset for the large card */
    /* width is up to 600, so we use transform translate(-50%, -50%)? No, JS handles transform. */
    /* Because JS handles transform translate, we must redefine margin offsets so it grows smoothly! */
    margin-top: -240px !important; /* Approx half height */
    margin-left: -300px !important; /* Approx half width */
    
    background: rgba(11, 29, 66, 0.4) !important;
    border: 2px solid rgba(255, 215, 0, 0.9) !important;
    padding: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    
    overflow: visible !important;
}

/* モバイル時の左右の星の配置調整（はみ出し防止） */
@media (max-width: 768px) {
    body:not(.editing) #works-grid .glass-card.carousel-active {
        margin-left: -42.5vw !important; /* max-width 85vw の半分 */
    }
}

/* メディアや文章の可視化制御 */
body:not(.editing) #works-grid .glass-card:not(.carousel-active) > * {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: scale(0) !important;
}

body:not(.editing) #works-grid .glass-card.carousel-active > * {
    opacity: 1 !important;
    transform: scale(1) !important;
    transition: opacity 0.4s ease 0.4s, transform 0.4s ease 0.4s !important;
}

body:not(.editing) #works-grid .glass-card.carousel-active .card-media-container {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9 !important;
    margin-bottom: 15px !important;
}
"""
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write("\n" + clean_css)
    
    print("Updated JS and CSS for MonSt-style layout")

if __name__ == '__main__':
    update_carousel_to_gacha_style()
