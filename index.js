function buttonClicked(){

     var city = document.getElementById("cityInput").value

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9fd7a449d055dba26a982a3220f32aa2`)//api url
     .then((response) => response.json())
     .then((data) => {
         console.log(data)  
         console.log(`${data.name},${data.sys.country}`)    
         console.log(`${(data.main.temp-273.15).toFixed(2)} celcius`) 
         console.log(`${data.weather[0].main}, ${data.weather[0].description}`) 
         
         document.getElementById("displaycity").innerHTML = `${data.name},${data.sys.country}`
         document.getElementById("displaySuhu").innerHTML = `${(data.main.temp-273.15).toFixed(2)} celcius`
         document.getElementById("displayWeather").innerHTML = `${data.weather[0].main}, ${data.weather[0].description}`

         
     } )      

}//end of buttonClicked()