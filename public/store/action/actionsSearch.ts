import { get, post } from '@utils/ajax';
import { responseStatus, urls } from '@utils/config';
import { page404 } from '@router/Page404/page404';

class ActionsSearch {
  async searchFilm ({
    title,
    dateFrom,
    dateTo,
    ratingFrom,
    ratingTo,
    mpaa,
    genre,
    actors,
    page,
    per_page
  }: searchFilm) {
    const response = get({
      url: urls.searchFilm,
      query: {
        title: title || '',
        date_from: dateFrom || '',
        date_to: dateTo || '',
        rating_from: ratingFrom || 0,
        rating_to: ratingTo || 10,
        mpaa: mpaa || '',
        genres: genre || [],
        actors: actors || [],
        page: page || 1,
        per_page: per_page || 20
      }
    });

    const result = await response;

    if (result === undefined) {
      console.error(responseStatus.notFound);
      page404.render();
    }

    return {
      resultSearchFilm: result
    };
  }

  async searchActor ({
    name,
    films,
    birthday,
    amplua,
    page,
    per_page
  }: searchActor) {
    const response = get({
      url: urls.searchActor,
      query: {
        name: name,
        films: films,
        birthday: birthday,
        amplua: amplua,
        page: page || 1,
        per_page: per_page || 20
      }
    });

    const result = await response;

    if (result === undefined) {
      console.error(responseStatus.notFound);
      page404.render();
    }

    return {
      resultSearchActor: result
    };
  }

  async searchModerUser ({ login, role, page, per_page }: searchModerUser) {
    const response = get({
      url: urls.searchModerUser,
      query: {
        login: login,
        role: role,
        page: page || 1,
        per_page: per_page || 20
      }
    });

    const result = await response;

    return {
      searchModerUser: result
    };
  }

  async getTrends () {
    const response = get({
      url: urls.trends
    });

    const result = await response;

    return {
      getTrends: result
    };
  }
}

export const actionsSearch = new ActionsSearch();
