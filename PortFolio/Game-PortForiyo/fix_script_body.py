import re

def fix_script():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Find where classes are added
    # m_WorksGridContainer.classList.add('editing');
    add_pattern = r"(m_WorksGridContainer\.classList\.add\('editing'\);)"
    add_replacement = r"\1\n            document.body.classList.add('editing');"
    js = re.sub(add_pattern, add_replacement, js)

    # Find where classes are removed
    # m_WorksGridContainer.classList.remove('editing');
    remove_pattern = r"(m_WorksGridContainer\.classList\.remove\('editing'\);)"
    remove_replacement = r"\1\n            document.body.classList.remove('editing');"
    js = re.sub(remove_pattern, remove_replacement, js)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed script.js")

if __name__ == '__main__':
    fix_script()
