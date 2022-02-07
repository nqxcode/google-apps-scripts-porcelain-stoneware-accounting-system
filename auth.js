let admins = [
  'bcfess@yandex.ru',
  'nc101ux@gmail.com',
]

Auth.gate('report', function(currentUser) {
  return admins.includes(currentUser)
})

Auth.gate('trash', function(currentUser) {
  return admins.includes(currentUser)
})
