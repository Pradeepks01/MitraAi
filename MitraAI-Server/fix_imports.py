import os

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".py") and file != "fix_imports.py":
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace langchain.prompts with langchain_core.prompts
                if "from langchain.prompts import" in content:
                    print(f"Fixing {filepath}")
                    new_content = content.replace("from langchain.prompts import", "from langchain_core.prompts import")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    fix_imports(".")
