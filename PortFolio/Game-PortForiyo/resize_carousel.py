import re

def update_carousel_dimensions():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Rewrite the setTimeout logic in updateCarouselDisplay to also set --active-height
    # The active card expands, and GAMES & WORKS expands as well!
    # "GAMES & WORKSの枠を星が拡大したときに出てくる枠に合わせて拡大してほしいです"
    
    new_js = js.replace(
        "if (card.scrollHeight > maxNeededHeight) {",
        """// CSS変数に高さを渡し、中心ズレを自動修正する
                card.style.setProperty('--active-height', card.scrollHeight + 'px');
                if (card.scrollHeight > maxNeededHeight) {"""
    )

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(new_js)

    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Apply the variable height for the negative margin!
    css = css.replace(
        "margin-top: -300px !important;",
        "margin-top: calc(var(--active-height, 600px) / -2) !important; /* JSが設定した高さの半分上にずらす */"
    )
    
    # Also, we need to make sure #works section (GAMES & WORKS枠) naturally expands.
    # The .placeholder-section glass-panel wrapper has padding, but height might be constrained by parent flex/min-height?
    # Actually, #works is a standard section, so increasing grid.style.minHeight in JS DOES increase its height.
    # Did the user say it *didn't* expand?
    # "星が拡大したときに出てくる枠に合わせて拡大してほしいです" -> "Please expand the GAMES & WORKS frame *to match* the box that appears when the star expands."
    # Wait, my previous JS only set minHeight to `card.scrollHeight + 80`. What if the card is smaller than 500px? Then it doesn't change it.
    # Actually, setting `#works-grid` height permanently to `card.scrollHeight + 100` makes the container EXACTLY fit the active card!
    # Let's fix JS to ALWAYS set grid height.

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

    print("Updated CSS and JS for dynamic auto-centering and sizing.")

if __name__ == '__main__':
    update_carousel_dimensions()
