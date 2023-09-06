import cv2
import math
import numpy as np


def get_isolated_homework(img: cv2.Mat):

    """
    Returns: a new image, with a transform applied to isolate the paper from the image
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
