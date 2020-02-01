// Movie API Module
import config from "./config.js"
const api_key = config.api_key; // key is hidden in config.js file

// helper for fetch requests
const fetchContent = async (path) => {
    const response = await fetch(path);
    return await response.json();
}

// get api configuration - needed to get correct image paths
const configure = async () => {
    return fetchContent(`https://api.themoviedb.org/3/configuration?api_key=${api_key}`);
}

// call search endpoint and format result for use
const search = async (searchTerm) => {
    return new Promise((resolve, reject) => {
        Promise.all([
            configure(),
            fetchContent(`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${searchTerm}`)
        ]).then((res) => {
            const config = res[0];
            const data = res[1];
            if (data) {
                resolve({
                    hasContent: true,
                    data: data.results.map((result) => {
                        return {
                            id: result.id,
                            title: result.title,
                            coverURL: result.poster_path !== null ? `${config.images.base_url}${config.images.poster_sizes[3]}${result.poster_path}` : null
                        }
                    })
                });
            }
            resolve({ hasContent: false })
        });
    });
}

// call endpoint to get details of movie - reformate to include configuration paths
const getMovieDetails = async (id) => {
    return Promise.all([
        configure(),
        fetchContent("https://api.themoviedb.org/3/movie/" + id + "?api_key=" + api_key)
    ]).then((res) => {
        const config = res[0];
        const data = res[1];
        return {
            id: id,
            title: data.original_title,
            overview: data.overview,
            bgURL: data.backdrop_path !== null ? `${config.images.base_url}${config.images.backdrop_sizes[3]}${data.backdrop_path}` : null,
            coverURL: data.poster_path !== null ? `${config.images.base_url}${config.images.poster_sizes[3]}${data.poster_path}` : null,
            popularity: data.popularity,
            average: data.vote_average,
            count: data.vote_count,
            release: data.release_date,
            genres: data.genres || []
        }
    });
};

// call reviews endpoint
const getReviews = async (id) => {
    return fetchContent(`https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${api_key}`).then((res) => {
        return res.results;
    });
}

// kick this off early to have it resolved when needed
configure();

export default {
    search: search,
    getMovieDetails: getMovieDetails,
    getReviews: getReviews
}