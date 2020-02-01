import movieService from "./movieService.js";
const anime = window.anime;
const readMore = window.$readMoreJS;
const resultsContainer = document.getElementById("resultsContainer");
const searchField = document.getElementById("movieSearch");

// empty out results container
const clearList = (elm) => {
    while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
    }

    elm.style.cssText = "display: none;";
};

// show results list
const showList = (elm, data, callback) => {
    elm.style.cssText = "display: flex;";
    elm.innerHTML = templates.card(data);
    return callback();
}

// render selected movie
const renderMovie = (details, callback) => {
    return movieService.getReviews(details.id).then((reviews) => {
        if (reviews.length === 0) {
            reviews = [{
                author: "",
                content: "There is no reviews for this movie"
            }];
        }
        document.getElementById("movieView").innerHTML = templates.movie(details, reviews);
        readMore.init({
            target: '.movie-display-review p'
        });
    }).then(callback);
};

// html templates
const templates = {
    card: (movies) => {
        return movies.map((movie) => {
            let coverStyle = movie.coverURL !== null
                ? `background-image: url(${movie.coverURL});`
                : "background-image: url(img/brokenimage.png); background-size: auto;";

            return `<div class="movie-card" data-id="${movie.id}">
                <div class="movie-cover" style="${coverStyle}">
                    <h3 class="movie-title">${movie.title}</h3>
                </div>
            </div>`
        }).join("");
    },

    movie: (details, reviews) => {
        let bgStyle = details.bgURL !== null
            ? `background-image: url(${details.bgURL});`
            : "";

        return `<div class="movie-display" style="${bgStyle}">
            <div class="movie-display-details">
                <h3 class="movie-display-title">${details.title}</h3>
                <div class="movie-display-genres">
                    ${templates.genre(details.genres)}
                </div>
                <div class="movie-display-stats">
                    <span class="movie-display-release">Release Date: ${details.release}</span>
                    <span class="movie-display-popularity">Popularity: ${details.popularity}</span>
                    <span class="movie-display-average">Average Vote: ${details.average}</span>
                    <span class="movie-display-count">Vote Count: ${details.count}</span>
                </div>
                <div class="movie-display-overview">
                    <h4>Overview</h4>
                    <p>${details.overview}</p>
                </div>
                <div class="movie-display-reviews">
                    <h4>Reviews</h4>
                    ${templates.review(reviews)}
                </div>
            </div>
        </div>`
    },

    genre: (arr) => {
        return arr.map((obj) => {
            return `<span class="movie-display-genre">${obj.name}</span>`
        }).join("");
    },

    review: (arr) => {
        return arr.map((obj) => {
            return `<div class="movie-display-review">
                <h5>${obj.author}</h5>
                <p>${obj.content}</p>
            </div>`
        }).join("");
    }
};

// fade in out animations
const animations = {
    fadeList: () => {
        if (resultsContainer.firstChild) {
            return anime({
                targets: "." + resultsContainer.firstChild.className,
                opacity: 0,
                easing: 'easeInOutQuad',
                delay: anime.stagger(50)
            }).finished.then(() => {
                return anime({
                    targets: "." + resultsContainer.className,
                    opacity: 0,
                    easing: 'easeInOutQuad'
                }).finished
            });
        }
        return Promise.resolve();
    },
    showList: () => {
        return anime({
            targets: resultsContainer,
            opacity: 1,
            easing: 'easeInOutQuad',
            delay: 500
        });
    }
};

// document ready
(() => {

    // search for movie on enter key
    document.getElementById("movieSearch").addEventListener("keypress", (e) => {
        let key = e.which || e.keyCode;
        if (key === 13 && searchField.value.length) {
            movieService.search(searchField.value).then((result) => {
                if (result.hasContent) {
                    clearList(resultsContainer)
                    showList(resultsContainer, result.data, animations.showList);
                }
            });
        }
    });

    // click event for movie render
    document.body.addEventListener("click", (e) => {
        if (e.target.className != 'movie-card') return;
        movieService.getMovieDetails(e.target.dataset.id).then((details) => {
            renderMovie(details, animations.fadeList).then(() => {
                clearList(resultsContainer);
            });
        });
    });
})();