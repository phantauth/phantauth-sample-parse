$(function() {

    // Don't forget to change it, if you deploy your own copy
    var parseAppId = "Cupn4nw6zFH65X3FXNXVJZU2JBUEBgCCIXfP1Zwf";
    var parseJavaScriptKey = "OCA3higtQrCF8JG9QFJkvPv5obcdEmXDc09V5FCE";

    var issuer = "https://phantauth.net";
    var page = window.location.hostname;
  
    function beforeLogin() {
      $(".after-login").hide();
      $(".before-login").show();
    }
  
    function afterLogin() {
      $(".before-login").hide();
      $(".after-login").show();
    }
  
    function newClient() {
      return new Oidc.OidcClient({
        authority: issuer,
        client_id: "phantauth+phantauth.test@gmail.com",
        redirect_uri: window.location.href,
        response_type: "id_token token",
        scope: "openid profile email phone address",
        filterProtocolClaims: false,
        loadUserInfo: false
      });
    }
  
    function login() {
      $(".after-login").hide();
      newClient()
        .createSigninRequest({ state: { bar: Math.random() } })
        .then(function(req) {
          window.location = req.url;
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  
    function process() {
      newClient()
        .processSigninResponse()
        .then(function(response) {
          var sub = response.profile.sub;
          var token = response.access_token
          window.location.hash = "";
          history.pushState("", document.title, window.location.pathname);
          parseLogin(sub, token)
        })
        .catch(function(err) {
          console.log(err);
        });
    }

    var authProvider = {
      authenticate(options) {
        if (options.success) {
          options.success(this, {});
        }
      },
    
      restoreAuthentication(authData) {},
    
      getAuthType() {
        return 'phantauth';
      },
    
      deauthenticate() {}
    };

    function parseLogin(sub, token) {
      Parse.User.logInWith(authProvider, {authData: {id: sub, access_token: token}}).then(user => {
        localStorage.setItem(page, JSON.stringify(user.attributes));
        update();
      }, error => {
        console.log(error);
      });      
    }
  
    function isLoggedIn() {
      return localStorage.getItem(page);
    }
  
    function getProfile() {
      return JSON.parse(localStorage.getItem(page));
    }
  
    function update() {
      var bindings = {};
      bindings["user"] = getProfile();
      rivets.bind($("#user"), bindings);
      afterLogin();
    }
  
    function logout() {
      localStorage.removeItem(page);
      beforeLogin();
      return false;
    }
  
    $("#login").click(login);
    $("#logout").click(logout);
  
    if (isLoggedIn()) {
      update();
    } else if (window.location.hash !== "") {
      process();
    } else {
      beforeLogin();
    }

    Parse.initialize(parseAppId, parseJavaScriptKey);
    Parse.serverURL = "https://parseapi.back4app.com/";
  });
  