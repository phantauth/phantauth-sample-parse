
Parse.Cloud.beforeSave(Parse.User,savePhantAuthUser);

async function savePhantAuthUser(request) {
  var accessToken = request.object.get("authData").phantauth.access_token;

  if ( ! accessToken ) {
    throw "Missing access_token from authData " + JSON.stringify(request.object.get("authData"));
  }

  await Parse.Cloud.httpRequest({
    url: 'https://phantauth.net/auth/userinfo',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function (httpResponse) {
    var user = JSON.parse(httpResponse.text);
    var obj = request.object;

    if ( user.address ) {
      if ( user.address.street_address ) {
        user.address.streetAddress = user.address.street_address;
        delete user.address.street_address;
      }
      if ( user.address.postal_code ) {
        user.address.postalCode = user.address.postal_code;
        delete user.address.postal_code;
      }
    }

    var claims = ["sub","email", "password","nickname", "preferred_username", "family_name", "given_name", "middle_name", "gender", "birthdate", "locale", "phone_number", "phone_number_verified",  "zoneinfo", "picture", "profile", "website", "address"];

    claims.forEach((item, index)=> {
      obj.set(snakeToCamel(item), user[item]);
    });
  }, function (httpResponse) {
    throw 'Request failed with response code ' + httpResponse.status;
  });
}

function snakeToCamel(str) { 
  return str.replace(
  /([-_][a-z])/g,
  (group) => group.toUpperCase()
                  .replace('-', '')
                  .replace('_', '')
  );
}
