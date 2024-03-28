import mongoose from "mongoose";
// export const formatHashtags =(hashtags)=>
// hashtags.split(",").map((word)=>(word.startsWith("#")? word : `#${word}`))

//model의 shape= schema 비디오의 형태를 정의해준다
//maxLength를 데이터베이스에도 해야 누군가 해킹해서 글자 수 제한을 풀고 데이터를 전송하는 것을 방지
const videoSchema= new mongoose.Schema({
	fileUrl: {type:String, required: true},
	title: {type: String, required: true, maxLength:10},
	description: {type: String, required: true, minLength:5},
	createdAt: {type: Date, required: true, default: Date.now},
	hashtags: [{type: String}],
	meta:{
		views: {type:Number, default:0 , required: true},
	},
	comment:[{type: mongoose.Schema.Types.ObjectId, required:true, ref:"Comment"}],
	// object ID가 model User에서 온다고 알려줘야 mongoose가 우리를 도와줌
	owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"}
})
//middleware는 model이 생성되기 이전에 만들어야 함
// videoSchema.pre('save', async function(){
// 	this.hashtags = this.hashtags[0].split(",").map((word)=>(word.startsWith("#")? word: `#${word}`))
// 	console.log("we are about to" ,this);
// })
videoSchema.static('formatHashtags', function(hashtags){
	return hashtags.split(",").map((word)=>(word.startsWith("#")? word : `#${word}`))
})

const Video = mongoose.model("Video",videoSchema)
export default Video;