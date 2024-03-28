const video= document.querySelector("video");
const playBtn= document.getElementById("playBtn");
const playBtnIcon = playBtn.querySelector("i");
const hiddenPlayBtn= document.getElementById("hiddenPlayBtn");
const hiddenPlayBtnIcon=hiddenPlayBtn.querySelector("i");
const muteBtn= document.getElementById("muteBtn");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange= document.getElementById("volume");
const currentTime= document.getElementById("currentTime");
const totalTime= document.getElementById("totalTime");
const timeline= document.getElementById("timeline");
const fullScreenBtn= document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer=document.getElementById("videoContainer");
const videoControls=document.getElementById("videoControls");

let controlsTimeout= null;

let volumeValue=0.5;
video.volume=volumeValue;

const handleVolumeChange =(event)=>{
	const {target: {value}} = event;
	video.volume=value;
	volumeValue=value;
	video.volume=value;
}

const handlePlayClick=()=>{
	if(video.paused){
		video.play();
	}else{
		video.pause();
	}
	hiddenPlayBtnIcon.classList= video.paused? "fas fa-play" : "fas fa-pause";
	playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute=(e)=>{
	if(video.muted){
		video.muted=false;
	}else{
		video.muted=true;
	}
	muteBtnIcon.classList = video.muted? "fas fa-volume-mute": "fas fa-volume-up";
	volumeRange.value= video.muted? "0": volumeValue
}

const formatTime=(seconds)=> new Date(seconds*1000).toISOString().substring(14,19);

const handleLoadedMetadata=()=>{
	totalTime.innerText=formatTime(Math.floor(video.duration));
	timeline.max= Math.floor(video.duration);
}

const handleTimeUpdate=()=>{
	currentTime.innerText=formatTime(Math.floor(video.currentTime));
	timeline.value=Math.floor(video.currentTime)
}

const handelTimelineChange=(event)=>{
	const {target: {value}}=event;
	video.currentTime= value;
}

const handleFullScreen=()=>{
	const fullScreen= document.fullscreenElement;
	if(fullScreen){
		document.exitFullscreen();
		fullScreenIcon.classList = "fas fa-expand";
	}else{
		videoContainer.requestFullscreen();
		fullScreenIcon.classList = "fas fa-compress";
	}
};

const handleMouseMove=()=>{
	if(controlsTimeout){
		clearTimeout(controlsTimeout);
		controlsTimeout= null;
	}
	videoControls.classList.add("showing");
	hiddenPlayBtn.classList.add("showing");
	controlsTimeout = setTimeout(()=>{
		videoControls.classList.remove("showing");
		hiddenPlayBtn.classList.remove("showing");
	},2000);
};

const handleEnded=()=>{
	//API요청 보내는방법 fetch
	//프론트엔드에서 자바스크림트가 비디오의 id를 알기 위해서는 템플릿을 렌더링하는 pug한데 비디오 정보를 남기라고 해야함
	const {id}= videoContainer.dataset;
	//fetch를 하면 get요청을 보내게됨 따라서 method:post를 추가
	fetch(`/api/videos/${id}/view`,{
		method: "POST",
	});
}

playBtn.addEventListener("click",handlePlayClick)
muteBtn.addEventListener("click",handleMute);
volumeRange.addEventListener("input",handleVolumeChange);
video.addEventListener("loadeddata",handleLoadedMetadata);
video.addEventListener("timeupdate",handleTimeUpdate);
video.addEventListener("ended",handleEnded);
timeline.addEventListener("input",handelTimelineChange);
fullScreenBtn.addEventListener("click",handleFullScreen);
videoContainer.addEventListener("mousemove",handleMouseMove);
video.addEventListener("click",handlePlayClick);