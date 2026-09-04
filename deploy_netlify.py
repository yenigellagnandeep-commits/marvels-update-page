"""
Automated Netlify Deploy Script for Marvel Universe Archive
Deploys the static bundle (marvel-universe-archive-deploy.zip) directly to Netlify.
"""

import urllib.request
import urllib.error
import json
import os
import sys

ZIP_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'marvel-universe-archive-deploy.zip')

def deploy_to_netlify(token=None, site_name=None):
    token = token or os.environ.get('NETLIFY_AUTH_TOKEN')
    if not token:
        print("[ERROR] No Netlify access token found.")
        print("Please provide your token or set NETLIFY_AUTH_TOKEN environment variable.")
        print("You can generate one for free at: https://app.netlify.com/user/applications#personal-access-tokens")
        return None

    if not os.path.exists(ZIP_PATH):
        print(f"[INFO] Packaging zip file first...")
        from package_deploy import create_deploy_zip
        create_deploy_zip()

    with open(ZIP_PATH, 'rb') as f:
        zip_bytes = f.read()

    print(f"[INFO] Deploying {len(zip_bytes)} bytes to Netlify...")

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/zip',
        'User-Agent': 'Marvel-Universe-Archive-Deployer/1.0'
    }

    # If site_name or site_id is provided, deploy to existing or create new
    # Netlify endpoint: POST https://api.netlify.com/api/v1/sites creates and deploys in one step when sending zip!
    # If sending zip directly to /api/v1/sites:
    url = 'https://api.netlify.com/api/v1/sites'
    if site_name:
        url += f'?name={site_name}'

    req = urllib.request.Request(url, data=zip_bytes, headers=headers, method='POST')

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            site_url = data.get('ssl_url') or data.get('url')
            admin_url = data.get('admin_url')
            site_id = data.get('id')
            site_name_assigned = data.get('name')

            print("\n=======================================================")
            print("🎉 SITE DEPLOYED SUCCESSFULLY TO NETLIFY!")
            print(f"👉 Live Website URL : {site_url}")
            print(f"👉 Site Admin Panel : {admin_url}")
            print(f"👉 Netlify Site ID  : {site_id}")
            print("=======================================================\n")
            return site_url

    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"[NETLIFY API ERROR] HTTP {e.code}: {err_msg}")
        return None
    except Exception as e:
        print(f"[UNEXPECTED ERROR] {e}")
        return None

if __name__ == '__main__':
    token = sys.argv[1] if len(sys.argv) > 1 else None
    name = sys.argv[2] if len(sys.argv) > 2 else 'marvel-universe-archive'
    deploy_to_netlify(token, name)
