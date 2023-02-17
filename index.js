const PORT = process.env.PORT | 3000;

const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");


const app = express();



const newsCompany = [
    {
        name: 'hindustantimes',
        address: 'https://www.hindustantimes.com/topic/pm-modi/news',
        base: 'https://www.hindustantimes.com'
    },
    {
        name:'outlookindia',
        address:'https://www.outlookindia.com/search?title=pm+modi',
        base: ''
    },
    {
        name:'indiatv',
        address:'https://www.indiatvnews.com/topic/pm-modi',
        base: ''
    },
    {
        name:'indianexpress',
        address:'https://indianexpress.com/about/pm-modi/',
        base: ''
    },
    {
      name:'timesofindia',
      address:'https://timesofindia.indiatimes.com/topic/Narendra-Modi',
      base:''
    }
]

const articles = [];

const forbiddenWords = ['window.','Search:','https:','home', 'about', 'contact', 'pm modi','[pm modi news]','pm modi news','Latest from pm modi'];

newsCompany.forEach(news =>{axios.get(news.address).then((response)=>{

            const html = response.data
            const $ = cheerio.load(html)
            const base = news.base 
        
            $("a:contains('Modi')",html).each(function(){

                title = $(this).text().replaceAll("\n", "").replaceAll("    "," ")
                url = $(this).attr('href')
            
                articles.push({
                    title,
                    url: base + url
                })

                for (var i = articles.length - 1; i >= 0; i--) {
                    if (articles[i].title.length > 500) {
                      articles.pop(); 
                    }
                  } 
                  for (var i = articles.length - 1; i >= 0; i--) {
                    var articleTitle = articles[i].title; 
                    for (var j = 0; j < forbiddenWords.length; j++) {
                      if (articleTitle.indexOf(forbiddenWords[j]) !== -1) {
                        articles.pop(); 
                        break; 
                      }
                    }
                  }
                  
            })
        }) 
    })

app.get('/', function(req,res){
  res.json(articles)
})



// -------------------------------------------------------------------------------



app.get('/:newscompId', async function(req,res){
    const newscompId = req.params.newscompId.toLowerCase()
    console.log(newscompId);

    const newsAddress = newsCompany.filter(newsCompany => newsCompany.name == newscompId)[0].address

    const base = newsCompany.filter(newsCompany => newsCompany.name == newscompId)[0].base

    const name = newsCompany.filter(newsCompany => newsCompany.name == newscompId)[0].name

    axios.get(newsAddress)
        .then((response)=>{
            const html = response.data
            const $ = cheerio.load(html)
            const chosenArticle = []

            $("a:contains('Modi'),:contains('modi')",html).each(function (){
                title = $(this).text().replaceAll("\n", "")
                source = $(this).attr('href')
                
                
                chosenArticle.push({
                    title,
                    address: base + source,
                    source: name
                })

                for (var i = chosenArticle.length - 1; i >= 0; i--) {
                    if (chosenArticle[i].title.length > 500) {
                      chosenArticle.pop(); 
                    }
                  } 
                  for (var i = chosenArticle.length - 1; i >= 0; i--) {
                    var articleTitle = chosenArticle[i].title; 
                    for (var j = 0; j < forbiddenWords.length; j++) {
                      if (articleTitle.indexOf(forbiddenWords[j]) !== -1) {
                        chosenArticle.pop(); 
                        break; 
                      }
                    }
                  }
                  
            })
            res.json(chosenArticle)
        }) 
    .catch((err) => console.log(err));

})


app.listen(PORT, function(req,res){
    console.log(`server is running on port:${PORT}`);
})