function getX(event) {
    return event.clientX + window.scrollX - globalStates.canvasRect.left;
}

function getY(event) {
    return event.clientY + window.scrollY - globalStates.canvasRect.top;
}

function fillBackground(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fill();
}

function drawSelectedRect(ctx) {
    ctx.beginPath();
    ctx.rect(globalStates.selectorCursor.x1, globalStates.selectorCursor.y1, (globalStates.selectorCursor.x2 - globalStates.selectorCursor.x1), globalStates.selectorCursor.y2 - globalStates.selectorCursor.y1);
    ctx.clearRect(globalStates.selectorCursor.x1, globalStates.selectorCursor.y1, (globalStates.selectorCursor.x2 - globalStates.selectorCursor.x1), globalStates.selectorCursor.y2 - globalStates.selectorCursor.y1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "white";
    ctx.stroke();
}


function renderCropper() {

    // get current canvas
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");

    // set width and height to match image
    canvas.width = globalStates.canvasRect.right - globalStates.canvasRect.left;
    canvas.height = globalStates.canvasRect.bottom - globalStates.canvasRect.top;

    // set initial values
    fillBackground(canvas, ctx);
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";

    // when user starts selecting
    canvas.addEventListener("mousedown", (event) => {
        if (!globalStates.selectorMouseDown) {
            globalStates.selectorCursor.x1 = getX(event);
            globalStates.selectorCursor.y1 = getY(event);
            globalStates.selectorMouseDown = true;
        }
    });

    // when user is done selecting
    canvas.addEventListener("mouseup", (event) => {
        // set final x and y values
        globalStates.selectorCursor.x2 = getX(event);
        globalStates.selectorCursor.y2 = getY(event);
        globalStates.selectorMouseDown = false;

        // draw final lined rectangle
        drawSelectedRect(ctx);
    });
    canvas.onmousemove = (event) => {
        if (globalStates.selectorMouseDown) {

            // put background back
            fillBackground(canvas, ctx);

            // obtain current cursor values
            globalStates.selectorCursor.x2 = getX(event);
            globalStates.selectorCursor.y2 = getY(event);

            // draw the rectangle
            drawSelectedRect(ctx);

        }
    }
}