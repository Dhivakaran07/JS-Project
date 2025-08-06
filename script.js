 let sidebar = document.getElementById("sidebar")
        let list = document.getElementById("categoryList")
        let container = document.getElementById('cardsContainer')

        function toggle() {
            sidebar.classList.toggle("active")
        }
        async function categories() {
            let value = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
            let res = await value.json()
            let data = res.categories

            data.forEach(cat => {
                let div = document.createElement('div')
                div.className = "category"
                div.innerHTML = `<ul><li>${cat.strCategory}</li></ul>`;
                list.appendChild(div);
                div.addEventListener("click", () => {
                    photo(cat.strCategory);

                })
            });


        }
        function closeSidebar() {
            let sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('active'); // hide sidebar
        }


        async function photo(category) {
            let value = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
            let res = await value.json();
            let data = res.meals;
            container.innerHTML = ""; // Clear previous results
            data.forEach((meal) => {
                let div = document.createElement('div');
                div.className = "card"; // apply card style

                div.innerHTML = `
                <span class="tag">${category}</span>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <p>${meal.strMeal}</p>
            `;

                container.appendChild(div);
            });
        }
        // Run this once on page load
        categories();
        let cards=document.querySelector(".cards")