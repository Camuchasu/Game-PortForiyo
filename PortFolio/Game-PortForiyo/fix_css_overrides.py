import re

def fix_css_important():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Remove !important from height and min-height in #works-grid
    css = re.sub(
        r"(body:not\(\.editing\) #works-grid \{[\s\S]*?height:\s*600px)\s*!important;",
        r"\1;", css)
    css = re.sub(
        r"(body:not\(\.editing\) #works-grid \{[\s\S]*?min-height:\s*600px)\s*!important;",
        r"\1;", css)

    # Remove transform overrides for .carousel-side and .carousel-back
    css = re.sub(
        r"transform:\s*scale\([^)]+\)\s*!important;",
        r"", css)

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

def fix_js_scale():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # In updateCarouselDisplay, inside the forEach, we set card.style.transform
    # We should add the scale to the js transform string based dynamically on classes or diff.
    # Currently it reads:
    # card.style.transform = `rotateY(${angle}deg) translateZ(${m_CarouselRadius}px)`;
    
    new_transform = """
        let currentScale = 1.0;
        if (numCards === 4) {
            let diff = Math.abs(index - m_CarouselIndex);
            if (diff === 1 || diff === 3) currentScale = 0.85;
            if (diff === 2) currentScale = 0.6;
        } else {
            if (index !== m_CarouselIndex) currentScale = 0.8;
        }
        card.style.transform = `rotateY(${angle}deg) translateZ(${m_CarouselRadius}px) scale(${currentScale})`;
    """
    
    js = re.sub(
        r"card\.style\.transform = `rotateY\(\$\{angle\}deg\) translateZ\(\$\{m_CarouselRadius\}px\)`;",
        new_transform, js)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    fix_css_important()
    fix_js_scale()
    print("Fixed CSS overrides and added JS scale.")
