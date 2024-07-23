require('dotenv').config()

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')

const path = require('path')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', router)



app.use(errorHandler)

// тестовый вызов чтобы понимать, что сервер работает
app.get('/', (req, res) => {

    res.status(200).json({ message: "its work" })
})



const getAllVideos = async () => {

    models.Videos.truncate()

    let allVideos

    try {
        let response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.CHANNEL_ID}&maxResults=50&type=video&key=${process.env.API_KEY}`)

        allVideos = await response.json()

        if (allVideos.pageInfo.totalResults > allVideos.pageInfo.resultsPerPage) count = Math.floor(allVideos.pageInfo.totalResults / allVideos.pageInfo.resultsPerPage)

        if (allVideos.nextPageToken) {
            let nextPageToken = json.nextPageToken
            for (let index = 0; index < count; index++) {

                let nextPageResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.CHANNEL_ID}&maxResults=50&type=video&key=${process.env.API_KEY}&pageToken=${nextPageToken}`)

                let nextPage = await nextPageResponse.json()

                nextPageToken = nextPage.nextPageToken
                allVideos.items.push(...nextPage.items)
            }
        }
    } catch (error) {
        console.log(error);

    }

    try {
        if(allVideos.items){
           for (let index = 0; index < allVideos.items.length; index++) {
            const element = allVideos.items[index];
            console.log(element);
            models.Videos.create({ videoId: element.id.videoId, title: element.snippet.title })
        } 
        }
        
    } catch (error) {
        console.log(error);
    }

}



const start = async () => {
    try {

        await sequelize.authenticate()
        await sequelize.sync()


        app.listen(PORT, () => console.log(`server started on port: ${PORT}`))

        getAllVideos()

        setInterval(() => {
            getAllVideos()
        }, 86400000)
    } catch (error) {
        console.log(error);

    }
}

start()

