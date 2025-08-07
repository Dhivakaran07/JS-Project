const main = document.querySelector("main");

document.addEventListener("DOMContentLoaded", () => {
  const categoriesContainer = document.getElementById("categoriesContainer");
  const categoryMenu = document.getElementById("categoryMenu");
  const categoryList = document.getElementById("categoryList");
  const toggleMenu = document.getElementById("toggleMenu");
  const closeMenu = document.getElementById("closeMenu");
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  // Show/Hide sidebar
  toggleMenu.addEventListener("click", () => {
    categoryMenu.classList.remove("hidden");
  });

  closeMenu.addEventListener("click", () => {
    categoryMenu.classList.add("hidden");
  });

  // Load categories
  fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
    .then(res => res.json())
    .then(data => {
      data.categories.forEach(category => {
        // Sidebar item
        const li = document.createElement("li");
        li.textContent = category.strCategory;
        li.addEventListener("click", () => showCategoryDetails(category));
        categoryList.appendChild(li);

        // Main card
        const card = document.createElement("div");
        card.classList.add("category-card");
        card.innerHTML = `
          <img src="${category.strCategoryThumb}" />
          <p>${category.strCategory}</p>
        `;
        card.addEventListener("click", () => showCategoryDetails(category));
        categoriesContainer.appendChild(card);
      });
    });

  // Show category details and meals
  function showCategoryDetails(category) {
    categoryMenu.classList.add("hidden");
    main.innerHTML = "";

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <h2>${category.strCategory}</h2>
      <p>${category.strCategoryDescription}</p>
    `;
    main.appendChild(header);

    const mealsTitle = document.createElement("h3");
    mealsTitle.className = "meals-title";
    mealsTitle.textContent = "Meals";
    main.appendChild(mealsTitle);

    const mealsGrid = document.createElement("div");
    mealsGrid.className = "meals-grid";
    main.appendChild(mealsGrid);

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category.strCategory}`)
      .then(res => res.json())
      .then(data => {
        data.meals.forEach(meal => {
          const mealCard = document.createElement("div");
          mealCard.className = "meal-card";
          mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" />
            <p>${meal.strMeal}</p>
          `;
          mealCard.addEventListener("click", () => showMealDetails(meal.idMeal));
          mealsGrid.appendChild(mealCard);
        });
      });
  }

  // Search functionality
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return;

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
      .then(res => res.json())
      .then(data => {
        main.innerHTML = "";

        if (!data.meals) {
          main.innerHTML = "<p style='text-align:center;'>No meals found.</p>";
          return;
        }

        const mealsTitle = document.createElement("h3");
        mealsTitle.className = "meals-title";
        mealsTitle.textContent = `Search Results for "${query}"`;
        main.appendChild(mealsTitle);

        const mealsGrid = document.createElement("div");
        mealsGrid.className = "meals-grid";
        main.appendChild(mealsGrid);

        data.meals.forEach(meal => {
          const mealCard = document.createElement("div");
          mealCard.className = "meal-card";
          mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" />
            <p>${meal.strMeal}</p>
          `;
          mealCard.addEventListener("click", () => showMealDetails(meal.idMeal));
          mealsGrid.appendChild(mealCard);
        });
      });
  });
});

// Show full meal details
function showMealDetails(mealId) {
  const main = document.querySelector("main");
  main.innerHTML = "";

  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];

      const mealDetail = document.createElement("div");
      mealDetail.className = "meal-detail";
      mealDetail.innerHTML = `
        <div class="meal-title">${meal.strMeal}</div>

        <div class="image-ingredients">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
          <div class="ingredients">
            <h3>Ingredients</h3>
            <ul id="ingredientList"></ul>
          </div>
        </div>

        <div class="category-area">
          <p><strong>Category:</strong> ${meal.strCategory}</p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
        </div>

        <div class="instructions">
          <h3>Instructions</h3>
          <p>${meal.strInstructions}</p>
        </div>
      `;
      main.appendChild(mealDetail);

      const ingredientList = mealDetail.querySelector("#ingredientList");
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          const li = document.createElement("li");
          li.textContent = `${ingredient} - ${measure}`;
          ingredientList.appendChild(li);
        }
      }
    });
}
