import re

def rewrite_js_height():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Rewrite setTimeout to perfectly match height, overriding old logic
    pattern = r"setTimeout\(\(\) => \{[\s\S]*?\}, 50\);"
    new_timeout = """setTimeout(() => {
                let h = card.scrollHeight;
                card.style.setProperty('--active-height', h + 'px');
                
                // カードの高さに余白(上下計120px程度)を足して、コンテナ枠自体を伸縮させる
                grid.style.height = (h + 120) + 'px';
                grid.style.minHeight = (h + 120) + 'px';
                
                // Section自体の高さも必要に応じて更新（はみ出しを確実に防止）
                const section = document.getElementById('works');
                if(section) {
                   section.style.minHeight = 'auto'; // フレックス等に任せる
                   section.style.height = 'auto';
                }
            }, 50);"""

    js = re.sub(pattern, new_timeout, js)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)
    
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()
    
    # Increase the padding and constraints of works-grid so frame fits perfectly
    css = re.sub(
        r"body:not\(\.editing\) #works-grid \{\s*(.*?)(height: 500px !important;\s*min-height: 480px !important;)(.*?)\}",
        r"body:not(.editing) #works-grid {\n    \1height: 600px !important;\n    min-height: 600px !important;\n    transition: height 0.5s ease;\n\3}", 
        css, flags=re.DOTALL
    )

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

    print("Updated specific height synchronizations.")

if __name__ == '__main__':
    rewrite_js_height()
