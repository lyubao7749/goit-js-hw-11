import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/fetchImages';
import { renderGallery } from './js/renderGallery';

const refs = {
    searchForm: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.btn-load-more')
}

let queryString = '';
let page = 1;
let simpleLightBox;
const perPage = 20;

refs.searchForm.addEventListener('submit', onSearchForm);
refs.btnLoadMore.addEventListener('click', onLoadMoreBtn);

function onSearchForm(event) {
    event.preventDefault();
    queryString = event.currentTarget.searchQuery.value.trim();
    if (queryString === '') {
        Notify.failure('The search string cannot be empty. Please specify your search query.');
        return;
    }
    page = 1;
    refs.gallery.innerHTML = '';
    refs.btnLoadMore.classList.add('is-hidden');
    fetchImages(queryString, page, perPage)
        .then(({ data }) => {
            if (data.totalHits === 0) {
                Notify.info('Sorry, there are no images matching your search query. Please try again.');
            } else {
                renderGallery(data.hits);
                simpleLightBox = new SimpleLightbox('.gallery a').refresh();
                Notify.success(`Hooray! We found ${data.totalHits} images.`);
                if (data.totalHits > perPage) {
                    refs.btnLoadMore.classList.remove('is-hidden');
                }
            }
        })
        .catch(error => console.log(error))

}

function onLoadMoreBtn() {
    page += 1;
    simpleLightBox.destroy();
    fetchImages(queryString, page, perPage)
        .then(({ data }) => {
            renderGallery(data.hits)
            simpleLightBox = new SimpleLightbox('.gallery a').refresh();

            const totalPages = Math.ceil(data.totalHits / perPage)

            if (page > totalPages) {
                refs.btnLoadMore.classList.add('is-hidden')
                Notify.failure("We're sorry, but you've reached the end of search results.");
            }
        })
        .catch(error => console.log(error))

}