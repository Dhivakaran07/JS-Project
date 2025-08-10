const categoryList = document.getElementById("categoryList");
const allCategories = document.getElementById("allCategories");
const mealResults = document.getElementById("mealResults");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const heroSection = document.querySelector(".hero-section");
const categorySection = document.getElementById("categorySection");

// Load categories on page load
fetchCategories();

searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    searchMeals(searchTerm);
  }
});

// Fetch sidebar and card categories
async function fetchCategories() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
  const data = await res.json();

  categoryList.innerHTML = "";
  allCategories.innerHTML = "";

  data.categories.forEach((cat) => {
    // Sidebar List
    const li = document.createElement("li");
    li.textContent = cat.strCategory;
    li.classList.add("mb-2", "fw-semibold", "text");
    li.style.cursor = "pointer";
    li.addEventListener("click", () => fetchMealsByCategory(cat.strCategory));
    categoryList.appendChild(li);

    // Category Cards
    const div = document.createElement("div");
    div.className = "col-md-4 col-lg-3 mb-4";
    div.innerHTML = `
      <div class="card h-100 shadow-sm" style="cursor:pointer">
        <img src="${cat.strCategoryThumb}" class="card-img-top" alt="${cat.strCategory}">
        <div class="card-body">
          <h5 class="card-title text-center">${cat.strCategory}</h5>
        </div>
      </div>
    `;
    div.addEventListener("click", () => fetchMealsByCategory(cat.strCategory));
    allCategories.appendChild(div);
  });
}

// Fetch and display meals by category
async function fetchMealsByCategory(catName) {
  const [catRes, mealRes] = await Promise.all([
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php'),
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${catName}`)
  ]);

  const catData = await catRes.json();
  const mealData = await mealRes.json();

  const matchedCategory = catData.categories.find(
    (cat) => cat.strCategory.toLowerCase() === catName.toLowerCase()
  );

  renderResults(matchedCategory.strCategory, matchedCategory.strCategoryDescription, mealData.meals);
}

// Search handler
async function searchMeals(query) {
  const trimmedQuery = query.toLowerCase();

  const catRes = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
  const catData = await catRes.json();
  const matchedCategory = catData.categories.find(
    (cat) => cat.strCategory.toLowerCase() === trimmedQuery
  );

  if (matchedCategory) {
    const mealRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${matchedCategory.strCategory}`);
    const mealData = await mealRes.json();

    renderResults(matchedCategory.strCategory, matchedCategory.strCategoryDescription, mealData.meals);
  } else {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();
renderResults(
  `Search: "${query}"`,
  "Here are your search results:",
  data.meals || []
);

  }
}

// Render meals and heading/description
function renderResults(heading, description, meals) {
  heroSection.style.display = "none";
  categorySection.style.display = "none";

  mealResults.innerHTML = `
  <div class="text-danger fw-bold border border-danger p-2 rounded">
    <h2 class="text-danger text">${heading}</h2>
    <p class="text text-muted">${description}</p>
  </div>
  <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4 mt-3" id="mealCards">
    ${
      meals.length > 0
        ? meals
            .map(
              (meal) => `
      <div class="col">
        <div class="card h-100 shadow-sm meal-card" data-meal-id="${meal.idMeal}" style="cursor:pointer">
          <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
          <div class="card-body">
            <h5 class="card-title text-center">${meal.strMeal}</h5>
          </div>
        </div>
      </div>
    `
            )
            .join("")
        :`<p class="text-center">No meals found.</p>`
    }
  </div>
  <div class="text-center mt-4">
    <button class="btn btn-outline-secondary" onclick="resetHome()">← Back</button>
  </div>
  `;

  // ADD: Attach click listeners to meal cards
  const mealCards = document.querySelectorAll('.meal-card');
  mealCards.forEach(card => {
    card.addEventListener('click', () => {
      const mealId = card.getAttribute('data-meal-id');
      showMealDetailsView(mealId);
    });
  });
}

// Reset to home
function resetHome() {
  searchInput.value = "";
  mealResults.innerHTML = "";
  heroSection.style.display = "flex";
  categorySection.style.display = "block";
}

// ✅ Full meal detail view
async function showMealDetailsView(mealId) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const data = await res.json();
  const meal = data.meals[0];

  heroSection.style.display = "none";
  categorySection.style.display = "none";

  let ingredientsHTML = "";
  let measurementsHTML = "";

  for (let i = 1; i <= 20; i++) {
   const ing = meal[`strIngredient${i}`];
const meas = meal[`strMeasure${i}`];

    if (ing && ing.trim()) {
      ingredientsHTML += `<span>${ing}</span>`;
      measurementsHTML += `<li>${meas}</li>`;
    }
  }

  mealResults.innerHTML = `
    <div class="meal-detail-container">
      <!-- Image and category info -->
      <div class="meal-detail-image">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h2>${meal.strMeal}</h2>
          <p><strong>Category:</strong> ${meal.strCategory}</p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
          <p><strong>Source:</strong> ${meal.strSource ?` <a href="${meal.strSource}" target="_blank">${meal.strSource}</a>` : 'N/A'}</p>
        </div>
      </div>

      <!-- Ingredients -->
      <div class="meal-detail-content">
        <h4>Ingredients</h4>
        <div class="ingredients-box">${ingredientsHTML}</div>
      </div>
    </div>

    <!-- Measurements -->
    <ul class="measurements">${measurementsHTML}</ul>

    <!-- Instructions -->
    <div class="instructions">
      <h4>Instructions</h4>
      <p>${meal.strInstructions}</p>
    </div>

    <!-- Back button -->
    <div class="back-btn">
      <button class="btn btn-outline-danger" onclick="resetHome()">← Back</button>
    </div>
  `;

  mealResults.scrollIntoView({ behavior: "smooth" });
}


