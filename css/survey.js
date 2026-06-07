const selected = [];
const ratings = {};

window.onload = function () {
  const cards = document.querySelectorAll(".logo-card");

  cards.forEach(function (card) {
    card.onclick = function () {
      const id = Number(card.getAttribute("data-logo"));
      toggleLogo(id);
    };
  });
};

function toggleLogo(id) {
  const index = selected.indexOf(id);

  if (index !== -1) {
    selected.splice(index, 1);
  } else {
    if (selected.length === 3) return;
    selected.push(id);
  }

  document.getElementById("counter").textContent =
    "Selected: " + selected.length + " / 3";

  document.querySelectorAll(".logo-card").forEach(function (card) {
    const cardId = Number(card.getAttribute("data-logo"));
    card.classList.toggle("selected", selected.includes(cardId));
  });

  if (selected.length === 3) {
    setTimeout(showForm, 500);
  }
}

function showForm() {
  document.getElementById("step1").style.display = "none";

  const step2 = document.getElementById("step2");
  step2.style.display = "grid";

  step2.innerHTML = "<h2>Rate Your Top 3 Logos</h2>";

  selected.forEach(function (id) {
    const originalCard = document.querySelector('[data-logo="' + id + '"]');
    const image = originalCard.querySelector("img").src;

    step2.innerHTML += `
      <div class="rating-card" data-logo="${id}">
        <h3>Logo ${id}</h3>
        <img src="${image}" alt="Logo ${id}">
        <div class="stars">
          <span class="star" onclick="rate(this)">★</span>
          <span class="star" onclick="rate(this)">★</span>
          <span class="star" onclick="rate(this)">★</span>
          <span class="star" onclick="rate(this)">★</span>
          <span class="star" onclick="rate(this)">★</span>
        </div>
      </div>
    `;
  });

  step2.innerHTML += `
    <button class="btn" onclick="checkRatingsBeforeQuestions()">
      Continue
    </button>
  `;
}

function rate(star) {
  const ratingCard = star.closest(".rating-card");
  const logoId = ratingCard.getAttribute("data-logo");

  const stars = star.parentElement.querySelectorAll(".star");
  const index = Array.from(stars).indexOf(star);
  const rating = index + 1;

  ratings[logoId] = rating;

  stars.forEach(function (s, i) {
    if (i <= index) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });
}

function checkRatingsBeforeQuestions() {
  if (Object.keys(ratings).length < 3) {
    alert("Please rate all 3 logos before continuing.");
    return;
  }

  showQuestions();
}

function showQuestions() {
  const step3 = document.getElementById("step3");
  step3.style.display = "block";

  step3.innerHTML = `
    <h2>Final Questions</h2>

    <p>Do you have personal experience of recovery, or have you supported someone in recovery?</p>
    <label><input type="radio" name="recoveryExperience" value="Yes"> Yes</label><br>
    <label><input type="radio" name="recoveryExperience" value="No"> No</label><br>
    <label><input type="radio" name="recoveryExperience" value="Prefer not to answer"> Prefer not to answer</label>

    <p>Of the three logos you selected, which is your overall favourite?</p>

    <label><input type="radio" name="favouriteLogo" value="${selected[0]}"> Logo ${selected[0]}</label><br>
    <label><input type="radio" name="favouriteLogo" value="${selected[1]}"> Logo ${selected[1]}</label><br>
    <label><input type="radio" name="favouriteLogo" value="${selected[2]}"> Logo ${selected[2]}</label>

    <p>Which logo best represents private, non-judgemental recovery support?</p>

    <label><input type="radio" name="trustworthy" value="${selected[0]}"> Logo ${selected[0]}</label><br>
    <label><input type="radio" name="trustworthy" value="${selected[1]}"> Logo ${selected[1]}</label><br>
    <label><input type="radio" name="trustworthy" value="${selected[2]}"> Logo ${selected[2]}</label>

    <p>What emotion does your favourite logo evoke in you?</p>
    <textarea maxlength="100" placeholder="Maximum 100 characters"></textarea>

    <p>What, if anything, would improve your favourite logo?</p>
    <textarea maxlength="100" placeholder="Maximum 100 characters"></textarea>

    <p>Any other comments?</p>
    <textarea maxlength="100" placeholder="Maximum 100 characters"></textarea>

    <div>
    <button class="btn" onclick="checkQuestionsBeforeSubmit()">Submit</button>
     <a href="../index.html" class="home-link">← Return to OpenRecovery</a>
    </div>
  `;
  document.getElementById("step3").scrollIntoView({
  behavior: "smooth",
  block: "start"
});
}

function checkQuestionsBeforeSubmit() {
  const recoveryExperience = getRadioValue("recoveryExperience");
  const favouriteLogo = getRadioValue("favouriteLogo");
  const trustworthy = getRadioValue("trustworthy");
  const answers = document.querySelectorAll("#step3 textarea");

  if (recoveryExperience === "") {
    alert("Please answer the recovery experience question.");
    return;
  }

  if (favouriteLogo === "") {
    alert("Please select your overall favourite logo.");
    return;
  }

  if (trustworthy === "") {
    alert("Please select which logo best represents private, non-judgemental recovery support.");
    return;
  }

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].value.trim() === "") {
      alert("Please answer all questions before submitting.");
      return;
    }
  }

  submitToGoogleSheet();
}

function submitToGoogleSheet() {
  const submitButton = document.querySelector("#step3 button");
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  const answers = document.querySelectorAll("#step3 textarea");

  const data = {
    recoveryExperience: getRadioValue("recoveryExperience"),

    logo1: selected[0],
    rating1: ratings[selected[0]] || "",

    logo2: selected[1],
    rating2: ratings[selected[1]] || "",

    logo3: selected[2],
    rating3: ratings[selected[2]] || "",

    favouriteLogo: getRadioValue("favouriteLogo"),
bestRepresentsRecoverySupport: getRadioValue("trustworthy"),

emotion: answers[0]?.value || "",
improvement: answers[1]?.value || "",
otherComments: answers[2]?.value || ""
  };

  fetch("https://script.google.com/macros/s/AKfycbx4PkEHQUHUmbK1LrU9179jqfd3JB6Q5_WIyTdzhQ83G7P4mV-rCyGezHyUiUKYNbfu8w/exec", {
    method: "POST",
    body: JSON.stringify(data)
  })
   .then(function () {
   alert("Thank you. Your response has been submitted.");
   submitButton.textContent = "Submitted";
 })
  .catch(function () {
  alert("Something went wrong. Please try again.");
  submitButton.disabled = false;
  submitButton.textContent = "Submit";
 });
}

function getRadioValue(name) {
  const selectedRadio = document.querySelector(
    'input[name="' + name + '"]:checked'
  );

  return selectedRadio ? selectedRadio.value : "";
}