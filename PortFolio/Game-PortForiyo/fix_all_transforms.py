import re

def fix_all_css_transforms():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Remove strict transform for the JS-animated cards in style.css
    # We want to entirely leave `transform` to JS for non-editing mode!
    # Specifically, look for `transform: rotateY(0deg) !important;`
    css = re.sub(
        r"transform:\s*rotateY\([0-9]+deg\)\s*!important;",
        r"", css)

    # Make sure we didn't leave any other `transform` rules that would break .glass-card in 3D
    # e.g., body:not(.editing) #works-grid .glass-card { transform: none !important; }
    # Just to be sure...
    css = re.sub(
        r"body:not\(\.editing\) #works-grid \.glass-card\s*\{[\s\S]*?transform:\s*none\s*!important;\s*\}",
        r"", css)

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

if __name__ == '__main__':
    fix_all_css_transforms()
    print("Fixed all CSS transform overrides!")
