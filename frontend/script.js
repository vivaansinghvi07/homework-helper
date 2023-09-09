const storedTexts = {
    texts: [],
    add (val) {
        this.texts.push(val);
        storedTextsCallback(this.texts);
    },
    remove (index) {
        this.texts.splice(index, 1);
        storedTextsCallback(this.texts);
    }
}


function storedTextsCallback() {
    let textContainer = document.querySelector("#stored-texts-container");
    if (storedTexts.texts.length === 0) {
        textContainer.setAttribute("hidden", "hidden")
    } else {
        textContainer.removeAttribute("hidden");
    }

    // render texts
    let fullHTMLString = "";
    storedTexts.texts.forEach((value, index) => {
        fullHTMLString += `
            <hr>
            <div>
                <div class="stored-question-button-container">
                    <input id="question${index}gen-questions" type="submit" value="Generate Practice">
                    <input id="question${index}solve" type="submit" value="Solve">
                    <input id="question${index}remove" type="submit" value="Remove">
                </div>
                <h3>Question ${index+1}</h3>
                <pre class="stored-question" id="question-${index}">${value}</pre>
                <div id="question${index}solution" hidden="hidden">
                    <h4>Solution</h4>
                    <p style="margin-left: 20px;" id="question${index}solution-text"></p>
                </div>
                <div id="question${index}practice" hidden="hidden">
                    <h4>Practice</h4>
                    <ol id="question${index}practice-text"></ol>
                </div>
            </div>
        `;
    });
    document.querySelector("#stored-texts").innerHTML = fullHTMLString;

    // load removal for each
    for (let i = 0; i < storedTexts.texts.length; i++) {
        document.querySelector(`#question${i}remove`).addEventListener("click", () => {
            storedTexts.remove(i);
        });
        document.querySelector(`#question${i}solve`).addEventListener("click", async () => {
            showLoading();
            const { aiResponse } = await callAI(storedTexts.texts[i], "ANSWER");
            hideLoading();
            document.querySelector(`#question${i}solution`).removeAttribute("hidden");
            document.querySelector(`#question${i}solution-text`).innerHTML = aiResponse;

        });
        document.querySelector(`#question${i}gen-questions`).addEventListener("click", async () => {
            showLoading();
            const { aiResponse } = await callAI(storedTexts.texts[i], "PRACTICE");
            hideLoading();
            const questions = aiResponse.split("\n---\n");
            let questionListHTML = '';
            for (const q of questions) {
                questionListHTML += `<li>${q}</li>`;
            }
            document.querySelector(`#question${i}practice`).removeAttribute("hidden");
            document.querySelector(`#question${i}practice-text`).innerHTML = questionListHTML;
        })
    }
}

function showLoading() {
    document.querySelector("#loading-container").removeAttribute("hidden");
}

function hideLoading() {
    document.querySelector("#loading-container").setAttribute("hidden", "hidden");
}

document.addEventListener("DOMContentLoaded", () => {

    // handle user entering new files
    document.querySelector("#homework-image").addEventListener("change", cropHomework);
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "attributes") {
                if (mutation.attributeName === "src") {
                    console.log("Handle new file here.");
                }
            }
        }
    }).observe(document.querySelector("#cropped-homework-image"), {attributes: true});


    // assume we have our data
    document.querySelector("#text-read-submit").addEventListener("click", async () => {
        let imgData = document.querySelector("#cropped-homework-image").src.split(",")[1];
        showLoading();
        const {textRead, textReadStatus} = await readText(imgData);
        hideLoading();
        if (textReadStatus === 0) {
            document.querySelector("#text-confirmation-container").removeAttribute("hidden");
            document.querySelector("#text-confirmation-textedit").value = textRead;
        }
    });

    // check for text submission
    document.querySelector("#text-confirmation-submit").addEventListener("click", () => {
        let text = document.querySelector("#text-confirmation-textedit").value;
        document.querySelector("#text-confirmation-container").setAttribute("hidden", "hidden")
        storedTexts.add(text);
    });
});