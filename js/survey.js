
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
    <button class="btn" onclick="showQuestions()">
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

function showQuestions() {
  const step3 = document.getElementById("step3");
  step3.style.display = "block";

  step3.innerHTML = `
    <h2>Final Questions</h2>

    <p>Do you have personal experience of recovery, or have you supported someone in recovery?</p>
    <label><input type="radio" name="recoveryExperience" value="Yes"> Yes</label><br>
    <label><input type="radio" name="recoveryExperience" value="No"> No</label><br>
    <label><input type="radio" name="recoveryExperience" value="Prefer not to answer"> Prefer not to answer</label>

    <p>Which of your three chosen logos feels most trustworthy?</p>
    <textarea></textarea>

    <p>Which logo best represents private, non-judgemental recovery support?</p>
    <textarea></textarea>

    <p>What emotion does your favourite logo evoke in you?</p>
    <textarea></textarea>

    <p>What, if anything, would improve your favourite logo?</p>
    <textarea></textarea>

    <p>Any other comments?</p>
    <textarea></textarea>

    <button class="btn" onclick="submitToGoogleSheet()">Submit</button>
  `;
}

function downloadCSV() {
  const answers = document.querySelectorAll("#step3 textarea");

  const rows = [
    ["Logo", "Rating", "Question", "Answer"]
  ];

  selected.forEach(function (id) {
    rows.push([
      "Logo " + id,
      ratings[id] || "",
      "",
      ""
    ]);
  });

  rows.push(["", "", "Recovery experience", getRadioValue("recoveryExperience")]);
  rows.push(["", "", "Most trustworthy logo", answers[0]?.value || ""]);
  rows.push(["", "", "Best represents recovery support", answers[1]?.value || ""]);
  rows.push(["", "", "Emotion from favourite logo", answers[2]?.value || ""]);
  rows.push(["", "", "Suggested improvement", answers[3]?.value || ""]);
  rows.push(["", "", "Other comments", answers[4]?.value || ""]);

  const csv = rows.map(function (row) {
    return row.map(function (cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"';
    }).join(",");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "openrecovery-logo-survey.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function getRadioValue(name) {
  const selectedRadio = document.querySelector(
    'input[name="' + name + '"]:checked'
  );

  return selectedRadio ? selectedRadio.value : "";
}

function submitToGoogleSheet() {
  const answers = document.querySelectorAll("#step3 textarea");

  const data = {
    recoveryExperience: getRadioValue("recoveryExperience"),

    logo1: selected[0],
    rating1: ratings[selected[0]] || "",

    logo2: selected[1],
    rating2: ratings[selected[1]] || "",

    logo3: selected[2],
    rating3: ratings[selected[2]] || "",

    mostTrustworthy: answers[0]?.value || "",
    bestRepresentsRecoverySupport: answers[1]?.value || "",
    emotion: answers[2]?.value || "",
    improvement: answers[3]?.value || "",
    otherComments: answers[4]?.value || ""
  };

  fetch("https://script.google.com/macros/s/AKfycbx4PkEHQUHUmbK1LrU9179jqfd3JB6Q5_WIyTdzhQ83G7P4mV-rCyGezHyUiUKYNbfu8w/exec", {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(function () {
    alert("Thank you. Your response has been submitted.");
  })
  .catch(function () {
    alert("Something went wrong. Please try again.");
  });
}