

const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  outputLanguageDropdown2 = document.querySelector("#output-language2");


var inputLanguage =
inputLanguageDropdown.querySelector(".selected").dataset.value;
var outputLanguage =
outputLanguageDropdown.querySelector(".selected").dataset.value;
var outputLanguage2 =
outputLanguageDropdown2.querySelector(".selected").dataset.value;

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
      localStorage.setItem(dropdown.id,selected.dataset.value);
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

var inputSaved = localStorage.getItem("input-language");
console.log("[data-value=\"" +inputSaved + "\"]");
if(inputSaved){
    inputLanguageDropdown.querySelector("[data-value=\"" +inputSaved + "\"]")
    .dispatchEvent(new Event('click'));
}

var outputSaved = localStorage.getItem("output-language");
console.log("[data-value=\"" +outputSaved + "\"]");
if(outputSaved){
    outputLanguageDropdown.querySelector("[data-value=\"" +outputSaved + "\"]")
    .dispatchEvent(new Event('click'));
}

var outputSaved2 = localStorage.getItem("output-language2");
console.log("[data-value=\"" +outputSaved2 + "\"]");
if(outputSaved2){
    outputLanguageDropdown2.querySelector("[data-value=\"" +outputSaved2 + "\"]")
    .dispatchEvent(new Event('click'));
}








//Transcription
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
//Translation
//https://github.com/Venkateeshh/Js-Language-Translator

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var content = document.querySelector(".options-wrapper");
var coll = document.querySelector(".collapse");
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
var transcription_current = transcription.querySelector('.current');
var transcription_current_under = transcription_current.querySelector('.under');
var transcription_current_over = transcription_current.querySelector('.over');

var translation1 = document.querySelector('.translation1');
var translation1_current = translation1.querySelector('.current');
var translation1_current_under = translation1_current.querySelector('.under');
var translation1_current_over = translation1_current.querySelector('.over');

var translation2 = document.querySelector('.translation2');
var translation2_current = translation2.querySelector('.current');
var translation2_current_under = translation2_current.querySelector('.under');
var translation2_current_over = translation2_current.querySelector('.over');

var startBtn = document.querySelector('.listenButton');
var greenScreen = document.querySelector('.greenScreen');

var recognition;
var initialized = false;

var slider1 = document.querySelector("#slider1");
var slider2 = document.querySelector("#slider2");
var slider3 = document.querySelector("#slider3");
var slider4 = document.querySelector("#slider4");

if (localStorage.getItem(slider1.id)) {
    slider1.value = localStorage.getItem(slider1.id);
    slider1.nextElementSibling.textContent = slider1.value;
}
if (localStorage.getItem(slider2.id)) {
    slider2.value = localStorage.getItem(slider2.id);
    slider2.nextElementSibling.textContent = slider2.value;
}
if (localStorage.getItem(slider3.id)) {
    slider3.value = localStorage.getItem(slider3.id);
    slider3.nextElementSibling.textContent = slider3.value;
}
if (localStorage.getItem(slider4.id)) {
    slider4.value = localStorage.getItem(slider4.id);
    slider4.nextElementSibling.textContent = slider4.value;
}

slider1.addEventListener('input', function() {
  document.documentElement.style.setProperty('--translation-font-size', this.value+'px');
  this.nextElementSibling.textContent = this.value;
  localStorage.setItem(this.id, this.value);
}, false);
slider2.addEventListener('input', function() {
  document.documentElement.style.setProperty('--translation-font-weight', this.value);
  this.nextElementSibling.textContent = this.value;
  localStorage.setItem(this.id, this.value);
}, false);
slider3.addEventListener('input', function() {
  document.documentElement.style.setProperty('--translation-outline-thick', this.value+'px');
  this.nextElementSibling.textContent = this.value;
  localStorage.setItem(this.id, this.value);
}, false);
slider4.addEventListener('input', function() {
  localStorage.setItem(this.id, this.value);
  if(this.value == 0){
    document.documentElement.style.setProperty('--translation-align', 'left');
    this.nextElementSibling.textContent = 'left';
  }
  else if(this.value == 1){
    document.documentElement.style.setProperty('--translation-align', 'center');
    this.nextElementSibling.textContent = 'center';
  }
  else if(this.value == 2){
    document.documentElement.style.setProperty('--translation-align', 'right');
    this.nextElementSibling.textContent = 'right';
  }
}, false);

slider1.dispatchEvent(new Event('input'));
slider2.dispatchEvent(new Event('input'));
slider3.dispatchEvent(new Event('input'));
slider4.dispatchEvent(new Event('input'));


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

function randomPhrase() {
  var number = Math.floor(Math.random() * phrases.length);
  return number;
}

function outlineHelper(element, text){
    element.textContent = text;
    element.nextElementSibling.textContent = text;
  
}
function startListening() {
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
  recognition.maxAlternatives = 10;
  recognition.continuous = false;
  recognition.start();

  recognition.onresult = function(event) {
    var result = event.results[event.results.length-1];
    outlineHelper(transcription_current_under, result[0].transcript);
    const inputText = transcription_current_over.textContent;
    console.log(result);
    const url1 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
    inputText,
    )}`;
    const url2 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage2}&dt=t&q=${encodeURI(
    inputText,
    )}`;
    
    fetch(url1)
    .then((response) => response.json())
    .then((json) => {
        outlineHelper(translation1_current_under, json[0].map((item) => item[0]).join(""));
    })
    .catch((error) => {
        console.log(error);
    });
        

    fetch(url2)
    .then((response) => response.json())
    .then((json) => {
        outlineHelper(translation2_current_under, json[0].map((item) => item[0]).join(""));
    })
    .catch((error) => {
        console.log(error);
    });
        
    
    if(result.isFinal){
        transcription.insertBefore(transcription_current.cloneNode(true),transcription_current);
        translation1.insertBefore(translation1_current.cloneNode(true),translation1_current);
        translation2.insertBefore(translation2_current.cloneNode(true),translation2_current);

        if(transcription.childElementCount >10){
            transcription.firstElementChild.remove();
            translation1.firstElementChild.remove();
            translation2.firstElementChild.remove();
        }

        outlineHelper(transcription_current_under, "");
        outlineHelper(translation1_current_under, "");
        outlineHelper(translation2_current_under, "");
    }
  }

  recognition.onspeechend = function() {
    console.log("SpeechRecognition.onspeechend")
  }

  recognition.onerror = function(event) {
    startBtn.disabled = false;
    startBtn.textContent = '에러';
    console.log(event);
    transcription_current_under.textContent = event.message;
    transcription_current_over.textContent = event.message;
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
      startBtn.textContent = '시작';
      recognition.start();
  }
  
  recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
  }
  
  recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
      
      greenScreen.classList.remove("fade-out-box");
      greenScreen.classList.add("fade-in-box");
  }
  
  recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend');
      
      greenScreen.classList.remove("fade-in-box");
      greenScreen.classList.add("fade-out-box");
  }
  
  recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
      inputLanguage = inputLanguageDropdown.querySelector(".selected").dataset.value;
      outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;
      outputLanguage2 = outputLanguageDropdown2.querySelector(".selected").dataset.value;
  }
  recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
      initialized = true;
      startBtn.textContent = '정지';
  }
}

startBtn.addEventListener('click', startListening);

