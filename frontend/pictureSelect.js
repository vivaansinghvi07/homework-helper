var c = [];
var mouseDown = false;
var c1X = 0;
var c1Y = 0;
var c2X = 0;
var c2Y = 0;


function initial() {
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    ctx.setLineDash([5, 5]);
    canvas.addEventListener("mousedown", (event) => {
        c = [];
        if (!mouseDown) {
            c1X = event.clientX - globalStates.canvasRect.left;
            c1Y = event.clientY - globalStates.canvasRect.top;
            mouseDown = true;
        }
    });
    canvas.addEventListener("mouseup", (event) => {
        mouseDown = false;
        c2X = event.clientX - globalStates.canvasRect.left;
        c2Y = event.clientY - globalStates.canvasRect.top;


        ctx.beginPath();

        ctx.rect(c1X, c1Y, (c2X - c1X), c2Y - c1Y);
        ctx.clearRect(c1X, c1Y, (c2X - c1X), c2Y - c1Y);
        ctx.globalAlpha = 1;
        ctx.stroke();

        //ctx.globalAlpha = 0.2;
        //ctx.fillStyle = "white";
        //ctx.fill();


        //alert(cX+" "+cY)
        c.push(c1X, c1Y, c2X, c2Y)
        console.log(c);
        c1X = 0;
        c1Y = 0;
        c2X = 0;
        c2Y = 0;
    });
    canvas.onmousemove = (event) => {
        if (mouseDown) {

            // clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.;
            ctx.fillStyle = "grey";
            ctx.fill();
            c2X = event.clientX - globalStates.canvasRect.left;
            c2Y = event.clientY - globalStates.canvasRect.top;

            ctx.beginPath();

            ctx.rect(c1X, c1Y, (c2X - c1X), c2Y - c1Y);
            ctx.globalAlpha = 1;
            ctx.stroke();

        }
    }
}