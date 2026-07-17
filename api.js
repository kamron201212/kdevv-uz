// Находим элементы DOM
const grid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search-input');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const paginationContainer = document.getElementById('pagination-container');

const modalFlag = document.getElementById('modal-flag');
const modalName = document.getElementById('modal-name');
const modalCapital = document.getElementById('modal-capital');
const modalPop = document.getElementById('modal-pop');

// Глобальные переменные для управления данными
let allCountries = [];      // Все страны из API
let filteredCountries = []; // Страны после поиска (изначально равны всем)
let currentPage = 1;        // Текущая активная страница
const totalPages = 5;       // Фиксированное количество страниц

// Получаем данные из API
axios.get('https://countries.dev/countries')
    .then(res => {
      return res.data;
    })
  .then(data => {
    // Сортируем страны по алфавиту
    allCountries = data.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    }); 
    
    // Изначально отфильтрованный список совпадает со всеми странами
    filteredCountries = [...allCountries];
    
    // Запускаем отображение первой страницы и кнопок
    updatePage();
  })
  .catch(err => {
    console.error('Ошибка в блоке;', err);
    grid.innerHTML = `<p class="col-span-4 text-center text-red-500 py-10">Не удалось загрузить данные из API.</p>`;
  });

// Функция обновления интерфейса (карточки + кнопки)
function updatePage() {
  // Рассчитываем, сколько элементов должно быть на одной странице
  const itemsPerPage = Math.ceil(filteredCountries.length / totalPages);
  
  // Вырезаем порцию стран для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const countriesToDisplay = filteredCountries.slice(startIndex, endIndex);
  
  // Рендерим карточки и перерисовываем кнопки пагинации
  renderCountries(countriesToDisplay);
  renderPaginationButtons();
}

// Функция отрисовки карточек
function renderCountries(countriesList) {
  grid.innerHTML = ''; 

  if (countriesList.length === 0) {
    grid.innerHTML = `<p class="col-span-4 text-center text-slate-500 py-10">Страны не найдены</p>`;
    return;
  }

  countriesList.forEach(country => {
    const countryName = country.name || 'Нет названия';
    const flagUrl = country.flags?.svg || country.flags?.png || '';
    const capitalName = country.capital ? country.capital[0] : 'Нет данных';

    const card = document.createElement('div');
    card.className = "country-card h-[250px] bg-white rounded-xl p-5 text-center shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 bg-cover bg-center flex flex-col justify-end overflow-hidden group relative";
    
    if (flagUrl) card.style.backgroundImage = `url('${flagUrl}')`;

    const textBadge = document.createElement('div');
    textBadge.className = "bg-slate-900/80 text-white p-2 rounded-lg text-sm font-semibold truncate group-hover:bg-blue-600 transition-colors";
    textBadge.textContent = countryName;
    card.appendChild(textBadge);

    card.addEventListener('click', () => {
      modalFlag.style.backgroundImage = flagUrl ? `url('${flagUrl}')` : 'none';
      modalName.textContent = countryName;
      modalCapital.textContent = capitalName;
      modalPop.textContent = country.population ? country.population.toLocaleString() : 'Нет данных';
      
      modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
      if (modalOverlay.querySelector('div')) {
        modalOverlay.querySelector('div').classList.remove('scale-95');
        modalOverlay.querySelector('div').classList.add('scale-100');
      }
    });

    grid.appendChild(card);
  });
}

// Функция генерации кнопок пагинации (всего 5 штук)
function renderPaginationButtons() {
  paginationContainer.innerHTML = ''; // Очищаем старые кнопки

  // Если результатов поиска слишком мало (например, 0 или 1 страна), пагинация не нужна
  if (filteredCountries.length <= 5) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    
    // Базовые стили для кнопок
    button.className = "px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ";
    
    // Стили для активной и неактивной страницы
    if (i === currentPage) {
      button.className += "bg-blue-600 text-white border-blue-600 shadow-sm";
    } else {
      button.className += "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";
    }

    // Событие клика на номер страницы
    button.addEventListener('click', () => {
      currentPage = i; // Меняем страницу
      updatePage();    // Перерисовываем контент
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавный скролл наверх
    });

    paginationContainer.appendChild(button);
  }
}

// Модальное окно: скрытие
function hideModal() {
  modalOverlay.classList.add('opacity-0', 'pointer-events-none');
  if (modalOverlay.querySelector('div')) {
    modalOverlay.querySelector('div').classList.remove('scale-100');
    modalOverlay.querySelector('div').classList.add('scale-95');
  }
}

if (closeModal) closeModal.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) hideModal();
});

// Живой поиск
searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase().trim();
  
  // Фильтруем главный массив
  filteredCountries = allCountries.filter(country => {
    const name = country.name?.toLowerCase() || '';
    return name.includes(value);
  });
  
  currentPage = 1; // При каждом новом поиске сбрасываем на 1-ю страницу
  updatePage();    // Обновляем данные
});
