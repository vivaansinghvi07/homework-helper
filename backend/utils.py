import cv2
import g4f
import math
import base64
import numpy as np
from flask import request
from paddleocr import PaddleOCR
from requests.exceptions import HTTPError

OCR = PaddleOCR(use_angle_cls=True, lang='en', show_log=False, rotation=True)


def b64_request_to_img() -> cv2.Mat:
    received_image = request.get_json()
    base64_image = received_image["data"]
    np_buf = np.frombuffer(base64.b64decode(base64_image), np.uint8)
    img = cv2.imdecode(np_buf, cv2.IMREAD_COLOR)
    if v := received_image.get("crop_dims", None):
        print(v)
        img = img[
            min(v["y1"], v["y2"]):max(v["y1"], v["y2"]),
            min(v["x1"], v["x2"]):max(v["x1"], v["x2"])
        ]
    return img


def img_to_b64_response(img: cv2.Mat) -> bytes:
    return base64.b64encode(cv2.imencode('.jpg', img)[1])


def get_isolated_homework(img: cv2.Mat):
    """

    Args:
        img: A np.ndarray shaped (None, None, 3) containing image data focusing on a paper.

    Returns: The image, with a warped perspective, focusing on the main paper in the picture.

    """

    # obtains the contour for the paper
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 21, 6)
    dilated = cv2.dilate(thresh, np.ones((3, 3)))
    contours, _ = cv2.findContours(cv2.bitwise_not(dilated, np.full_like(img, 255)), cv2.RETR_TREE,
                                   cv2.CHAIN_APPROX_SIMPLE)
    paper = max(contours, key=lambda cnt: cv2.contourArea(cnt))

    # obtains the four-point approximation for the paper
    min_area_rect = cv2.boxPoints(cv2.minAreaRect(paper))
    points = [None] * 4
    dists = [100_000] * 4
    for point in paper.reshape(-1, 2):
        for i, (rect_point, stored, d) in enumerate(zip(min_area_rect, points, dists)):
            if (new_dist := math.dist(point, rect_point)) < d:
                dists[i] = new_dist
                points[i] = [*point]

    # performs the four-point transform
    points = sorted(points, key=lambda x: x[1])
    tl, tr = sorted(points[0:2], key=lambda x: x[0])
    bl, br = sorted(points[2:4], key=lambda x: x[0])
    max_height = int(max(math.dist(bl, tl), math.dist(br, tr)))
    max_width = int(max(math.dist(bl, br), math.dist(tl, tr)))
    dst = np.array([
        [0, 0],
        [max_width - 1, 0],
        [max_width - 1, max_height - 1],
        [0, max_height - 1]
    ], dtype='float32')
    M = cv2.getPerspectiveTransform(np.array([tl, tr, br, bl], dtype='float32'), dst)
    warped = cv2.warpPerspective(img, M, (max_width, max_height))
    return warped


def _get_y(x: list[int, int]) -> int:
    """

    Args:
        x: A list containing the coordinates for a two-dimensional point.

    Returns: The y-coordinate of the point

    """

    return x[1]


def extract_text_linewise(img: cv2.Mat) -> str:
    """

    Args:
        img: The image from which to read text.

    Returns: A string of interpreted text for the imag.

    """

    # obtains text and other information about the text
    text = OCR.ocr(img)
    boxes = [np.array(t[0], dtype=np.int32) for t in text[0]]
    text_height = np.average(np.array([max(b) - min(b) for b in map(lambda x: list(map(_get_y, x)), boxes)]))
    top_to_bottom = sorted(text[0], key=lambda x: min(map(_get_y, x[0])))

    # determines whether to merge each line with the previous one
    merge_with_prev = [max(map(_get_y, prev[0])) - min(map(_get_y, line[0])) > text_height // 2 for prev, line in
                       zip(top_to_bottom, top_to_bottom[1:])]

    # builds final string
    final_string = ""
    for merge, [_, (line, _)] in zip([True] + merge_with_prev, top_to_bottom):
        if merge:
            final_string += f"{line} "
        else:
            final_string += f"\n{line} "
    return final_string


def get_ai_response(prompt: str, problem: str) -> tuple[int, str]:
    try:
        response = g4f.ChatCompletion.create(
            model=g4f.models.gpt_4,
            messages=[{"role": "user", "content": prompt.format(problem)}],
            provider=g4f.Provider.DeepAi
        )
        print(response)
        return 0, response
    except HTTPError:
        return 1, ''
