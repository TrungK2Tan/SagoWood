const mongoose = require('mongoose');

const db = `mongodb+srv://sagowood:Trung2511!@sagowood.al0dp.mongodb.net/?retryWrites=true&w=majority&appName=SagoWood`

mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(() =>{
    console.log('database connected successfully');
}).catch((e)=>{
    console.log(e,'<=error');
})