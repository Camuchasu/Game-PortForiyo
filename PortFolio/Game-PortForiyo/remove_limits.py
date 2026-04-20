import re

def remove_restrictive_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Remove the flex strict limitations added earlier
    # We will redefine the flat carousel rules cleanly at the end.
    
    # We will completely strip anything from "/* カルーセルサイズの最適化（動画とコメントの全表示対応） */"
    # to the end of the file, or just regex it out.
    # It's better to just rewrite the whole file and add the *proper* flat carousel styles without max-heights.
    pass

if __name__ == '__main__':
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()
    
    # Remove everything after "/* カルーセルサイズの最適化" or "/* ==================================" that relates to flat carousel
    # Let's find "/* ==================================\n   カルーセルサイズの最適化"
    idx = css.find('/* ==================================\n   カルーセルサイズの最適化')
    if idx != -1:
        css = css[:idx]
        
    idx2 = css.find('/* ==================================\n   横一列に並んで回転しながら拡大する')
    if idx2 != -1:
        css = css[:idx2]

    # Now append the CLEAN, unrestricted flat carousel CSS
    clean_css = """
/* ==================================
   横一列に並んで回転しながら拡大するギャラリー風カルーセル
================================== */
body:not(.editing) #works-grid {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important; /* 上揃えにして、カードが下に伸びるのを許容 */
    justify-content: center !important;
    gap: 30px !important;
    width: 100% !important;
    max-width: 100vw !important;
    height: auto !important;
    min-height: 480px !important;
    margin: 0 auto !important;
    transform-style: preserve-3d;
    perspective: 1200px;
}

body:not(.editing) #works-grid .glass-card {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    margin: 0 !important;
    transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    transform: rotateY(0deg) !important;
}

/* 通常の星の状態 */
body:not(.editing) #works-grid .glass-card:not(.carousel-active) {
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 0 10px #FFF, 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6) !important;
    margin-top: 50px !important; /* 少し下げて中央っぽく見せる */
}

/* 選択されたカード（制限なく大きく表示） */
body:not(.editing) #works-grid .glass-card.carousel-active {
    transform: rotateY(360deg) !important;
    width: 600px !important;
    max-width: 80vw !important;
    height: auto !important;     /* 高さは中身に合わせて自動拡張！下に見切れてもスクロールで見る */
    min-height: 480px !important;
    border-radius: 15px !important;
    
    background: rgba(11, 29, 66, 0.3) !important;
    border: 2px solid rgba(255, 215, 0, 0.8) !important;
    padding: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    
    /* 内部スクロールなどは設定せず、あふれる場合はそのまま要素を大きくする */
    overflow: visible !important;
}

/* 映像は常に16:9をキープ */
body:not(.editing) #works-grid .glass-card.carousel-active .card-media-container {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9 !important;
    max-height: none !important; /* 制限解除 */
    margin-bottom: 15px !important;
}

/* テキストや動画のアニメーションや非表示制御 */
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
"""
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css + clean_css)
    print("Fixed style restrictions.")
