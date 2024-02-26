import mongoose from "mongoose";

//맨뒤에 이름 꼭 명시하기
mongoose.connect(process.env.DB_URL)

const db= mongoose.connection;
const handleOpen=()=>console.log("connected")
db.on("error",(error)=>console.log("DB error",error))
db.once("open",handleOpen)
