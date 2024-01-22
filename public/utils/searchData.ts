import { FilmCard } from '@components/filmCard/filmCard';
import { ROOT } from '@utils/config';
import { store } from '@store/store';
import { FilmSelection } from '@components/FilmSelection/filmSelection';
import { ActorCard } from '@components/ActorCard/actorCard';
import { addActive, removeActive } from '@utils/std';

class SearchData {
  /**
   * Метод создания массива HTMLElement из фильмов
   * @param films
   * @param renderDelete
   */
  addFilmsToHTML (films, renderDelete = false): HTMLElement[] {
    const array: HTMLElement[] = [];
    films.forEach((film) => {
      const filmCard = new FilmCard(ROOT);
      array.push(
        filmCard.render({
          film: film,
          alreadyFavorite: false,
          renderDelete: renderDelete,
          alreadyAdded: film.is_favorite,
          haveRating: true
        })
      );
    });
    return array;
  }

  /**
   * Метод создания массива HTMLElement из актёров
   * @param actors
   * @param renderDelete
   * @param adminPanel
   */
  addActorsToHTML (actors, renderDelete = false, adminPanel = false) {
    const array: HTMLElement[] = [];
    actors.forEach((actor) => {
      const actorCard = new ActorCard(ROOT);
      array.push(
        actorCard.render({
          actor: actor,
          alreadyFavorite: false,
          renderDelete: renderDelete,
          adminPanel: adminPanel
        })
      );
    });
    return array;
  }
}

export const searchData = new SearchData();
