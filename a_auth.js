let Auth = {
  gates: {}
}

Auth.gates.default = function() {
  return true
}

Auth.gate = function(resource, callable) {
  this.gates[resource] = callable
}

Auth.currentUser = function() {
  return currentUser
}

Auth.check = function (resource) {
  if (!this.gates[resource]) {
    return this.gates.default.call(this)
  }

  return this.gates[resource].call(this, this.currentUser())
}

