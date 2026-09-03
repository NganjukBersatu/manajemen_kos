import bcrypt from 'bcryptjs'

const password = process.argv[2]
const email = process.argv[3] || 'admin@kos.com'

if (!password) {
  console.log('Cara pakai: node scripts/hash-password.js password_kamu admin@kos.com')
  process.exit(1)
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\nHash password:')
  console.log(hash)
  console.log('\nJalankan SQL ini di pgAdmin:\n')
  console.log(`UPDATE users SET email = '${email}', password_hash = '${hash}' WHERE id = 1;`)
})