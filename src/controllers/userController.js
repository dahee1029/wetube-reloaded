import { config } from "dotenv";
import User from "../models/User"
import Video from "../models/Video";
import fetch from "cross-fetch";
import bcrypt from "bcryptjs";
import { token } from "morgan";

export const getJoin= (req, res)=>res.render("users/join",{pageTitle: "Join"});

export const postJoin= async(req,res)=>{
	const {name, username, email, password, password2, location} =req.body;
	const pageTitle="join";
	if(password !== password2){
		return res.status(400).render("users/join",{
		pageTitle,
		errorMessage : "password confirmation does not match"
		})
	}
	//$or operator 는 둘 이상의 조건에 대해 논리적 QR연산을 수행하고 조건 중 하나 이상을 충족하는 문서를 선택한다
	//계정의 중복생성 방지
	//model이 exists함수를 이용하여 중복여부 파악 가능
	//res.render()로 render하면 기본적으로 status code 200 을 받게됨
	const exists= await User.exists({ $or: [{username},{email}]});
	if(exists){
		return res.status(400).render("users/join",{
			pageTitle,
			errorMessage: "This username/email is already taken."})
	}
	
	try{
		await User.create({
			name,
			username,
			email,
			password,
			location,
			socialOnly:false,
		});
	return res.redirect("/");
	}catch(error){
	return res.status(400).render("join",{
		pageTitle: "join" ,
		errorMessage: "error",
	})
	};
}


export const getLogin = (req,res)=> res.render("users/login",{pageTitle: "Login"});

export const postLogin =async(req,res)=>{
	const {username, password}=req.body;
	const pageTitle= "Login";
	const user= await User.findOne({username , socialOnly: false});
	if(!user){
		res.status(400).render("users/login",{
			pageTitle,
			errorMessage: "An account with this username does not exists."
		})
	}
	//password는 입력한 password user.password는 해싱된 password
	const ok= await bcrypt.compare(password, user.password);
	if(!ok){
		return res.status(400).render("users/login",{
			pageTitle,
			errorMessage: "Wrong password"
		});
	}

	//세션을 수정/초기화 하는 부분
	//백엔드가 로그인한 사용자에게만 쿠키를 주도록 설정
	req.session.loggedIn= true;
	req.session.user= user;
	res.redirect("/")
}

export const startGithubLogin=(req,res)=>{
	const baseUrl="https://github.com/login/oauth/authorize";
	const config={
		client_id: process.env.GH_CLIENT,
		allow_signup: false,
		//read:user를 해야 밑에서 user의 정보를 읽을 수 있는 access_token을 받을 수 있다
		scope: "read:user user:email",
	}
	const params= new URLSearchParams(config).toString();
	const finalUrl=`${baseUrl}?${params}`;
	return res.redirect(finalUrl);
}

export const startKakaoLogin=(req,res)=>{
	const baseUrl="https://kauth.kakao.com/oauth/authorize";
	const config={
		client_id: process.env.KAKAO_CLIENT,
		redirect_uri: "http://localhost:4000/users/kakao/callback",
		scope: "profile_nickname, account_email",
		response_type: "code",
		
	}	
	const params= new URLSearchParams(config).toString();
	const finalUrl=`${baseUrl}?${params}`;
	return res.redirect(finalUrl);
}

export const finishGithubLogin= async(req,res)=>{
	const baseUrl= "https://github.com/login/oauth/access_token";
	const config={
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	};
	const params= new URLSearchParams(config).toString();
	const finalUrl=`${baseUrl}?${params}`;
	const tokenRequest= await(await fetch(finalUrl, {
		method:"POST",
		headers: {
			Accept: "application/json",
		},
	})).json();
	
	if("access_token" in tokenRequest){
		// access token은 scope에 적은 내용만 허용함
		const {access_token}=tokenRequest;
		const apiUrl= "https://api.github.com"
		//user의 데이터를 가져옴
		const userData= await(await fetch(`${apiUrl}/user`,{
			headers:{
				Authorization: `token ${access_token}`
			}
		})).json();
		
		const emailData= await(await fetch(`${apiUrl}/user/emails`,{
			headers:{
				Authorization: `token ${access_token}`
			}
		})).json();
		const emailObj = emailData.find(
			email=>email.primary===true && email.verified===true
		);
		if(!emailObj){
			return res.redirect('users/login');
		}                     
		let user= await User.findOne({email: emailObj.email});
		if(!user){
			//create an account
			user= await User.create({
				avatarUrl: userData.avatar_url,
				name :userData.name,
				username: userData.login,
				email: emailObj.email,
				password:"",
				socialOnly:true,
				location: userData.location,
			});
		}
		req.session.loggedIn= true;
		req.session.user= user;
		return res.redirect("/");
	}else{
		return res.redirect("users/login");
	}
}

export const finishKakaoLogin=async(req,res)=>{
	const baseUrl= "https://kauth.kakao.com/oauth/token";
	const config={
		client_id: process.env.KAKAO_CLIENT,
		client_secret: process.env.KAKAO_SECRET,
		grant_type: 'authorization_code',
		code: req.query.code,
	};
	const params= new URLSearchParams(config).toString();
	const finalUrl= `${baseUrl}?${params}`
	//fetch를 통해 데이터를 받아오고 데이터에서 json추출
	//fetch는 브라우저에서만 사용가능하기 때문에 node-fetch설치
	const tokenRequest= await(await fetch(finalUrl,{
		method:"POST",
		headers: {
			Accept: "application/json",
		},
	})
	).json();
	if("access_token"in tokenRequest){
		//access api
		const {access_token} =tokenRequest;
		//fetch를 요청 fetch가 돌아오면 해당 fetch의 json을 받음 
		const userData= await(await fetch("https://kapi.kakao.com/v2/user/me",{
			headers:{
				Authorization: `Bearer ${access_token}`
			}
		})).json();
		const userProfile= userData.kakao_account
		let user= await User.findOne({email: userProfile.email});
		if(!user){
			user= await User.create({
				name :userProfile.profile.nickname,
				username: userProfile.profile.nickname,
				email:userProfile.email,
				password:"",
				socialOnly:true,
			});
		}
		req.session.loggedIn= true;
		req.session.user= user;
		
		return res.redirect("/");
	}else{
		return res.redirect("users/login");
	}
	
}

export const logout = (req,res)=>{
	req.session.destroy();
	return res.redirect("/")
}

export const getEdit=(req,res)=> {
	return res.render("/users/edit-profile",{pageTitle:"Edit Profile"})
}

export const postEdit=async(req,res)=> {
	//request object의 req.session.user에서 user의 id를 찾는다
	//const i = req.session.user.id 이랑 같은 문장
	const {
		session:{
			user: { _id ,avatarUrl},
		},
		body:{name,location,email,username},
		file,
	}=req;
	// const {name,email,username,location}=req.body;
	const updatedUser= await User.findByIdAndUpdate(_id,{
		avatarUrl: file ? file.path : avatarUrl,
		name,
		email,
		username,
		location,
		
	},
	{new: true});

	req.session.user=updatedUser;
	return res.redirect("/users/edit");
}

export const getChangePassword=(req,res)=>{
	return res.render("/users/change-password",{pageTitle:"Change password"});
}

export const postChangePassword=async(req,res)=>{
	const {
		session:{
			user: { _id},
		},
		body:{currentPassword, newPassword,newPassword2},
	}=req;
	const user= await User.findById(_id);
	const ok = await bcrypt.compare(currentPassword, user.password);
	if(!ok){
		return res.status(400).render("/users/change-password",
		{pageTitle:"Change Password", errorMessage:"The current password is incorrect"})
	}
	if(newPassword!== newPassword2){
		return res.status(400).render("/users/change-password",
		{pageTitle:"Change Password", errorMessage:"The password does not match the confirmation"})
	}
	//User-> save()를 사용하기 위해서는 session에서 로그인된 user를 찾아야함
	user.password= newPassword;
	await user.save();
	return res.redirect("/")
}

export const remove=(req,res)=> res.send("remove User");

export const see=async(req,res)=> {
	const {id} = req.params;
	const user= await User.findById(id).populate("videos");
	if(!user){
		return res.status(400).render("404",{pageTitle:"User not found."});
	}
	
	return res.render("/users/profile",{pageTitle:`${user.username}의 Profile`,
	user,
	})
}
