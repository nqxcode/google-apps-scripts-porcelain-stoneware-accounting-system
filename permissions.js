let admins = [
  'bcfess@yandex.ru',
  'nc101ux@gmail.com',
]

Auth.gate('show-report', function(currentUser) {
  return admins.includes(currentUser)
})

Auth.gate('remove-from-trash', function(currentUser) {
  return admins.includes(currentUser)
})
