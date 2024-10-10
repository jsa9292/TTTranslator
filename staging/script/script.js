//Transcription
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
//Translation
//https://github.com/Venkateeshh/Js-Language-Translator

//import packages
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
    SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
const canWakeLock = () => "wakeLock" in navigator;
let wakelock;

async function lockWakeState() {
    if (!canWakeLock()) return;
    try {
        wakelock = await navigator.wakeLock.request();
        wakelock.addEventListener("release", () => {
            console.log("Screen Wake State Locked:", !wakelock.released);
        });
        console.log("Screen Wake State Locked:", !wakelock.released);
    } catch (e) {
        console.error("Failed to lock wake state with reason:", e.message);
    }
}
lockWakeState();

//initialize dropdowns
const dropdowns = document.querySelectorAll(".dropdown-container"),
    inputLanguageDropdown = document.querySelector("#input-language"),
    outputLanguageDropdown = document.querySelector("#output-language"),
    outputLanguageDropdown2 = document.querySelector("#output-language2");

function populateDropdown(dropdown, options) {
    dropdown.querySelector("ul").innerHTML = "";
    options.forEach((option) => {
        const li = document.createElement("li");
        const title = option.name + " (" + option.native + ")";
        li.innerHTML = title;
        li.dataset.value = option.code;
        li.classList.add("option");
        dropdown.querySelector("ul").appendChild(li);
    });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown2, languages);

dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    });

    dropdown.querySelectorAll(".option").forEach((item) => {
        item.addEventListener("click", () => {
            //remove active class from current dropdowns
            dropdown.querySelectorAll(".option").forEach((item) => {
                item.classList.remove("active");
            });
            item.classList.add("active");
            const selected = dropdown.querySelector(".selected");
            selected.innerHTML = item.innerHTML;
            selected.dataset.value = item.dataset.value;
            localStorage.setItem(dropdown.id, selected.dataset.value);
        });
    });
});

document.addEventListener("click", (e) => {
    dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    });
});

//check cached values and simulate clicks
var inputSaved = localStorage.getItem("input-language");
console.log('[data-value="' + inputSaved + '"]');
if (inputSaved) {
    inputLanguageDropdown
        .querySelector('[data-value="' + inputSaved + '"]')
        .dispatchEvent(new Event("click"));
}

var outputSaved = localStorage.getItem("output-language");
console.log('[data-value="' + outputSaved + '"]');
if (outputSaved) {
    outputLanguageDropdown
        .querySelector('[data-value="' + outputSaved + '"]')
        .dispatchEvent(new Event("click"));
}

var outputSaved2 = localStorage.getItem("output-language2");
console.log('[data-value="' + outputSaved2 + '"]');
if (outputSaved2) {
    outputLanguageDropdown2
        .querySelector('[data-value="' + outputSaved2 + '"]')
        .dispatchEvent(new Event("click"));
}

var inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
var outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
var outputLanguage2 =
    outputLanguageDropdown2.querySelector(".selected").dataset.value;
var content = document.querySelector(".options-wrapper");
var coll = document.querySelector(".collapse");
coll.addEventListener("click", function () {
    this.classList.toggle("active");
    if (content.style.display == "block") {
        content.style.display = "none";
        coll.innerHTML = "보이기";
    } else {
        content.style.display = "block";
        coll.innerHTML = "숨기기";
    }
});

//initialize elements
var transcription = document.querySelector(".transcription");
var transcription_current = transcription.querySelector(".current");
var transcription_current_under = transcription_current.querySelector(".under");
var transcription_current_over = transcription_current.querySelector(".over");

var translation1 = document.querySelector(".translation1");
var translation1_current = translation1.querySelector(".current");
var translation1_current_under = translation1_current.querySelector(".under");
//var translation1_current_over = translation1_current.querySelector(".over");

var translation2 = document.querySelector(".translation2");
var translation2_current = translation2.querySelector(".current");
var translation2_current_under = translation2_current.querySelector(".under");
//var translation2_current_over = translation2_current.querySelector(".over");

var startBtn = document.querySelector(".listenButton");
var stopBtn = document.querySelector(".stopButton");
//var greenScreen = document.querySelector(".greenScreen");

//var continuousCheck = document.querySelector("#continous-check");
//continuousCheck.addEventListener("change", () => {
//    localStorage.setItem("--continous-check", continuousCheck.checked);
//});
//continuousCheck.checked = localStorage.getItem("--continous-check");

var recognition;
var initialized = false;
var stopListening = false;

//Coloris Setup
Coloris.setInstance("#input-color", {
    theme: "polaroid",
    themeMode: "light",
    alpha: true,
    format: "rgb",
    formatToggle: true,
    closeButton: true,
    onChange: (color, input) => {
        localStorage.setItem("--input-color", color);
        document.documentElement.style.setProperty("--input-color", color);
    },
});
var inputColor = document.querySelector("#input-color");
inputColor.value = localStorage.getItem("--input-color");
inputColor.dispatchEvent(new Event("input", { bubbles: true }));
document.documentElement.style.setProperty(
    "--input-color",
    localStorage.getItem("--input-color")
);

Coloris.setInstance("#output-color1", {
    theme: "polaroid",
    themeMode: "light",
    alpha: true,
    format: "rgb",
    formatToggle: true,
    closeButton: true,
    onChange: (color, input) => {
        localStorage.setItem("--output-color1", color);
        document.documentElement.style.setProperty("--output-color1", color);
    },
});
var outputColor1 = document.querySelector("#output-color1");
outputColor1.value = localStorage.getItem("--output-color1");
outputColor1.dispatchEvent(new Event("input", { bubbles: true }));
document.documentElement.style.setProperty(
    "--output-color1",
    localStorage.getItem("--output-color1")
);

Coloris.setInstance("#output-color2", {
    theme: "polaroid",
    themeMode: "light",
    alpha: true,
    format: "rgb",
    formatToggle: true,
    closeButton: true,
    onChange: (color, input) => {
        localStorage.setItem("--output-color2", color);
        document.documentElement.style.setProperty("--output-color2", color);
    },
});
var outputColor2 = document.querySelector("#output-color2");
outputColor2.value = localStorage.getItem("--output-color2");
outputColor2.dispatchEvent(new Event("input", { bubbles: true }));
document.documentElement.style.setProperty(
    "--output-color2",
    localStorage.getItem("--output-color2")
);

Coloris.setInstance("#outline-color", {
    theme: "polaroid",
    themeMode: "light",
    alpha: true,
    format: "rgb",
    formatToggle: true,
    closeButton: true,
    onChange: (color, input) => {
        localStorage.setItem("--outline-color", color);
        document.documentElement.style.setProperty("--outline-color", color);
    },
});
var outlineColor = document.querySelector("#outline-color");
outlineColor.value = localStorage.getItem("--outline-color");
outlineColor.dispatchEvent(new Event("input", { bubbles: true }));
document.documentElement.style.setProperty(
    "--outline-color",
    localStorage.getItem("--outline-color")
);

Coloris.setInstance("#screen-color", {
    theme: "polaroid",
    themeMode: "light",
    alpha: true,
    format: "rgb",
    formatToggle: true,
    closeButton: true,
    onChange: (color, input) => {
        localStorage.setItem("--screen-color", color);
        document.documentElement.style.setProperty("--screen-color", color);
    },
});
var screenColor = document.querySelector("#screen-color");
screenColor.value = localStorage.getItem("--screen-color");
screenColor.dispatchEvent(new Event("input", { bubbles: true }));
document.documentElement.style.setProperty(
    "--screen-color",
    localStorage.getItem("--screen-color")
);

//initialize sliders
var slider1 = document.querySelector("#slider1");
if (localStorage.getItem(slider1.id)) {
    slider1.value = localStorage.getItem(slider1.id);
}
slider1.addEventListener(
    "input",
    function () {
        document.documentElement.style.setProperty(
            "--translation-font-size",
            this.value + "px"
        );
        this.nextElementSibling.textContent = this.value + "px";
        localStorage.setItem(this.id, this.value);
    },
    false
);
slider1.dispatchEvent(new Event("input"));

var slider2 = document.querySelector("#slider2");
if (localStorage.getItem(slider2.id)) {
    slider2.value = localStorage.getItem(slider2.id);
}
slider2.addEventListener(
    "input",
    function () {
        document.documentElement.style.setProperty(
            "--translation-font-weight",
            this.value
        );
        this.nextElementSibling.textContent = this.value;
        localStorage.setItem(this.id, this.value);
    },
    false
);
slider2.dispatchEvent(new Event("input"));

var slider3 = document.querySelector("#slider3");
if (localStorage.getItem(slider3.id)) {
    slider3.value = localStorage.getItem(slider3.id);
}
slider3.addEventListener(
    "input",
    function () {
        document.documentElement.style.setProperty(
            "--translation-outline-thick",
            this.value + "px"
        );
        this.nextElementSibling.textContent = this.value + "px";
        localStorage.setItem(this.id, this.value);
    },
    false
);
slider3.dispatchEvent(new Event("input"));

var slider4 = document.querySelector("#slider4");
if (localStorage.getItem(slider4.id)) {
    slider4.value = localStorage.getItem(slider4.id);
}
slider4.addEventListener(
    "input",
    function () {
        localStorage.setItem(this.id, this.value);
        if (this.value == 0) {
            document.documentElement.style.setProperty(
                "--translation-align",
                "left"
            );
            this.nextElementSibling.textContent = "left";
        } else if (this.value == 1) {
            document.documentElement.style.setProperty(
                "--translation-align",
                "center"
            );
            this.nextElementSibling.textContent = "center";
        } else if (this.value == 2) {
            document.documentElement.style.setProperty(
                "--translation-align",
                "right"
            );
            this.nextElementSibling.textContent = "right";
        }
    },
    false
);
slider4.dispatchEvent(new Event("input"));

var slider5 = document.querySelector("#slider5");
if (localStorage.getItem(slider5.id)) {
    slider5.value = localStorage.getItem(slider5.id);
}
slider5.addEventListener(
    "input",
    function () {
        document.documentElement.style.setProperty(
            "--history-fade-time",
            this.value + "s"
        );
        this.nextElementSibling.textContent = this.value + "s";
        localStorage.setItem(this.id, this.value);
    },
    false
);
slider5.dispatchEvent(new Event("input"));

var slider6 = document.querySelector("#slider6");
if (localStorage.getItem(slider6.id)) {
    slider6.value = localStorage.getItem(slider6.id);
}
slider6.addEventListener(
    "input",
    function () {
        if (this.value == 0) {
            this.nextElementSibling.textContent = "즉시";
        } else {
            this.nextElementSibling.textContent = this.value + " 회당";
        }
        localStorage.setItem(this.id, this.value);
    },
    false
);
slider6.dispatchEvent(new Event("input"));

var phrases = [
    "I love to sing because it's fun",
    "where are you going",
    "can I call you tomorrow",
    "why did you talk while I was talking",
    "she enjoys reading books and playing games",
    "where are you going",
    "have a great day",
    "she sells seashells on the seashore",
];

function randomPhrase() {
    var number = Math.floor(Math.random() * phrases.length);
    return number;
}

function outlineHelper(element, text) {
    element.textContent = text;
    element.nextElementSibling.textContent = text;
}
function startListening() {
    stopListening = false;
    if (!initialized) {
        recognition = new SpeechRecognition();
        recognition.lang = inputLanguage;
        recognition.interimResults = true;
        recognition.maxAlternatives = 0;
        recognition.continuous = true; //continuousCheck.checked;
        //var phrase = phrases[randomPhrase()];
        // To ensure case consistency while checking with the returned output text
        //phrase = phrase.toLowerCase();

        //var grammar =
        //    "#JSGF V1.0; grammar phrase; public <phrase> = " + phrase + ";";
        //var speechRecognitionList = new SpeechGrammarList();
        //speechRecognitionList.addFromString("치지직");
        //speechRecognitionList.addFromString("뚜야");
        //speechRecognitionList.addFromString(grammar, 1);
        //recognition.grammars = speechRecognitionList;

        recognition.start();

        var spokenWords;
        var interimWords;
        var inputText;
        var talkCount = 0;
        var isFinal;
        var translateCycle = 0;
        var translateThres;
        var results;
        var numberOfResults;
    } else {
        recognition.abort();
        console.log("already initialized");
        return;
    }
    recognition.onresult = function (event) {
        //recognition work
        results = event.results;
        numberOfResults = results.length;
        if (0 !== numberOfResults) {
            spokenWords = interimWords = "";
            var index = event.resultIndex;
            isFinal = results[index].isFinal;
            if (isFinal) {
                spokenWords = results[index][0].transcript;
                inputText = spokenWords;
                talkCount++;
            } else {
                for (index = talkCount; index < numberOfResults; index++) {
                    var transcript = results[index][0].transcript;
                    interimWords += transcript;
                    if (0.5 < results[index][0].confidence) {
                        spokenWords += transcript;
                    }
                }
                inputText = interimWords;
            }
        }
        //transcription
        outlineHelper(transcription_current_under, inputText);
        if (isFinal) {
            var newLine = transcription_current.cloneNode(true);
            transcription.insertBefore(newLine, transcription_current);
            newLine.classList.add("fade-out-5s");
            newLine.onanimationend = () => {
                newLine.remove();
            };
            outlineHelper(transcription_current_under, " ");
        }
        if (translateCycle < translateThres && !isFinal) {
            translateCycle += 1;
            return;
        } else {
            translateCycle = 0;
        }
        //translation1
        const url1 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
            inputText
        )}`;
        if (isFinal) {
            fetch(url1)
                .then((response) => response.json())
                .then((json) => {
                    outlineHelper(
                        translation1_current_under,
                        json[0].map((item) => item[0]).join("")
                    );
                    var newLine1 = translation1_current.cloneNode(true);
                    translation1.insertBefore(newLine1, translation1_current);
                    newLine1.classList.add("fade-out-5s");
                    newLine1.onanimationend = () => {
                        newLine1.remove();
                    };
                    outlineHelper(translation1_current_under, " ");
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            fetch(url1)
                .then((response) => response.json())
                .then((json) => {
                    outlineHelper(
                        translation1_current_under,
                        json[0].map((item) => item[0]).join("")
                    );
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        //translation2
        const url2 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage2}&dt=t&q=${encodeURI(
            inputText
        )}`;
        if (isFinal) {
            fetch(url2)
                .then((response) => response.json())
                .then((json) => {
                    outlineHelper(
                        translation2_current_under,
                        json[0].map((item) => item[0]).join("")
                    );
                    var newLine2 = translation2_current.cloneNode(true);
                    translation2.insertBefore(newLine2, translation2_current);
                    newLine2.classList.add("fade-out-5s");
                    newLine2.onanimationend = () => {
                        newLine2.remove();
                    };
                    outlineHelper(translation2_current_under, " ");
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            fetch(url2)
                .then((response) => response.json())
                .then((json) => {
                    outlineHelper(
                        translation2_current_under,
                        json[0].map((item) => item[0]).join("")
                    );
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };
    recognition.onerror = function (event) {
        console.log(event);
        transcription_current_under.textContent = event.message;
        transcription_current_over.textContent = event.message;
    };
    recognition.onstart = function () {
        //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
        console.log("SpeechRecognition.onstart");
        initialized = true;
        inputLanguage =
            inputLanguageDropdown.querySelector(".selected").dataset.value;
        outputLanguage =
            outputLanguageDropdown.querySelector(".selected").dataset.value;
        outputLanguage2 =
            outputLanguageDropdown2.querySelector(".selected").dataset.value;
        translateThres = slider6.value;
    };
    recognition.onend = function () {
        //Fired when the speech recognition service has disconnected.
        console.log("SpeechRecognition.onend");
        spokenWords = interimWords = "";
        talkCount = 0;
        initialized = false;
        if (!stopListening) {
            recognition.start();
        }
    };
    recognition.onspeechend = function () {
        console.log("SpeechRecognition.onspeechend");
    };
    recognition.onaudiostart = function () {
        //Fired when the user agent has started to capture audio.
        console.log("SpeechRecognition.onaudiostart");
    };
    //recognition.onaudioend = function () {
    //Fired when the user agent has finished capturing audio.
    //    console.log("SpeechRecognition.onaudioend");
    //};
    //recognition.onnomatch = function () {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    //    console.log("SpeechRecognition.onnomatch");
    //};
    // recognition.onsoundstart = function () {
    //Fired when any sound — recognisable speech or not — has been detected.
    //    console.log("SpeechRecognition.onsoundstart");
    //};
    //recognition.onsoundend = function () {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    //    console.log("SpeechRecognition.onsoundend");
    //};
    // recognition.onspeechstart = function () {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    //    console.log("SpeechRecognition.onspeechstart");
    //};
}

function endListening() {
    recognition.abort();
    stopListening = true;
}

startBtn.addEventListener("click", startListening);
stopBtn.addEventListener("click", endListening);
