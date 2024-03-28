import multer from "multer";
//localsMiddleware가 session middleware다음에 오기떄문에 가능
//locals는 자동적으로 views로 import 된다.

export const localsMiddleware=(req,res,next)=>{
	// if(req.session.loggedIn){
	// 	res.locals.loggedIn= true;
	//Boolean()을 사용하면 값이 true이거나 false인지 확인 가능
	//locals안에 집어넣으면 pug와 언제든 연결가능
	res.locals.loggedIn= Boolean(req.session.loggedIn);
	res.locals.siteName= "Wetube"
	//or 빈(empty) {}
	res.locals.loggedInUser=req.session.user ||{};
	//next를 호출하지 않으면 웹사이트 작동x
	next();
}

export const protectorMiddleware=(req,res,next)=>{
	// loggedIn은 유저가 로그인 할 때 session에 저장되는 정보
	//session에 저장되어 있기 때문에 어느 controller나 middleware에서도 사용할 수 있음
	if(req.session.loggedIn){
		//요청을 계속하게한다
		next()
	}else{
		req.flash("error","Log In First")
		res.redirect("/login");
	}
}

export const publicOnlyMiddleware=(req,res,next)=>{
	if(!req.session.loggedIn){
		next()
	}else{
		req.flash("error","Not Authorized")
		res.redirect("/");
	}
}

//router에다가 사용할거임
export const avatarUpload= multer({dest:"uploads/avatars/",limits: {
	fileSize: 8000000,
}});

export const videoUpload= multer({dest:"uploads/videos/",limits: {
	fileSize: 10000000,
}});