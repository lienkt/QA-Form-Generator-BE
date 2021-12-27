require('dotenv').config()
const express = require('express')
const morgan  = require('morgan')
const cors    = require('cors')
const helmet  = require('helmet')

const projectsRoutes = require('./routes/projectsRoutes')

const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/ErrorHandler')
const connectDB = require('./middlewares/connectDB')
connectDB()

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(helmet())
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb', extended: true, parameterLimit: 50000}));

app.use(express.static('public'));
app.use(express.static('projects'));

app.get('/', (req, res) => {
    res.status(200).send('<h1>QA Form Generator Backend is running!</h1>')
})

app.use('/projects', projectsRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server listen on http://localhost:${PORT}`)
})