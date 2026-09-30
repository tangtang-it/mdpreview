import json
import urllib.request

payload = {
    "host": "mdpreview.dev",
    "key": "7e3b9f84a1d64c0e8f2a5b1c9d3e7f41",
    "keyLocation": "https://mdpreview.dev/7e3b9f84a1d64c0e8f2a5b1c9d3e7f41.txt",
    "urlList": [
        "https://mdpreview.dev/",
        "https://mdpreview.dev/es/",
        "https://mdpreview.dev/pt/",
        "https://mdpreview.dev/about.html",
        "https://mdpreview.dev/privacy.html",
        "https://mdpreview.dev/terms.html",
        "https://mdpreview.dev/contact.html",
    ]
}

data = json.dumps(payload).encode('utf-8')
headers = {'Content-Type': 'application/json; charset=utf-8'}

endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
]

for url in endpoints:
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as resp:
            print(f"{url} -> HTTP {resp.status} (OK)")
    except urllib.error.HTTPError as e:
        print(f"{url} -> HTTP {e.code} {e.reason}")
    except Exception as e:
        print(f"{url} -> Error: {e}")
