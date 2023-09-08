const SERVER_URL = "http://localhost:6969"

function readText(b64img) {
    const XHR = new XMLHttpRequest();
    XHR.onreadystatechange = () => {
        if (XHR.readyState === 4 && XHR.status === 200) {
            console.log(XHR.responseText);
        }
    };
    XHR.open("POST", `${SERVER_URL}/api/read_text`, true);
    XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    XHR.send(JSON.stringify({"data": b64img}));
}

async function cropHomework() {
    if (!this.files || !this.files[0]) return;
    const XHR = new XMLHttpRequest();
    const FR = new FileReader();

    // very messy solution for submit button, but works
    await new Promise((resolve) => {
        document.querySelector("#homework-image-submit").addEventListener("click", () => {
            resolve();
        });
    });

    FR.addEventListener("load", function (evt) {
        let imageData = evt.target.result.split(',')[1];
        XHR.onreadystatechange = () => {
            if (XHR.readyState === 4 && XHR.status === 200) {
                let imgData = XHR.responseText;
                let img = document.querySelector("#cropped-homework-image");
                img.removeAttribute("hidden");
                img.src = `data:image/png;base64,${imgData}`;
                readText(imgData);
            }
        };
        XHR.open("POST", `${SERVER_URL}/api/homework_cropper`, true);
        XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        XHR.send(JSON.stringify({"data": imageData}));
    });
    FR.readAsDataURL(this.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#homework-image").addEventListener("change", cropHomework);
})