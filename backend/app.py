import json
import flask
from utils import (
    get_ai_response,
    b64_request_to_img,
    img_to_b64_response,
    get_isolated_homework,
    extract_text_linewise,
)
from flask_cors import CORS
from flask import Flask, request, Response


# setup app
app = Flask(__name__)
CORS(app)


@app.route("/")
def hello():
    return "Hello, World!"


@app.route('/api/homework_cropper', methods=["POST"])
def homework_cropper() -> Response:
    img = b64_request_to_img()
    cropped_homework = get_isolated_homework(img)
    return Response(response=img_to_b64_response(cropped_homework), status=200)


@app.route('/api/read_text', methods=["POST"])
def read_text() -> Response:
    img = b64_request_to_img()
    text = extract_text_linewise(img)
    return Response(response=text, status=200)


@app.route('/api/apply_ai', methods=["POST"])
def apply_ai() -> Response:
    data = request.get_json()
    method = data["method"]
    if method == "ANSWER":
        prompt = """\
        Answer the following question. If there are many answers, number your answers \
        in the same way as the questions are numbered. Here is the question:
        {}
        """
    elif method == "PRACTICE":
        prompt = """\
        Generate practice problems similar to the question below, where each problem \
        is seperated by "\n". Do not start each problem with a number:
        {}
        """
    else:
        return Response(response="Bad prompt request", status=400)
    status, response = get_ai_response(prompt, data["text"])
    if status == 1:
        return Response(response="AI Failed", status=400)
    return Response(response=response, status=200)


if __name__ == "__main__":
    app.run("localhost", 6969)
