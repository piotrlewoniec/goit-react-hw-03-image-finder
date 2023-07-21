// import React, { Children, Component } from 'react';
import React, { Component } from 'react';
import css from './App.module.css';
import { Searchbar } from './searchbar/Searchbar';
import { ImageGallery } from './imagegallery/ImageGallery';
import { ImageGalleryItem } from './imagegalleryitem/ImageGalleryItem';
import { Button } from './button/Button';
import { Loader } from './loader/Loader';
import { Modal } from './modal/Modal';
import Notiflix from 'notiflix';
import { apikeyPixabay } from '../js/config/apikey';
import { axiosData } from '../js/apireset/axios-data';
export class App extends Component {
  static propTypes = {};
  static defaultProps = {
    initialValue: 0,
  };

  constructor(props) {
    super(props);
    this.galleryRef = React.createRef();
    this.state = {
      // searchPchrase: '',
      data: [],
      isData: false,
      isPages: false,
      isLoading: false,
      // currentPage: 1,
      // largeImageURL: '',
      // alt: '',
      isModal: false,
    };
  }

  // galleryRef = React.forwardRef();
  searchPchrase = '';
  currentPage = 1;
  perPage = 12;
  totalHits = 0;
  largeImageURL = '';
  alt = '';
  scroll = false;

  handleSubmit = evt => {
    evt.preventDefault();
    this.searchPchrase = evt.target.form.inputsearch.value;
    this.currentPage = 1;
    this.setState(
      prevState => {
        return { isLoading: true };
      },
      async () => {
        try {
          const response = await this.getDataFromServer();
          if (response.code !== 'ERR_NETWORK') {
            this.dataToDisplayPreparation(response);
          } else {
            Notiflix.Notify.failure(`${response.code}`);
            this.setState({ isLoading: false });
          }
        } catch (error) {
          Notiflix.Notify.failure(`${error}`);
        }
      }
    );
  };

  dataToDisplayPreparation(response) {
    this.scroll = false;
    if (window.scrollY > 0) {
      window.scrollBy({
        top: -window.scrollY,
        behavior: 'smooth',
      });
    }
    if (response.length !== 0) {
      Notiflix.Notify.success(`You have ${this.totalHits} hits`);
      Notiflix.Notify.success(`Now loading ${response.length}`);
      if (this.totalHits > this.perPage) {
        this.setState(prevState => {
          return { isPages: true };
        });
      } else {
        this.setState(prevState => {
          return { isPages: false };
        });
      }
      this.setState(prevState => {
        return { isData: true, data: [...response] };
      });
    } else {
      this.setState(prevState => {
        return { isData: false, data: [], isPages: false };
      });

      Notiflix.Notify.failure(`You have ${this.totalHits} hits`);
    }
  }

  handleLoadMore = evt => {
    this.currentPage += 1;
    // this.setState(prevState => {
    //   return { currentPage: prevState.currentPage + 1 };
    // });
    this.setState(
      prevState => {
        return { isLoading: true };
      },
      async () => {
        try {
          const response = await this.getDataFromServer();
          if (response.code !== 'ERR_NETWORK') {
            this.dataToAddDisplayPreparation(response);
          } else {
            Notiflix.Notify.failure(`${response.code}`);
            this.setState({ isLoading: false });
          }
        } catch (error) {
          Notiflix.Notify.failure(`${error}`);
        }
      }
    );
  };

  dataToAddDisplayPreparation(response) {
    Notiflix.Notify.success(`You have ${this.totalHits} hits`);
    Notiflix.Notify.success(`Now loading ${response.length} more`);
    this.scroll = true;
    let totalPages = 0;
    if (this.totalHits % this.perPage !== 0) {
      totalPages = Math.trunc(this.totalHits / this.perPage) + 1;
    } else if (this.totalHits % this.perPage === 0) {
      totalPages = this.totalHits / this.perPage;
    }
    if (totalPages === this.currentPage) {
      this.setState(prevState => {
        return { isPages: false };
      });
    }
    this.setState(prevState => {
      return { isData: true, data: [...prevState.data, ...response] };
    });
  }

  handleImageClick = evt => {
    if (evt.target.nodeName !== 'IMG') {
      return;
    }
    window.addEventListener('keyup', this.handleModalKeyDown);
    this.largeImageURL = evt.target.dataset.img;
    this.alt = evt.target.dataset.alt;
    this.setState(prevState => {
      return {
        isModal: true,
        // largeImageURL: evt.target.dataset.img,
        // alt: evt.target.dataset.alt,
      };
    });
  };

  handleModalClick = evt => {
    if (evt.target.nodeName === 'DIV') {
      this.largeImageURL = '';
      this.alt = '';
      this.setState(prevState => {
        return {
          isModal: false,
          // largeImageURL: '',
          // alt: '',
        };
      });
      window.removeEventListener('keyup', this.handleModalKeyDown);
    }
  };

  handleModalKeyDown = evt => {
    this.largeImageURL = '';
    this.alt = '';
    evt = evt || window.event;
    let isEscape = false;
    if ('key' in evt) {
      isEscape = evt.key === 'Escape' || evt.key === 'Esc';
    } else {
      isEscape = evt.keyCode === 27;
    }
    if (isEscape) {
      this.setState(prevState => {
        return {
          isModal: false,
          // largeImageURL: '',
          // alt: '',
        };
      });
      window.removeEventListener('keyup', this.handleModalKeyDown);
    }
  };

  async getDataFromServer() {
    const header = {
      method: 'get',
      accept: 'application/json',
      baseURL: 'https://pixabay.com/api',
    };
    const parameters = {
      key: apikeyPixabay,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 12,
      q: this.searchPchrase,
      page: this.currentPage,
    };
    try {
      const response = await axiosData(header, parameters);
      if (response.code !== 'ERR_NETWORK') {
        this.setState({ isLoading: false });
        this.totalHits = response.data.totalHits;
        let filteredResponse = [];
        if (response.data.hits.length !== 0) {
          for (let element of response.data.hits) {
            const { webformatURL, largeImageURL, tags, id } = element;
            filteredResponse.push({ webformatURL, largeImageURL, tags, id });
          }
        }
        return filteredResponse;
      } else {
        return response;
      }
    } catch (error) {
      this.setState({ isLoading: false });
      Notiflix.Notify.failure(`${error}`);
      return error;
    }
  }

  componentDidUpdate() {
    if (this.scroll) {
      const cardElement = this.galleryRef.current.firstElementChild;
      const { height: cardHeight } = cardElement.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 3,
        behavior: 'smooth',
      });
    }
  }

  render() {
    return (
      <div className={css.app}>
        <Searchbar onSubmit={this.handleSubmit} />
        <main>
          <ImageGallery action={this.handleImageClick} ref={this.galleryRef}>
            {this.state.isData &&
              this.state.data.map(element => (
                <ImageGalleryItem
                  key={element.id}
                  id={element.id}
                  webformatURL={element.webformatURL}
                  largeImageURL={element.largeImageURL}
                  alt={element.tags}
                />
              ))}
          </ImageGallery>

          {this.state.isLoading && <Loader name="RotatingLines" />}
          {this.state.isModal && (
            <Modal
              largeImageURL={this.largeImageURL}
              alt={this.alt}
              action={this.handleModalClick}
              actionKey={this.handleModalKeyDown}
            />
          )}
        </main>
        <footer className={css.app_footer}>
          {this.state.isPages && (
            <Button
              label="Load more"
              action={this.handleLoadMore}
              formButton={false}
              id="loadmore"
            />
          )}
        </footer>
      </div>
    );
  }
}

//------------------------------------------------------------------------------------

// 2 - Wyszukiwanie obrazków
// Napisz aplikację do wyszukiwania obrazków po słowie kluczu. Preview roboczej aplikacji: zobacz odnośnik.
// https://drive.google.com/file/d/1oXCGyiq4uKwW0zzraZLKk4lh3voBlBzZ/view?usp=sharing

// Utwórz komponenty <Searchbar>, <ImageGallery>, <ImageGalleryItem>, <Loader>, <Button> i <Modal>. Gotowe style komponentów można wziąć z pliku styles.css i dostosować do siebie, jeśli jest to potrzebne.
// https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/goitacademy/react-homework/blob/master/homework-03/image-finder/styles.css

// Instrukcja Pixabay API
// Dla zapytań HTTP wykorzystaj publiczny serwis wyszukiwania obrazów Pixabay. Zarejestruj się i otrzymaj indywidualny klucz dostępu.

// Łańcuch URL zapytania HTTP.

// https://pixabay.com/api/?q=cat&page=1&key=your_key&image_type=photo&orientation=horizontal&per_page=12

// Pixabay API wspiera paginację, domyślnie parametr page jest równy 1. Niech w odpowiedzi przychodzi po 12 obiektów, ustanowionych w parametrze per_page. Nie zapomnij, że w trakcie wyszukiwania po słowie kluczu należy wyrzucać wartość page w 1.

// W odpowiedzi od api przychodzi tablica obiektów, w których ważne są dla ciebie tylko następujące właściwości.

// id - unikalny identyfikator
// webformatURL - odnośnik do miniatury dla listy obrazków
// largeImageURL - odnośnik do dużej wersji dla okna modalnego

// Opis komponentu <Searchbar>

// Komponent przyjmuje jeden props onSubmit - funkcję dla przekazania wartości input przy submicie formularza. Tworzy element DOM o następującej strukturze:

// <header class="searchbar">
//   <form class="form">
//     <button type="submit" class="button">
//       <span class="button-label">Search</span>
//     </button>

//     <input
//       class="input"
//       type="text"
//       autocomplete="off"
//       autofocus
//       placeholder="Search images and photos"
//     />
//   </form>
// </header>

// Opis komponentu <ImageGallery>
// Lista obrazków. Tworzy element DOM o następującej strukturze:

// <ul class="gallery">
//   <!-- Zbiór <li> z obrazami -->
// </ul>

// Opis komponentu <ImageGalleryItem>
// Komponent elementu listy z obrazkami. Tworzy element DOM o następującej strukturze:

// <li class="gallery-item">
//   <img src="" alt="" />
// </li>

// Opis komponentu <Button>
// Po naciśnięciu przycisku Load more powinna ładować się kolejna porcja obrazków i renderować się razem z poprzednimi. Przycisk powinien renderować się tylko wtedy, gdy istnieje jakieś obrazek do wyświetlenia. Jeśli tablica obrazków jest pusta, przycisk nie renderuje się.

// Opis komponentu <Loader>
// Komponent spinnera, wyświetlany jest w czasie ładowania obrazków. Wykorzystaj dowolny gotowy komponent, na przykład react-loader-spinner lub inny.
// https://github.com/mhnpd/react-loader-spinner

// Opis komponentu <Modal>
// Po kliknięciu na element galerii powinno otwierać się okno modalne z ciemnym tłem i wyświetlać się duża wersja obrazka. Okno modalne powinno zamykać się po naciśnięciu klawisza ESC lub po kliknięciu na tło.

// Wygląd podobny jest do tej funkcjonalności VanillaJS-плагина, ale zamiast białego okna modalnego renderuje się obrazek (kliknij na przykład Run). Nie trzeba tworzyć animacji.

// https://basiclightbox.electerious.com/

// <div class="overlay">
//   <div class="modal">
//     <img src="" alt="" />
//   </div>
// </div>
