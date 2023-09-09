const SERVER_URL = "http://localhost:6969"

async function callAI(text, method) {
    let outputString = '';
    let status = 0;
    await new Promise((resolve) => {
        const XHR = new XMLHttpRequest();
        XHR.onreadystatechange = () => {
            if (XHR.readyState === 4) {
                if (XHR.status === 200) {
                    console.log("received");
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
    return { aiResponse: outputString, aiResponseStatus: status };
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
        XHR.send(JSON.stringify({"data": b64img}));
    });
    return {textRead: outputString, textReadStatus: status};
}

function handleCroppedHomework(croppedHomework) {
    let img = document.querySelector("#cropped-homework-image");
    img.removeAttribute("hidden");
    img.src = `data:image/png;base64,${croppedHomework}`;
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

    return {croppedHomework: outputString, croppedHomeworkStatus: status};
}
