
import base64
import requests
import sys

def test_encode(image_path):
    with open(image_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode("utf-8")
    
    url = "http://localhost:5000/encode"
    response = requests.post(url, json={"image": img_base64})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_encode(sys.argv[1])
    else:
        print("Usage: python test_face_service.py <image_path>")
