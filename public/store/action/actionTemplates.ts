export const setUser = (user: user) => ({
  type: 'setUser',
  value: user
});

export const actionAuth = () => ({
  type: 'auth'
});

export const actionCSRF = () => ({
  type: 'csrf'
});

export const actionLogout = (redirect) => ({
  type: 'logout'
});

export const actionSignin = (user: user) => ({
  type: 'signin',
  value: user
});

export const actionSignup = (user: user) => ({
  type: 'signup',
  value: user
});

export const actionUpdateProgram = () => ({
  type: 'update'
});

export const actionCollectionMain = (params: collectionParams) => ({
  type: 'collectionMain',
  value: params
});

export const actionCollectionMenu = (params: collectionParams) => ({
  type: 'collectionMenu',
  value: params
});

export const actionActor = (params: { actorName: number }) => ({
  type: 'actor',
  value: params
});

export const actionFilm = (params: film) => ({
  type: 'film',
  value: params
});

export const actionPutSettings = (params: settings) => ({
  type: 'putSettings',
  value: params
});

export const actionGetSettings = () => ({
  type: 'getSettings'
});

export const actionGetCommentsUser = (params: paginator) => ({
  type: 'userComments',
  value: params
});

export const actionGetCommentsFilm = (params: {
  film_id: number;
  per_page: number;
  page: number;
}) => ({
  type: 'filmComments',
  value: params
});

export const actionAddComment = (params: addComment) => ({
  type: 'addComment',
  value: params
});

export const actionAddCommentTwo = (params: addComment) => ({
  type: 'addCommentTwo',
  value: params
});

export const actionFavoriteFilms = (params: paginator) => ({
  type: 'favoriteFilms',
  value: params
});

export const actionFavoriteActors = (params: paginator) => ({
  type: 'favoriteActors',
  value: params
});

export const actionAddFavoriteFilm = (params: favoriteFilm) => ({
  type: 'addFavoriteFilm',
  value: params
});

export const actionAddFavoriteActor = (params: favoriteActor) => ({
  type: 'addFavoriteActor',
  value: params
});

export const actionRemoveFavoriteFilm = (params: favoriteFilm) => ({
  type: 'removeFavoriteFilm',
  value: params
});

export const actionRemoveFavoriteActor = (params: favoriteActor) => ({
  type: 'removeFavoriteActor',
  value: params
});

export const actionSearchFilm = (params: searchFilm) => ({
  type: 'searchFilm',
  value: params
});

export const actionModerSearchUsers = (params: searchModerUser) => ({
  type: 'searchModerUser',
  value: params
});

export const actionSearchActor = (params: searchActor) => ({
  type: 'searchActor',
  value: params
});

export const actionUpdateRole = (params: updateRole) => ({
  type: 'updateRole',
  value: params
});

export const actionAddFilm = (params: settings) => ({
  type: 'addFilm',
  value: params
});

export const actionGetCalendar = () => ({
  type: 'getCalendar'
});

export const actionStatistics = () => ({
  type: 'getStatistics'
});

export const actionSubCalendar = () => ({
  type: 'subscribeCalendar'
});

export const actionCheckSubscribeCalendar = () => ({
  type: 'checkSubscribeCalendar'
});

export const actionGetTrends = () => ({
  type: 'getTrends'
});

export const actionRemoveComment = (params: removeComment) => ({
  type: 'removeComment',
  value: params
});

export const actionUserStatistic = () => ({
  type: 'userStatistic'
});

export const actionAlreadyWatched = () => ({
  type: 'alreadyWatched'
});
