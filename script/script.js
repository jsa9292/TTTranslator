//Transcription
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
//Translation
//https://github.com/Venkateeshh/Js-Language-Translator
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var phrases = [
  'I love to sing because it\'s fun',
  'where are you going',
  'can I call you tomorrow',
  'why did you talk while I was talking',
  'she enjoys reading books and playing games',
  'where are you going',
  'have a great day',
  'she sells seashells on the seashore'
];

var coll = document.querySelector(".collapse");
var content = document.querySelector(".options-wrapper");
coll.addEventListener("click", function() {
    this.classList.toggle("active");
    if (content.style.display === "block") {
        content.style.display = "none";
        coll.innerHTML = "보이기";
    } else {
        content.style.display = "block";
        coll.innerHTML = "숨기기";
    }
});
var transcription = document.querySelector('.transcription');
var translation1 = document.querySelector('.translation1');
var translation2 = document.querySelector('.translation2');

var testBtn = document.querySelector('.listenButton');
function randomPhrase() {
  var number = Math.floor(Math.random() * phrases.length);
  return number;
}

var recognition;
var initialized = false;

var slider1 = document.querySelector(".slider1");
var slider2 = document.querySelector(".slider2");
var slider3 = document.querySelector(".slider3");
var slider4 = document.querySelector(".slider4");
slider1.addEventListener('input', function() {
  console.log(this.value);
  document.documentElement.style.setProperty('--translation-font-size', this.value+'px');
}, false);
slider2.addEventListener('input', function() {
  console.log(this.value);
  document.documentElement.style.setProperty('--translation-font-weight', this.value);
}, false);
slider3.addEventListener('input', function() {
  console.log(this.value);
  document.documentElement.style.setProperty('--translation-outline-thick', this.value+'px');
}, false);
slider4.addEventListener('input', function() {
  console.log(this.value);
  if(this.value == 0){
      transcription.style.textAlign = "left";
      translation1.style.textAlign = "left";
      translation2.style.textAlign = "left";
  }
  else if(this.value == 1){
      transcription.style.textAlign = "center";
      translation1.style.textAlign = "center";
      translation2.style.textAlign = "center";
  }
  else if(this.value == 2){
      transcription.style.textAlign = "right";
      translation1.style.textAlign = "right";
      translation2.style.textAlign = "right";
  }
}, false);


function testSpeech() {
  if (initialized) {
      recognition.abort();
      return;
  }
  var phrase = phrases[randomPhrase()];
  // To ensure case consistency while checking with the returned output text
  phrase = phrase.toLowerCase();

  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString("치지직");
  speechRecognitionList.addFromString("뚜야");
  speechRecognitionList.addFromString(grammar, 1);

  recognition = new SpeechRecognition();
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;
  recognition.start();

  recognition.onresult = function(event) {
    transcription.textContent = event.results[event.results.length-1][0].transcript;
    transcription.nextElementSibling.textContent = transcription.textContent;
    document.documentElement.style.setProperty('--transcription', transcription.textContent);
    
    const inputText = transcription.textContent;
    const inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
    const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
    const outputLanguage2 =
    outputLanguageDropdown2.querySelector(".selected").dataset.value;


    const url1 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
    inputText,
    )}`;
    fetch(url1)
    .then((response) => response.json())
    .then((json) => {
        translation1.textContent = json[0].map((item) => item[0]).join("");
        translation1.nextElementSibling.textContent = translation1.textContent;
    })
    .catch((error) => {
        console.log(error);
    });
    

    const url2 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage2}&dt=t&q=${encodeURI(
    inputText,
    )}`;
    fetch(url2)
    .then((response) => response.json())
    .then((json) => {
        translation2.textContent = json[0].map((item) => item[0]).join("");
        translation2.nextElementSibling.textContent = translation2.textContent;
        console.log(json)
    })
    .catch((error) => {
        console.log(error);
    });
  }

  recognition.onspeechend = function() {
    console.log("SpeechRecognition.onspeechend")
  }

  recognition.onerror = function(event) {
    testBtn.disabled = false;
    testBtn.textContent = '에러';
    transcription.textContent = event.error;
  }
  




  recognition.onaudiostart = function(event) {
      //Fired when the user agent has started to capture audio.
      console.log('SpeechRecognition.onaudiostart');
  }
  
  recognition.onaudioend = function(event) {
      //Fired when the user agent has finished capturing audio.
      console.log('SpeechRecognition.onaudioend');
  }
  
  recognition.onend = function(event) {
      //Fired when the speech recognition service has disconnected.
      console.log('SpeechRecognition.onend');
      initialized = false;
      testBtn.textContent = '시작';
      transcription.textContent = "";
      translation1.textContent = "";
      translation2.textContent = "";
      recognition.start();
  }
  
  recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
  }
  
  recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
  }
  
  recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend');
  }
  
  recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
      initialized = true;
      testBtn.textContent = '정지';
  }
}

testBtn.addEventListener('click', testSpeech);





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
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      //remove active class from current dropdowns
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      console.log(selected.dataset.value);
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

const inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected");
