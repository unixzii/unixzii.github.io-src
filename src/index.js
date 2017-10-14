import roadtrip from 'roadtrip';

import * as store from './services/store';

import About from './components/About.html';
import Posts from './components/Posts.html';
import Post from './components/Post.html';

const redirectFrom = sessionStorage.getItem('redirect');
if (redirectFrom) {
  history.replaceState({}, '', redirectFrom.replace(/\.html$/, ''));
  sessionStorage.removeItem('redirect');
}

roadtrip
  .add('/', createRoute(About))
  .add('/activity', createRedirect('/post/activity'))
  .add('/posts', Object.assign(createRoute(Posts), {
    beforeenter(route, prevRoute) {
      showLoadingHint(prevRoute);
      return Promise.all([store.fetchPosts(false), wait(100)]);
    }
  }))
  .add('/post/:slug', {
    beforeenter(route, prevRoute) {
      showLoadingHint(prevRoute);
      const key = route.params.slug;
      const loadP = Promise.all([store.fetchPost(key), store.fetchPosts(false)])
        .then(res => {
          route.data = { content: res[0], post: store.getPostInfo(key) };
        })
        .catch(err => {
          route.data = { err };
        });
      return Promise.all([loadP, wait(200)]);
    },

    enter(route, prevRoute) {
      if (prevRoute && prevRoute.view) {
        prevRoute.view.destroy();
      }
      route.view = createView(Post, route.data);
      if ((route.data.post || {}).title) {
        window.document.title = route.data.post.title + ' - Cyandev';
      }
    }
  })
  .start({
    fallback: '/'
  });

function showLoadingHint(onRoute) {
  ((onRoute.view || {}).set || noop).call(onRoute.view, { loading: true });
}

function createRedirect(to) {
  return {
    enter(route, prevRoute) {
      if (prevRoute && prevRoute.view) {
        route.view = prevRoute.view;
      }
      roadtrip.goto(to);
    }
  };
}

function createRoute(Component, data) {
  return {
    enter(route, prevRoute) {
      if (prevRoute && prevRoute.view) {
        prevRoute.view.destroy();
      }
      route.view = createView(Component, data);
      window.document.title = 'Cyandev';
    },

    leave(route, nextRoute) {
      // Defer destroying to next route's enter period.
    }
  };
}

function createView(Component, data) {
  return new Component({
    target: document.getElementById('root'),
    data
  });
}

function noop() { }

function wait(ms) {
  return new Promise(fulfill => {
    setTimeout(fulfill, ms);
  });
}