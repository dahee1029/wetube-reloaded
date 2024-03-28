import Video from "../models/Video"
import User from "../models/User"

//모든 비디오를 database에서 불러옴
export const home=async(req,res)=>{
	const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
	return res.render("home",{pageTitle:"Home", videos});
};

export const watch= async(req,res)=> {
	const {id} = req.params;
	//populate()은 'owner: :/id'부분을 실제User로 데이터를 채워줌
	//mongoose가 'video'를 찾고 그안에서 'owner'가 'object ID 인것을 알고
	//그 ref가 User에서 온 것을 앎
	const video= await(await Video.findById(id)).populate("owner");

	//페이지에서 satus code 404를 받으면 브라우저가 히스토리에 기록을 남기지 x
	if(!video){
		return res.status(404).render("404", {pageTitle: "Video not found."});
	}
	return res.render("videos/watch",{pageTitle: video.title, video});
};

export const getUpload=(req,res)=>{
	const {_id}=req.session.user;
	return res.render("videos/upload",{pageTitle: "Uploading New Video" });
};
//form이 데이터베이스에 데이터를 전송해주는 과정
export const postUpload= async(req,res) => {
	const {
		session: {user: _id},
		body: {title, description, hashtags},
		file:{path: fileUrl},
	}= req;
	
	try{
		//비동기 처리가 필요한 애들을 기다린다.
		//promise함수는 비동기가 끝나기 전에 pending상태. 잘 끝나면 success상태 , error 면 error
		//  create메소드가 error발생 시 error를 throw 해줌. try catch는 error를 감지할 수 있음.
		const newVideo= await Video.create({
			fileUrl,
			title,
			owner: _id,
			description,
			hashtags : Video.formatHashtags(hashtags),
		});
		const user= await User.findById(_id);
		user.uploadedVideos.push(newVideo._id);
		user.save();
		return res.redirect("/");	
	}catch(error){
		return res.status(400).render("videos/upload",{
			pageTitle: "Uploading New Video" ,
			errorMessage: error._message 
		});
	}
	
	//데이터를 database에 전송하는데 시간이 걸리기 때문에 await을 해줘야함
	//mongoose기능 save는 promise(생성된 video)를 return해준다
	// await video.save();
	//h)ere we will add a video to the videos array
};

export const getEdit= async(req, res)=> {
	const {id} = req.params;
	const {user: {_id}} =req.session;
	//object를 edit templete으로 보내줘야 하기 때문에 video object가 필요함
	const video= await Video.findById(id);
	if(!video){
		return res.render("404", {pageTitle: "Video not found."});
	}
	// console.log(typeof video.owner)
	// console.log(typeof _id)
	if(String(video.owner) !== _id){
		req.flash("error","Not Authorized")
		//status(403) = Forbidden
		return res.status(403).redirect("/");
	}
	return res.render("videos/edit",{pageTitle: `Edit: ${video.title}`,video });
};

export const postEdit= async(req, res)=> {
	const {id} = req.params;
	const {user: {_id}} =req.session;
	const {title, description, hashtags}= req.body;
	const video= await Video.findById(id)
	//exists를 통해 video object대신에 filter를 통해 true혹은 false를 받는다 
	const isExist= await Video.exists({_id: id});
	if(!isExist){
		return res.status(404).render("404", {pageTitle: "Video not found."});
	}
	

	if(String(video.owner) !== _id){
		// status(403) = Forbidden
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndUpdate(id,{
		title, 
		description, 
		hashtags : Video.formatHashtags(hashtags),
	})
	// //req.body => form에 있는 value의 javascript representation이다. server.js에 app.use(express.urlencoded({extended: true}));을 해줘야 사용 가능
	// //input이 name of title 이기 떄문
	req.flash("success","Changes saved")
	return res.redirect(`/videos/${id}`);
};



export const deleteVideo = async(req,res)=>{
	const {id}= req.params;
	const {user: {_id}} =req.session;
	const video = await Video.findById(id);
	if(!video){
		return res.render("404", {pageTitle: "Video not found."});
	}
	if(String(video.owner) !== _id){
		//status(403) = Forbidden
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndDelete(id);
	return res.redirect("/")
}

// mongoose, mongoDB와 소통하귀 위해 async와 await가 필요함

export const search = async(req,res)=>{
	const {keyword} = req.query;
	let videos=[];
	if(keyword){
		//search
		videos= await Video.find({
			title: {
				//contain 방식의 regular expression 생성
				//제목에 keyword를 포함하는 영상들을 찾을 것
				//mongoDB기능 -필터엔진 regex operater
				$regex: new RegExp(keyword, "i")
			}
		}).populate("owner");
	};
	return res.render("search", {pageTitle: "Search", videos});
};

export const registerView= async(req,res)=>{
	const{id}=req.params;
	const video= await Video.findById(id);
	if(!video){
		//응답에 상태코드 추가 status-> 렌더링
		// return res.status(404)다음에 렌더링을 해줘야 하기 때문에
		return res.sendStatus(404);
	}
	video.meta.views= video.meta.views+1;
	await video.save();
	//ok
	return res.sendStatus(202);
}

export const createComment = (req,res)=>{
	console.log("params:",req.params);
	console.log("body:",req.body);
	res.end()
}