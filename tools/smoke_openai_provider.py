import sys
import os
import re
import json
import subprocess
import urllib.request
import urllib.error
import getpass

PROJECT_REF = "typcvaszcfdpkzbjzuur"
ENV_FILE = "runtime/iskraSpace/.env.local"

def load_env_vars():
    """Load URL and Anon Key from .env.local file."""
    url, anon_key = None, None
    if os.path.exists(ENV_FILE):
        print(f"[INFO] Reading configuration from {ENV_FILE}...")
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            url_match = re.search(r'VITE_SUPABASE_URL=["\']?([^"\']+)["\']?', content)
            key_match = re.search(r'VITE_SUPABASE_ANON_KEY=["\']?([^"\']+)["\']?', content)
            if url_match:
                url = url_match.group(1)
            if key_match:
                anon_key = key_match.group(1)
    return url, anon_key

def run_command(args):
    """Run a system command and return exit code, stdout, stderr."""
    try:
        res = subprocess.run(args, capture_output=True, text=True, shell=True)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return -1, "", str(e)

def main():
    print("==========================================================")
    print(" Iskra Supabase Edge Function OpenAI Live Smoke Test")
    print("==========================================================")

    # 1. Load env configuration
    sb_url, sb_anon_key = load_env_vars()
    if not sb_url or not sb_anon_key:
        print("[ERROR] Could not load VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY from .env.local.")
        sb_url = input("Enter Supabase Project URL (e.g. https://xxxx.supabase.co): ").strip()
        sb_anon_key = input("Enter Supabase Anon API Key: ").strip()
    else:
        print(f"[INFO] Found URL: {sb_url}")
        print(f"[INFO] Found Anon Key: {sb_anon_key[:12]}...")

    # 2. Get OpenAI API Key
    openai_key = getpass.getpass("Enter your OPENAI_API_KEY (input is hidden): ").strip()
    if not openai_key:
        print("[ERROR] OpenAI API Key cannot be empty.")
        sys.exit(1)

    # 3. Set secrets in Supabase via CLI
    print(f"\n[INFO] Setting OPENAI_API_KEY secret in Supabase project {PROJECT_REF}...")
    # Escape token for powershell/cmd execution
    code, out, err = run_command(f'npx supabase secrets set --project-ref {PROJECT_REF} OPENAI_API_KEY="{openai_key}"')
    if code != 0:
        print(f"[ERROR] Failed to set Supabase secrets. Code: {code}")
        print(f"Stdout: {out}")
        print(f"Stderr: {err}")
        sys.exit(1)
    print("[SUCCESS] Secret successfully configured in Supabase.")

    # 4. Perform the HTTP POST Request to Deno Edge Function
    url = f"{sb_url}/functions/v1/gemini"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {sb_anon_key}",
        "apikey": sb_anon_key
    }
    payload = {
        "action": "generateContent",
        "provider": "openai",
        "contents": "Say: Iskra OpenAI live smoke test successful."
    }

    print(f"\n[INFO] Sending HTTP POST request to Edge Function: {url}...")
    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")

    test_passed = False
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            resp_body = response.read().decode("utf-8")
            resp_code = response.getcode()
            print(f"[INFO] Response HTTP Code: {resp_code}")
            print(f"[INFO] Response Body: {resp_body}")
            
            # Verify response shape
            data = json.loads(resp_body)
            if "text" in data and ("success" in data["text"].lower() or "iskra" in data["text"].lower()):
                print("\n[SUCCESS] OpenAI live provider smoke test PASSED!")
                test_passed = True
            else:
                print("\n[WARNING] Response received, but response text doesn't match expected pattern.")
    except urllib.error.HTTPError as e:
        print(f"\n[ERROR] HTTP Request failed with code {e.code}")
        try:
            err_body = e.read().decode("utf-8")
            print(f"Error Response Body: {err_body}")
        except Exception:
            pass
    except Exception as e:
        print(f"\n[ERROR] Request failed: {e}")

    # 5. Clean up secrets from Supabase
    print(f"\n[INFO] Cleaning up secrets: unsetting OPENAI_API_KEY in Supabase...")
    code, out, err = run_command(f"npx supabase secrets unset --project-ref {PROJECT_REF} OPENAI_API_KEY")
    if code != 0:
        print(f"[WARNING] Failed to clean up secret. Please clean up manually. Stderr: {err}")
    else:
        print("[SUCCESS] OPENAI_API_KEY unset from Supabase.")

    print("\n==========================================================")
    if test_passed:
        print(" Smoke test results: SUCCESS")
    else:
        print(" Smoke test results: FAILED")
    print("==========================================================")

if __name__ == "__main__":
    main()
