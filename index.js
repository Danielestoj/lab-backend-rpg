require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`RPG Backend en http://localhost:${PORT}`)
})
