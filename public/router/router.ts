import {
  DOMAIN,
  privateRoutes,
  responseStatus,
  ROOT,
  routes
} from '@utils/config';
import { store } from '@store/store';
import { actionAuth, actionCSRF } from '@store/action/actionTemplates';
import { page404 } from '@router/Page404/page404';

interface Class {
  render: Function;
  componentWillUnmount: Function;
}

interface stateObject {
  path: string;
  props?: string;
}
interface Router {
  root: Element;
  mapViews: Map<string, Class>;
  privateMapViews: Map<string, Class>;
  lastView: { path; props };
  lastViewClass: any;
  firstView: boolean;
  role: string;
}
class Router {
  constructor (ROOT) {
    this.root = ROOT;
    this.lastView = { path: '/', props: '' };
    this.role = 'user';
    this.firstView = false;
    this.lastViewClass = '';
    this.mapViews = new Map();
    this.privateMapViews = new Map();

    store.subscribe('auth', this.subscribeRouterAuthStatus.bind(this));
    store.subscribe('login', this.subscribeRouterSigninStatus.bind(this));
    store.subscribe('logoutStatus', this.subscribeRouterLogout.bind(this));
  }

  register ({ path, view }, privatePath = false) {
    privatePath
      ? this.privateMapViews.set(path, view)
      : this.mapViews.set(path, view);
  }

  refresh (redirect = false) {
    const url = new URL(window.location.href);
    const names = url.pathname.split('/');

    if (
      this.mapViews.get(url.pathname) ||
      this.privateMapViews.get(url.pathname)
    ) {
      this.go(
        {
          path: url.pathname,
          props: url.search
        },
        { pushState: !redirect, refresh: !redirect }
      );
    } else if (
      this.mapViews.get(`/${names[1]}`) ||
      this.privateMapViews.get(`/${names[1]}`)
    ) {
      this.go(
        {
          path: `/${names[1]}`,
          props: `/${names[2]}`
        },
        { pushState: !redirect, refresh: !redirect }
      );
    } else {
      page404.render();
    }
  }

  start () {
    store.dispatch(actionCSRF());
    store.dispatch(actionAuth());

    for (const rout of routes) {
      this.register(rout);
    }

    for (const rout of privateRoutes) {
      this.register(rout, true);
    }

    window.addEventListener('popstate', () => {
      const url = new URL(window.location.href);
      const hasNumber = /\d/.test(url.pathname);

      let path = '';
      let props: string | undefined = '';

      if (hasNumber) {
        path = url.pathname.replace(/\/\d+$/, '');
        props = '/' + url.pathname.match(/\d+$/)?.[0];
      } else {
        path = url.pathname;
      }

      this.go({ path, props }, { pushState: false, refresh: false });
    });

    this.refresh();
    this.firstView = true;
  }

  go (
    stateObject: stateObject,
    { pushState, refresh }: { pushState: boolean; refresh: boolean }
  ) {
    let view = this.mapViews.get(stateObject.path);
    if (view) {
      if (
        stateObject.path === '/login' ||
        stateObject.path === '/registration'
      ) {
      } else {
        this.lastView = { path: stateObject.path, props: stateObject.props };
      }

      this.navigate(stateObject, pushState);
      if (this.lastViewClass) {
        this?.lastViewClass?.componentWillUnmount();
      }

      // @ts-ignore
      // eslint-disable-next-line new-cap
      this.lastViewClass = new view(ROOT);
      this.lastViewClass.render(stateObject.props);
      window.scrollTo(0, 0);
      return;
    }

    view = this.privateMapViews.get(stateObject.path);
    if (view) {
      this.lastView = { path: stateObject.path, props: stateObject.props };
      if (store.getState('auth')?.status !== responseStatus.success) {
        view = this.mapViews.get('/login');
        stateObject = { path: '/login', props: '' };
      }

      this.navigate(stateObject, pushState);
      if (this.lastViewClass) {
        this?.lastViewClass?.componentWillUnmount();
      }

      // @ts-ignore
      // eslint-disable-next-line new-cap
      this.lastViewClass = new view(ROOT);
      this.lastViewClass.render(stateObject.props);
      window.scrollTo(0, 0);
    }
  }

  navigate ({ path, props }: stateObject, pushState = false) {
    const location = DOMAIN;

    if (pushState) {
      if (props) {
        window.history.pushState('', '', location + path + props);
      } else {
        window.history.pushState('', '', location + path);
      }
    } else {
      if (props) {
        window.history.replaceState('', '', `${location + path + props}`);
      } else {
        window.history.replaceState('', '', location + path);
      }
    }
  }

  subscribeRouterAuthStatus () {
    const status = store.getState('auth')?.status;

    if (window.location.pathname === '/') {
      return;
    }

    if (this.lastView.path === '/admin') {
      if (status === responseStatus.success) {
        if (store.getState('auth')?.body?.role === undefined) {
          store.subscribe('auth', this.subscribeRouterRoleStatus.bind(this));
          store.unsubscribe('auth', this.subscribeRouterAuthStatus.bind(this));
          store.dispatch(actionAuth());
          return;
        } else if (store.getState('auth')?.body?.role === 'super') {
          this.subscribeRouterRoleStatus();
          return;
        } else if (store.getState('auth')?.body?.role !== 'super') {
          this.go(
            {
              path: '/',
              props: ''
            },
            { pushState: true, refresh: false }
          );
          return;
        }
      }
    }

    if (
      status === responseStatus.success &&
      (!this.firstView ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/registration')
    ) {
      router.go(
        {
          path: this.lastView.path,
          props: this.lastView.props
        },
        { pushState: true, refresh: false }
      );
    }
  }

  subscribeRouterRoleStatus () {
    store.unsubscribe('auth', this.subscribeRouterRoleStatus.bind(this));
    store.subscribe('auth', this.subscribeRouterAuthStatus.bind(this));
    if (store.getState('auth')?.body?.role !== 'super') {
      this.go(
        {
          path: '/',
          props: ''
        },
        { pushState: true, refresh: false }
      );
    } else if (store.getState('auth')?.body?.role === 'super') {
      this.go(
        {
          path: '/admin',
          props: this.lastView.props
        },
        { pushState: true, refresh: false }
      );
    }
  }

  subscribeRouterLogout () {
    if (store.getState('logoutStatus') === responseStatus.success) {
      store.setState({ auth: { status: responseStatus.invalidError } });
      this.role = 'user';
      if (this.privateMapViews.get(window.location.pathname)) {
        this.go(
          {
            path: '/',
            props: ''
          },
          { pushState: true, refresh: false }
        );
      }
    }
  }

  subscribeRouterSigninStatus () {
    store.setState({ auth: store.getState('login') });
  }
}

export const router = new Router(ROOT);
