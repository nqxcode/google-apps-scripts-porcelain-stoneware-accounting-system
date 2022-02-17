let Auth = {
  gates: {}
}

Auth.gates.default = function() {
  return true
}

Auth.gate = function(resource, callable) {
  this.gates[resource] = callable
}

Auth.currentUser = function () {
    var userEmail = Session.getActiveUser().getEmail();
    if (userEmail === '' || !userEmail || userEmail === undefined) {
        userEmail = PropertiesService.getUserProperties().getProperty('userEmail');
        if (!userEmail) {
            var protection = SpreadsheetApp.getActive().getRange('A1').protect();
            protection.removeEditors(protection.getEditors());
            var editors = protection.getEditors();
            if (editors.length === 2) {
                var owner = SpreadsheetApp.getActive().getOwner();
                editors.splice(editors.indexOf(owner), 1);
            }
            userEmail = editors[0];
            protection.remove();
            PropertiesService.getUserProperties().setProperty('userEmail', userEmail);
        }
    }
    return userEmail;
}

Auth.check = function (resource) {
  if (!this.gates[resource]) {
    return this.gates.default.call(this)
  }

  return this.gates[resource].call(this, this.currentUser())
}

