#!/usr/bin/env python3
"""
Universal Dark Mode Integration Script
Adds dark mode CSS and JS to all HTML files in deploy folder
"""

import os
import re
from pathlib import Path

def add_dark_mode_to_html(file_path):
    """Add dark mode CSS and JS to an HTML file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has dark mode CSS
    if 'dark-mode.css' in content:
        print(f"✓ {file_path.name} - Already has dark mode CSS")
        return False
    
    # Add CSS link before closing head tag
    css_link = '\n    <link rel="stylesheet" href="../css/dark-mode.css">'
    if '</head>' in content:
        content = content.replace('</head>', css_link + '\n    </head>')
    
    # Add JS script before closing body tag
    js_script = '\n    <script src="../js/dark-mode.js"></script>'
    if '</body>' in content:
        content = content.replace('</body>', js_script + '\n</body>')
    
    # Add theme toggle button to navbar (if exists)
    if 'navbar' in content.lower():
        # Add button to navbar if not already there
        if 'theme-toggle' not in content:
            # Find navbar and add button
            navbar_pattern = r'(<nav[^>]*class="[^"]*navbar[^"]*"[^>]*>.*?<div[^>]*class="[^"]*container[^"]*"[^>]*>)'
            match = re.search(navbar_pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                # Add button after navbar opening
                toggle_button = '<button class="theme-toggle btn btn-outline-light ms-2" onclick="toggleDarkMode()" style="position: absolute; right: 20px; top: 10px;">🌙</button>'
                # Insert after the navbar opening or container
                insert_pos = match.end()
                content = content[:insert_pos] + '\n            ' + toggle_button + '\n        ' + content[insert_pos:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Added dark mode to: {file_path.name}")
    return True

def main():
    """Process all HTML files in deploy folder"""
    deploy_path = Path(__file__).parent
    
    html_files = list(deploy_path.glob('**/*.html'))
    html_files = [f for f in html_files if 'css' not in f.parent.name and 'js' not in f.parent.name]
    
    print(f"\n📁 Found {len(html_files)} HTML files in deploy folder\n")
    
    updated_count = 0
    for html_file in sorted(html_files):
        try:
            if add_dark_mode_to_html(html_file):
                updated_count += 1
        except Exception as e:
            print(f"✗ Error processing {html_file.name}: {e}")
    
    print(f"\n✅ Updated {updated_count} files with dark mode support!")
    print("\n📝 Note: Dark mode CSS and JS are now linked to all HTML pages.")
    print("💡 Users can toggle dark mode with the 🌙 button or Ctrl+Shift+D")

if __name__ == '__main__':
    main()
