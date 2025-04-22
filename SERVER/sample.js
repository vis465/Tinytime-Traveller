const axios = require("axios");


const geturl = async(id)=>{
   
  let headersList = {
   "X-API-KEY": "w34W5MQjubmnZ0xrmx3MLk38tnuKMR42rFWNOXJEO1I",
   "Content-Type": "application/json" 
  }
  

  let reqOptions = {
    url: `https://viralapi.vadoo.tv/api/get_video_url?id=${id}`,
    method: "GET",
    headers: headersList
  }
  
  let response = await axios.request(reqOptions);
  console.log(response.data);
  
}

geturl(182042765177);