"""
SecureVote - Military-Grade Face Recognition Microservice v2.1
==============================================================
Security Pipeline (per request):
  1. Decode base64 image
  2. validate_image_quality() → LOW_LIGHT_DETECTED | IMAGE_BLURRED
  3. CLAHE low-light enhancement
  4. Face detection → NO_FACE_FOUND | MULTIPLE_FACES_DETECTED
  5. LBP liveness → SPOOF_DETECTED
  6. 128-d encoding / matching at strict tolerance 0.45
     → DUPLICATE_VOTER | FACE_MISMATCH

All errors use standardized: { success, message, errorCode, details? }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import cv2
import base64
import io
import logging
import os
from PIL import Image
from dotenv import load_dotenv
from skimage.feature import local_binary_pattern

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:8080"])

# ─── Tunable Thresholds ───────────────────────────────────────────────────────
FACE_MATCH_TOLERANCE = 0.45
BLUR_THRESHOLD       = 80.0
LOW_LIGHT_THRESHOLD  = 50     # avg grayscale pixel intensity
LIVENESS_THRESHOLD   = 0.18
LBP_RADIUS           = 1
LBP_N_POINTS         = 8


# ==============================================================================
# Standardized error builder
# ==============================================================================

def err(message: str, error_code: str, http_status: int = 400, details: dict = None):
    """Return a standardized (body_dict, http_status) tuple."""
    body = {"success": False, "message": message, "errorCode": error_code}
    if details:
        body["details"] = details
    return body, http_status


# ==============================================================================
# Stage 1 — Decode
# ==============================================================================

def decode_base64_image(b64: str) -> np.ndarray:
    if ',' in b64:
        b64 = b64.split(',')[1]
    data = base64.b64decode(b64)
    img  = Image.open(io.BytesIO(data))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return np.array(img)


# ==============================================================================
# Stage 2 — validate_image_quality  ← deliverable helper function
# ==============================================================================

def validate_image_quality(image_array: np.ndarray):
    """
    Runs environmental checks BEFORE the heavy dlib encoding pipeline.
    Returns (error_body, http_status) if a check fails, or (None, None) if OK.

    Checks (in order of cheapness):
      A. Low-light:  avg grayscale intensity < LOW_LIGHT_THRESHOLD
      B. Blur:       Laplacian variance       < BLUR_THRESHOLD
    """
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)

    # A. Low-light check (O(N) pixel mean — very fast)
    avg_intensity = float(np.mean(gray))
    if avg_intensity < LOW_LIGHT_THRESHOLD:
        return err(
            "You are in low light. Please turn on your lights or move to a brighter area.",
            "LOW_LIGHT_DETECTED",
            http_status=400,
            details={"avg_intensity": round(avg_intensity, 2), "threshold": LOW_LIGHT_THRESHOLD}
        )

    # B. Blur check (Laplacian variance)
    variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if variance < BLUR_THRESHOLD:
        return err(
            "The image is too blurry. Please hold the camera steady and clean your lens.",
            "IMAGE_BLURRED",
            http_status=400,
            details={"variance": round(variance, 2), "threshold": BLUR_THRESHOLD}
        )

    return None, None   # all quality checks passed


# ==============================================================================
# Stage 3 — CLAHE low-light enhancement
# ==============================================================================

def apply_clahe(image_array: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    cl = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(l)
    return cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2RGB)


# ==============================================================================
# Stage 4 — Face detection validation
# ==============================================================================

def detect_single_face(image_array: np.ndarray):
    """
    Returns (face_locations, error_body, http_status).
    error_body is None when exactly one face is found.
    """
    locs = face_recognition.face_locations(image_array, model="hog")

    if len(locs) == 0:
        return None, *err(
            "No face detected. Please position your face clearly in the center of the frame.",
            "NO_FACE_FOUND"
        )

    if len(locs) > 1:
        return None, *err(
            "Multiple faces detected. For security, ensure only you are in the frame.",
            "MULTIPLE_FACES_DETECTED"
        )

    return locs, None, None


# ==============================================================================
# Stage 5 — LBP liveness / anti-spoof
# ==============================================================================

def check_liveness(image_array: np.ndarray, face_location: tuple):
    """Returns (is_live, spoof_score)."""
    top, right, bottom, left = face_location
    h, w = image_array.shape[:2]
    pv = int((bottom - top) * 0.2);  ph = int((right - left) * 0.2)
    roi = image_array[max(0, top - pv):min(h, bottom + pv),
                      max(0, left - ph):min(w, right + ph)]
    gray = cv2.resize(cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY), (128, 128))
    lbp  = local_binary_pattern(gray, LBP_N_POINTS, LBP_RADIUS, method='uniform')
    hist, _ = np.histogram(lbp.ravel(), bins=LBP_N_POINTS + 2,
                           range=(0, LBP_N_POINTS + 2), density=True)
    score = float(hist[0] + hist[-1])
    return score < LIVENESS_THRESHOLD, round(score, 4)


# ==============================================================================
# FULL PIPELINE HELPER
# ==============================================================================

class PipelineError(Exception):
    def __init__(self, body, status):
        self.body   = body
        self.status = status

def run_pipeline(b64_image: str, skip_liveness: bool = False):
    """
    Runs all stages in order. Returns:
      (image_array, encoding_list, face_location)  on success
    Raises PipelineError on any failure.
    """
    # S1: Decode
    try:
        img = decode_base64_image(b64_image)
    except Exception:
        raise PipelineError(*err("Invalid image data. Please retake the photo.", "INVALID_IMAGE"))

    # S2: Quality gate (cheap checks before dlib)
    body, status = validate_image_quality(img)
    if body:
        raise PipelineError(body, status)

    # S3: CLAHE
    img = apply_clahe(img)

    # S4: Face detection
    locs, body, status = detect_single_face(img)
    if body:
        raise PipelineError(body, status)

    # S5: Liveness
    if not skip_liveness:
        is_live, score = check_liveness(img, locs[0])
        if not is_live:
            raise PipelineError(*err(
                "Liveness check failed. Please look directly at the camera and ensure "
                "you are not holding a photo.",
                "SPOOF_DETECTED",
                http_status=403,
                details={"spoof_score": score, "threshold": LIVENESS_THRESHOLD}
            ))

    # S6: Encode
    encoding = face_recognition.face_encodings(img, locs)[0]
    return img, encoding.tolist(), locs[0]


# ==============================================================================
# ROUTES
# ==============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status":   "OK",
        "service":  "SecureVote Face Recognition (v2.1 — hardened)",
        "pipeline": {
            "low_light_check": True,
            "blur_check":      True,
            "clahe":           True,
            "liveness":        True,
            "tolerance":       FACE_MATCH_TOLERANCE,
        }
    }), 200


# ─── /encode — Registration pipeline ────────────────────────────────────────

@app.route('/encode', methods=['POST'])
def encode_face():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "No image provided.",
                            "errorCode": "MISSING_IMAGE"}), 400

        _, encoding, _ = run_pipeline(data['image'])
        return jsonify({
            "success":  True,
            "encoding": encoding,
            "message":  "Face encoding generated successfully.",
        }), 200

    except PipelineError as pe:
        return jsonify(pe.body), pe.status
    except Exception as e:
        logger.error(f"/encode error: {e}")
        return jsonify({"success": False,
                        "message": "An unexpected error occurred. Please try again.",
                        "errorCode": "SERVER_ERROR"}), 500


# ─── /verify — Login-time verification + face match ─────────────────────────

@app.route('/verify', methods=['POST'])
def verify_face():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "No image provided.",
                            "errorCode": "MISSING_IMAGE"}), 400

        _, live_encoding, face_loc = run_pipeline(data['image'])

        result = {
            "success":      True,
            "face_detected": True,
            "face_location": {"top": face_loc[0], "right": face_loc[1],
                              "bottom": face_loc[2], "left": face_loc[3]},
            "live_encoding": live_encoding,
        }

        # If a known encoding was provided, match it
        if 'known_encoding' in data:
            dist      = float(face_recognition.face_distance(
                [np.array(data['known_encoding'])], np.array(live_encoding))[0])
            is_match  = dist <= FACE_MATCH_TOLERANCE
            result["match"]     = is_match
            result["distance"]  = round(dist, 4)
            result["tolerance"] = FACE_MATCH_TOLERANCE

            if not is_match:
                return jsonify({
                    "success":   False,
                    "message":   "Face verification failed. Please ensure you are the registered voter.",
                    "errorCode": "FACE_MISMATCH",
                    "details":   {"distance": round(dist, 4), "tolerance": FACE_MATCH_TOLERANCE}
                }), 401

        return jsonify(result), 200

    except PipelineError as pe:
        return jsonify(pe.body), pe.status
    except Exception as e:
        logger.error(f"/verify error: {e}")
        return jsonify({"success": False,
                        "message": "An unexpected error occurred. Please try again.",
                        "errorCode": "SERVER_ERROR"}), 500


# ─── /compare — Raw encoding comparison ─────────────────────────────────────

@app.route('/compare', methods=['POST'])
def compare_face_encodings():
    try:
        data = request.get_json()
        if not data or 'known_encoding' not in data or 'unknown_encoding' not in data:
            return jsonify({"success": False, "message": "Both encodings are required.",
                            "errorCode": "MISSING_ENCODING"}), 400

        tolerance = float(data.get('tolerance', FACE_MATCH_TOLERANCE))
        dist      = float(face_recognition.face_distance(
            [np.array(data['known_encoding'])], np.array(data['unknown_encoding']))[0])
        is_match  = dist <= tolerance

        return jsonify({
            "success": True,
            "result":  {"match": is_match, "distance": round(dist, 4), "tolerance": tolerance}
        }), 200

    except Exception as e:
        logger.error(f"/compare error: {e}")
        return jsonify({"success": False,
                        "message": "Comparison failed. Please try again.",
                        "errorCode": "SERVER_ERROR"}), 500


# ─── /detect — Detection only (no liveness) ──────────────────────────────────

@app.route('/detect', methods=['POST'])
def detect_faces():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "No image provided.",
                            "errorCode": "MISSING_IMAGE"}), 400

        img  = decode_base64_image(data['image'])
        img  = apply_clahe(img)
        locs = face_recognition.face_locations(img, model="hog")

        return jsonify({
            "success":        True,
            "face_count":     len(locs),
            "face_locations": [{"top": l[0], "right": l[1], "bottom": l[2], "left": l[3]}
                               for l in locs],
        }), 200

    except Exception as e:
        logger.error(f"/detect error: {e}")
        return jsonify({"success": False,
                        "message": "Detection failed. Please try again.",
                        "errorCode": "SERVER_ERROR"}), 500


# ─── /api/verify-unique — Duplicate biometric check (1:N) ───────────────────

@app.route('/api/verify-unique', methods=['POST'])
def verify_unique():
    """
    1:N biometric duplicate check for voter registration.
    Payload: { "encoding": [...128...], "all_encodings": [[...], ...] }
    """
    try:
        data = request.get_json()
        if not data or 'encoding' not in data or 'all_encodings' not in data:
            return jsonify({"success": False,
                            "message": "Both 'encoding' and 'all_encodings' are required.",
                            "errorCode": "MISSING_PARAMS"}), 400

        new_enc  = np.array(data['encoding'])
        all_encs = [np.array(e) for e in data['all_encodings']]

        if not all_encs:
            return jsonify({"success": True, "is_unique": True,
                            "message": "No existing encodings to compare against."}), 200

        distances    = face_recognition.face_distance(all_encs, new_enc)
        closest_dist = float(np.min(distances))
        closest_idx  = int(np.argmin(distances))

        if closest_dist <= FACE_MATCH_TOLERANCE:
            logger.warning(f"Duplicate biometric at index {closest_idx}, dist={closest_dist:.4f}")
            return jsonify({
                "success":   False,
                "is_unique": False,
                "message":   "This person is already registered in the system. "
                             "Double voting is strictly prohibited.",
                "errorCode": "DUPLICATE_VOTER",
                "details":   {"closest_distance": round(closest_dist, 4),
                              "threshold":        FACE_MATCH_TOLERANCE,
                              "matched_index":    closest_idx}
            }), 409

        return jsonify({
            "success":          True,
            "is_unique":        True,
            "closest_distance": round(closest_dist, 4),
            "message":          "Biometric is unique — registration allowed."
        }), 200

    except Exception as e:
        logger.error(f"/api/verify-unique error: {e}")
        return jsonify({"success": False,
                        "message": "Uniqueness check failed. Please try again.",
                        "errorCode": "SERVER_ERROR"}), 500


# ─── Global Error Handler ─────────────────────────────────────────────────────

@app.errorhandler(Exception)
def handle_error(e):
    logger.error(f"Unhandled error: {e}")
    return jsonify({
        "success":   False,
        "message":   "An unexpected error occurred. Please try again.",
        "errorCode": "SERVER_ERROR"
    }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"SecureVote Face Service v2.1 starting on port {port}")
    logger.info(f"Thresholds: LowLight={LOW_LIGHT_THRESHOLD} | "
                f"Blur={BLUR_THRESHOLD} | Liveness={LIVENESS_THRESHOLD} | "
                f"Tolerance={FACE_MATCH_TOLERANCE}")
    app.run(host='0.0.0.0', port=port, debug=False)