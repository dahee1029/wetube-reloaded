//모든걸 초기화 시킴 database와 Video를 import하고 우리 application을 작동시킴
//필요한 모든 것들을 import시키는 역할
import "dotenv/config";
import "./db"
import "./models/Video"
import "./models/User"
import app from "./server"

const PORT=4000;

const handleListening=()=>
	console.log(`server listenting on port http://localhost:${PORT}`);


app.listen(PORT, handleListening)