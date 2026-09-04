import zipfile
import os

def create_deploy_zip():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(base_dir, 'marvel-universe-archive-deploy.zip')
    
    # Files and folders to include
    include_files = ['index.html', 'README.md']
    include_dirs = ['css', 'js', 'data']

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add root files
        for f in include_files:
            file_path = os.path.join(base_dir, f)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=f)
                print(f"Added: {f}")

        # Add directory trees
        for d in include_dirs:
            dir_path = os.path.join(base_dir, d)
            if os.path.exists(dir_path):
                for root, dirs, files in os.walk(dir_path):
                    for file in files:
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, base_dir)
                        zipf.write(full_path, arcname=rel_path)
                        print(f"Added: {rel_path}")

    size_kb = os.path.getsize(zip_path) / 1024
    print(f"\n[DEPLOY PACKAGE READY] Created: {zip_path} ({size_kb:.2f} KB)")
    return zip_path

if __name__ == '__main__':
    create_deploy_zip()
