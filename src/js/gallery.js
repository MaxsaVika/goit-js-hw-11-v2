import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { getApiImg } from './searchApi.js';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputForm: document.querySelector('.form-input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  loader: document.querySelector('.loader'),
};

let inputValue = '';
let page = 1;
let limit = 40;
let total = 0;

const lightbox = new SimpleLightbox('.gallery a');

Notiflix.Notify.init({
  timeout: 2000,
  width: '480px',
});

const showQuotes = quotes => {
  quotes.forEach(quote => {
    const quoteEl = document.createElement('blockquote');
    quoteEl.classList.add('quote', 'photo-card');

    quoteEl.innerHTML = `
      <a class="photo__link" href="${quote.largeImageURL}">
          <img class="gallery__image" src="${quote.webformatURL}" loading="lazy" alt="${quote.tags}" />
          </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        <span>${quote.likes}</span>
      </p>
      <p class="info-item">
        <b>Views</b>
        <span>${quote.views}</span>
      </p>
      <p class="info-item">
        <b>Comments</b>
        <span>${quote.comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b>
        <span>${quote.downloads}</span>
      </p>
    </div>`;

    refs.gallery.appendChild(quoteEl);
    // onScroll();
  });
};

const hideLoader = () => {
  refs.loader.classList.remove('show');
};

const showLoader = () => {
  refs.loader.classList.add('show');
};

const hasMoreQuotes = (page, limit, total) => {
  const startIndex = (page - 1) * limit + 1;
  return total === 0 || startIndex < total;
};

const loadQuotes = async (page, limit) => {
  showLoader();
  inputValue = refs.inputForm.value.trim();

  try {
    if (hasMoreQuotes(page, limit, total)) {
      const response = await getApiImg(inputValue, page);
      showQuotes(response.hits);
      total = response.totalHits;
      lightbox.refresh();
      onScroll();
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    hideLoader();
  }
};

window.addEventListener(
  'scroll',
  () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      hasMoreQuotes(page, limit, total)
    ) {
      page++;
      loadQuotes(page, limit);
    }
  },
  {
    passive: true,
  }
);

refs.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  page = 1;

  clearGallery();
  // getGalleryItems();
  loadQuotes(page, limit);
});

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
