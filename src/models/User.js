import mongoose from "mongoose";
import bcrypt from "bcryptjs";
//스키마를 만든 후 init에다 export해줘야함
// 파일은 절대로 DB에 저장하지 않는다
//대신 폴더에 파일을 저장하고DB에는 그 파일의 위치만 저장한다
const userSchema= new mongoose.Schema({
	email: {type: String, required: true ,unique: true},
	avatarUrl: String,
	socialOnly:{type:Boolean, default: true},
	username: {type: String, required: true ,unique: true},
	password: {type: String,},
	name: {type: String, required: true},
	location: String,
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"} ],
	uploadedVideos: [{type: mongoose.Schema.Types.ObjectId, ref: "Video"}]
});

//function 안에서의 this는 create가 되는 User을 가르킨다
//this는 arrow function을 사용할 수 없음
userSchema.pre('save', async function(){
	if(this.isModified("password")){
	this.password=await bcrypt.hash(this.password, 5)}
});

const User = mongoose.model("User",userSchema);
export default User;