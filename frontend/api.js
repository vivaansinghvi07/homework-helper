const SERVER_URL = "http://localhost:6969"

async function callAI(text, method) {
    let outputString = '';
    let status = 0;
    await new Promise((resolve) => {
        const XHR = new XMLHttpRequest();
        XHR.onreadystatechange = () => {
            if (XHR.readyState === 4) {
                if (XHR.status === 200) {
                    outputString = XHR.responseText;
                } else {
                    status = 1;
                }
                resolve();
            }
        }
        XHR.open("POST", `${SERVER_URL}/api/apply_ai`, true);
        XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        XHR.send(JSON.stringify({"text": text, "method": method}));
    });
    return {aiResponse: outputString, aiResponseStatus: status};
}

async function readText(b64img) {
    let outputString = '';
    let status = 0;
    await new Promise((resolve) => {
        const XHR = new XMLHttpRequest();
        XHR.onreadystatechange = () => {
            if (XHR.readyState === 4) {
                if (XHR.status === 200) {
                    outputString = XHR.responseText;
                } else if (XHR.status === 400) {
                    status = 1;
                }
                resolve();
            }
        };
        XHR.open("POST", `${SERVER_URL}/api/read_text`, true);
        XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        XHR.send(JSON.stringify({
            "data": b64img, "crop_dims": {
                "x1": Math.round(globalStates.selectorCursor.x1 * (1 / globalStates.scaleFactor)),
                "y1": Math.round(globalStates.selectorCursor.y1 * (1 / globalStates.scaleFactor)),
                "x2": Math.round(globalStates.selectorCursor.x2 * (1 / globalStates.scaleFactor)),
                "y2": Math.round(globalStates.selectorCursor.y2 * (1 / globalStates.scaleFactor)),
            }
        }));
    });
    return {textRead: outputString, textReadStatus: status};
}

function handleCroppedHomework(croppedHomework) {

    // loads the image
    let data = JSON.parse(croppedHomework)
    let img = document.querySelector("#cropped-homework-image");
    document.querySelector("#image-container").removeAttribute("hidden");
    img.src = `data:image/png;base64,${data.data}`;

    // calculates scale factor from coordinates found
    let maxWidth = window.innerWidth / 10 * 9;
    let maxHeight = window.innerHeight / 10 * 9;
    let scaleFactor = Math.min(maxWidth / data.width, maxHeight / data.height, 1);

    // adjusts the image container to fit the widths
    document.querySelector("#image-container").style.width = `${Math.round(scaleFactor * data.width)}px`;
    document.querySelector("#image-container").style.height = `${Math.round(scaleFactor * data.height)}px`;

    // set canvas width and height equal to image width and height
    let canvas = document.querySelector("#canvas");
    canvas.style.width = img.style.width;
    canvas.style.height = img.style.height;

    // adjust globals
    globalStates.scaleFactor = scaleFactor;
    globalStates.canvasRect = canvas.getBoundingClientRect();
    renderCropper();
}

async function cropHomework() {

    let outputString = '';
    let status = 0;

    if (!this.files || !this.files[0]) {
        return {croppedHomework: outputString, croppedHomeworkStatus: 1};
    }
    const XHR = new XMLHttpRequest();
    const FR = new FileReader();

    // promise wrapper to get the image data
    await new Promise((resolve) => {
        FR.addEventListener("load", function (evt) {
            let imageData = evt.target.result.split(',')[1];
            XHR.onreadystatechange = () => {
                if (XHR.readyState === 4) {
                    if (XHR.status === 200) {
                        handleCroppedHomework(XHR.responseText);
                    } else {
                        status = 1;
                    }
                    resolve();
                }
            };
            XHR.open("POST", `${SERVER_URL}/api/homework_cropper`, true);
            XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            XHR.send(JSON.stringify({"data": imageData}));
        });
        FR.readAsDataURL(this.files[0]);
    });
}
