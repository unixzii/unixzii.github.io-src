let posts;
let postsContent = {};

export function getPosts() {
  return posts.slice();
}

export function getPostInfo(key) {
  if (!posts) {
    return null;
  }

  return posts.filter(post => post.key === key)[0];
}

export function fetchPosts(force) {
  if (posts && !force) {
    return Promise.resolve();
  }

  return fetch('/public/posts/manifest.json')
    .then(resp => resp.json())
    .then(json => { posts = json; return null; })
}

export function fetchPost(key) {
  if (postsContent[key]) {
    return postsContent[key];
  }

  return fetch(`/public/posts/${key}.md`)
    .then(resp => resp.text())
    .then(text => {
      if (!text || text.startsWith('<!DOCTYPE html>')) {
        throw new Error('Specific post not exists');
      }

      postsContent[key] = text;
      return text;
    })
}